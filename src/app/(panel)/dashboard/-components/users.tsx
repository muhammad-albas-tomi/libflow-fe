'use client';

import { useQuery } from '@tanstack/react-query';

import type { ListResponse } from '~/types/response';

type User = {
  id: number;
  name: string;
  email: string;
  gender: string;
  ipAddress: string;
};

export function UsersTable() {
  const { data, isLoading } = useQuery<ListResponse<User>>({
    queryKey: [['api', 'users']],
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.data &&
              (data?.data.length > 0 ? (
                data.data.map((user, index: number) => (
                  <tr key={user.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.id || `user-${index + 1}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.name || 'Unknown User'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                    colSpan={3}
                  >
                    No users found. Create your first user to get started.
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
