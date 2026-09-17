'use client';
// Penjelasan:
// Riwayat peminjaman milik Member sendiri (/loans/me).

import { useQuery } from '@tanstack/react-query';

import { formatDate, formatRupiah, loanStatusClass, loanStatusLabel } from '~/lib/format';
import type { Loan, PaginatedResponse } from '~/types/library';

import { Badge, EmptyRow, PageHeader, TableShell } from '../-components/ui';

export default function Page() {
  const { data, isLoading } = useQuery<PaginatedResponse<Loan>>({
    queryKey: [['api', 'loans/me', { limit: 50 }]],
  });

  return (
    <div>
      <PageHeader description="Daftar peminjaman buku milik Anda." title="Riwayat Peminjaman" />

      <TableShell
        head={
          <tr>
            <th className="px-4 py-3">Judul Buku</th>
            <th className="px-4 py-3">Tgl Pinjam</th>
            <th className="px-4 py-3">Jatuh Tempo</th>
            <th className="px-4 py-3">Tgl Kembali</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Denda</th>
          </tr>
        }
      >
        {isLoading ? (
          <EmptyRow colSpan={6} text="Memuat..." />
        ) : data && data.data.length > 0 ? (
          data.data.map((loan) => (
            <tr key={loan.id}>
              <td className="px-4 py-3 font-medium">{loan.book?.title ?? '-'}</td>
              <td className="px-4 py-3">{formatDate(loan.borrowDate)}</td>
              <td className="px-4 py-3">{formatDate(loan.dueDate)}</td>
              <td className="px-4 py-3">{formatDate(loan.returnDate)}</td>
              <td className="px-4 py-3">
                <Badge className={loanStatusClass[loan.status]}>
                  {loanStatusLabel[loan.status]}
                </Badge>
              </td>
              <td className="px-4 py-3">{formatRupiah(loan.fineAmount)}</td>
            </tr>
          ))
        ) : (
          <EmptyRow colSpan={6} text="Belum ada peminjaman." />
        )}
      </TableShell>
    </div>
  );
}
