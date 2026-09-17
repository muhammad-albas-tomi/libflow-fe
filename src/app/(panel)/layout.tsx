// Penjelasan:
// Layout grup (panel): menyediakan Provider (TanStack Query) untuk halaman di dalamnya.
import type { Metadata } from 'next';

import { Providers } from '../(panel)/-components/providers';

export const metadata: Metadata = {
  title: {
    default: 'Example',
    template: 'Example - %s',
  },
};

export default function Layout({ children }: React.PropsWithChildren) {
  return <Providers>{children}</Providers>;
}
