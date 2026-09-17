'use client';
// Penjelasan:
// Kerangka dashboard: sidebar menu (difilter per role) + topbar (nama/role/logout).
// Responsif: di layar kecil sidebar jadi drawer yang dibuka lewat tombol menu.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const [open, setOpen] = useState(false);
  const items = NAV.filter((item) => item.roles.includes(role));

  // Tutup drawer setiap pindah halaman
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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

  const nav = (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
      {items.map((item) => (
        <Link
          key={item.href}
          className={`block rounded-md px-3 py-2 text-sm ${
            item.href === activeHref
              ? 'bg-gray-900 font-medium text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          href={item.href}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  const brand = (
    <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
      <div className="h-7 w-7 rounded-md border-2 border-gray-900" />
      <span className="font-bold text-gray-900">Perpustakaan</span>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar tetap (desktop) */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
        {brand}
        {nav}
      </aside>

      {/* Drawer (mobile) */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-white shadow-xl">
            {brand}
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-gray-200 bg-white px-4 sm:px-6">
          <button
            aria-label="Buka menu"
            className="rounded-md border border-gray-300 p-2 text-gray-700 lg:hidden"
            onClick={() => setOpen(true)}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeWidth={2} />
            </svg>
          </button>

          <div className="flex-1" />

          <div className="min-w-0 text-right">
            <p className="truncate text-sm font-medium text-gray-900">{name}</p>
            <p className="truncate text-xs text-gray-500">
              {roleLabel[role] ?? role}
              {memberNumber ? ` · ${memberNumber}` : ''}
            </p>
          </div>
          <SignOutButton />
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
