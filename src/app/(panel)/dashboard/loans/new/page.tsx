'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { api } from '~/lib/axios';
import { ApiError } from '~/lib/errors/api-error';
import { getErrorMessage } from '~/lib/errors/utils';
import { formatDate } from '~/lib/format';
import type {
  Book,
  ItemResponse,
  LibraryUser,
  Loan,
  PaginatedResponse,
} from '~/types/library';

import { Alert, Button, Card, PageHeader, SelectField } from '../../-components/ui';

export default function Page() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState('');
  const [bookId, setBookId] = useState('');
  const [notice, setNotice] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

  const members = useQuery<PaginatedResponse<LibraryUser>>({
    queryKey: [['api', 'users', { role: 'MEMBER', limit: 100 }]],
  });
  const books = useQuery<PaginatedResponse<Book>>({
    queryKey: [['api', 'books', { limit: 100 }]],
  });

  const availableBooks = books.data?.data.filter((b) => b.stock > 0) ?? [];

  const mutation = useMutation<ItemResponse<Loan>, ApiError>({
    mutationFn: async () => {
      const res = await api.post('/loans', { userId, bookId });
      return res.data;
    },
    onSuccess: (res) => {
      setNotice({
        type: 'success',
        msg: `Peminjaman berhasil. Jatuh tempo ${formatDate(res.data.dueDate)}.`,
      });
      setBookId('');
      queryClient.invalidateQueries({ queryKey: [['api', 'books']] });
      queryClient.invalidateQueries({ queryKey: [['api', 'loans']] });
    },
    onError: (err) => setNotice({ type: 'error', msg: getErrorMessage(err) }),
  });

  const canSubmit = Boolean(userId && bookId) && !mutation.isPending;

  return (
    <div className="max-w-2xl">
      <PageHeader description="Catat peminjaman buku atas nama anggota." title="Peminjaman Baru" />

      <Card className="space-y-5 p-6">
        {notice && <Alert variant={notice.type}>{notice.msg}</Alert>}

        <SelectField
          label="1. Pilih anggota"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        >
          <option value="">— pilih anggota —</option>
          {members.data?.data.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} {m.memberNumber ? `(${m.memberNumber})` : ''}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="2. Pilih buku (stok tersedia)"
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
        >
          <option value="">— pilih buku —</option>
          {availableBooks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title} — stok {b.stock}
            </option>
          ))}
        </SelectField>

        <p className="text-sm text-gray-500">
          Masa pinjam 7 hari sejak hari ini. Stok berkurang otomatis saat disimpan.
        </p>

        <Button disabled={!canSubmit} onClick={() => { setNotice(null); mutation.mutate(); }}>
          {mutation.isPending ? 'Menyimpan...' : 'Simpan Peminjaman'}
        </Button>
      </Card>
    </div>
  );
}
