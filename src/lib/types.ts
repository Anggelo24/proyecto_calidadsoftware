export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'Estudiante' | 'Profesor' | 'Administrador';
  status: 'active' | 'inactive';
  loginAttempts: number;
  blockedUntil: string | null;
}

export interface Session {
  userId: number;
  email: string;
  name: string;
  role: string;
  loginTime: string;
  expiresAt: string;
}

export interface RecoveryToken {
  token: string;
  email: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
}

export interface ValidationResult {
  valid: boolean;
  message: string;
}

export interface PasswordValidationResult extends ValidationResult {
  details: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    special: boolean;
  };
}

export interface BlockStatus {
  blocked: boolean;
  remainingTime: number;
}

export interface LoginResult {
  success: boolean;
  message: string;
  session?: Session;
}

export interface RecoveryResult {
  success: boolean;
  message: string;
  token?: string | null;
}

export interface TokenValidationResult {
  valid: boolean;
  message: string;
  email?: string;
}

export interface RegisterResult {
  success: boolean;
  message: string;
}

export const CONFIG = {
  MAX_LOGIN_ATTEMPTS: 4,
  BLOCK_DURATION_MINUTES: 30,
  TOKEN_EXPIRY_HOURS: 24,
  MIN_PASSWORD_LENGTH: 10,
  SESSION_TIMEOUT_MINUTES: 30,
} as const;
