'use client';

import { useState, useTransition } from 'react';
import { useSession } from '@/lib/better-auth/auth-client';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { updateProfile } from '../actions';
import { validateName } from '../utils/validation';
import type { ProfileFormData, UpdateProfileParams } from '../types';

export const useProfileUpdate = () => {
  const { data: session, refetch } = useSession();
  const t = useTranslations('Settings.profile');
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleUpdateProfile = async (params: UpdateProfileParams) => {
    setErrors({});

    // Client-side validation
    if (params.name !== undefined) {
      const nameValidation = validateName(params.name);
      if (!nameValidation.isValid) {
        setErrors({ name: nameValidation.error || 'Nome inválido' });
        return;
      }
    }

    startTransition(async () => {
      try {
        const result = await updateProfile(params);

        if (result.success) {
          // Profile updated successfully - refresh session to update UI immediately
          await refetch();
          toast.success(t('success'));
        } else {
          toast.error(result.error || t('error'));
          
          // Set field-specific errors if available
          if (result.error?.includes('Nome')) {
            setErrors({ name: result.error });
          }
        }
      } catch (error) {
        console.error('[useProfileUpdate] Error:', error);
        toast.error(t('unexpectedError'));
      }
    });
  };

  const getInitialFormData = (): ProfileFormData => ({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    image: session?.user?.image || undefined,
  });

  return {
    updateProfile: handleUpdateProfile,
    isLoading: isPending,
    errors,
    clearErrors: () => setErrors({}),
    getInitialFormData,
  };
};
