import React from 'react';
import { Loader2, Pencil } from 'lucide-react';
import { Button } from '../ui/button';
import type { AdminUserItem } from '../../api/admin';

interface DashboardUsersProps {
  usersList: AdminUserItem[];
  isLoadingUsers: boolean;
  updatingUserId: number | null;
  handleToggleUserStatus: (userId: number) => void;
  handleEditUserEmail: (user: AdminUserItem) => void;
}

export const DashboardUsers: React.FC<DashboardUsersProps> = ({
  usersList,
  isLoadingUsers,
  updatingUserId,
  handleToggleUserStatus,
  handleEditUserEmail
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
              {isLoadingUsers ? (
                <tr>
                  <td className="px-6 py-10 text-center text-slate-400 dark:text-slate-500" colSpan={6}>
                    <div className="inline-flex items-center gap-2 font-semibold">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : usersList.length === 0 ? (
                <tr>
                  <td className="px-6 py-10 text-center text-slate-400 dark:text-slate-500 font-semibold" colSpan={6}>
                    No users found.
                  </td>
                </tr>
              ) : usersList.map((userItem) => (
                <tr key={userItem.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-850 dark:text-foreground">
                    <div className="space-y-1">
                      <div>{userItem.name}</div>
                      {userItem.nickName && (
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {userItem.nickName}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-505 dark:text-slate-400">
                    <div className="space-y-1">
                      <div>{userItem.email}</div>
                      <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                        Providers: {userItem.providers.join(', ')}
                      </div>
                    </div>
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
                    {userItem.joinedAt ? new Date(userItem.joinedAt).toLocaleDateString() : '—'}
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
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditUserEmail(userItem)}
                        className="text-[11px] font-bold rounded-lg px-3 py-1.5 cursor-pointer border-slate-200 dark:border-border text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit Email
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={updatingUserId === userItem.id}
                        onClick={() => handleToggleUserStatus(userItem.id)}
                        className={`text-[11px] font-bold rounded-lg px-3 py-1.5 cursor-pointer ${
                          userItem.status === 'active'
                            ? 'text-red-655 hover:bg-red-50 dark:hover:bg-red-950/20'
                            : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20'
                        }`}
                      >
                        {updatingUserId === userItem.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : userItem.status === 'active' ? (
                          'Suspend'
                        ) : (
                          'Activate'
                        )}
                      </Button>
                    </div>
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
