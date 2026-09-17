'use client';

import { useEffect, useState } from 'react';

interface DebugJWTProps {
  accessToken: string;
  refreshToken: string;
}

interface TokenPayload {
  exp: number;
  iat: number;
  [key: string]: unknown;
}

function parseJWT(token: string): TokenPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Expired';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
}

export function DebugJWT({ accessToken, refreshToken }: DebugJWTProps) {
  const [currentTime, setCurrentTime] = useState(() =>
    Math.floor(Date.now() / 1000),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const accessTokenPayload = parseJWT(accessToken);
  const refreshTokenPayload = parseJWT(refreshToken);

  if (!accessTokenPayload || !refreshTokenPayload) {
    return (
      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-700">Invalid JWT tokens</p>
      </div>
    );
  }

  const accessTokenExpiry = accessTokenPayload.exp;
  const refreshTokenExpiry = refreshTokenPayload.exp;

  const accessTokenTimeRemaining = accessTokenExpiry - currentTime;
  const refreshTokenTimeRemaining = refreshTokenExpiry - currentTime;

  const accessTokenExpired = accessTokenTimeRemaining <= 0;
  const refreshTokenExpired = refreshTokenTimeRemaining <= 0;

  return (
    <div className="mt-4 space-y-3">
      <h4 className="text-sm font-medium text-gray-900">
        JWT Debug Information
      </h4>

      <div className="space-y-2">
        <div
          className={`p-3 rounded-lg border ${
            accessTokenExpired
              ? 'bg-red-50 border-red-200'
              : accessTokenTimeRemaining <= 30
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-green-50 border-green-200'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Access Token
            </span>
            <div className="flex items-center space-x-2">
              <span
                className={`text-sm font-mono ${
                  accessTokenExpired
                    ? 'text-red-700'
                    : accessTokenTimeRemaining <= 30
                      ? 'text-yellow-700'
                      : 'text-green-700'
                }`}
              >
                {formatTimeRemaining(accessTokenTimeRemaining)}
              </span>
              <div
                className={`w-2 h-2 rounded-full ${
                  accessTokenExpired
                    ? 'bg-red-500'
                    : accessTokenTimeRemaining <= 30
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                }`}
              />
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Expires: {new Date(accessTokenExpiry * 1000).toLocaleString()}
          </div>
        </div>

        <div
          className={`p-3 rounded-lg border ${
            refreshTokenExpired
              ? 'bg-red-50 border-red-200'
              : refreshTokenTimeRemaining <= 300
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-green-50 border-green-200'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Refresh Token
            </span>
            <div className="flex items-center space-x-2">
              <span
                className={`text-sm font-mono ${
                  refreshTokenExpired
                    ? 'text-red-700'
                    : refreshTokenTimeRemaining <= 300
                      ? 'text-yellow-700'
                      : 'text-green-700'
                }`}
              >
                {formatTimeRemaining(refreshTokenTimeRemaining)}
              </span>
              <div
                className={`w-2 h-2 rounded-full ${
                  refreshTokenExpired
                    ? 'bg-red-500'
                    : refreshTokenTimeRemaining <= 300
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                }`}
              />
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Expires: {new Date(refreshTokenExpiry * 1000).toLocaleString()}
          </div>
        </div>
      </div>

      {(accessTokenExpired || refreshTokenExpired) && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">
            ⚠️{' '}
            {accessTokenExpired && refreshTokenExpired
              ? 'Both tokens have expired'
              : accessTokenExpired
                ? 'Access token has expired'
                : 'Refresh token has expired'}
          </p>
        </div>
      )}
    </div>
  );
}
