'use server';

import { db } from '@/db/drizzle';
import { account } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { validatePassword } from '../utils/validation';
import type { UpdatePasswordParams, UserSettingsResponse } from '../types';

export const updatePassword = async (
  params: UpdatePasswordParams
): Promise<UserSettingsResponse> => {
  const t = await getTranslations('Settings.password');
  
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: t('notAuthenticated'),
      };
    }

    // Check if user has only third-party authentication (Google, etc.)
    const userAccounts = await db
      .select({ providerId: account.providerId })
      .from(account)
      .where(eq(account.userId, session.user.id));

    // If user only has third-party auth (no email/password), can't change password
    const hasOnlyThirdParty = userAccounts.length > 0 && 
      userAccounts.every(acc => acc.providerId !== 'credential');
    
    if (hasOnlyThirdParty) {
      return { 
        success: false, 
        error: t('thirdPartyOnlyError') 
      };
    }

    const { currentPassword, newPassword } = params;

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (passwordValidation.score < 3) {
      return {
        success: false,
        error: t('weakPasswordError') + ' ' + passwordValidation.feedback.join(', '),
      };
    }

    // Use better-auth API to update password
    try {
      const result = await auth.api.changePassword({
        body: {
          currentPassword,
          newPassword,
        },
        headers: await headers(),
      });

      if (!result) {
        return {
          success: false,
          error: t('incorrectCurrentPassword'),
        };
      }

      console.log(`✅ Password updated for user ${session.user.id}`);

      return {
        success: true,
        data: { message: t('success') },
      };
    } catch (authError) {
      console.error('[updatePassword] Auth error:', authError);
      return {
        success: false,
        error: t('incorrectCurrentPassword'),
      };
    }
  } catch (error) {
    console.error('[updatePassword] Error:', error);
    return {
      success: false,
      error: t('serverError'),
    };
  }
};
