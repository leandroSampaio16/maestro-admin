'use client';

import { useRef, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAvatarUpload } from '../hooks';

interface AvatarUploadProps {
  className?: string;
}

export const AvatarUpload = ({ className }: AvatarUploadProps) => {
  const t = useTranslations('Settings.avatar');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const {
    uploadState,
    handleFileSelect,
    handleUpload,
    clearFileInput,
    clearPreview,
    getCurrentAvatarUrl,
    isLoading,
  } = useAvatarUpload();

  const currentAvatarUrl = getCurrentAvatarUrl();

  // Clear file input when upload is completed successfully
  useEffect(() => {
    if (uploadState.progress === 100 && !uploadState.isUploading && !uploadState.error) {
      // Clear the file input after successful upload
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [uploadState.progress, uploadState.isUploading, uploadState.error]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileChange(file || null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    handleFileChange(file || null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleConfirmUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Current Avatar Display */}
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage 
            src={currentAvatarUrl} 
            alt="Avatar do usuário" 
          />
          <AvatarFallback className="bg-muted">
            <User className="h-8 w-8 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Foto de perfil</p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG ou WebP. Máximo 5MB.
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-colors',
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          isLoading && 'pointer-events-none opacity-50'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="p-6 text-center">
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium mb-1">
            Clique para selecionar ou arraste uma imagem
          </p>
          <p className="text-xs text-muted-foreground">
            Recomendado: 200x200px
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />
      </div>

      {/* Preview and Upload Controls */}
      {uploadState.preview && !uploadState.isUploading && (
        <div className={cn(
          "space-y-3 transition-all duration-500 ease-out",
          uploadState.isFadingOut 
            ? "opacity-0 transform scale-95" 
            : "opacity-100 transform scale-100"
        )}>
          <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={uploadState.preview} alt="Preview" />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <p className="text-sm font-medium">Nova imagem selecionada</p>
              <p className="text-xs text-muted-foreground">
                Clique em "Atualizar" para salvar
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={clearPreview}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={handleConfirmUpload}
              disabled={isLoading}
              className="flex-1"
            >
              Atualizar Avatar
            </Button>
            <Button 
              variant="outline" 
              onClick={clearPreview}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploadState.isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Fazendo upload...</span>
            <span>{uploadState.progress}%</span>
          </div>
          <Progress value={uploadState.progress} className="h-2" />
        </div>
      )}

      {/* Error Display */}
      {uploadState.error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{uploadState.error}</p>
        </div>
      )}

    </div>
  );
};
