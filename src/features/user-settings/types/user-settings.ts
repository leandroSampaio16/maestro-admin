// User Settings Types
export interface UpdateProfileParams {
  name?: string;
  imageUrl?: string;
}

export interface UpdatePasswordParams {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountParams {
  confirmationText: string;
}

export interface UploadAvatarParams {
  file: File;
  userId: string;
}

// Response types
export interface UserSettingsResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UploadAvatarResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

// UI State types
export interface ProfileFormData {
  name: string;
  email: string; // readonly
  image?: string;
}

export interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  minLength: boolean;
}

// File validation types
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface AvatarUploadState {
  isUploading: boolean;
  progress: number;
  preview?: string;
  error?: string;
  isFadingOut?: boolean;
}
