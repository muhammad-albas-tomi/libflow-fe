// Penjelasan:
// Layout dashboard: cek login (kalau belum -> ke sign-in),
// ambil data user dari cookie, bungkus dengan Shell (menu sesuai role).
import type { Metadata } from 'next';

import { redirect } from 'next/navigation';

import { getAuthCookie } from '~/lib/auth';
import type { Role } from '~/types/library';

import { Providers } from './-components/providers';
import { Shell } from './-components/shell';

export const metadata: Metadata = {
  title: {
    default: 'Perpustakaan',
    template: '%s · Perpustakaan',
  },
};

type AuthCookie = {
  data: { accessToken: string; refreshToken: string };
  user: { role: Role; name: string; memberNumber: string | null };
};

export default async function Layout({ children }: React.PropsWithChildren) {
  const authCookie = await getAuthCookie<AuthCookie>();

  // Belum login → arahkan ke halaman masuk
  if (authCookie === undefined) {
    redirect('/auth/sign-in');
  }

  const user = authCookie.user;

  return (
    <Providers {...authCookie.data}>
      <Shell
        memberNumber={user?.memberNumber ?? null}
        name={user?.name ?? 'Pengguna'}
        role={user?.role ?? 'MEMBER'}
      >
        {children}
      </Shell>
    </Providers>
  );
}
