import type { NextRequest } from 'next/server';

import * as jose from 'jose';
import { NextResponse } from 'next/server';

import { delay, randomDelay } from '~/lib/utils';

import USERS_DATA from './users.json';

const USERS = USERS_DATA.filter(({ gender }) =>
  ['Male', 'Female'].includes(gender),
);

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

  await delay(500);

  const url = new URL(request.url);

  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const search = url.searchParams.get('search') || '';
  const gender = url.searchParams.get('gender') || '';

  let filteredData = USERS;

  if (gender && (gender === 'Male' || gender === 'Female')) {
    filteredData = filteredData.filter((user) => user.gender === gender);
  }

  if (search) {
    const searchLower = search.toLowerCase();

    filteredData = filteredData.filter(
      (user) =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.ip_address.toLowerCase().includes(searchLower),
    );
  }

  const totalData = filteredData.length;
  const totalPage = Math.ceil(totalData / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedData = filteredData.slice(startIndex, endIndex);

  const data = paginatedData.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    gender: user.gender,
    ipAddress: user.ip_address,
  }));

  return NextResponse.json({
    data,
    meta: {
      page,
      totalPage,
      totalData,
    },
  });
}

export async function POST(request: NextRequest) {
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

  await randomDelay();

  return NextResponse.json({
    data: {
      id: 101,
      name: 'New User',
      email: 'newuser@example.com',
    },
  });
}
