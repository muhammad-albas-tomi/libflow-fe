'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import type { Book, Category, PaginatedResponse } from '~/types/library';

import { Badge, Card, Field, PageHeader, SelectField } from '../-components/ui';

export default function Page() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const categories = useQuery<PaginatedResponse<Category>>({
    queryKey: [['api', 'categories', { limit: 100 }]],
  });

  const params: Record<string, string | number> = { limit: 24 };
  if (search) params.search = search;
  if (categoryId) params.categoryId = categoryId;

  const books = useQuery<PaginatedResponse<Book>>({
    queryKey: [['api', 'books', params]],
  });

  return (
    <div>
      <PageHeader description="Koleksi buku perpustakaan & ketersediaan stok." title="Katalog Buku" />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <Field
          className="sm:max-w-xs"
          placeholder="Cari judul / pengarang / ISBN"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <SelectField
          className="sm:max-w-xs"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Semua kategori</option>
          {categories.data?.data.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectField>
      </div>

      {books.isLoading ? (
        <p className="text-sm text-gray-500">Memuat katalog...</p>
      ) : books.data && books.data.data.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.data.data.map((book) => (
            <Card key={book.id} className="flex flex-col gap-2 p-4">
              <div className="flex h-32 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                Sampul
              </div>
              <h3 className="font-semibold text-gray-900">{book.title}</h3>
              <p className="text-sm text-gray-500">
                {book.author}
                {book.category ? ` · ${book.category.name}` : ''}
              </p>
              <div>
                {book.stock > 0 ? (
                  <Badge className="border-green-200 bg-green-100 text-green-800">
                    Tersedia {book.stock}
                  </Badge>
                ) : (
                  <Badge className="border-red-200 bg-red-100 text-red-800">Habis</Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Tidak ada buku ditemukan.</p>
      )}
    </div>
  );
}
