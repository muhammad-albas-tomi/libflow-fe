'use client';
// Penjelasan:
// Tombol logout: hapus token & cookie, balik ke halaman login.

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { useAuth } from '~/lib/auth/context';
import { signOut } from '~/server/auth';

export function SignOutButton() {
  const router = useRouter();

  const clearAllToken = useAuth((s) => s.clearAll);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      return signOut();
    },
    onSuccess: (_data, _variables, _onMutateResult, context) => {
      clearAllToken();

      context.client.clear();

      router.push('/auth/sign-in');
    },
  });

  return (
    <button
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      disabled={isPending}
      onClick={() => mutate()}
    >
      {isPending ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
          Signing out...
        </>
      ) : (
        'Sign Out'
      )}
    </button>
  );
}
