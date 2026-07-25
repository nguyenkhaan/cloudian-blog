import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Loader2, Trash2, Plus, Edit2, Eye } from 'lucide-react';
import type { Post } from '../../types/post';
import { TableSkeleton } from '../ui/Skeleton';

interface DashboardBlogsProps {
  blogs: Post[];
  isLoadingBlogs: boolean;
  isUpdatingBlogId: number | null;
  handleToggleBlogStatus: (postId: number, currentStatus: string | null | undefined, isAdminPanel: boolean) => Promise<void>;
  handleDeleteBlog: (postId: number, isAdminPanel: boolean) => Promise<void>;
}

export const DashboardBlogs: React.FC<DashboardBlogsProps> = ({
  blogs,
  isLoadingBlogs,
  isUpdatingBlogId,
  handleToggleBlogStatus,
  handleDeleteBlog
}) => {
  const navigate = useNavigate();
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-foreground tracking-tight font-heading">
            Blog Moderation
          </h2>
        </div>
        <Link to="/manager/editor">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl px-5 py-3 flex items-center gap-1.5 shadow-none cursor-pointer">
            <Plus className="w-4.5 h-4.5" />
            <span>Create New Blog</span>
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl overflow-hidden shadow-none transition-colors duration-300">
        {isLoadingBlogs ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={4} />
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-semibold">
            No blogs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-card border-b border-slate-100 dark:border-border/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Blog Title</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border/50 text-sm text-slate-700 dark:text-slate-300">
                {blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-850 dark:text-foreground max-w-sm">
                      <span className="line-clamp-2">{blog.title}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {blog.author?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      {blog.publishedAt ? (
                        <button
                          onClick={() => handleToggleBlogStatus(blog.id, 'published', true)}
                          disabled={isUpdatingBlogId === blog.id}
                          title="Click to take down (Set to Draft)"
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer border bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/50 hover:bg-amber-50 hover:text-amber-755 hover:border-amber-100 transition-colors bg-transparent"
                        >
                          {isUpdatingBlogId === blog.id && (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          )}
                          Published
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleBlogStatus(blog.id, 'draft', true)}
                          disabled={isUpdatingBlogId === blog.id}
                          title="Click to publish (Set to Published)"
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer border bg-amber-50 dark:bg-amber-955/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/50 hover:bg-green-50 hover:text-green-755 hover:border-green-100 transition-colors bg-transparent"
                        >
                          {isUpdatingBlogId === blog.id && (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          )}
                          Draft
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : 'Draft'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => window.open(`/posts/${blog.id}`, '_blank')}
                          title="Preview blog"
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer border-0 bg-transparent"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/manager/editor?postId=${blog.id}`)}
                          title="Edit blog"
                          className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 text-blue-600 hover:text-blue-755 transition-colors cursor-pointer border-0 bg-transparent"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(blog.id, true)}
                          disabled={isUpdatingBlogId === blog.id}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-slate-850 text-red-500 hover:text-red-650 transition-colors cursor-pointer border-0 bg-transparent"
                          title="Delete Blog"
                        >
                          {isUpdatingBlogId === blog.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
