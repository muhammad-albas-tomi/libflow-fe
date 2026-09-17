import type { AuthStoreState } from '~/lib/auth/store';
import { createAuthStore } from '~/lib/auth/store';

describe('Auth Store', () => {
  describe('initState', () => {
    it('should initialize with default state when no initState provided', () => {
      const store = createAuthStore();
      const state = store.getState();

      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
    });

    it('should initialize with default state when initState provided', () => {
      const initState: AuthStoreState = {
        accessToken: 'provided-access-token',
        refreshToken: 'provided-refresh-token',
      };
      const store = createAuthStore(initState);
      const state = store.getState();

      expect(state.accessToken).toEqual('provided-access-token');
      expect(state.refreshToken).toEqual('provided-refresh-token');
    });
  });

  describe('setAccessToken', () => {
    it('should set accessToken with valid token string', () => {
      const store = createAuthStore();

      store.getState().setAccessToken('provided-access-token');
      expect(store.getState().accessToken).toEqual('provided-access-token');
    });

    it('should set accessToken to null', () => {
      const initState: AuthStoreState = {
        accessToken: 'provided-access-token',
        refreshToken: null,
      };
      const store = createAuthStore(initState);

      store.getState().setAccessToken(null);

      expect(store.getState().accessToken).toBeNull();
    });

    it('should update accessToken without affecting refreshToken', () => {
      const initState: AuthStoreState = {
        accessToken: 'old-access-token',
        refreshToken: 'old-refresh-token',
      };
      const store = createAuthStore(initState);

      store.getState().setAccessToken('new-access-token');

      expect(store.getState().accessToken).toEqual('new-access-token');
      expect(store.getState().refreshToken).toEqual('old-refresh-token');
    });
  });

  describe('clearAccessToken', () => {
    it('should clear accessToken to be null', () => {
      const initState: AuthStoreState = {
        accessToken: 'provided-access-token',
        refreshToken: null,
      };
      const store = createAuthStore(initState);

      store.getState().clearAccessToken();

      expect(store.getState().accessToken).toBeNull();
    });

    it('should not affecting refreshToken when clearing accessToken', () => {
      const initState: AuthStoreState = {
        accessToken: 'provided-access-token',
        refreshToken: 'provided-refresh-token',
      };
      const store = createAuthStore(initState);

      store.getState().clearAccessToken();
      expect(store.getState().refreshToken).toEqual('provided-refresh-token');
    });
  });

  describe('setRefreshToken', () => {
    it('should set refreshToken with valid token string', () => {
      const store = createAuthStore();

      store.getState().setRefreshToken('provided-refresh-token');
      expect(store.getState().refreshToken).toEqual('provided-refresh-token');
    });

    it('should set refresh to null', () => {
      const initState: AuthStoreState = {
        accessToken: null,
        refreshToken: 'provided-refresh-token',
      };
      const store = createAuthStore(initState);

      store.getState().setRefreshToken(null);

      expect(store.getState().refreshToken).toBeNull();
    });

    it('should update refreshToken without affecting accessToken', () => {
      const initState: AuthStoreState = {
        accessToken: 'old-access-token',
        refreshToken: 'old-refresh-token',
      };
      const store = createAuthStore(initState);

      store.getState().setRefreshToken('new-refresh-token');

      expect(store.getState().accessToken).toEqual('old-access-token');
      expect(store.getState().refreshToken).toEqual('new-refresh-token');
    });
  });

  describe('clearRefreshToken', () => {
    it('should clear refreshToken to be null', () => {
      const initState: AuthStoreState = {
        accessToken: null,
        refreshToken: 'provided-refresh-token',
      };
      const store = createAuthStore(initState);

      store.getState().clearRefreshToken();

      expect(store.getState().refreshToken).toBeNull();
    });

    it('should not affecting accessToken when clearing refreshToken', () => {
      const initState: AuthStoreState = {
        accessToken: 'provided-access-token',
        refreshToken: 'provided-refresh-token',
      };
      const store = createAuthStore(initState);

      store.getState().clearRefreshToken();
      expect(store.getState().accessToken).toEqual('provided-access-token');
    });
  });

  describe('clearAll', () => {
    it('should clear both tokens if exist', () => {
      const initState: AuthStoreState = {
        accessToken: 'provided-access-token',
        refreshToken: 'provided-refresh-token',
      };
      const store = createAuthStore(initState);

      store.getState().clearAll();

      expect(store.getState().accessToken).toBeNull();
      expect(store.getState().refreshToken).toBeNull();
    });

    it('should clear any tokens when exists', () => {
      const store = createAuthStore({
        accessToken: 'access-token',
        refreshToken: null,
      });

      store.getState().clearAll();

      expect(store.getState().accessToken).toBeNull();
      expect(store.getState().refreshToken).toBeNull();
    });

    it('should work correctly when tokens already null', () => {
      const initState: AuthStoreState = {
        accessToken: null,
        refreshToken: null,
      };
      const store = createAuthStore(initState);

      store.getState().clearAll();

      expect(store.getState().accessToken).toBeNull();
      expect(store.getState().refreshToken).toBeNull();
    });
  });

  describe('Store Isolation', () => {
    it('should create independent store instances', () => {
      const store1 = createAuthStore();
      const store2 = createAuthStore();

      store1.getState().setAccessToken('token1');
      store2.getState().setAccessToken('token2');

      expect(store1.getState().accessToken).toBe('token1');
      expect(store2.getState().accessToken).toBe('token2');
    });
  });

  describe('Action Composition', () => {
    it('should handle multiple sequential actions correctly', () => {
      const store = createAuthStore();

      store.getState().setAccessToken('access-1');
      store.getState().setRefreshToken('refresh-1');
      store.getState().setAccessToken('access-2');

      expect(store.getState().accessToken).toBe('access-2');
      expect(store.getState().refreshToken).toBe('refresh-1');
    });

    it('should handle set then clear sequence', () => {
      const store = createAuthStore();

      store.getState().setAccessToken('token');
      store.getState().clearAccessToken();

      expect(store.getState().accessToken).toBeNull();
    });
  });
});
