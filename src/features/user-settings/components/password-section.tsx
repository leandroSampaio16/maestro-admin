'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, Lock, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePasswordUpdate, useAuthProvider } from '../hooks';
import { getPasswordStrengthText, getPasswordStrengthColor } from '../utils/validation';
import type { PasswordFormData } from '../types';

export const PasswordSection = () => {
  const t = useTranslations('Settings.password');
  
  const {
    updatePassword,
    handlePasswordChange,
    isLoading,
    errors,
    passwordStrength,
    clearErrors,
  } = usePasswordUpdate();

  const { hasThirdPartyOnly, isLoading: authLoading } = useAuthProvider();

  // All hooks must be called before any conditional returns
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Don't render password section for third-party only accounts
  if (authLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>{t('loadingAuth')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasThirdPartyOnly) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5" />
            <span>{t('thirdPartyAuthTitle')}</span>
          </CardTitle>
          <CardDescription>
            {t('thirdPartyAuthDescription')}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleInputChange = (field: keyof PasswordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Handle password strength validation for new password
    if (field === 'newPassword') {
      handlePasswordChange(value);
    }
    
    // Clear errors when user starts typing
    if (errors[field]) {
      clearErrors();
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updatePassword(formData);
    
    // Note: updatePassword hook handles success state internally
    // and will show toast notifications accordingly
  };

  const hasFormData = formData.currentPassword || formData.newPassword || formData.confirmPassword;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lock className="h-5 w-5" />
          <span>Alterar Senha</span>
        </CardTitle>
        <CardDescription>
          Atualize sua senha para manter sua conta segura
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                placeholder="Digite sua senha atual"
                className={cn(
                  'pr-10',
                  errors.currentPassword ? 'border-destructive' : ''
                )}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('current')}
                disabled={isLoading}
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-destructive">{errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                placeholder="Digite sua nova senha"
                className={cn(
                  'pr-10',
                  errors.newPassword ? 'border-destructive' : ''
                )}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('new')}
                disabled={isLoading}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword}</p>
            )}
          </div>

          {/* Password Strength Indicator */}
          {passwordStrength && formData.newPassword && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Força da senha:</span>
                <span className={cn(
                  'font-medium',
                  passwordStrength.score >= 3 ? 'text-green-600' : 'text-orange-600'
                )}>
                  {getPasswordStrengthText(passwordStrength.score)}
                </span>
              </div>
              <Progress 
                value={(passwordStrength.score / 5) * 100} 
                className="h-2"
              />
              {passwordStrength.feedback.length > 0 && (
                <ul className="text-xs text-muted-foreground space-y-1">
                  {passwordStrength.feedback.map((feedback, index) => (
                    <li key={index} className="flex items-center space-x-1">
                      <span className="text-orange-500">•</span>
                      <span>{feedback}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirme sua nova senha"
                className={cn(
                  'pr-10',
                  errors.confirmPassword ? 'border-destructive' : ''
                )}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('confirm')}
                disabled={isLoading}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isLoading || !hasFormData}
              className="min-w-[140px]"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Atualizando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Atualizar Senha</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
