import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/better-auth/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { Separator } from '@/components/ui/separator';
import { 
  ProfileSection, 
  PasswordSection, 
  DangerZone 
} from '@/features/user-settings/components';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Settings');
  
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session?.user) {
    redirect('/login');
  }

  const t = await getTranslations('Settings');

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* Page Header */}
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-8">
        {/* Profile Section */}
        <section>
          <ProfileSection 
            initialData={{
              name: session.user.name || '',
              email: session.user.email || '',
              image: session.user.image || undefined
            }}
          />
        </section>

        <Separator />

        {/* Password Section */}
        <section>
          <PasswordSection />
        </section>

        <Separator />

        {/* Danger Zone */}
        <section>
          <DangerZone />
        </section>
      </div>
    </div>
  );
}
