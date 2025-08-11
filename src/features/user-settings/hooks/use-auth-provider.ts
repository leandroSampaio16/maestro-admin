'use client';

import { useState, useEffect } from 'react';
import { checkAuthProvider, type AuthProviderInfo } from '../actions';

export const useAuthProvider = () => {
  const [authInfo, setAuthInfo] = useState<AuthProviderInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthProvider = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await checkAuthProvider();
        
        if (result.success && result.data) {
          setAuthInfo(result.data);
        } else {
          setError(result.error || 'Erro ao verificar fornecedores de autenticação');
        }
      } catch (err) {
        console.error('[useAuthProvider] Error:', err);
        setError('Erro inesperado ao verificar autenticação');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthProvider();
  }, []);

  return {
    authInfo,
    isLoading,
    error,
    hasEmailPassword: authInfo?.hasEmailPassword ?? false,
    hasThirdPartyOnly: authInfo?.hasThirdPartyOnly ?? false,
    providers: authInfo?.providers ?? []
  };
};
