# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Development Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build production bundle
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run all tests
- `pnpm test:dev` - Run tests in watch mode
- `pnpm test -- path/to/file.test.ts` - Run a single test file

## Architecture Overview

This is a Next.js 16+ frontend boilerplate with authentication, using modern
React patterns and TypeScript.

### Authentication System

The authentication system follows a multi-layer architecture:

1. **Global State (Zustand)**: `src/lib/auth/store.ts` - Vanilla Zustand store
   managing accessToken and refreshToken
2. **React Context**: `src/lib/auth/context.tsx` - React wrapper with provider
   and custom hooks
3. **Axios Integration**: `src/lib/axios/index.ts` - Automatic token injection,
   refresh token flow with queue management for concurrent requests
4. **Next.js API Routes**: `src/app/api/handlers/` - Proxy layer that manages
   cookies and forwards requests
5. **Cookie Management**: `src/lib/auth/index.ts` and `src/configs/auth.ts` -
   Base64 encoding/decoding with react.cache() optimization

### Data Fetching

- **TanStack Query**: Custom `defaultQueryFn` in
  `src/lib/query/default-query-fn.ts`
- **Query Key Pattern**: Uses array format `[['api', 'endpoint', params?]]` for
  standardized caching
  - `queryKey[0][0]` = Instance identifier ('api') - determines which axios
    instance to use
  - `queryKey[0][1]` = Endpoint path (e.g., 'auth/me', 'users')
  - `queryKey[0][2]` = Optional query parameters object
- **Auto-configured**: Axios instance with automatic authentication headers and
  token refresh
- **Extensible**: Can add more instance types (e.g., 'external', 'cdn') by
  extending `AppQueryInstance` type

### Error Handling System

Comprehensive error handling with `ApiError` class in
`src/lib/errors/api-error.ts`:

- **Type-safe Error Classification**: Validation, authentication, server, and
  network errors
- **Structured Error Format**: Standardized `ErrorResponse` with type, errors
  array, and timestamp
- **Field-specific Errors**: Methods to extract errors by field for form
  validation
- **Axios Integration**: Automatic conversion from AxiosError to ApiError in
  interceptors
- **Error Utilities**: Helper methods for error codes, details aggregation, and
  error type checking

### Directory Structure

- `src/app/examples/` - Example implementations showing how to use the
  boilerplate mechanisms (for testing and debugging)
- `src/app/(MOCK)/` - Mock API endpoints using Next.js route handlers (since MSW
  doesn't support latest Next.js)
- `src/lib/` - Core utilities (auth, axios, query, utils, errors)
- `src/types/` - Shared TypeScript types
- `src/configs/` - Configuration files
- `test/` - Test files (mirror `src/` structure)
- `test/__mocks__/` - Jest mocks (e.g., `next/headers` for cookie testing)

### Path Aliases

- `~/` maps to `./src/` (e.g., `import { foo } from '~/lib/utils'`)

### Mock Backend

The `src/app/(MOCK)/api/v1/` directory contains a complete mock backend:

- JWT-based authentication with 15s access tokens, 20s refresh tokens
- User management endpoints
- Test credentials in `credentials.json`
- Proper JWT verification using jose library
- Error simulation endpoints for testing error handling

### Key Patterns

1. **Authentication Flow**: Login → JWT tokens → Automatic refresh → Cookie
   storage
2. **API Calls**: Use TanStack Query with standardized query keys for automatic
   caching and auth
3. **Error Handling**: 401 responses trigger automatic token refresh or logout;
   all errors are wrapped in ApiError class
4. **State Management**: Zustand for auth state, TanStack Query for server state

### Component Conventions

- Use `-components/` subdirectories for component organization, currently
  applied for `/examples` routes only
- Route groups with parentheses: `(auth)`, `(MOCK)`
- Server/client component separation following Next.js App Router patterns

### Environment Variables

- `NEXT_PUBLIC_API_URL` - API base URL (defaults to localhost:3000/api/v1)
- `AUTH_COOKIES_NAME` - Auth cookie name (defaults to 'auth_token')

## Notes

- Authentication tokens have short expiration times for testing token refresh
  functionality
- Mock endpoints simulate real backend behavior including proper JWT validation
- Base64 cookie encoding (not encryption) - consider security implications for
  production
