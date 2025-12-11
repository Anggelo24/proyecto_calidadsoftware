import {
  User,
  Session,
  RecoveryToken,
  BlockStatus,
  LoginResult,
  RecoveryResult,
  TokenValidationResult,
  RegisterResult,
  CONFIG,
} from './types';
import {
  getUsers,
  saveUsers,
  getTokens,
  saveTokens,
  saveSession,
  clearSession,
  findUserByEmail,
  updateUser,
} from './storage';
import { validateEmail, validatePassword } from './validation';

export function checkAccountBlock(user: User): BlockStatus {
  if (!user.blockedUntil) {
    return { blocked: false, remainingTime: 0 };
  }

  const blockedUntil = new Date(user.blockedUntil);
  const now = new Date();

  if (now < blockedUntil) {
    const remainingMs = blockedUntil.getTime() - now.getTime();
    const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
    return { blocked: true, remainingTime: remainingMinutes };
  }

  return { blocked: false, remainingTime: 0 };
}

export function blockAccount(email: string): void {
  const users = getUsers();
  const userIndex = users.findIndex(
    u => u.email.toLowerCase() === email.toLowerCase()
  );

  if (userIndex !== -1) {
    const blockUntil = new Date(
      Date.now() + CONFIG.BLOCK_DURATION_MINUTES * 60 * 1000
    );
    users[userIndex].blockedUntil = blockUntil.toISOString();
    users[userIndex].loginAttempts = CONFIG.MAX_LOGIN_ATTEMPTS;
    saveUsers(users);
  }
}

export function unlockAccount(email: string): void {
  updateUser(email, { blockedUntil: null, loginAttempts: 0 });
}

export function incrementLoginAttempts(email: string): number {
  const users = getUsers();
  const userIndex = users.findIndex(
    u => u.email.toLowerCase() === email.toLowerCase()
  );

  if (userIndex !== -1) {
    users[userIndex].loginAttempts++;
    const attempts = users[userIndex].loginAttempts;

    if (attempts >= CONFIG.MAX_LOGIN_ATTEMPTS) {
      blockAccount(email);
    }

    saveUsers(users);
    return CONFIG.MAX_LOGIN_ATTEMPTS - attempts;
  }

  return CONFIG.MAX_LOGIN_ATTEMPTS;
}

export function login(email: string, password: string): LoginResult {
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return { success: false, message: emailValidation.message };
  }

  if (!password) {
    return { success: false, message: 'El campo contrasena es requerido' };
  }

  const user = findUserByEmail(email);

  if (!user) {
    return { success: false, message: 'Credenciales invalidas' };
  }

  const blockStatus = checkAccountBlock(user);
  if (blockStatus.blocked) {
    return {
      success: false,
      message: `Cuenta bloqueada. Intente en ${blockStatus.remainingTime} minutos`,
    };
  }

  if (user.blockedUntil && !blockStatus.blocked) {
    unlockAccount(email);
  }

  // En login solo verificamos si la contraseña coincide
  // NO validamos requisitos de formato (eso es solo para crear/cambiar contraseña)
  if (user.password !== password) {
    const remaining = incrementLoginAttempts(email);
    const updatedUser = findUserByEmail(email);

    if (updatedUser) {
      const newBlockStatus = checkAccountBlock(updatedUser);
      if (newBlockStatus.blocked) {
        return {
          success: false,
          message: `Cuenta bloqueada por ${CONFIG.BLOCK_DURATION_MINUTES} minutos debido a multiples intentos fallidos`,
        };
      }
    }

    if (remaining === 1) {
      return {
        success: false,
        message: `Credenciales invalidas. ADVERTENCIA: 1 intento restante antes del bloqueo`,
      };
    } else if (remaining <= 2) {
      return {
        success: false,
        message: `Credenciales invalidas. ${remaining} intentos restantes`,
      };
    }

    return { success: false, message: 'Credenciales invalidas' };
  }

  unlockAccount(email);

  const session: Session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    loginTime: new Date().toISOString(),
    expiresAt: new Date(
      Date.now() + CONFIG.SESSION_TIMEOUT_MINUTES * 60 * 1000
    ).toISOString(),
  };

  saveSession(session);

  return {
    success: true,
    message: 'Login exitoso! Redirigiendo...',
    session,
  };
}

