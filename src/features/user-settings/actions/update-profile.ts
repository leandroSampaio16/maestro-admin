'use server';

import { db } from '@/db/drizzle';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { validateName } from '../utils/validation';
import type { UpdateProfileParams, UserSettingsResponse } from '../types';

export const updateProfile = async (
  params: UpdateProfileParams
): Promise<UserSettingsResponse> => {
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

    const { name, imageUrl } = params;

    // Validate name if provided
    if (name !== undefined) {
      const nameValidation = validateName(name);
      if (!nameValidation.isValid) {
        return {
          success: false,
          error: nameValidation.error,
        };
      }
    }

    // Build update object with only provided fields
    const updateData: Partial<typeof user.$inferInsert> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (imageUrl !== undefined) updateData.image = imageUrl;

    // Update user in database
    const [updatedUser] = await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, session.user.id))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      });

    if (!updatedUser) {
      return {
        success: false,
        error: 'Usuário não encontrado',
      };
    }

    console.log(`✅ Profile updated for user ${session.user.id}:`, updateData);

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    console.error('[updateProfile] Error:', error);
    return {
      success: false,
      error: 'Erro interno do servidor',
    };
  }
};
