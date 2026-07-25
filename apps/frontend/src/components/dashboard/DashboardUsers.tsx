import React from 'react';
import { Button } from '../ui/button';

interface UserListItem {
  id: number;
  name: string;
  email: string;
  roles: string[];
  joinedAt: string;
  status: string;
}

interface DashboardUsersProps {
  usersList: UserListItem[];
  handleToggleUserStatus: (userId: number) => void;
}

export const DashboardUsers: React.FC<DashboardUsersProps> = ({
  usersList,
  handleToggleUserStatus
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-foreground tracking-tight font-heading">
          User Management
        </h2>
      </div>

      <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl overflow-hidden shadow-none transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-card border-b border-slate-100 dark:border-border/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Roles</th>
                <th className="px-6 py-4">Joined At</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-border/50 text-sm text-slate-700 dark:text-slate-300">
              {usersList.map((userItem) => (
                <tr key={userItem.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-850 dark:text-foreground">
                    {userItem.name}
                  </td>
                  <td className="px-6 py-4 text-slate-505 dark:text-slate-400">
                    {userItem.email}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {userItem.roles.map((r, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-650 dark:text-slate-350 border border-slate-200 dark:border-border">
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-505 dark:text-slate-400">
                    {new Date(userItem.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      userItem.status === 'active'
                        ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                        : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                    }`}>
                      {userItem.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleUserStatus(userItem.id)}
                      className={`text-[11px] font-bold rounded-lg px-3 py-1.5 cursor-pointer ${
                        userItem.status === 'active'
                          ? 'text-red-655 hover:bg-red-50 dark:hover:bg-red-950/20'
                          : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20'
                      }`}
                    >
                      {userItem.status === 'active' ? 'Suspend' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
