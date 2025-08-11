'use server';

import { db } from '@/db/drizzle';
import { account } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';

export interface AuthProviderInfo {
  hasEmailPassword: boolean;
  hasThirdPartyOnly: boolean;
  providers: string[];
}

export const checkAuthProvider = async (): Promise<{
  success: boolean;
  data?: AuthProviderInfo;
  error?: string;
}> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: 'Utilizador não autenticado' };
    }

    // Get all authentication providers for this user
    const userAccounts = await db
      .select({ providerId: account.providerId })
      .from(account)
      .where(eq(account.userId, session.user.id));

    const providers = userAccounts.map(acc => acc.providerId);
    const hasEmailPassword = providers.includes('credential');
    const hasThirdPartyOnly = providers.length > 0 && !hasEmailPassword;

    return {
      success: true,
      data: {
        hasEmailPassword,
        hasThirdPartyOnly,
        providers
      }
    };
  } catch (error) {
    console.error('[checkAuthProvider] Error:', error);
    return {
      success: false,
      error: 'Erro ao verificar fornecedores de autenticação'
    };
  }
};
