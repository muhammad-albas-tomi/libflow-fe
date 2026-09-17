import { cookies } from 'next/headers';

import { clearAuthCookie, getAuthCookie, setAuthCookie } from '~/lib/auth';

jest.mock('next/headers');

jest.mock('~/configs/auth', () => ({
  authConfig: {
    cookie: {
      name: 'auth_token',
    },
  },
}));

describe('Auth Cookie', () => {
  const mockData = {
    accessToken: 'accessToken',
    refreshToken: 'refreshToken',
  };

  let mockCookies: {
    get: jest.Mock;
    set: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockCookies = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };

    (cookies as jest.Mock).mockResolvedValue(mockCookies);
  });

  describe('getAuthCookie', () => {
    it('should return undefined when cookie does not exist', async () => {
      mockCookies.get.mockReturnValue(undefined);

      const result = await getAuthCookie();

      expect(result).toBeUndefined();
      expect(mockCookies.get).toHaveBeenCalledWith('auth_token');
    });

    it('should decode and parse cookie value correctly', async () => {
      const encodedValue = btoa(JSON.stringify(mockData));

      mockCookies.get.mockReturnValue({ value: encodedValue });

      const result = await getAuthCookie<typeof mockData>();

      expect(result).toEqual(mockData);
      expect(mockCookies.get).toHaveBeenCalledWith('auth_token');
    });

    it('should return undefined when cookie value is invalid base64', async () => {
      mockCookies.get.mockReturnValue({ value: 'invalid-base64!!!' });

      const result = await getAuthCookie();

      expect(result).toBeUndefined();
    });

    it('should return undefined when auth cookie value is not valid JSON', async () => {
      const invalidJson = btoa('not a json string');

      mockCookies.get.mockReturnValue({ value: invalidJson });

      const result = await getAuthCookie();

      expect(result).toBeUndefined();
    });
  });

  describe('setAuthCookie', () => {
    it('should encode and set auth cookie with data', async () => {
      const expectedEncoded = btoa(JSON.stringify(mockData));

      await setAuthCookie(mockData);

      expect(mockCookies.set).toHaveBeenCalledWith(
        'auth_token',
        expectedEncoded,
      );
    });
  });

  describe('clearAuthCookie', () => {
    it('should delete auth cookie', async () => {
      await clearAuthCookie();

      expect(mockCookies.delete).toHaveBeenCalledWith('auth_token');
    });
  });
});
