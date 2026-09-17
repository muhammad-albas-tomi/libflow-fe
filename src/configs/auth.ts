// Penjelasan:
// Konfigurasi auth FE (nama cookie).
export const authConfig = {
  cookie: {
    name: process.env.AUTH_COOKIES_NAME ?? 'auth_token',
  },
};
