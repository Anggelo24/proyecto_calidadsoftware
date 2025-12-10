import { ValidationResult, PasswordValidationResult, CONFIG } from './types';

export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { valid: false, message: 'El campo email es requerido' };
  }

  if (email.includes(' ')) {
    return { valid: false, message: 'El email no puede contener espacios' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Formato de email invalido' };
  }

  if ((email.match(/@/g) || []).length > 1) {
    return { valid: false, message: 'Formato de email invalido' };
  }

  if (email.startsWith('@')) {
    return { valid: false, message: 'Formato de email invalido' };
  }

  const parts = email.split('@');
  if (parts[1] && !parts[1].includes('.')) {
    return { valid: false, message: 'Formato de email invalido' };
  }

  return { valid: true, message: '' };
}

export function validatePassword(password: string): PasswordValidationResult {
  const details = {
    length: password.length >= CONFIG.MIN_PASSWORD_LENGTH,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{}|;:',.<>?]/.test(password),
  };

  if (!password || password.trim() === '') {
    return {
      valid: false,
      message: 'El campo contrasena es requerido',
      details,
    };
  }

  if (!details.length) {
    return {
      valid: false,
      message: `La contrasena debe tener al menos ${CONFIG.MIN_PASSWORD_LENGTH} caracteres`,
      details,
    };
  }

  if (!details.uppercase) {
    return {
      valid: false,
      message: 'La contrasena debe contener al menos una mayuscula',
      details,
    };
  }

  if (!details.lowercase) {
    return {
      valid: false,
      message: 'La contrasena debe contener al menos una minuscula',
      details,
    };
  }

  if (!details.special) {
    return {
      valid: false,
      message: 'La contrasena debe contener al menos un caracter especial',
      details,
    };
  }

  return { valid: true, message: '', details };
}

export function getPasswordRequirements(password: string) {
  return {
    length: password.length >= CONFIG.MIN_PASSWORD_LENGTH,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{}|;:',.<>?]/.test(password),
  };
}
