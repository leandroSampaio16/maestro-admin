'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAccountDeletion } from '../hooks';

export const DangerZone = () => {
  const t = useTranslations('Settings.dangerZone');
  
  const {
    deleteAccount,
    isLoading,
    errors,
    clearErrors,
    isConfirmationOpen,
    openConfirmation,
    closeConfirmation,
  } = useAccountDeletion();

  const [formData, setFormData] = useState({
    confirmationText: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      clearErrors();
    }
  };

  const handleOpenConfirmation = () => {
    setFormData({ confirmationText: '' });
    clearErrors();
    openConfirmation();
  };

  const handleCloseConfirmation = () => {
    setFormData({ confirmationText: '' });
    clearErrors();
    closeConfirmation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await deleteAccount(formData);
  };

  const isFormValid = formData.confirmationText;

  return (
    <>
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>{t('title')}</span>
          </CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <h4 className="font-medium text-destructive mb-2">
              {t('deleteAccount')}
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              {t('deleteAccountDescription')}
            </p>
            
            <Button
              variant="destructive"
              onClick={handleOpenConfirmation}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('deleteButton')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmationOpen} onOpenChange={handleCloseConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center py-6 space-x-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>{t('confirmDeletion')}</span>
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p>
                <strong>{t('confirmationText')}</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>{t('dataList.profile')}</li>
                <li>{t('dataList.searchHistory')}</li>
                <li>{t('dataList.accountSettings')}</li>
                <li>{t('dataList.organizationData')}</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                {t('confirmationInstruction')}
              </p>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-6">
            {/* Confirmation Text */}
            <div className="space-y-2">
              <Label htmlFor="confirmationText">
                {t('confirmationPlaceholder')}
              </Label>
              <Input
                id="confirmationText"
                type="text"
                value={formData.confirmationText}
                onChange={(e) => handleInputChange('confirmationText', e.target.value)}
                placeholder={t('confirmationPlaceholder')}
                className={errors.confirmationText ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.confirmationText && (
                <p className="text-sm text-destructive">{errors.confirmationText}</p>
              )}
            </div>

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseConfirmation}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {t('cancelButton')}
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isLoading || !isFormValid}
                className="w-full sm:w-auto min-w-[140px]"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>{t('deleting')}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Trash2 className="h-4 w-4" />
                    <span>{t('confirmButton')}</span>
                  </div>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
