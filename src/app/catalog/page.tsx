'use client';
// Penjelasan:
// Halaman KATALOG PUBLIK (tanpa login). Cari + filter kategori + stok.
// Ambil data langsung dari API backend.

import Link from 'next/link';
import { useEffect, useState } from 'react';

import type { Book, Category, PaginatedResponse } from '~/types/library';

const API =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export default function Page() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/categories?limit=100`)
      .then((r) => r.json())
      .then((d: PaginatedResponse<Category>) => setCategories(d.data ?? []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ limit: '24' });
    if (search) params.set('search', search);
    if (categoryId) params.set('categoryId', categoryId);

    setLoading(true);
    const t = setTimeout(() => {
      fetch(`${API}/books?${params.toString()}`)
        .then((r) => r.json())
        .then((d: PaginatedResponse<Book>) => setBooks(d.data ?? []))
        .catch(() => setBooks([]))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(t);
  }, [search, categoryId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md border-2 border-gray-900" />
          <span className="font-bold text-gray-900">Perpustakaan</span>
        </div>
        <Link
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          href="/auth/sign-in"
        >
          Masuk
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Katalog Buku</h1>
        <p className="mt-1 text-sm text-gray-500">
          Jelajahi koleksi perpustakaan. Masuk untuk meminjam.
        </p>

        <div className="my-6 flex flex-col gap-3 sm:flex-row">
          <input
            className="h-10 rounded-md border border-gray-300 px-3 text-sm sm:max-w-xs"
            placeholder="Cari judul / pengarang / ISBN"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm sm:max-w-xs"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Semua kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Memuat katalog...</p>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {books.map((book) => (
              <div
                key={book.id}
                className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4"
              >
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
                    <span className="inline-block rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                      Tersedia {book.stock}
                    </span>
                  ) : (
                    <span className="inline-block rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                      Habis
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Tidak ada buku ditemukan.</p>
        )}
      </main>
    </div>
  );
}
