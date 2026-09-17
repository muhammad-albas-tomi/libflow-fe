'use client';
// Penjelasan:
// Kelola Buku (Admin): tabel + tambah/ubah/hapus buku + kelola kategori.
// Form buku & kategori pakai react-hook-form + Zod (validasi per-field).

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { api } from '~/lib/axios';
import { ApiError } from '~/lib/errors/api-error';
import { getErrorMessage } from '~/lib/errors/utils';
import {
  bookSchema,
  categorySchema,
  type BookInput,
  type CategoryInput,
} from '~/schemas/library';
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

const emptyBook: BookInput = {
  isbn: '',
  title: '',
  author: '',
  stock: 0,
  categoryId: '',
};

export default function Page() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

  const booksKey = [['api', 'books', { limit: 100 }]];
  const categoriesKey = [['api', 'categories', { limit: 100 }]];

  const books = useQuery<PaginatedResponse<Book>>({ queryKey: booksKey });
  const categories = useQuery<PaginatedResponse<Category>>({ queryKey: categoriesKey });

  const invalidateBooks = () => queryClient.invalidateQueries({ queryKey: booksKey });
  const invalidateCategories = () =>
    queryClient.invalidateQueries({ queryKey: categoriesKey });

  // ---- Form buku ----
  const bookForm = useForm<BookInput>({
    resolver: zodResolver(bookSchema),
    defaultValues: emptyBook,
  });
  const isEdit = editingId !== null;

  const startCreateBook = () => {
    setEditingId(null);
    bookForm.reset(emptyBook);
  };

  const saveBook = useMutation<unknown, ApiError, BookInput>({
    mutationFn: async (values) => {
      if (editingId) return (await api.put(`/books/${editingId}`, values)).data;
      return (await api.post('/books', values)).data;
    },
    onSuccess: () => {
      setNotice({ type: 'success', msg: editingId ? 'Buku diperbarui.' : 'Buku ditambahkan.' });
      startCreateBook();
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

  // ---- Form kategori ----
  const catForm = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  });

  const addCategory = useMutation<unknown, ApiError, CategoryInput>({
    mutationFn: async (values) => (await api.post('/categories', values)).data,
    onSuccess: () => {
      catForm.reset({ name: '' });
      invalidateCategories();
    },
    onError: (err) => setNotice({ type: 'error', msg: getErrorMessage(err) }),
  });

  const deleteCategory = useMutation<unknown, ApiError, string>({
    mutationFn: async (id) => (await api.delete(`/categories/${id}`)).data,
    onSuccess: invalidateCategories,
    onError: (err) => setNotice({ type: 'error', msg: getErrorMessage(err) }),
  });

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
                        onClick={() => {
                          setEditingId(b.id);
                          bookForm.reset({
                            isbn: b.isbn,
                            title: b.title,
                            author: b.author,
                            stock: b.stock,
                            categoryId: b.categoryId,
                          });
                        }}
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
              {isEdit ? 'Ubah Buku' : 'Tambah Buku'}
            </h2>
            <form
              className="space-y-3"
              onSubmit={bookForm.handleSubmit((values) => {
                setNotice(null);
                saveBook.mutate(values);
              })}
            >
              <Field
                error={bookForm.formState.errors.isbn?.message}
                label="ISBN"
                {...bookForm.register('isbn')}
              />
              <Field
                error={bookForm.formState.errors.title?.message}
                label="Judul"
                {...bookForm.register('title')}
              />
              <Field
                error={bookForm.formState.errors.author?.message}
                label="Pengarang"
                {...bookForm.register('author')}
              />
              <SelectField
                error={bookForm.formState.errors.categoryId?.message}
                label="Kategori"
                {...bookForm.register('categoryId')}
              >
                <option value="">— pilih kategori —</option>
                {categories.data?.data.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </SelectField>
              <Field
                error={bookForm.formState.errors.stock?.message}
                label="Stok"
                min={0}
                type="number"
                {...bookForm.register('stock', { valueAsNumber: true })}
              />
              <div className="flex gap-2">
                <Button disabled={saveBook.isPending} type="submit">
                  {saveBook.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
                {isEdit && (
                  <Button type="button" variant="secondary" onClick={startCreateBook}>
                    Batal
                  </Button>
                )}
              </div>
            </form>
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
                    type="button"
                    onClick={() => {
                      if (confirm(`Hapus kategori "${c.name}"?`)) deleteCategory.mutate(c.id);
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <form
              className="flex items-start gap-2"
              onSubmit={catForm.handleSubmit((values) => {
                setNotice(null);
                addCategory.mutate(values);
              })}
            >
              <Field
                className="flex-1"
                error={catForm.formState.errors.name?.message}
                placeholder="Kategori baru"
                {...catForm.register('name')}
              />
              <Button className="h-10" disabled={addCategory.isPending} type="submit">
                Tambah
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
