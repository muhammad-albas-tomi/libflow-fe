// Penjelasan:
// Halaman root '/': cek login, arahkan ke /dashboard (sudah login) atau /auth/sign-in.
import { redirect } from 'next/navigation';

import { getAuthCookie } from '~/lib/auth';

export default async function Page() {
  const authCookie = await getAuthCookie();

  // Belum login → ke halaman masuk; sudah login → ke dashboard
  redirect(authCookie === undefined ? '/auth/sign-in' : '/dashboard');
}
