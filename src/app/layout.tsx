import { routing } from '@/i18n/routing';
import { redirect } from 'next/navigation';

// This is the minimal root layout that redirects to locale-based routing
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout should never actually render because middleware handles redirects
  // But we need it for Next.js structure
  return children;
}
