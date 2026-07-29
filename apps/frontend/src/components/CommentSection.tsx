import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  getCommentsApi,
  createCommentApi,
  updateCommentApi,
  deleteCommentApi
} from '../api/comment';
import type { Comment } from '../types/comment';
import { ReportModal } from './ReportModal';
import { Button } from './ui/button';
import { ConfirmModal } from './ui/ConfirmModal';
import { getErrorMessage } from '../utils/errors';
import {
  Send,
  Edit2,
  Trash2,
  Flag,
  Loader2,
  AlertCircle,
  X,
  Check,
  Calendar
} from 'lucide-react';

interface CommentSectionProps {
  postId: number;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { isAuthenticated, user, openLoginModal } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [commentIdToDelete, setCommentIdToDelete] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [reportModalTarget, setReportModalTarget] = useState<{
    id: number;
    preview: string;
  } | null>(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCommentsApi(postId);
      setComments(data);
    } catch (err) {
      setError('Failed to load comments. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await createCommentApi(postId, newCommentText.trim());
      setNewCommentText('');
      await fetchComments();
      toast({
        title: 'Comment submitted',
        description: 'Your comment has been posted.',
        variant: 'success',
      });
    } catch (err: any) {
      const errMsg = getErrorMessage(err, 'Failed to post comment.');
      setError(errMsg);
      toast({
        title: 'Failed to submit comment',
        description: errMsg,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText('');
  };

  const handleSaveEdit = async (commentId: number) => {
    if (!editingText.trim() || isSavingEdit) return;

    setIsSavingEdit(true);
    setError(null);

    try {
      await updateCommentApi(commentId, editingText.trim());
      setEditingCommentId(null);
      setEditingText('');
      await fetchComments();
      toast({
        title: 'Update Successful',
        description: 'Your comment has been updated.',
        variant: 'success',
      });
    } catch (err: any) {
      const errMsg = getErrorMessage(err, 'Failed to update comment.');
      setError(errMsg);
      toast({
        title: 'Update Failed',
        description: errMsg,
        variant: 'destructive',
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteComment = (commentId: number) => {
    setCommentIdToDelete(commentId);
  };

  const handleConfirmDeleteComment = async () => {
    if (commentIdToDelete === null) return;
    const commentId = commentIdToDelete;
    setCommentIdToDelete(null);
    setError(null);

    try {
      await deleteCommentApi(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast({
        title: 'Comment Deleted',
        description: 'Your comment has been deleted.',
        variant: 'success',
      });
    } catch (err: any) {
      const errMsg = getErrorMessage(err, 'Failed to delete comment.');
      setError(errMsg);
      toast({
        title: 'Delete Failed',
        description: errMsg,
        variant: 'destructive',
      });
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
    return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
  };

  const canModifyComment = (commentUser: Comment['user']) => {
    if (!isAuthenticated || !user) return false;
    const isOwner = user.id === commentUser.id;
    const isManagerOrAdmin = user.roles.some((r) => r === 'admin' || r === 'manager');
    return isOwner || isManagerOrAdmin;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {isAuthenticated ? (
        <form onSubmit={handleCreateComment} className="space-y-3">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm select-none border border-primary/20 shrink-0">
              {getInitials(user?.name || '')}
            </div>
            <div className="flex-grow space-y-3">
              <textarea
                placeholder="Write a comment..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                rows={3}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-350 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-800 dark:text-foreground bg-white dark:bg-background transition-all placeholder:text-slate-450"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!newCommentText.trim() || isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:opacity-90 text-white font-black text-xs flex items-center gap-1.5 shadow-none cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Post comment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="text-center py-6 bg-slate-50 dark:bg-card border border-slate-350 dark:border-border rounded-xl p-6">
          <p className="text-slate-700 dark:text-foreground text-sm font-bold mb-1">Sign in to join the discussion</p>
          <p className="text-slate-455 dark:text-muted-foreground text-xs mb-4">Please sign in with Google to comment on this blog.</p>
          <Button 
            onClick={openLoginModal} 
            className="px-5 py-2.5 rounded-xl bg-primary hover:opacity-95 text-white font-black text-xs shadow-none cursor-pointer"
          >
            Sign in with Google
          </Button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-10 gap-2">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Loading comments...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 text-slate-450 text-xs italic">
          No comments yet. Be the first to start the discussion!
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-border/50">
          {comments.map((comment) => (
            <div key={comment.id} className="py-5 first:pt-0 last:pb-0 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-border text-slate-600 dark:text-slate-350 flex items-center justify-center font-bold text-sm select-none shrink-0 shadow-none">
                {getInitials(comment.user.name)}
              </div>

              <div className="flex-grow space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-slate-800 dark:text-foreground block">
                      {comment.user.name}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-450">
                      <Calendar className="w-3 h-3" />
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {canModifyComment(comment.user) ? (
                      editingCommentId !== comment.id && (
                        <>
                          <button
                            onClick={() => handleStartEdit(comment)}
                            title="Edit comment"
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-primary transition-all cursor-pointer border-0 bg-transparent"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            title="Delete comment"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-all cursor-pointer border-0 bg-transparent"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )
                    ) : (
                      isAuthenticated && (
                        <button
                          onClick={() => setReportModalTarget({ id: comment.id, preview: comment.content })}
                          title="Report violation"
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 hover:text-amber-700 transition-all cursor-pointer border-0 bg-transparent"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}
                  </div>
                </div>

                {editingCommentId === comment.id ? (
                  <div className="space-y-2 mt-2">
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl border border-slate-350 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-800 dark:text-foreground bg-white dark:bg-background transition-all"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={handleCancelEdit}
                        disabled={isSavingEdit}
                        variant="ghost"
                        size="sm"
                        className="px-3 py-1.5 border border-slate-200 dark:border-border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 text-xs font-semibold cursor-pointer shadow-none"
                      >
                        <X className="w-3.5 h-3.5 mr-1" /> Cancel
                      </Button>
                      <Button
                        onClick={() => handleSaveEdit(comment.id)}
                        disabled={!editingText.trim() || isSavingEdit}
                        size="sm"
                        className="px-3 py-1.5 rounded-xl bg-primary hover:opacity-90 text-white font-black text-xs flex items-center shadow-none cursor-pointer"
                      >
                        {isSavingEdit ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1" /> Save
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {reportModalTarget && (
        <ReportModal
          isOpen={!!reportModalTarget}
          onClose={() => setReportModalTarget(null)}
          entityType="comment"
          entityId={reportModalTarget.id}
          entityPreviewText={reportModalTarget.preview}
        />
      )}

      <ConfirmModal
        isOpen={commentIdToDelete !== null}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDeleteComment}
        onCancel={() => setCommentIdToDelete(null)}
      />
    </div>
  );
};
