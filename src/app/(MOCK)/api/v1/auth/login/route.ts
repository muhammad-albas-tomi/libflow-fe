import type { NextRequest } from 'next/server';

import * as jose from 'jose';
import { NextResponse } from 'next/server';

import { randomDelay } from '~/lib/utils';
import { signInSchema } from '~/schemas/auth';

import CREDENTIALS from '../credentials.json';
import { buildZodErrorResponse } from '../utils';

export async function POST(request: NextRequest) {
  await randomDelay();

  const body = await request.json();

  const validation = signInSchema.safeParse(body);

  if (validation.error) {
    return NextResponse.json(buildZodErrorResponse(validation.error.issues), {
      status: 400,
    });
  }

  const { email, password } = validation.data;

  const user = CREDENTIALS.find(
    (user) => user.email === email && user.password === password,
  );

  if (user === undefined) {
    return NextResponse.json(
      {
        type: 'unauthorized',
        timestamp: new Date().toISOString(),
        errors: [
          {
            detail: 'Invalid email or password',
            attr: null,
            code: 'invalid_credentials',
          },
        ],
      },
      {
        status: 401,
      },
    );
  }

  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key',
  );

  const accessToken = await new jose.SignJWT({
    sub: user.email,
    email: user.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15s')
    .sign(secret);

  const refreshToken = await new jose.SignJWT({
    sub: user.email,
    email: user.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('20s')
    .sign(secret);

  return NextResponse.json({
    data: {
      accessToken,
      refreshToken,
    },
  });
}
