'use client';

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ApiError } from '~/lib/errors/api-error';
import { getErrorMessage } from '~/lib/errors/utils';
import { signUpSchema } from '~/schemas/auth';
import { signUp } from '~/server/auth';

type FieldErrors = Partial<Record<'nik' | 'name' | 'email' | 'password', string>>;

export function SignUpForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    nik: '',
    name: '',
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { mutate, error, isPending } = useMutation<unknown, ApiError>({
    mutationFn: async () => {
      // Validasi sisi klien dulu
      const parsed = signUpSchema.safeParse(form);
      if (!parsed.success) {
        const fe: FieldErrors = {};
        for (const issue of parsed.error.issues) {
          const key = issue.path[0] as keyof FieldErrors;
          if (key && !fe[key]) fe[key] = issue.message;
        }
        setFieldErrors(fe);
        throw new ApiError({
          type: 'validation_error',
          errors: [{ attr: null, detail: 'Periksa kembali isian form', code: null }],
          timestamp: new Date().toISOString(),
        });
      }
      setFieldErrors({});

      const response = await signUp(parsed.data);

      if (ApiError.isErrorResponse(response)) {
        throw new ApiError(response);
      }

      return response;
    },
    onSuccess: () => {
      router.push('/dashboard');
    },
  });

  const setField = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Daftar Anggota Perpustakaan
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Nomor anggota dibuat otomatis setelah pendaftaran.
          </p>
        </div>

        <form
          className="mt-8 space-y-6 bg-white shadow-lg rounded-lg px-8 pt-6 pb-8"
          onSubmit={(e) => {
            e.preventDefault();
            mutate();
          }}
        >
          <div className="space-y-4">
            <Field
              id="nik"
              label="NIK"
              placeholder="16 digit angka"
              value={form.nik}
              inputMode="numeric"
              error={fieldErrors.nik}
              onChange={setField('nik')}
            />
            <Field
              id="name"
              label="Nama lengkap"
              placeholder="Nama sesuai identitas"
              value={form.name}
              error={fieldErrors.name}
              onChange={setField('name')}
            />
            <Field
              id="email"
              label="Email"
              type="email"
              placeholder="nama@email.com"
              value={form.email}
              error={fieldErrors.email}
              onChange={setField('email')}
            />
            <Field
              id="password"
              label="Password"
              type="password"
              placeholder="Minimal 6 karakter"
              value={form.password}
              error={fieldErrors.password}
              onChange={setField('password')}
            />
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
            {isPending ? 'Mendaftarkan...' : 'Daftar'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Sudah punya akun?{' '}
            <Link
              className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
              href="/auth/sign-in"
            >
              Masuk di sini
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  inputMode?: 'numeric' | 'text';
}) {
  return (
    <div>
      <label
        className="block text-sm font-medium text-gray-700 mb-1"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        required
        className={`appearance-none relative block w-full px-3 py-2 border ${
          error ? 'border-red-400' : 'border-gray-300'
        } placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
        id={id}
        inputMode={inputMode}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
