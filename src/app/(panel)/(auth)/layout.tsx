// Penjelasan:
// Layout grup auth: kalau sudah login, dilempar ke /dashboard.
import { redirect } from 'next/navigation';

import { getAuthCookie } from '~/lib/auth';

export default async function AuthLayout({
  children,
}: React.PropsWithChildren) {
  const authCookie = await getAuthCookie();

  // Sudah login → tidak perlu ke halaman auth, arahkan ke dashboard
  if (authCookie !== undefined) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
