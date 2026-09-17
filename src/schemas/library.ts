// Penjelasan:
// Skema validasi (Zod) untuk form-form LibFlow: buku, kategori, anggota, admin, peminjaman.
// Dipakai bersama react-hook-form (zodResolver) untuk validasi per-field.
import * as z from 'zod';

export const bookSchema = z.object({
  isbn: z.string().min(1, 'ISBN wajib diisi'),
  title: z.string().min(1, 'Judul wajib diisi'),
  author: z.string().min(1, 'Pengarang wajib diisi'),
  stock: z.number('Stok wajib angka').int('Stok harus bilangan bulat').min(0, 'Stok tidak boleh negatif'),
  categoryId: z.string().uuid('Pilih kategori'),
});
export type BookInput = z.infer<typeof bookSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, 'Nama kategori minimal 2 karakter'),
});
export type CategoryInput = z.infer<typeof categorySchema>;

// Registrasi anggota oleh admin (butuh NIK + password)
export const memberCreateSchema = z.object({
  nik: z.string().regex(/^\d{16}$/, 'NIK harus 16 digit angka'),
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});
export type MemberCreateInput = z.infer<typeof memberCreateSchema>;

// Ubah anggota (password opsional; kosong = tidak diubah)
export const memberUpdateSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').or(z.literal('')),
});
export type MemberUpdateInput = z.infer<typeof memberUpdateSchema>;

export const adminCreateSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});
export type AdminCreateInput = z.infer<typeof adminCreateSchema>;

export const adminUpdateSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').or(z.literal('')),
});
export type AdminUpdateInput = z.infer<typeof adminUpdateSchema>;

export const loanSchema = z.object({
  userId: z.string().uuid('Pilih anggota'),
  bookId: z.string().uuid('Pilih buku'),
});
export type LoanInput = z.infer<typeof loanSchema>;
