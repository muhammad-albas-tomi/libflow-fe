'use client';

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
