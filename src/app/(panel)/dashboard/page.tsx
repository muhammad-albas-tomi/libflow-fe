'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import type { ItemResponse, LibraryUser, PaginatedResponse } from '~/types/library';

import { Card, PageHeader, StatTile } from './-components/ui';

export default function Page() {
  const { data: profile } = useQuery<ItemResponse<LibraryUser>>({
    queryKey: [['api', 'auth/profile']],
  });

  const user = profile?.data;
  const isStaff = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <div>
      <PageHeader
        description={user ? `Selamat datang, ${user.name}.` : 'Memuat...'}
        title="Beranda"
      />

      {isStaff ? <StaffSummary /> : <MemberHome />}
    </div>
  );
}

function StaffSummary() {
  const books = useQuery<PaginatedResponse<unknown>>({
    queryKey: [['api', 'books', { limit: 1 }]],
  });
  const loans = useQuery<PaginatedResponse<unknown>>({
    queryKey: [['api', 'loans', { limit: 1 }]],
  });
  const borrowed = useQuery<PaginatedResponse<unknown>>({
    queryKey: [['api', 'loans', { limit: 1, status: 'BORROWED' }]],
  });
  const members = useQuery<PaginatedResponse<unknown>>({
    queryKey: [['api', 'users', { limit: 1, role: 'MEMBER' }]],
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Total Buku" value={books.data?.pagination.total ?? '—'} />
        <StatTile label="Total Transaksi" value={loans.data?.pagination.total ?? '—'} />
        <StatTile label="Sedang Dipinjam" value={borrowed.data?.pagination.total ?? '—'} />
        <StatTile label="Anggota" value={members.data?.pagination.total ?? '—'} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink href="/dashboard/loans/new" title="Peminjaman Baru" desc="Catat peminjaman buku untuk anggota" />
        <QuickLink href="/dashboard/loans" title="Daftar Peminjaman" desc="Proses pengembalian & lihat denda" />
        <QuickLink href="/dashboard/books" title="Kelola Buku" desc="Tambah, ubah, hapus buku & kategori" />
        <QuickLink href="/dashboard/members" title="Anggota" desc="Kelola data anggota perpustakaan" />
        <QuickLink href="/dashboard/catalog" title="Katalog" desc="Lihat katalog & stok buku" />
      </div>
    </div>
  );
}

function MemberHome() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <QuickLink href="/dashboard/catalog" title="Katalog Buku" desc="Jelajahi koleksi & cek ketersediaan" />
      <QuickLink href="/dashboard/my-loans" title="Riwayat Peminjaman" desc="Lihat pinjaman, jatuh tempo, & denda" />
    </div>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href}>
      <Card className="p-5 transition-colors hover:border-gray-400">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="mt-1 text-sm text-gray-500">{desc}</p>
      </Card>
    </Link>
  );
}
