'use client';
// Penjelasan:
// Form login: input NIK/email + password, panggil server action signIn.

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ApiError } from '~/lib/errors/api-error';
import { getErrorMessage } from '~/lib/errors/utils';
import { signIn } from '~/server/auth';
import type { Response } from '~/types/response';
import type { Token } from '~/types/token';

type SignInResponse = Response<Token>;

export function SignInForm() {
  const router = useRouter();

  const [credential, setCredential] = useState({
    email: '',
    password: '',
  });

  const { mutate, error, isPending } = useMutation<SignInResponse, ApiError>({
    mutationFn: async () => {
      const response = await signIn(credential);

      if (ApiError.isErrorResponse(response)) {
        throw new ApiError(response);
      }

      return response;
    },
    onSuccess: () => {
      router.push('/dashboard');
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form
          className="mt-8 space-y-6 bg-white shadow-lg rounded-lg px-8 pt-6 pb-8"
          onSubmit={(e) => {
            e.preventDefault();
            mutate();
          }}
        >
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="email"
              >
                NIK atau Email
              </label>
              <input
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                id="email"
                placeholder="NIK 16 digit atau email"
                type="text"
                value={credential.email}
                onChange={(e) =>
                  setCredential((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <input
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                id="password"
                placeholder="Enter your password"
                type="password"
                value={credential.password}
                onChange={(e) =>
                  setCredential((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <div className="shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    Sign in failed
                  </h3>
                  <div className="text-sm text-red-700">
                    {getErrorMessage(error)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              disabled={isPending}
              type="submit"
            >
              {isPending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      fill="currentColor"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <p className="text-center text-sm text-gray-600">
            Belum punya akun?{' '}
            <Link
              className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
              href="/auth/sign-up"
            >
              Daftar sebagai anggota
            </Link>
          </p>

          <p className="text-center text-sm text-gray-600">
            <Link
              className="text-gray-600 hover:text-gray-800 underline underline-offset-2"
              href="/catalog"
            >
              Lihat katalog tanpa masuk
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
