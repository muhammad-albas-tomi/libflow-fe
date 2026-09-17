import * as jose from 'jose';
import { NextResponse, type NextRequest } from 'next/server';

import CREDENTIALS from '../credentials.json';

export async function GET(request: NextRequest) {
  const authorization = request.headers.get('Authorization');

  if (authorization === null) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        type: 'client_error',
        errors: [
          {
            detail: 'Unauthenticated',
            attr: null,
            code: 'unauthenticated',
          },
        ],
      },
      { status: 401 },
    );
  }

  const [, token] = authorization.split(' ');

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key',
    );

    const { payload } = await jose.jwtVerify(token, secret);

    if (Date.now() >= payload.exp! * 1000) {
      return NextResponse.json(
        {
          timestamp: new Date().toISOString(),
          type: 'client_error',
          errors: [
            {
              detail: 'Token expired',
              attr: null,
              code: 'token_expired',
            },
          ],
        },
        { status: 401 },
      );
    }

    const user = CREDENTIALS.find((user) => user.email === payload.email);

    if (user === undefined) {
      return NextResponse.json(
        {
          timestamp: new Date().toISOString(),
          type: 'client_error',
          errors: [
            {
              detail: 'User not found',
              attr: null,
              code: 'user_not_found',
            },
          ],
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: user,
    });
  } catch {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        type: 'client_error',
        errors: [
          {
            detail: 'Invalid or expired token',
            attr: null,
            code: 'invalid_token',
          },
        ],
      },
      { status: 401 },
    );
  }
}
