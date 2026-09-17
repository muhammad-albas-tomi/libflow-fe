// Penjelasan:
// Skema validasi form auth (Zod): sign-in (NIK/email) & sign-up (NIK 16 digit).
import * as z from 'zod';

export const signInSchema = z.object({
  // Boleh email atau NIK
  email: z.string().min(1),
  password: z.string().min(6),
});

export type SignInSchema = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  nik: z.string().regex(/^\d{16}$/, 'NIK harus 16 digit angka'),
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;
