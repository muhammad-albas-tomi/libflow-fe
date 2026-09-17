'use client';

import { useQuery } from '@tanstack/react-query';

import { useAuth } from '~/lib/auth/context';
import type { Response } from '~/types/response';

import { DebugJWT } from './debug-jwt';

export function Profile() {
  const accessToken = useAuth((s) => s.accessToken);
  const refreshToken = useAuth((s) => s.refreshToken);

  const { data } = useQuery<Response<object>>({
    queryKey: [['api', 'auth/me']],
  });

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Authentication Tokens
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
            <pre className="text-sm text-gray-700 break-all whitespace-pre-wrap">
              {JSON.stringify(
                {
                  data: {
                    accessToken,
                    refreshToken,
                  },
                },
                null,
                2,
              )}
            </pre>

            {accessToken !== null && refreshToken !== null && (
              <DebugJWT accessToken={accessToken} refreshToken={refreshToken} />
            )}
          </div>
        </div>
      </div>

      {data && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              User Profile Data
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
              <pre className="text-sm text-gray-700 break-all whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
