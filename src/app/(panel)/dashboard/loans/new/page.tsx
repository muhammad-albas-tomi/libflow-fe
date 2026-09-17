'use client';
// Penjelasan:
// Form Peminjaman Baru (Admin): cari & pilih anggota + buku (stok>0),
// lihat ringkasan (jatuh tempo +7 hari), lalu simpan. Bisa lanjut pinjam untuk anggota sama.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

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

import { Alert, Badge, Button, Card, PageHeader } from '../../-components/ui';

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

  const selectedMember = members.data?.data.find((m) => m.id === userId) ?? null;
  const selectedBook = books.data?.data.find((b) => b.id === bookId) ?? null;

  const dueDatePreview = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString();
  }, []);

  const mutation = useMutation<ItemResponse<Loan>, ApiError>({
    mutationFn: async () => {
      const res = await api.post('/loans', { userId, bookId });
      return res.data;
    },
    onSuccess: (res) => {
      setNotice({
        type: 'success',
        msg: `Berhasil: "${selectedBook?.title}" dipinjam ${selectedMember?.name}. Jatuh tempo ${formatDate(res.data.dueDate)}.`,
      });
      // Reset form sepenuhnya setelah berhasil
      setUserId('');
      setBookId('');
      queryClient.invalidateQueries({ queryKey: [['api', 'books']] });
      queryClient.invalidateQueries({ queryKey: [['api', 'loans']] });
      queryClient.invalidateQueries({ queryKey: [['api', 'users']] });
    },
    onError: (err) => setNotice({ type: 'error', msg: getErrorMessage(err) }),
  });

  const canSubmit = Boolean(userId && bookId) && !mutation.isPending;

  return (
    <div className="max-w-2xl">
      <PageHeader description="Catat peminjaman buku atas nama anggota." title="Peminjaman Baru" />

      <Card className="space-y-5 p-6">
        {notice && <Alert variant={notice.type}>{notice.msg}</Alert>}

        {/* Langkah 1: anggota */}
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">1. Anggota</p>
          {selectedMember ? (
            <SelectedRow
              subtitle={`${selectedMember.memberNumber ?? '-'} · ${selectedMember.email}`}
              title={selectedMember.name}
              onClear={() => {
                setUserId('');
                setNotice(null);
              }}
            />
          ) : (
            <Picker
              emptyText="Anggota tidak ditemukan"
              loading={members.isLoading}
              placeholder="Cari nama / NIK / nomor anggota"
              options={(members.data?.data ?? []).map((m) => ({
                id: m.id,
                title: m.name,
                subtitle: `${m.memberNumber ?? '-'} · ${m.email}`,
                keywords: `${m.name} ${m.nik ?? ''} ${m.memberNumber ?? ''} ${m.email}`,
              }))}
              onPick={(id) => {
                setUserId(id);
                setNotice(null);
              }}
            />
          )}
        </div>

        {/* Langkah 2: buku */}
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">2. Buku (stok tersedia)</p>
          {selectedBook ? (
            <SelectedRow
              subtitle={`${selectedBook.author} · stok ${selectedBook.stock}`}
              title={selectedBook.title}
              onClear={() => setBookId('')}
            />
          ) : (
            <Picker
              emptyText="Tidak ada buku tersedia"
              loading={books.isLoading}
              placeholder="Cari judul / pengarang / ISBN"
              options={(books.data?.data ?? [])
                .filter((b) => b.stock > 0)
                .map((b) => ({
                  id: b.id,
                  title: b.title,
                  subtitle: `${b.author} · stok ${b.stock}`,
                  keywords: `${b.title} ${b.author} ${b.isbn}`,
                }))}
              onPick={(id) => setBookId(id)}
            />
          )}
        </div>

        {/* Ringkasan */}
        {selectedMember && selectedBook && (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm">
            <p className="mb-2 font-semibold text-gray-700">Ringkasan</p>
            <dl className="grid grid-cols-3 gap-y-1">
              <dt className="text-gray-500">Anggota</dt>
              <dd className="col-span-2 text-gray-900">{selectedMember.name}</dd>
              <dt className="text-gray-500">Buku</dt>
              <dd className="col-span-2 text-gray-900">{selectedBook.title}</dd>
              <dt className="text-gray-500">Tanggal pinjam</dt>
              <dd className="col-span-2 text-gray-900">{formatDate(new Date().toISOString())}</dd>
              <dt className="text-gray-500">Jatuh tempo</dt>
              <dd className="col-span-2 text-gray-900">
                {formatDate(dueDatePreview)}{' '}
                <Badge className="border-blue-200 bg-blue-100 text-blue-800">7 hari</Badge>
              </dd>
            </dl>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            disabled={!canSubmit}
            onClick={() => {
              setNotice(null);
              mutation.mutate();
            }}
          >
            {mutation.isPending ? 'Menyimpan...' : 'Simpan Peminjaman'}
          </Button>
          {(userId || bookId) && (
            <Button
              variant="secondary"
              onClick={() => {
                setUserId('');
                setBookId('');
                setNotice(null);
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

type Option = { id: string; title: string; subtitle: string; keywords: string };

function Picker({
  options,
  onPick,
  placeholder,
  emptyText,
  loading,
}: {
  options: Option[];
  onPick: (id: string) => void;
  placeholder: string;
  emptyText: string;
  loading?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = query
    ? options.filter((o) => o.keywords.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <div className="relative">
      <input
        className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {loading ? (
            <p className="px-3 py-3 text-sm text-gray-500">Memuat...</p>
          ) : filtered.length > 0 ? (
            filtered.slice(0, 30).map((o) => (
              <button
                key={o.id}
                className="block w-full border-b border-gray-100 px-3 py-2 text-left last:border-0 hover:bg-gray-50"
                type="button"
                onMouseDown={() => onPick(o.id)}
              >
                <span className="block text-sm font-medium text-gray-900">{o.title}</span>
                <span className="block text-xs text-gray-500">{o.subtitle}</span>
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-sm text-gray-500">{emptyText}</p>
          )}
        </div>
      )}
    </div>
  );
}

function SelectedRow({
  title,
  subtitle,
  onClear,
}: {
  title: string;
  subtitle: string;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-900">{title}</p>
        <p className="truncate text-xs text-gray-500">{subtitle}</p>
      </div>
      <button
        className="shrink-0 text-sm text-blue-600 hover:text-blue-700"
        type="button"
        onClick={onClear}
      >
        Ganti
      </button>
    </div>
  );
}
