import { NextResponse } from 'next/server';

import { randomDelay } from '~/lib/utils';

export async function POST() {
  await randomDelay(500, 1200);

  return NextResponse.json(
    {
      type: 'server_error',
      timestamp: new Date().toISOString(),
      errors: [
        {
          attr: null,
          detail:
            'An unexpected error occurred on the server. Please try again later.',
          code: 'internal_server_error',
        },
        {
          attr: null,
          detail: 'Database connection temporarily unavailable',
          code: 'database_error',
        },
      ],
    },
    { status: 500 },
  );
}
