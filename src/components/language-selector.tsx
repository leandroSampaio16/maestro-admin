"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function LanguageSelector() {
  const t = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLanguageChange = (newLocale: 'pt' | 'en') => {
    // Preserve query parameters when switching language
    const queryString = searchParams.toString();
    const fullPath = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(fullPath, { locale: newLocale });
  };

  const currentLanguage = locale === 'pt' ? 'Português' : 'English';
  const targetLanguage = locale === 'pt' ? 'English' : 'Português';
  const targetLocale = locale === 'pt' ? 'en' : 'pt';

  return (
    <DropdownMenuItem
      className="cursor-pointer"
      onClick={() => handleLanguageChange(targetLocale)}
    >
      <Languages className="h-4 w-4" />
      <span className="flex items-center gap-2">
         {targetLanguage}
      </span>
    </DropdownMenuItem>
  );
}
