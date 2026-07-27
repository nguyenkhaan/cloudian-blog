import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Plus, FolderOpen, Edit2, Trash2, Eye } from 'lucide-react';
import type { Post } from '../../types/post';
import { TableSkeleton } from '../ui/Skeleton';

interface DashboardMyBlogsProps {
  managerPosts: Post[];
  isLoadingManagerPosts: boolean;
  handleDeleteBlog: (postId: number, isAdminPanel: boolean) => Promise<void>;
}

export const DashboardMyBlogs: React.FC<DashboardMyBlogsProps> = ({
  managerPosts,
  isLoadingManagerPosts,
  handleDeleteBlog
}) => {
  const navigate = useNavigate();
  const safeManagerPosts = Array.isArray(managerPosts) ? managerPosts : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-foreground tracking-tight font-heading">
            Blog Management
          </h2>
        </div>
        <Link to="/manager/editor">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl px-5 py-3 flex items-center gap-1.5 shadow-none cursor-pointer">
            <Plus className="w-4.5 h-4.5" />
            <span>Create New Blog</span>
          </Button>
        </Link>
      </div>

      {isLoadingManagerPosts ? (
        <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6 shadow-none">
          <TableSkeleton rows={5} cols={4} />
        </div>
      ) : safeManagerPosts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-card border border-dashed border-slate-200 dark:border-border p-8 rounded-2xl">
          <FolderOpen className="w-10 h-10 text-slate-355 mx-auto mb-3" />
          <p className="font-bold text-slate-600 dark:text-slate-400 text-base">No posts found</p>
          <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">
            You haven't written any posts yet. Click the button above to write your first blog!
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl shadow-none overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-card border-b border-slate-100 dark:border-border/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Blog</th>
                  <th className="px-6 py-4">Collections</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border/50 text-sm text-slate-700 dark:text-slate-300">
                {safeManagerPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 max-w-xs">
                      <span className="font-bold text-slate-850 dark:text-foreground line-clamp-2">{post.title}</span>
                      <span className="text-[10px] text-slate-400 mt-1 block">Slug: {post.slug}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(post.collections) && post.collections.length > 0 ? (
                          post.collections.map((col) => (
                            <span key={col.id} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-650 dark:text-slate-350">
                              {col.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-xs italic">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {post.publishedAt ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/50">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-amber-50 dark:bg-amber-955/30 text-amber-700 dark:text-amber-455 border-amber-100 dark:border-amber-900/50">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-550 dark:text-slate-400">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString('en-US')
                        : 'Not published'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => window.open(`/posts/${post.id}`, '_blank')}
                          title="Preview blog"
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer border-0 bg-transparent"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/manager/editor?postId=${post.id}`)}
                          title="Edit blog"
                          className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 text-blue-600 hover:text-blue-750 transition-colors cursor-pointer border-0 bg-transparent"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(post.id, false)}
                          title="Delete blog"
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-slate-850 text-red-650 hover:text-red-750 transition-colors cursor-pointer border-0 bg-transparent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
