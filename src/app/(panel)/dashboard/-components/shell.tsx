'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { roleLabel } from '~/lib/format';
import type { Role } from '~/types/library';

import { SignOutButton } from './sign-out-button';

type NavItem = {
  href: string;
  label: string;
  roles: Role[];
};

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Beranda', roles: ['SUPER_ADMIN', 'ADMIN', 'MEMBER'] },
  { href: '/dashboard/catalog', label: 'Katalog Buku', roles: ['SUPER_ADMIN', 'ADMIN', 'MEMBER'] },
  { href: '/dashboard/my-loans', label: 'Riwayat Saya', roles: ['MEMBER'] },
  { href: '/dashboard/loans/new', label: 'Peminjaman Baru', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/dashboard/loans', label: 'Daftar Peminjaman', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/dashboard/books', label: 'Kelola Buku', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/dashboard/members', label: 'Anggota', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/dashboard/admins', label: 'Kelola Admin', roles: ['SUPER_ADMIN'] },
];

export function Shell({
  role,
  name,
  memberNumber,
  children,
}: React.PropsWithChildren<{
  role: Role;
  name: string;
  memberNumber: string | null;
}>) {
  const pathname = usePathname();
  const items = NAV.filter((item) => item.roles.includes(role));

  // Pilih satu menu paling spesifik (href terpanjang) yang cocok dengan URL,
  // supaya /loans dan /loans/new tidak aktif berbarengan.
  const activeHref = items
    .filter(
      (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
    )
    .reduce(
      (best, item) => (item.href.length > best.length ? item.href : best),
      '',
    );

  const isActive = (href: string) => href === activeHref;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-200">
          <div className="h-7 w-7 rounded-md border-2 border-gray-900" />
          <span className="font-bold text-gray-900">Perpustakaan</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              className={`block rounded-md px-3 py-2 text-sm ${
                isActive(item.href)
                  ? 'bg-gray-900 text-white font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end gap-4 px-6">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{name}</p>
            <p className="text-xs text-gray-500">
              {roleLabel[role] ?? role}
              {memberNumber ? ` · ${memberNumber}` : ''}
            </p>
          </div>
          <SignOutButton />
        </header>

        <main className="flex-1 p-6 lg:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
}
