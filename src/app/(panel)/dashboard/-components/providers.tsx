'use client';
// Penjelasan:
// Provider Auth (client): menyimpan token login ke store global (Zustand).

import { AuthProvider } from '~/lib/auth/context';

export function Providers({
  children,
  ...authState
}: React.PropsWithChildren<{
  accessToken: string;
  refreshToken: string;
}>) {
  return <AuthProvider {...authState}>{children}</AuthProvider>;
}
