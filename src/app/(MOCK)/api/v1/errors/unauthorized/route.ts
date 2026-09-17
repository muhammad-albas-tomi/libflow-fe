import { NextResponse } from 'next/server';

import { randomDelay } from '~/lib/utils';

export async function POST() {
  await randomDelay(200, 800);

  return NextResponse.json(
    {
      type: 'unauthorized',
      timestamp: new Date().toISOString(),
      errors: [
        {
          attr: null,
          detail: 'Your session has expired. Please sign in again.',
          code: 'session_expired',
        },
        {
          attr: null,
          detail: 'Insufficient permissions to access this resource',
          code: 'insufficient_permissions',
        },
      ],
    },
    { status: 401 },
  );
}
