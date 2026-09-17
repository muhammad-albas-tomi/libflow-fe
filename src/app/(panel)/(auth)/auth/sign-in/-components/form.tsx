'use client';
// Penjelasan:
// Form login: input NIK/email + password (react-hook-form + Zod), panggil server action signIn.

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { ApiError } from '~/lib/errors/api-error';
import { getErrorMessage } from '~/lib/errors/utils';
import { signInSchema, type SignInSchema } from '~/schemas/auth';
import { signIn } from '~/server/auth';

export function SignInForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const { mutate, error, isPending } = useMutation<unknown, ApiError, SignInSchema>({
    mutationFn: async (values) => {
      const response = await signIn(values);
      if (ApiError.isErrorResponse(response)) {
        throw new ApiError(response);
      }
      return response;
    },
    onSuccess: () => router.push('/dashboard'),
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Masuk ke akun Anda
          </h2>
        </div>
        <form
          className="mt-8 space-y-6 bg-white shadow-lg rounded-lg px-8 pt-6 pb-8"
          onSubmit={handleSubmit((values) => mutate(values))}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                NIK atau Email
              </label>
              <input
                id="email"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="NIK 16 digit atau email"
                type="text"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Masukkan password"
                type="password"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200 text-sm text-red-700">
              {getErrorMessage(error)}
            </div>
          )}

          <button
            className="w-full flex justify-center py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isPending}
            type="submit"
          >
            {isPending ? 'Memproses...' : 'Masuk'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Belum punya akun?{' '}
            <Link className="text-blue-600 hover:text-blue-700 underline underline-offset-2" href="/auth/sign-up">
              Daftar sebagai anggota
            </Link>
          </p>
          <p className="text-center text-sm text-gray-600">
            <Link className="text-gray-600 hover:text-gray-800 underline underline-offset-2" href="/catalog">
              Lihat katalog tanpa masuk
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
