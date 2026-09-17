// Penjelasan:
// Provider & hook React (useAuth) untuk baca/ubah state auth di komponen.
import type { AuthStore, AuthStoreState, createAuthStore } from './store';

import { createContext, useContext } from 'react';
import { useStore } from 'zustand';

import { authStore } from './store';

export type AuthStoreApi = ReturnType<typeof createAuthStore>;

/**
 * React Context for the authentication store.
 * Provides access to the auth store throughout the component tree.
 *
 * @example
 * ```tsx
 * // In a component
 * const store = useContext(AuthContext);
 * ```
 */
export const AuthContext = createContext<AuthStoreApi | null>(null);

/**
 * Authentication provider component that wraps the application to provide auth context.
 * Initializes the auth store with optional initial state (tokens from cookies, etc).
 *
 * @param children - React child components to be wrapped by the provider
 * @param initialState - Optional initial state containing accessToken and/or refreshToken
 *
 * @example
 * ```tsx
 * // In app/layout.tsx or root layout
 * <AuthProvider accessToken={tokenFromCookie} refreshToken={refreshFromCookie}>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({
  children,
  ...initialState
}: React.PropsWithChildren<AuthStoreState>) {
  if (initialState.accessToken || initialState.refreshToken) {
    authStore.setState({
      accessToken: initialState.accessToken,
      refreshToken: initialState.refreshToken,
    });
  }

  return (
    <AuthContext.Provider value={authStore}>{children}</AuthContext.Provider>
  );
}

/**
 * Custom hook to access the authentication store with a selector function.
 * Must be used within an AuthProvider component.
 *
 * @template T - The return type of the selector function
 * @param selector - A function that selects and derives state from the auth store
 * @returns The selected state from the auth store
 * @throws {Error} If used outside of an AuthProvider
 *
 * @example
 * ```tsx
 * // Select access token
 * const accessToken = useAuth((state) => state.accessToken);
 *
 * // Select multiple values
 * const { accessToken, refreshToken } = useAuth((state) => ({
 *   accessToken: state.accessToken,
 *   refreshToken: state.refreshToken,
 * }));
 *
 * // Select actions
 * const setAccessToken = useAuth((state) => state.setAccessToken);
 * ```
 */
export function useAuth<T>(selector: (store: AuthStore) => T) {
  const store = useContext(AuthContext);

  if (store === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return useStore(store, selector);
}
