'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/better-auth/auth-client';
import { deleteAccount } from '../actions';
import { validateConfirmationText } from '../utils/validation';

interface DeleteAccountFormData {
  confirmationText: string;
}

export const useAccountDeletion = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const t = useTranslations('Settings.dangerZone');

  const validateForm = (formData: DeleteAccountFormData): boolean => {
    const newErrors: Record<string, string> = {};

    // Check confirmation text
    const expectedText = t('confirmationTextRequired');
    const errorMessage = t('confirmationErrorMessage');
    const confirmationValidation = validateConfirmationText(
      formData.confirmationText,
      expectedText,
      errorMessage
    );
    if (!confirmationValidation.isValid) {
      newErrors.confirmationText = confirmationValidation.error || 'Texto de confirmação inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDeleteAccount = async (formData: DeleteAccountFormData) => {
    setErrors({});

    // Client-side validation
    if (!validateForm(formData)) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await deleteAccount({
          confirmationText: formData.confirmationText,
        });

        if (result.success) {
          toast.success(t('deleteSuccess'));
          
          // Close confirmation modal
          setIsConfirmationOpen(false);
          
          // Automatic logout and redirect after account deletion
          setTimeout(async () => {
            try {
              // Sign out the user
              await authClient.signOut();
              console.log('🚪 User logged out after account deletion');
              
              // Redirect to home page
              router.push('/');
            } catch (logoutError) {
              console.error('[useAccountDeletion] Logout error:', logoutError);
              // Still redirect even if logout fails
              router.push('/');
            }
          }, 1500);
        } else {
          toast.error(result.error || t('deleteError'));
          
          // Set field-specific errors
          if (result.error?.includes('confirmação')) {
            setErrors({ confirmationText: result.error });
          }
        }
      } catch (error) {
        console.error('[useAccountDeletion] Error:', error);
        toast.error(t('unexpectedError'));
      }
    });
  };

  const openConfirmation = () => {
    setIsConfirmationOpen(true);
    setErrors({});
  };

  const closeConfirmation = () => {
    setIsConfirmationOpen(false);
    setErrors({});
  };

  return {
    deleteAccount: handleDeleteAccount,
    validateForm,
    isLoading: isPending,
    errors,
    clearErrors: () => setErrors({}),
    isConfirmationOpen,
    openConfirmation,
    closeConfirmation,
  };
};
