import { User, Session, RecoveryToken, CONFIG } from './types';

const STORAGE_KEYS = {
  USERS: 'uniportal_users',
  TOKENS: 'uniportal_tokens',
  SESSION: 'uniportal_session',
} as const;

const DEFAULT_USERS: User[] = [
  {
    id: 1,
    email: 'estudiante@gmail.com',
    password: 'Passw0rd!23',
    name: 'Juan Estudiante',
    role: 'Estudiante',
    status: 'active',
    loginAttempts: 0,
    blockedUntil: null,
  },
  {
    id: 2,
    email: 'profesor@gmail.com',
    password: 'Pr0fesor!2024',
    name: 'Maria Profesora',
    role: 'Profesor',
    status: 'active',
    loginAttempts: 0,
    blockedUntil: null,
  },
  {
    id: 3,
    email: 'admin@gmail.com',
    password: 'Adm1n!Secure',
    name: 'Carlos Admin',
    role: 'Administrador',
    status: 'active',
    loginAttempts: 0,
    blockedUntil: null,
  },
  {
    id: 4,
    email: 'bloqueado@gmail.com',
    password: 'Block3d!Pass',
    name: 'Usuario Bloqueado',
    role: 'Estudiante',
    status: 'active',
    loginAttempts: 4,
    blockedUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    email: 'test10@gmail.com',
    password: 'Abcd1234!@',
    name: 'Test Limite',
    role: 'Estudiante',
    status: 'active',
    loginAttempts: 0,
    blockedUntil: null,
  },
];

export function initializeDatabase(): void {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TOKENS)) {
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify([]));
  }
}

export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

export function saveUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function getTokens(): RecoveryToken[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.TOKENS);
  return data ? JSON.parse(data) : [];
}

export function saveTokens(tokens: RecoveryToken[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (!data) return null;

  const session: Session = JSON.parse(data);
  const now = new Date();
  const expiresAt = new Date(session.expiresAt);

  if (now > expiresAt) {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    return null;
  }

  return session;
}

export function saveSession(session: Session): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

export function resetDatabase(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.TOKENS);
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  initializeDatabase();
}

export function findUserByEmail(email: string): User | undefined {
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function updateUser(email: string, updates: Partial<User>): void {
  const users = getUsers();
  const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
  }
}
