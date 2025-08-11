import { put, del, list } from '@vercel/blob';

// Generate a unique filename for avatar upload
export const generateAvatarFilename = (userId: string, file: File): string => {
  const timestamp = Date.now();
  const extension = file.name.split('.').pop() || 'jpg';
  return `avatars/${userId}/avatar-${timestamp}.${extension}`;
};

// Upload avatar to Vercel Blob
export const uploadAvatarToBlob = async (
  file: File,
  userId: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const filename = generateAvatarFilename(userId, file);
    
    const blob = await put(filename, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return {
      success: true,
      url: blob.url,
    };
  } catch (error) {
    console.error('[uploadAvatarToBlob] Error:', error);
    return {
      success: false,
      error: 'Falha no upload da imagem',
    };
  }
};

// Delete avatar from Vercel Blob
export const deleteAvatarFromBlob = async (
  imageUrl: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Pass the complete URL to del() as required by Vercel Blob API
    await del(imageUrl, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return { success: true };
  } catch (error) {
    console.error('[deleteAvatarFromBlob] Error:', error);
    return {
      success: false,
      error: 'Falha ao deletar imagem anterior',
    };
  }
};

// Delete all user files from Vercel Blob (entire user folder)
export const deleteUserFolderFromBlob = async (
  userId: string
): Promise<{ success: boolean; deletedCount: number; error?: string }> => {
  try {
    // List all files in the user's folder
    const { blobs } = await list({
      prefix: `avatars/${userId}/`,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (blobs.length === 0) {
      return { success: true, deletedCount: 0 };
    }

    // Delete all files in the user's folder
    const deletePromises = blobs.map(blob => 
      del(blob.url, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })
    );

    await Promise.all(deletePromises);
    
    console.log(`🗑️ Deleted ${blobs.length} files from user ${userId} folder`);
    
    return { 
      success: true, 
      deletedCount: blobs.length 
    };
  } catch (error) {
    console.error('[deleteUserFolderFromBlob] Error:', error);
    return {
      success: false,
      deletedCount: 0,
      error: 'Falha ao deletar pasta do utilizador',
    };
  }
};

// Delete old avatar when uploading new one
export const deleteOldAvatarFromBlob = async (
  oldImageUrl: string | null | undefined
): Promise<{ success: boolean; error?: string }> => {
  if (!oldImageUrl || !oldImageUrl.includes('blob.vercel-storage.com')) {
    return { success: true }; // No old avatar to delete
  }

  try {
    const result = await deleteAvatarFromBlob(oldImageUrl);
    if (result.success) {
      console.log('🗑️ Deleted old avatar:', oldImageUrl);
    }
    return result;
  } catch (error) {
    console.error('[deleteOldAvatarFromBlob] Error:', error);
    return {
      success: false,
      error: 'Falha ao deletar avatar anterior',
    };
  }
};

// Create a preview URL for file before upload
export const createFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to create preview'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// Resize image before upload (client-side)
export const resizeImage = (
  file: File,
  maxWidth: number = 200,
  maxHeight: number = 200,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Failed to resize image'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};
