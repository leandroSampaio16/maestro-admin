import type { PasswordStrength, FileValidationResult } from '../types';

// Password validation
export const validatePassword = (password: string): PasswordStrength => {
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const minLength = password.length >= 8;

  const checks = [hasUppercase, hasLowercase, hasNumber, hasSpecialChar, minLength];
  const score = checks.filter(Boolean).length;

  const feedback: string[] = [];
  if (!minLength) feedback.push('Mínimo 8 caracteres');
  if (!hasUppercase) feedback.push('Pelo menos uma letra maiúscula');
  if (!hasLowercase) feedback.push('Pelo menos uma letra minúscula');
  if (!hasNumber) feedback.push('Pelo menos um número');
  if (!hasSpecialChar) feedback.push('Pelo menos um caractere especial');

  return {
    score,
    feedback,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    minLength,
  };
};

export const getPasswordStrengthText = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return 'Muito fraca';
    case 2:
      return 'Fraca';
    case 3:
      return 'Média';
    case 4:
      return 'Forte';
    case 5:
      return 'Muito forte';
    default:
      return 'Muito fraca';
  }
};

export const getPasswordStrengthColor = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return 'bg-red-500';
    case 2:
      return 'bg-orange-500';
    case 3:
      return 'bg-yellow-500';
    case 4:
      return 'bg-green-500';
    case 5:
      return 'bg-green-600';
    default:
      return 'bg-red-500';
  }
};

// Name validation
export const validateName = (name: string): { isValid: boolean; error?: string } => {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return { isValid: false, error: 'Nome é obrigatório' };
  }
  
  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Nome deve ter pelo menos 2 caracteres' };
  }
  
  if (trimmedName.length > 50) {
    return { isValid: false, error: 'Nome deve ter no máximo 50 caracteres' };
  }
  
  return { isValid: true };
};

// File validation for avatar upload
export const validateAvatarFile = (file: File): FileValidationResult => {
  const maxSizeInMB = 5;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Formato não suportado. Use JPG, PNG ou WebP.',
    };
  }

  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `Arquivo muito grande. Máximo ${maxSizeInMB}MB.`,
    };
  }

  return { isValid: true };
};

// Confirmation text validation for account deletion
export const validateConfirmationText = (
  input: string,
  expected: string,
  errorMessage: string
): { isValid: boolean; error?: string } => {
  if (input.trim().toUpperCase() !== expected.toUpperCase()) {
    return {
      isValid: false,
      error: errorMessage,
    };
  }
  
  return { isValid: true };
};
