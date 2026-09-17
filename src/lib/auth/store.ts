// Penjelasan:
// Store global (Zustand) penyimpan accessToken & refreshToken.
import { createStore } from 'zustand/vanilla';

/**
 * Authentication state containing access and refresh tokens.
 */
export type AuthStoreState = {
  /** JWT access token for API authentication */
  accessToken: string | null;
  /** JWT refresh token for obtaining new access tokens */
  refreshToken: string | null;
};

/**
 * Actions available for manipulating authentication state.
 */
export type AuthStoreActions = {
  /** Sets a new access token */
  setAccessToken: (token: string | null) => void;
  /** Clears the current access token (sets to null) */
  clearAccessToken: () => void;

  /** Sets a new refresh token */
  setRefreshToken: (token: string | null) => void;
  /** Clears the current refresh token (sets to null) */
  clearRefreshToken: () => void;

  /** Clears both access and refresh tokens */
  clearAll: () => void;
};

/**
 * Combined authentication store type including state and actions.
 */
export type AuthStore = AuthStoreState & AuthStoreActions;

/**
 * Default initial state for the authentication store.
 * Both tokens are null (unauthenticated state).
 */
export const defaultInitState: AuthStoreState = {
  accessToken: null,
  refreshToken: null,
};

/**
 * Creates a Zustand vanilla store for authentication state management.
 * The store can be initialized with optional existing tokens.
 *
 * @param initState - Optional initial state with accessToken and/or refreshToken
 * @returns A configured Zustand store with auth state and actions
 *
 * @example
 * ```ts
 * // Create a new store with default state
 * const store = createAuthStore();
 *
 * // Create a store with existing tokens
 * const store = createAuthStore({
 *   accessToken: 'existing-token',
 *   refreshToken: 'existing-refresh',
 * });
 *
 * // Use the store
 * store.getState().setAccessToken('new-token');
 * const token = store.getState().accessToken;
 * ```
 */
export const createAuthStore = (
  initState: AuthStoreState = defaultInitState,
) => {
  return createStore<AuthStore>()((set) => ({
    ...initState,

    setAccessToken: (token: string | null) => {
      set(() => ({ accessToken: token }));
    },

    clearAccessToken: () => {
      set(() => ({ accessToken: null }));
    },

    setRefreshToken: (token: string | null) => {
      set(() => ({ refreshToken: token }));
    },

    clearRefreshToken: () => {
      set(() => ({ refreshToken: null }));
    },

    clearAll: () => {
      set(() => ({
        accessToken: null,
        refreshToken: null,
      }));
    },
  }));
};

/**
 * Global authentication store instance.
 * Use this directly in non-React contexts, or via AuthProvider/useAuth in React components.
 *
 * @example
 * ```ts
 * // In non-React code (API routes, middleware, etc.)
 * import { authStore } from '~/lib/auth/store';
 *
 * authStore.getState().setAccessToken('token');
 * authStore.getState().clearAll();
 * ```
 */
export const authStore = createAuthStore();
