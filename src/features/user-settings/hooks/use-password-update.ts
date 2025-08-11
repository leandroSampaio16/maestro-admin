'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { updatePassword } from '../actions';
import { validatePassword } from '../utils/validation';
import type { PasswordFormData, PasswordStrength } from '../types';


export const usePasswordUpdate = () => {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
  const t = useTranslations('Settings.password');

  const validatePasswordForm = (formData: PasswordFormData): boolean => {
    const newErrors: Record<string, string> = {};

    // Check if current password is provided
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
    }

    // Check if new password is provided
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else {
      // Validate password strength
      const strength = validatePassword(formData.newPassword);
      setPasswordStrength(strength);
      
      if (strength.score < 3) {
        newErrors.newPassword = 'Senha muito fraca. ' + strength.feedback.join(', ');
      }
    }

    // Check if passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    // Check if new password is different from current
    if (formData.currentPassword && formData.newPassword && 
        formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'Nova senha deve ser diferente da atual';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdatePassword = async (formData: PasswordFormData) => {
    setErrors({});

    // Client-side validation
    if (!validatePasswordForm(formData)) {
      return;
    }

    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
      try {
        const result = await updatePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        });

        if (result.success) {
          toast.success(t('success'));
          resolve(true);
        } else {
          toast.error(result.error || t('error'));
          
          // Set field-specific errors
          if (result.error?.includes('atual incorreta')) {
            setErrors({ currentPassword: result.error });
          } else if (result.error?.includes('fraca')) {
            setErrors({ newPassword: result.error });
          }
          resolve(false);
        }
      } catch (error) {
        console.error('[usePasswordUpdate] Error:', error);
        toast.error(t('unexpectedError'));
        resolve(false);
      }
      });
    });
  };

  const handlePasswordChange = (newPassword: string) => {
    const strength = validatePassword(newPassword);
    setPasswordStrength(strength);
    
    // Clear password-related errors when typing
    if (errors.newPassword) {
      setErrors(prev => ({ ...prev, newPassword: '' }));
    }
  };

  return {
    updatePassword: handleUpdatePassword,
    validateForm: validatePasswordForm,
    handlePasswordChange,
    isLoading: isPending,
    errors,
    passwordStrength,
    clearErrors: () => setErrors({}),
  };
};
