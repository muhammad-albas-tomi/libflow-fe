import Link from 'next/link';

import { getAuthCookie } from '~/lib/auth';
import type { Response } from '~/types/response';
import type { Token } from '~/types/token';

import { Providers } from './-components/providers';
import { SignOutButton } from './-components/sign-out-button';

export default async function Layout({ children }: React.PropsWithChildren) {
  const authCookie = await getAuthCookie<Response<Token>>();

  // If the user is not authenticated, redirect to the sign-in page
  if (authCookie === undefined) {
    // redirect('/auth/sign-in');
    return null;
  }

  return (
    <Providers {...authCookie.data}>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Welcome to your dashboard
                </p>
              </div>

              <div className="flex gap-4 items-center">
                <ul className="flex gap-2 [&_a]:underline [&_a]:underline-offset-2">
                  <li>
                    <Link href="/dashboard">Dashboard</Link>
                  </li>
                  <li>
                    <Link href="/dashboard/profile">Profile</Link>
                  </li>
                </ul>

                <SignOutButton />
              </div>
            </div>
          </div>
        </div>

        {children}
      </div>
    </Providers>
  );
}
