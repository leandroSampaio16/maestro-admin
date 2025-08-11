'use client';

import { useState, useTransition } from 'react';
import { useSession } from '@/lib/better-auth/auth-client';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { uploadAvatar } from '../actions';
import { validateAvatarFile, createFilePreview, resizeImage } from '../utils';
import type { AvatarUploadState } from '../types';

export const useAvatarUpload = () => {
  const { data: session, refetch } = useSession();
  const t = useTranslations('Settings.avatar');
  const [isPending, startTransition] = useTransition();
  const [uploadState, setUploadState] = useState<AvatarUploadState>({
    isUploading: false,
    progress: 0,
  });

  const handleFileSelect = async (file: File) => {
    // Validate file
    const validation = validateAvatarFile(file);
    if (!validation.isValid) {
      setUploadState(prev => ({ ...prev, error: validation.error }));
      toast.error(validation.error);
      return;
    }

    try {
      // Create preview
      const preview = await createFilePreview(file);
      setUploadState(prev => ({ 
        ...prev, 
        preview, 
        error: undefined 
      }));
    } catch (error) {
      console.error('[useAvatarUpload] Preview error:', error);
      setUploadState(prev => ({ 
        ...prev, 
        error: 'Erro ao criar preview da imagem' 
      }));
    }
  };

  const handleUpload = async (file: File) => {
    if (!file) {
      toast.error('Nenhum arquivo selecionado');
      return;
    }

    setUploadState(prev => ({ 
      ...prev, 
      isUploading: true, 
      progress: 0,
      error: undefined 
    }));

    startTransition(async () => {
      try {
        // Resize image before upload
        const resizedFile = await resizeImage(file, 200, 200, 0.8);
        
        // Simulate progress for better UX
        setUploadState(prev => ({ ...prev, progress: 25 }));

        // Create FormData
        const formData = new FormData();
        formData.append('avatar', resizedFile);

        setUploadState(prev => ({ ...prev, progress: 50 }));

        // Upload to server
        const result = await uploadAvatar(formData);

        setUploadState(prev => ({ ...prev, progress: 75 }));

        if (result.success && result.imageUrl) {
          // Avatar updated successfully - refresh session to update UI immediately
          await refetch();

          setUploadState(prev => ({ 
            ...prev, 
            progress: 100,
            isUploading: false,
            preview: result.imageUrl 
          }));

          toast.success(t('uploadSuccess'));
          
          // Start fade-out animation after showing success
          setTimeout(() => {
            setUploadState(prev => ({
              ...prev,
              isFadingOut: true
            }));
            
            // Clear preview after fade-out animation completes
            setTimeout(() => {
              setUploadState({
                isUploading: false,
                preview: undefined,
                progress: 0,
                error: undefined,
                isFadingOut: false
              });
            }, 500); // Duration of fade-out animation
          }, 1500); // Show success for 1.5s before starting fade-out
        } else {
          setUploadState(prev => ({ 
            ...prev, 
            isUploading: false,
            error: result.error 
          }));
          toast.error(result.error || t('uploadError'));
        }
      } catch (error) {
        console.error('[useAvatarUpload] Upload error:', error);
        setUploadState(prev => ({ 
          ...prev, 
          isUploading: false,
          error: t('unexpectedUploadError') 
        }));
        toast.error(t('unexpectedUploadError'));
      }
    });
  };

  const clearPreview = () => {
    setUploadState({
      isUploading: false,
      progress: 0,
    });
  };

  const getCurrentAvatarUrl = () => {
    return uploadState.preview || session?.user?.image || undefined;
  };

  const clearFileInput = () => {
    // Function to clear file input - will be called from component
    setUploadState({
      isUploading: false,
      preview: undefined,
      progress: 0,
      error: undefined,
      isFadingOut: true,
    });
    setTimeout(() => {
      setUploadState({
        isUploading: false,
        preview: undefined,
        progress: 0,
        error: undefined,
        isFadingOut: false,
      });
    }, 500);
  };

  return {
    uploadState,
    handleFileSelect,
    handleUpload,
    clearPreview,
    getCurrentAvatarUrl,
    clearFileInput,
    isLoading: isPending || uploadState.isUploading,
  };
};
