'use server';

import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { validateAvatarFile } from '../utils/validation';
import { uploadAvatarToBlob, deleteOldAvatarFromBlob } from '../utils/blob-helpers';
import { updateProfile } from './update-profile';
import type { UploadAvatarResponse } from '../types';

export const uploadAvatar = async (
  formData: FormData
): Promise<UploadAvatarResponse> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Não autenticado',
      };
    }

    const file = formData.get('avatar') as File;
    
    if (!file || file.size === 0) {
      return {
        success: false,
        error: 'Nenhum arquivo selecionado',
      };
    }

    // Validate file
    const validation = validateAvatarFile(file);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Get current user image to delete later
    const currentImageUrl = session.user.image;

    // Upload new avatar to Vercel Blob
    const uploadResult = await uploadAvatarToBlob(file, session.user.id);
    
    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error,
      };
    }

    // Update user profile with new image URL
    const updateResult = await updateProfile({
      imageUrl: uploadResult.url,
    });

    if (!updateResult.success) {
      return {
        success: false,
        error: 'Falha ao atualizar perfil',
      };
    }

    // Delete old avatar if it exists (using the dedicated function)
    try {
      const deleteResult = await deleteOldAvatarFromBlob(currentImageUrl);
      if (!deleteResult.success && deleteResult.error) {
        console.warn('[uploadAvatar] Failed to delete old avatar:', deleteResult.error);
        // Don't fail the entire operation if old image deletion fails
      }
    } catch (error) {
      console.warn('[uploadAvatar] Error deleting old avatar:', error);
      // Don't fail the entire operation if old image deletion fails
    }

    console.log(`✅ Avatar uploaded for user ${session.user.id}: ${uploadResult.url}`);

    return {
      success: true,
      imageUrl: uploadResult.url,
    };
  } catch (error) {
    console.error('[uploadAvatar] Error:', error);
    return {
      success: false,
      error: 'Erro interno do servidor',
    };
  }
};
