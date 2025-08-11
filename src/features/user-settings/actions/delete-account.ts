'use server';

import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { db } from '@/db/drizzle';
import { user, account, session } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import { validateConfirmationText } from '../utils/validation';
import { deleteUserFolderFromBlob } from '../utils/blob-helpers';
import type { DeleteAccountParams, UserSettingsResponse } from '../types';

export const deleteAccount = async (
  params: DeleteAccountParams
): Promise<UserSettingsResponse> => {
  const t = await getTranslations('Settings.dangerZone');
  
  try {
    const sessionData = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!sessionData?.user?.id) {
      return {
        success: false,
        error: t('notAuthenticated'),
      };
    }

    const { confirmationText } = params;

    // Validate confirmation text
    const expectedText = t('confirmationTextRequired');
    const errorMessage = t('confirmationErrorMessage');
    const confirmationValidation = validateConfirmationText(
      confirmationText,
      expectedText,
      errorMessage
    );
    if (!confirmationValidation.isValid) {
      return {
        success: false,
        error: confirmationValidation.error,
      };
    }

    // Delete entire user folder from Vercel Blob (all avatars and files)
    try {
      const blobResult = await deleteUserFolderFromBlob(sessionData.user.id);
      if (blobResult.success && blobResult.deletedCount > 0) {
        console.log(`🗑️ Deleted ${blobResult.deletedCount} files from user ${sessionData.user.id} folder`);
      }
    } catch (error) {
      console.warn('[deleteAccount] Failed to delete user folder from blob:', error);
      // Continue with account deletion even if blob deletion fails
    }

    // Delete user data from database directly
    // This is more reliable than using better-auth API on server-side
    try {
      const userId = sessionData.user.id;
      
      // Delete user's sessions first
      await db.delete(session).where(eq(session.userId, userId));
      console.log(`🗑️ Deleted sessions for user ${userId}`);
      
      // Delete user's accounts (OAuth connections)
      await db.delete(account).where(eq(account.userId, userId));
      console.log(`🗑️ Deleted accounts for user ${userId}`);
      
      // Finally, delete the user record
      await db.delete(user).where(eq(user.id, userId));
      console.log(`🗑️ Deleted user ${userId}`);

      return {
        success: true,
        data: { message: t('deleteSuccess') },
      };
    } catch (dbError) {
      console.error('[deleteAccount] Database error:', dbError);
      
      return {
        success: false,
        error: t('databaseError'),
      };
    }
  } catch (error) {
    console.error('[deleteAccount] Error:', error);
    return {
      success: false,
      error: t('serverError'),
    };
  }
};
