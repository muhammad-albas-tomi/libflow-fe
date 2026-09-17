import { NextResponse } from 'next/server';

import { randomDelay } from '~/lib/utils';

export async function POST() {
  await randomDelay(200, 800);

  return NextResponse.json(
    {
      type: 'validation_error',
      timestamp: new Date().toISOString(),
      errors: [
        {
          attr: 'name',
          detail: 'Name is required and must be at least 2 characters',
          code: 'required',
        },
        {
          attr: 'email',
          detail: 'Email format is invalid',
          code: 'invalid_format',
        },
        {
          attr: 'email',
          detail: 'Email is already taken',
          code: 'already_exists',
        },
        {
          attr: 'age',
          detail: 'Age must be between 18 and 120',
          code: 'out_of_range',
        },
        {
          attr: 'password',
          detail: 'Password must contain at least one uppercase letter',
          code: 'weak_password',
        },
        {
          attr: 'password',
          detail: 'Password must be at least 8 characters long',
          code: 'min_length',
        },
      ],
    },
    { status: 400 },
  );
}
