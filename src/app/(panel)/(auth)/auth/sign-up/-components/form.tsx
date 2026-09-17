'use client';
// Penjelasan:
// Form registrasi anggota (react-hook-form + Zod): NIK 16 digit, nama, email, password.

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forwardRef, type InputHTMLAttributes } from 'react';
import { useForm } from 'react-hook-form';

import { ApiError } from '~/lib/errors/api-error';
import { getErrorMessage } from '~/lib/errors/utils';
import { signUpSchema, type SignUpSchema } from '~/schemas/auth';
import { signUp } from '~/server/auth';

const Field = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }
>(function Field({ label, error, ...props }, ref) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        ref={ref}
        className={`relative block w-full appearance-none rounded-md border px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${
          error ? 'border-red-400' : 'border-gray-300'
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

export function SignUpForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { nik: '', name: '', email: '', password: '' },
  });

  const { mutate, error, isPending } = useMutation<unknown, ApiError, SignUpSchema>({
    mutationFn: async (values) => {
      const response = await signUp(values);
      if (ApiError.isErrorResponse(response)) {
        throw new ApiError(response);
      }
      return response;
    },
    onSuccess: () => router.push('/dashboard'),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Daftar Anggota Perpustakaan
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Nomor anggota dibuat otomatis setelah pendaftaran.
          </p>
        </div>

        <form
          className="mt-8 space-y-6 rounded-lg bg-white px-8 pb-8 pt-6 shadow-lg"
          onSubmit={handleSubmit((values) => mutate(values))}
        >
          <div className="space-y-4">
            <Field
              error={errors.nik?.message}
              inputMode="numeric"
              label="NIK"
              placeholder="16 digit angka"
              {...register('nik')}
            />
            <Field
              error={errors.name?.message}
              label="Nama lengkap"
              placeholder="Nama sesuai identitas"
              {...register('name')}
            />
            <Field
              error={errors.email?.message}
              label="Email"
              placeholder="nama@email.com"
              type="email"
              {...register('email')}
            />
            <Field
              error={errors.password?.message}
              label="Password"
              placeholder="Minimal 6 karakter"
              type="password"
              {...register('password')}
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {getErrorMessage(error)}
            </div>
          )}

          <button
            className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending}
            type="submit"
          >
            {isPending ? 'Mendaftarkan...' : 'Daftar'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Sudah punya akun?{' '}
            <Link className="text-blue-600 underline underline-offset-2 hover:text-blue-700" href="/auth/sign-in">
              Masuk di sini
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
