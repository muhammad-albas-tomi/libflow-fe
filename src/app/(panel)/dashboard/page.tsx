import { NewUserButton } from './-components/new-user-button';
import { Profile } from './-components/profile';
import { UsersTable } from './-components/users';

export default function Page() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Profile />
        </div>

        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Users</h2>
              <NewUserButton />
            </div>
            <UsersTable />
          </div>
        </div>
      </div>
    </div>
  );
}