export function logout(): void {
  clearSession();
}

export function register(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): RegisterResult {
  // Validar nombre
  if (!name || name.trim() === '') {
    return { success: false, message: 'El nombre es requerido' };
  }

  if (name.trim().length < 3) {
    return { success: false, message: 'El nombre debe tener al menos 3 caracteres' };
  }

  // Validar email
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return { success: false, message: emailValidation.message };
  }

  // Verificar que el email no exista
  const existingUser = findUserByEmail(email);
  if (existingUser) {
    return { success: false, message: 'Este correo ya esta registrado' };
  }

  // Validar contraseña
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return { success: false, message: passwordValidation.message };
  }

  // Validar confirmación de contraseña
  if (password !== confirmPassword) {
    return { success: false, message: 'Las contrasenas no coinciden' };
  }

  // Crear nuevo usuario
  const users = getUsers();
  const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

  const newUser: User = {
    id: newId,
    email: email.toLowerCase().trim(),
    password: password,
    name: name.trim(),
    role: 'Estudiante',
    status: 'active',
    loginAttempts: 0,
    blockedUntil: null,
  };

  users.push(newUser);
  saveUsers(users);

  return { success: true, message: 'Registro exitoso! Ya puedes iniciar sesion' };
}

function generateToken(): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export function requestPasswordRecovery(email: string): RecoveryResult {
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return { success: false, message: emailValidation.message };
  }

  const user = findUserByEmail(email);
  const tokens = getTokens();
  const updatedTokens = tokens.filter(
    t => t.email.toLowerCase() !== email.toLowerCase()
  );

  if (user) {
    const newToken: RecoveryToken = {
      token: generateToken(),
      email: email.toLowerCase(),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(
        Date.now() + CONFIG.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
      ).toISOString(),
      used: false,
    };

    updatedTokens.push(newToken);
    saveTokens(updatedTokens);

    return {
      success: true,
      message: 'Se ha enviado un enlace de recuperacion a tu correo',
      token: newToken.token,
    };
  }

  return {
    success: true,
    message: 'Se ha enviado un enlace de recuperacion a tu correo',
    token: null,
  };
}

export function validateRecoveryToken(token: string): TokenValidationResult {
  if (!token) {
    return { valid: false, message: 'Token no proporcionado' };
  }

  const tokens = getTokens();
  const tokenData = tokens.find(t => t.token === token);

  if (!tokenData) {
    return { valid: false, message: 'Enlace invalido' };
  }

  if (tokenData.used) {
    return { valid: false, message: 'Este enlace ya fue utilizado' };
  }

  const now = new Date();
  const expiresAt = new Date(tokenData.expiresAt);

  if (now > expiresAt) {
    return { valid: false, message: 'El enlace ha expirado' };
  }

  return { valid: true, message: '', email: tokenData.email };
}

export function resetPassword(
  token: string,
  newPassword: string,
  confirmPassword: string
): { success: boolean; message: string } {
  const tokenValidation = validateRecoveryToken(token);
  if (!tokenValidation.valid) {
    return { success: false, message: tokenValidation.message };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, message: 'Las contrasenas no coinciden' };
  }

  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    return { success: false, message: passwordValidation.message };
  }

  const users = getUsers();
  const userIndex = users.findIndex(
    u => u.email.toLowerCase() === tokenValidation.email?.toLowerCase()
  );

  if (userIndex === -1) {
    return { success: false, message: 'Usuario no encontrado' };
  }

  users[userIndex].password = newPassword;
  users[userIndex].loginAttempts = 0;
  users[userIndex].blockedUntil = null;
  saveUsers(users);

  const tokens = getTokens();
  const tokenIndex = tokens.findIndex(t => t.token === token);
  if (tokenIndex !== -1) {
    tokens[tokenIndex].used = true;
    saveTokens(tokens);
  }

  return { success: true, message: 'Contrasena actualizada exitosamente' };
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
