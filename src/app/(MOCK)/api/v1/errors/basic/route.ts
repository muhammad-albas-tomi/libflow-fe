import { NextResponse } from 'next/server';

import { randomDelay } from '~/lib/utils';

export async function POST() {
  await randomDelay(200, 800);

  return NextResponse.json(
    {
      type: 'client_error',
      timestamp: new Date().toISOString(),
      errors: [
        {
          attr: null,
          detail: 'A basic error occurred while processing your request',
          code: 'basic_error',
        },
      ],
    },
    { status: 400 },
  );
}
