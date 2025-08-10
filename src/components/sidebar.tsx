'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Building2, LogOut } from 'lucide-react';
import { logout } from '@/lib/auth';

export function Sidebar() {
  const pathname = usePathname();

  const linkClasses = (path: string) =>
    `flex items-center gap-2 p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${
      pathname === path ? 'bg-slate-300 dark:bg-slate-800' : ''
    }`;

  return (
    <aside className="w-64 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col justify-between">
      <nav className="p-4 space-y-2">
        <Link href="/admin" className={linkClasses('/admin')}>
          <Home size={18} /> Dashboard
        </Link>
        <Link href="/admin/utilizadores" className={linkClasses('/admin/utilizadores')}>
          <Users size={18} /> Utilizadores
        </Link>
        <Link href="/admin/organizacoes" className={linkClasses('/admin/organizacoes')}>
          <Building2 size={18} /> Organizações
        </Link>
      </nav>
      <button
        onClick={() => {
          logout();
          window.location.href = '/login';
        }}
        className="flex items-center gap-2 p-4 hover:bg-red-600 hover:text-white"
      >
        <LogOut size={18} /> Sair
      </button>
    </aside>
  );
}
