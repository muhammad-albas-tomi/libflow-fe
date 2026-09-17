import { cookies } from 'next/headers';
import { cache } from 'react';

import { authConfig } from '~/configs/auth';

/**
 * Retrieves and decodes the authentication cookie value.
 * Uses React.cache() to memoize the result during request lifetime.
 *
 * @template T - The expected type of the decoded cookie data
 * @returns A promise that resolves to the decoded cookie data, or undefined if the cookie doesn't exist or is invalid
 *
 * @example
 * ```ts
 * // In a server component or API route
 * const authData = await getAuthCookie<{ accessToken: string; refreshToken: string }>();
 * if (authData) {
 *   console.log(authData.accessToken);
 * }
 * ```
 */
export const getAuthCookie = cache(async <T>(): Promise<T | undefined> => {
  const allCookies = await cookies();
  const cookie = allCookies.get(authConfig.cookie.name);

  if (!cookie) {
    return undefined;
  }

  try {
    const decodedData = atob(cookie.value);

    return JSON.parse(decodedData) as T;
  } catch {
    return undefined;
  }
});

/**
 * Encodes and sets the authentication cookie with the provided data.
 * The data is serialized to JSON and Base64-encoded before storage.
 *
 * @template T - The type of data to be stored in the cookie
 * @param data - The data to be encoded and stored in the cookie
 * @returns A promise that resolves when the cookie has been set
 *
 * @example
 * ```ts
 * // After successful login
 * await setAuthCookie({
 *   accessToken: 'jwt-token-here',
 *   refreshToken: 'refresh-token-here',
 * });
 * ```
 */
export async function setAuthCookie<T>(data: T): Promise<void> {
  const allCookies = await cookies();
  const encodedData = btoa(JSON.stringify(data));

  allCookies.set(authConfig.cookie.name, encodedData);
}

/**
 * Removes the authentication cookie from the browser.
 * Typically used during logout operations.
 *
 * @returns A promise that resolves when the cookie has been deleted
 *
 * @example
 * ```ts
 * // During logout
 * await clearAuthCookie();
 * ```
 */
export async function clearAuthCookie(): Promise<void> {
  const allCookies = await cookies();

  allCookies.delete(authConfig.cookie.name);
}
