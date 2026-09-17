'use server';

import { clearAuthCookie, getAuthCookie, setAuthCookie } from '~/lib/auth';
import { type SignInSchema } from '~/schemas/auth';
import { type Response } from '~/types/response';
import { type Token } from '~/types/token';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export async function signIn(payload: SignInSchema) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (response) {
    const data = await response.json();

    if (
      response.ok &&
      response.headers.get('Content-Type')?.includes('application/json')
    ) {
      await setAuthCookie(data);
    }

    return data;
  }

  throw new Error(`Error Occured whilst SignIn`);
}

export async function refreshToken() {
  const authCookie = await getAuthCookie<Response<Token>>();

  if (authCookie === undefined) {
    return null;
  }

  const response = await fetch(`${API_URL}/auth/refresh-token`, {
    method: 'POST',
    body: JSON.stringify({
      refreshToken: authCookie.data.refreshToken,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response) {
    const data = await response.json();

    if (
      response.ok &&
      response.headers.get('Content-Type')?.includes('application/json')
    ) {
      await setAuthCookie(data);
    }

    return data;
  }

  throw new Error(`Error Occured whilst Refreshing Token`);
}

export async function signOut() {
  await clearAuthCookie();

  return true;
}
