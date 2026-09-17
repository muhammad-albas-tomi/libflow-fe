import type { LoanStatus } from '~/types/library';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount ?? 0);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export const loanStatusLabel: Record<LoanStatus, string> = {
  BORROWED: 'Dipinjam',
  RETURNED: 'Dikembalikan',
  LATE: 'Terlambat',
};

export const loanStatusClass: Record<LoanStatus, string> = {
  BORROWED: 'bg-blue-100 text-blue-800 border-blue-200',
  RETURNED: 'bg-green-100 text-green-800 border-green-200',
  LATE: 'bg-red-100 text-red-800 border-red-200',
};

export const roleLabel: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MEMBER: 'Anggota',
};
