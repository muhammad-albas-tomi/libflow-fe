'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { api } from '~/lib/axios';
import { ApiError } from '~/lib/errors/api-error';
import { getErrorMessage } from '~/lib/errors/utils';
import { formatDate, formatRupiah, loanStatusClass, loanStatusLabel } from '~/lib/format';
import type { ItemResponse, Loan, LoanStatus, PaginatedResponse } from '~/types/library';

import { Alert, Badge, Button, EmptyRow, PageHeader, TableShell } from '../-components/ui';

const FILTERS: Array<{ label: string; value: '' | LoanStatus }> = [
  { label: 'Semua', value: '' },
  { label: 'Dipinjam', value: 'BORROWED' },
  { label: 'Terlambat', value: 'LATE' },
  { label: 'Dikembalikan', value: 'RETURNED' },
];

export default function Page() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'' | LoanStatus>('');
  const [notice, setNotice] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

  const params: Record<string, string | number> = { limit: 50 };
  if (status) params.status = status;

  const { data, isLoading } = useQuery<PaginatedResponse<Loan>>({
    queryKey: [['api', 'loans', params]],
  });

  const returnMutation = useMutation<ItemResponse<Loan>, ApiError, string>({
    mutationFn: async (loanId) => {
      const res = await api.put(`/loans/${loanId}/return`);
      return res.data;
    },
    onSuccess: (res) => {
      const loan = res.data;
      setNotice({
        type: 'success',
        msg:
          loan.status === 'LATE'
            ? `Pengembalian berhasil. Denda ${formatRupiah(loan.fineAmount)} (terlambat).`
            : 'Pengembalian berhasil tanpa denda.',
      });
      queryClient.invalidateQueries({ queryKey: [['api', 'loans', params]] });
      queryClient.invalidateQueries({ queryKey: [['api', 'books']] });
    },
    onError: (err) => setNotice({ type: 'error', msg: getErrorMessage(err) }),
  });

  return (
    <div>
      <PageHeader description="Semua transaksi peminjaman & proses pengembalian." title="Daftar Peminjaman" />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value || 'all'}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              status === f.value
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setStatus(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {notice && (
        <div className="mb-4">
          <Alert variant={notice.type}>{notice.msg}</Alert>
        </div>
      )}

      <TableShell
        head={
          <tr>
            <th className="px-4 py-3">Anggota</th>
            <th className="px-4 py-3">Buku</th>
            <th className="px-4 py-3">Pinjam</th>
            <th className="px-4 py-3">Jatuh Tempo</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Denda</th>
            <th className="px-4 py-3 text-right">Aksi</th>
          </tr>
        }
      >
        {isLoading ? (
          <EmptyRow colSpan={7} text="Memuat..." />
        ) : data && data.data.length > 0 ? (
          data.data.map((loan) => (
            <tr key={loan.id}>
              <td className="px-4 py-3">
                <div className="font-medium">{loan.user?.name ?? '-'}</div>
                <div className="text-xs text-gray-500">{loan.user?.memberNumber ?? ''}</div>
              </td>
              <td className="px-4 py-3">{loan.book?.title ?? '-'}</td>
              <td className="px-4 py-3">{formatDate(loan.borrowDate)}</td>
              <td className="px-4 py-3">{formatDate(loan.dueDate)}</td>
              <td className="px-4 py-3">
                <Badge className={loanStatusClass[loan.status]}>
                  {loanStatusLabel[loan.status]}
                </Badge>
              </td>
              <td className="px-4 py-3">{formatRupiah(loan.fineAmount)}</td>
              <td className="px-4 py-3 text-right">
                {loan.status === 'BORROWED' ? (
                  <Button
                    className="px-3 py-1.5"
                    disabled={returnMutation.isPending}
                    onClick={() => {
                      setNotice(null);
                      returnMutation.mutate(loan.id);
                    }}
                  >
                    Kembalikan
                  </Button>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
            </tr>
          ))
        ) : (
          <EmptyRow colSpan={7} text="Tidak ada transaksi." />
        )}
      </TableShell>
    </div>
  );
}
