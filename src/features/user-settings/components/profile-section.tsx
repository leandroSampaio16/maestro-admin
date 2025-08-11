'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Save, User } from 'lucide-react';
import { useProfileUpdate } from '../hooks';
import { AvatarUpload } from './avatar-upload';
import type { ProfileFormData } from '../types';

interface ProfileSectionProps {
  initialData?: ProfileFormData;
}

export const ProfileSection = ({ initialData: propInitialData }: ProfileSectionProps) => {
  const t = useTranslations('Settings.profile');
  const tAvatar = useTranslations('Settings.avatar');
  const { 
    updateProfile, 
    isLoading, 
    errors, 
    clearErrors, 
    getInitialFormData 
  } = useProfileUpdate();

  // Use props data if available, otherwise fallback to session data
  const initialData = propInitialData || getInitialFormData();
  const [formData, setFormData] = useState({
    name: initialData.name,
    email: initialData.email,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(value !== initialData[field as keyof typeof initialData]);
    
    // Clear errors when user starts typing
    if (errors[field]) {
      clearErrors();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasChanges) return;

    await updateProfile({
      name: formData.name !== initialData.name ? formData.name : undefined,
    });

    // Reset hasChanges if successful
    setHasChanges(false);
  };

  const handleReset = () => {
    setFormData({
      name: initialData.name,
      email: initialData.email,
    });
    setHasChanges(false);
    clearErrors();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>{t('title')}</span>
        </CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Avatar Upload Section */}
        <div>
          <Label className="text-base font-medium">{tAvatar('title')}</Label>
          <div className="mt-2">
            <AvatarUpload />
          </div>
        </div>

        <Separator />

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={t('namePlaceholder')}
                className={errors.name ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Email Field (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                {t('emailReadonly')}
              </p>
            </div>
          </div>

          {/* Form Actions */}
          {hasChanges && (
            <div className="flex items-center justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isLoading}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !hasChanges}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Save className="mr-2 h-4 w-4 animate-spin" />
                    {t('updatingProfile')}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t('saveChanges')}
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
