// Penjelasan:
// Server actions auth (jalan di server): signIn, signUp, refreshToken, signOut.
// Panggil API backend, simpan token ke cookie, samakan bentuk respons ke FE.
'use server';

import { clearAuthCookie, getAuthCookie, setAuthCookie } from '~/lib/auth';
import { ApiError } from '~/lib/errors/api-error';
import { type SignInSchema, type SignUpSchema } from '~/schemas/auth';
import { type Response } from '~/types/response';
import { type Token } from '~/types/token';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/** Bentuk data user dari backend LibFlow */
export type AuthUser = {
  id: string;
  nik: string | null;
  memberNumber: string | null;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
};

/** Isi cookie auth yang dinormalisasi agar cocok dengan AuthProvider */
type AuthCookie = Response<Token> & { user: AuthUser };

/**
 * Ambil { user, tokens } dari respons backend LibFlow lalu ubah ke bentuk
 * { data: { accessToken, refreshToken }, user } yang dipakai FE.
 * Kembalikan ErrorResponse bila gagal.
 */
async function handleAuthResponse(res: Awaited<ReturnType<typeof fetch>>) {
  const json = await res.json();

  if (!res.ok) {
    return ApiError.toErrorResponse(json) ?? json;
  }

  const tokens = json?.data?.tokens ?? {};
  const cookie: AuthCookie = {
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
    user: json?.data?.user,
  };

  await setAuthCookie(cookie);

  return cookie;
}

export async function signIn(payload: SignInSchema) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleAuthResponse(res);
}

export async function signUp(payload: SignUpSchema) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleAuthResponse(res);
}

export async function refreshToken() {
  const authCookie = await getAuthCookie<AuthCookie>();

  if (authCookie === undefined) {
    return null;
  }

  const res = await fetch(`${API_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: authCookie.data.refreshToken }),
  });

  const json = await res.json();

  if (!res.ok) {
    return ApiError.toErrorResponse(json) ?? json;
  }

  const tokens = json?.data?.tokens ?? {};
  const cookie: AuthCookie = {
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
    user: authCookie.user,
  };

  await setAuthCookie(cookie);

  return cookie;
}

export async function signOut() {
  await clearAuthCookie();

  return true;
}
