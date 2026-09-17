'use client';
// Penjelasan:
// Kelola Buku (Admin): tabel + tambah/ubah/hapus buku + kelola kategori.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { api } from '~/lib/axios';
import { ApiError } from '~/lib/errors/api-error';
import { getErrorMessage } from '~/lib/errors/utils';
import type { Book, Category, PaginatedResponse } from '~/types/library';

import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyRow,
  Field,
  PageHeader,
  SelectField,
  TableShell,
} from '../-components/ui';

type BookForm = {
  id?: string;
  isbn: string;
  title: string;
  author: string;
  stock: string;
  categoryId: string;
};

const emptyForm: BookForm = {
  isbn: '',
  title: '',
  author: '',
  stock: '1',
  categoryId: '',
};

export default function Page() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<BookForm>(emptyForm);
  const [notice, setNotice] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);
  const [newCategory, setNewCategory] = useState('');

  const booksKey = [['api', 'books', { limit: 100 }]];
  const categoriesKey = [['api', 'categories', { limit: 100 }]];

  const books = useQuery<PaginatedResponse<Book>>({ queryKey: booksKey });
  const categories = useQuery<PaginatedResponse<Category>>({ queryKey: categoriesKey });

  const invalidateBooks = () => queryClient.invalidateQueries({ queryKey: booksKey });
  const invalidateCategories = () =>
    queryClient.invalidateQueries({ queryKey: categoriesKey });

  const saveBook = useMutation<unknown, ApiError>({
    mutationFn: async () => {
      const payload = {
        isbn: form.isbn,
        title: form.title,
        author: form.author,
        stock: Number(form.stock),
        categoryId: form.categoryId,
      };
      if (form.id) return (await api.put(`/books/${form.id}`, payload)).data;
      return (await api.post('/books', payload)).data;
    },
    onSuccess: () => {
      setNotice({ type: 'success', msg: form.id ? 'Buku diperbarui.' : 'Buku ditambahkan.' });
      setForm(emptyForm);
      invalidateBooks();
    },
    onError: (err) => setNotice({ type: 'error', msg: getErrorMessage(err) }),
  });

  const deleteBook = useMutation<unknown, ApiError, string>({
    mutationFn: async (id) => (await api.delete(`/books/${id}`)).data,
    onSuccess: () => {
      setNotice({ type: 'success', msg: 'Buku dihapus.' });
      invalidateBooks();
    },
    onError: (err) => setNotice({ type: 'error', msg: getErrorMessage(err) }),
  });

  const addCategory = useMutation<unknown, ApiError>({
    mutationFn: async () => (await api.post('/categories', { name: newCategory })).data,
    onSuccess: () => {
      setNewCategory('');
      invalidateCategories();
    },
    onError: (err) => setNotice({ type: 'error', msg: getErrorMessage(err) }),
  });

  const deleteCategory = useMutation<unknown, ApiError, string>({
    mutationFn: async (id) => (await api.delete(`/categories/${id}`)).data,
    onSuccess: invalidateCategories,
    onError: (err) => setNotice({ type: 'error', msg: getErrorMessage(err) }),
  });

  const set = (key: keyof BookForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canSave =
    form.isbn && form.title && form.author && form.categoryId && !saveBook.isPending;

  return (
    <div>
      <PageHeader description="Kelola koleksi buku dan kategori." title="Kelola Buku" />

      {notice && (
        <div className="mb-4">
          <Alert variant={notice.type}>{notice.msg}</Alert>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <TableShell
            head={
              <tr>
                <th className="px-4 py-3">ISBN</th>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            }
          >
            {books.isLoading ? (
              <EmptyRow colSpan={5} text="Memuat..." />
            ) : books.data && books.data.data.length > 0 ? (
              books.data.data.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3 font-mono text-xs">{b.isbn}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{b.title}</div>
                    <div className="text-xs text-gray-500">{b.author}</div>
                  </td>
                  <td className="px-4 py-3">{b.category?.name ?? '-'}</td>
                  <td className="px-4 py-3">
                    {b.stock > 0 ? (
                      <Badge className="border-green-200 bg-green-100 text-green-800">
                        {b.stock}
                      </Badge>
                    ) : (
                      <Badge className="border-red-200 bg-red-100 text-red-800">0</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        className="px-3 py-1.5"
                        variant="secondary"
                        onClick={() =>
                          setForm({
                            id: b.id,
                            isbn: b.isbn,
                            title: b.title,
                            author: b.author,
                            stock: String(b.stock),
                            categoryId: b.categoryId,
                          })
                        }
                      >
                        Ubah
                      </Button>
                      <Button
                        className="px-3 py-1.5"
                        variant="danger"
                        onClick={() => {
                          if (confirm(`Hapus buku "${b.title}"?`)) deleteBook.mutate(b.id);
                        }}
                      >
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <EmptyRow colSpan={5} text="Belum ada buku." />
            )}
          </TableShell>
        </div>

        <div className="space-y-6">
          <Card className="space-y-3 p-5">
            <h2 className="font-semibold text-gray-900">
              {form.id ? 'Ubah Buku' : 'Tambah Buku'}
            </h2>
            <Field label="ISBN" value={form.isbn} onChange={(e) => set('isbn')(e.target.value)} />
            <Field label="Judul" value={form.title} onChange={(e) => set('title')(e.target.value)} />
            <Field label="Pengarang" value={form.author} onChange={(e) => set('author')(e.target.value)} />
            <SelectField
              label="Kategori"
              value={form.categoryId}
              onChange={(e) => set('categoryId')(e.target.value)}
            >
              <option value="">— pilih kategori —</option>
              {categories.data?.data.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectField>
            <Field
              label="Stok"
              min={0}
              type="number"
              value={form.stock}
              onChange={(e) => set('stock')(e.target.value)}
            />
            <div className="flex gap-2">
              <Button disabled={!canSave} onClick={() => { setNotice(null); saveBook.mutate(); }}>
                {saveBook.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
              {form.id && (
                <Button variant="secondary" onClick={() => setForm(emptyForm)}>
                  Batal
                </Button>
              )}
            </div>
          </Card>

          <Card className="space-y-3 p-5">
            <h2 className="font-semibold text-gray-900">Kategori</h2>
            <div className="flex flex-wrap gap-2">
              {categories.data?.data.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700"
                >
                  {c.name}
                  <button
                    className="text-gray-400 hover:text-red-600"
                    title="Hapus kategori"
                    onClick={() => {
                      if (confirm(`Hapus kategori "${c.name}"?`)) deleteCategory.mutate(c.id);
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Field
                className="flex-1"
                placeholder="Kategori baru"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <Button
                disabled={!newCategory || addCategory.isPending}
                onClick={() => { setNotice(null); addCategory.mutate(); }}
              >
                Tambah
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
