import type { NextRequest } from 'next/server';

import * as jose from 'jose';
import { NextResponse } from 'next/server';
import * as z from 'zod';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const validation = z
    .object({
      refreshToken: z.string(),
    })
    .safeParse(body);

  if (validation.error) {
    return NextResponse.json(
      {
        type: 'client_error',
        timestamp: new Date().toISOString(),
        errors: [
          {
            detail: 'Refresh token is required',
            attr: 'refreshToken',
            code: 'invalid_request',
          },
        ],
      },
      { status: 400 },
    );
  }

  const { refreshToken } = validation.data;

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key',
    );

    const { payload } = await jose.jwtVerify(refreshToken, secret);

    if (Date.now() >= payload.exp! * 1000) {
      return NextResponse.json(
        {
          type: 'client_error',
          timestamp: new Date().toISOString(),
          errors: [
            {
              detail: 'Refresh token expired',
              attr: null,
              code: 'token_expired',
            },
          ],
        },
        { status: 401 },
      );
    }

    const accessToken = await new jose.SignJWT({
      sub: payload.sub,
      email: payload.email,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15s')
      .sign(secret);

    const newRefreshToken = await new jose.SignJWT({
      sub: payload.sub,
      email: payload.email,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('20s')
      .sign(secret);

    return NextResponse.json({
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch {
    return NextResponse.json(
      {
        type: 'client_error',
        timestamp: new Date().toISOString(),
        errors: [
          {
            detail: 'Invalid or expired refresh token',
            attr: null,
            code: 'invalid_token',
          },
        ],
      },
      { status: 401 },
    );
  }
}
