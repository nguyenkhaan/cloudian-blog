import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  getReportsApi,
  updateReportStatusApi,
  getAllCommentsApi,
  updateCommentStatusApi,
  getUsersApi,
  updateUserStatusApi,
  requestAdminUserEmailChangeApi,
} from '../api/admin';
import type { ReportItem, AdminCommentItem, AdminUserItem } from '../api/admin';
import { deletePostApi, updatePostStatusApi, getManagerPostsApi, getAdminPostsApi } from '../api/post';
import type { Post } from '../types/post';
import { registerApi, forgotPasswordApi, requestEmailChangeApi, updateProfileApi } from '../api/auth';
import { Button } from '../components/ui/button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import {
  type EmailChangeVerificationTarget,
  getEmailChangeSuccessMessage,
} from '../utils/emailChange';

// Extracted Tab Components
import { DashboardReports } from '../components/dashboard/DashboardReports';
import { DashboardBlogs } from '../components/dashboard/DashboardBlogs';
import { DashboardManagers } from '../components/dashboard/DashboardManagers';
import { DashboardUsers } from '../components/dashboard/DashboardUsers';
import { UserEmailChangeModal } from '../components/dashboard/UserEmailChangeModal';
import { DashboardMyBlogs } from '../components/dashboard/DashboardMyBlogs';
import { DashboardProfile } from '../components/dashboard/DashboardProfile';
import { DashboardTaxonomy } from '../components/dashboard/DashboardTaxonomy';
import { getErrorMessage } from '../utils/errors';
import {
  User,
  BookOpen,
  Users,
  LogOut,
  Shield,
  AlertCircle,
  ShieldAlert,
  UserPlus,
  ArrowLeft,
  Menu,
  X,
  FolderPlus
} from 'lucide-react';

type TabType = 'reports' | 'blogs' | 'taxonomy' | 'managers' | 'users' | 'my_blogs' | 'profile';

const tabToParamMap: Record<TabType, string> = {
  reports: 'reports',
  blogs: 'blog-management',
  taxonomy: 'taxonomy',
  managers: 'managers',
  users: 'users',
  my_blogs: 'my-blogs',
  profile: 'profile'
};

const paramToTabMap: Record<string, TabType> = {
  'reports': 'reports',
  'abuse-reports': 'reports',
  'blog-management': 'blogs',
  'blogs': 'blogs',
  'taxonomy': 'taxonomy',
  'managers': 'managers',
  'users': 'users',
  'my-blogs': 'my_blogs',
  'my_blogs': 'my_blogs',
  'profile': 'profile'
};

export const Dashboard: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const userRoles = user?.roles?.map(r => String(r).toLowerCase()) || [];
  const isAdmin = userRoles.includes('admin') || user?.email === 'admin@gmail.com';
  const isManager = userRoles.includes('manager') || user?.email === 'manager@gmail.com';

  const [searchParams, setSearchParams] = useSearchParams();
  const queryTab = searchParams.get('tab');

  const defaultTab = isAdmin ? 'reports' : isManager ? 'my_blogs' : 'profile';
  const initialTab = (queryTab && paramToTabMap[queryTab]) 
    ? paramToTabMap[queryTab] 
    : defaultTab;

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab: tabToParamMap[tab] });
  };

  const [isChatbotEnabled, setIsChatbotEnabled] = useState(() => {
    return localStorage.getItem('chatbot_enabled_system') !== 'false';
  });

  const handleToggleChatbot = () => {
    const newVal = !isChatbotEnabled;
    setIsChatbotEnabled(newVal);
    localStorage.setItem('chatbot_enabled_system', newVal ? 'true' : 'false');
    window.dispatchEvent(new Event('chatbot-toggle'));
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Reports state
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [solvingReport, setSolvingReport] = useState<ReportItem | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolutionStatus, setResolutionStatus] = useState<'solved' | 'cancel'>('solved');
  const [isSolvingSubmit, setIsSolvingSubmit] = useState(false);

  // Comments state
  const [comments, setComments] = useState<AdminCommentItem[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isUpdatingCommentId, setIsUpdatingCommentId] = useState<number | null>(null);

  // Admin users state
  const [usersList, setUsersList] = useState<AdminUserItem[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [selectedUserForEmailEdit, setSelectedUserForEmailEdit] = useState<AdminUserItem | null>(null);
  const [adminUserEmailDraft, setAdminUserEmailDraft] = useState('');
  const [isSubmittingAdminUserEmail, setIsSubmittingAdminUserEmail] = useState(false);
  const [adminUserEmailError, setAdminUserEmailError] = useState<string | null>(null);

  // System blogs state (Admin tab)
  const [blogs, setBlogs] = useState<Post[]>([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(false);
  const [isUpdatingBlogId, setIsUpdatingBlogId] = useState<number | null>(null);
  const [blogIdToDelete, setBlogIdToDelete] = useState<{ id: number; isAdminPanel: boolean } | null>(null);

  // Manager's own blogs state
  const [managerPosts, setManagerPosts] = useState<Post[]>([]);
  const [isLoadingManagerPosts, setIsLoadingManagerPosts] = useState(false);

  // Editable Profile state
  const [editName, setEditName] = useState(user?.name || '');
  const [editNickname, setEditNickname] = useState(user?.nickName || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [emailVerificationTarget, setEmailVerificationTarget] = useState<EmailChangeVerificationTarget>('old');
  const [emailChangeNotice, setEmailChangeNotice] = useState<string | null>(null);
  const [emailChangeError, setEmailChangeError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  // New Manager form
  const [managerName, setManagerName] = useState('');
  const [managerNickname, setManagerNickname] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [managerPassword, setManagerPassword] = useState('');
  const [isCreatingManager, setIsCreatingManager] = useState(false);
  const [managerSuccessMsg, setManagerSuccessMsg] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (queryTab && paramToTabMap[queryTab]) {
      const tab = paramToTabMap[queryTab];
      if (tab !== activeTab) {
        setActiveTab(tab);
      }
    }
  }, [queryTab, activeTab]);

  useEffect(() => {
    if (activeTab === 'reports' && isAdmin) {
      fetchReports();
      fetchComments();
    } else if (activeTab === 'blogs' && isAdmin) {
      fetchBlogs();
    } else if (activeTab === 'users' && isAdmin) {
      fetchUsers();
    } else if (activeTab === 'my_blogs' && isManager) {
      fetchManagerPosts();
    }
  }, [activeTab, isAdmin, isManager]);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditNickname(user.nickName || '');
      setEditEmail(user.email || '');
      setEmailVerificationTarget('old');
      setEmailChangeNotice(null);
      setEmailChangeError(null);
    }
  }, [user]);

  const fetchReports = async () => {
    setIsLoadingReports(true);
    setError(null);
    try {
      const data = await getReportsApi();
      setReports(data);
    } catch (err) {
      setError('Failed to load abuse reports.');
    } finally {
      setIsLoadingReports(false);
    }
  };

  const fetchComments = async () => {
    setIsLoadingComments(true);
    setError(null);
    try {
      const data = await getAllCommentsApi();
      setComments(data);
    } catch (err) {
      setError('Failed to load comments.');
    } finally {
      setIsLoadingComments(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setError(null);
    try {
      const data = await getUsersApi();
      setUsersList(data);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchBlogs = async () => {
    setIsLoadingBlogs(true);
    setError(null);
    try {
      const data = await getAdminPostsApi({ limit: 100 });
      setBlogs(data);
    } catch (err) {
      setError('Failed to load system blogs.');
    } finally {
      setIsLoadingBlogs(false);
    }
  };

  const fetchManagerPosts = async () => {
    setIsLoadingManagerPosts(true);
    setError(null);
    try {
      const data = await getManagerPostsApi();
      setManagerPosts(data);
    } catch (err) {
      setError('Failed to load your blogs.');
    } finally {
      setIsLoadingManagerPosts(false);
    }
  };

  const handleResolveReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solvingReport) return;

    setIsSolvingSubmit(true);
    setError(null);
    try {
      await updateReportStatusApi(solvingReport.id, resolutionStatus, resolutionNote);
      setReports((prev) =>
        prev.map((r) =>
          r.id === solvingReport.id
            ? { ...r, status: resolutionStatus, solvedAt: new Date().toISOString() }
            : r
        )
      );
      toast({
        title: 'Report Solved',
        description: `Report #${solvingReport.id} status updated to ${resolutionStatus}.`,
        variant: 'success',
      });
      setSolvingReport(null);
      setResolutionNote('');
    } catch (err) {
      setError('Error updating report status.');
    } finally {
      setIsSolvingSubmit(false);
    }
  };

  const handleToggleCommentStatus = async (commentId: number, currentStatus: string) => {
    setIsUpdatingCommentId(commentId);
    setError(null);
    const nextStatus = currentStatus === 'active' ? 'invalid' : 'active';

    try {
      await updateCommentStatusApi(commentId, nextStatus);
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, status: nextStatus } : c))
      );
      toast({
        description: `Comment status updated to ${nextStatus}.`,
        variant: 'success',
      });
    } catch (err) {
      setError('Error updating comment status.');
    } finally {
      setIsUpdatingCommentId(null);
    }
  };

  const handleToggleBlogStatus = async (postId: number, currentStatus: string | null | undefined, isAdminPanel: boolean) => {
    setIsUpdatingBlogId(postId);
    setError(null);
    const isPublished = currentStatus === 'published' || currentStatus === undefined;
    const nextStatus = isPublished ? 'draft' : 'published';
    try {
      await updatePostStatusApi(postId, nextStatus);
      
      const updateList = (prev: Post[]) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                status: nextStatus,
                publishedAt: nextStatus === 'published' ? new Date().toISOString() : null
              }
            : p
        );

      if (isAdminPanel) {
        setBlogs(updateList);
      } else {
        setManagerPosts(updateList);
      }

      toast({
        description: `Post status updated to ${nextStatus === 'published' ? 'Published' : 'Draft'}.`,
        variant: 'success',
      });
    } catch (err) {
      setError('Error updating post status.');
    } finally {
      setIsUpdatingBlogId(null);
    }
  };

  const handleDeleteBlog = async (postId: number, isAdminPanel: boolean) => {
    setBlogIdToDelete({ id: postId, isAdminPanel });
  };

  const handleConfirmDeleteBlog = async () => {
    if (!blogIdToDelete) return;
    const { id: postId, isAdminPanel } = blogIdToDelete;
    setBlogIdToDelete(null);
    setIsUpdatingBlogId(postId);
    try {
      await deletePostApi(postId);
      if (isAdminPanel) {
        setBlogs((prev) => prev.filter((p) => p.id !== postId));
      } else {
        setManagerPosts((prev) => prev.filter((p) => p.id !== postId));
      }
      toast({
        title: 'Blog Deleted',
        description: 'The blog post has been deleted permanently.',
        variant: 'success',
      });
    } catch (err) {
      setError('Error deleting the blog post.');
    } finally {
      setIsUpdatingBlogId(null);
    }
  };

  const handleToggleUserStatus = async (userId: number) => {
    setUpdatingUserId(userId);
    setError(null);
    try {
      const response = await updateUserStatusApi(userId);
      setUsersList((prev) =>
        prev.map((userItem) =>
          userItem.id === userId ? response.user : userItem
        )
      );
      toast({
        description: `User status updated to ${response.user.status}.`,
        variant: 'success',
      });
    } catch (err: any) {
      setError(getErrorMessage(err, 'Error updating user status.'));
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleOpenUserEmailEdit = (userItem: AdminUserItem) => {
    setSelectedUserForEmailEdit(userItem);
    setAdminUserEmailDraft(userItem.email);
    setAdminUserEmailError(null);
  };

  const handleCancelUserEmailEdit = () => {
    setSelectedUserForEmailEdit(null);
    setAdminUserEmailDraft('');
    setAdminUserEmailError(null);
  };

  const handleSubmitUserEmailEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEmailEdit) return;

    const nextEmail = adminUserEmailDraft.trim();
    if (!nextEmail) {
      setAdminUserEmailError('Please enter a valid email address.');
      return;
    }
    if (nextEmail === selectedUserForEmailEdit.email) {
      setAdminUserEmailError('The new email must be different from the current email.');
      return;
    }

    setIsSubmittingAdminUserEmail(true);
    setAdminUserEmailError(null);
    try {
      await requestAdminUserEmailChangeApi(selectedUserForEmailEdit.id, nextEmail);
      toast({
        title: 'Verification Email Sent',
        description: getEmailChangeSuccessMessage('new', nextEmail),
        variant: 'success',
      });
      handleCancelUserEmailEdit();
    } catch (err: any) {
      const message = getErrorMessage(err, 'Failed to request the email change.');
      setAdminUserEmailError(message);
      toast({
        title: 'Error changing user email',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingAdminUserEmail(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast({
        title: 'Invalid Name',
        description: 'Name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    
    if (user) {
      setIsSavingProfile(true);
      try {
        const response = await updateProfileApi({
          name: editName.trim(),
          nickName: editNickname.trim() ? editNickname.trim() : null,
        });
        localStorage.setItem('user', JSON.stringify(response.user));
        setEditName(response.user.name || '');
        setEditNickname(response.user.nickName || '');
        
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been saved successfully.',
          variant: 'success',
        });
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err: any) {
        toast({
          title: 'Error updating profile',
          description: getErrorMessage(err, 'An error occurred.'),
          variant: 'destructive',
        });
      } finally {
        setIsSavingProfile(false);
      }
    }
  };

  const handleEmailUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmail.trim() || !editEmail.includes('@')) {
      setEmailChangeError('Please enter a valid email address.');
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }
    if (user) {
      if (editEmail.trim() === user.email) {
        setEmailChangeError(null);
        setEmailChangeNotice(null);
        toast({
          description: 'This email matches your current email address.',
        });
        return;
      }
      const newEmail = editEmail.trim();
      setIsSavingProfile(true);
      setError(null);
      setEmailChangeError(null);
      setEmailChangeNotice(null);
      requestEmailChangeApi({
        email: newEmail,
        verificationTarget: emailVerificationTarget,
      })
        .then(() => {
          const message = getEmailChangeSuccessMessage(emailVerificationTarget, newEmail);
          setEmailChangeNotice(message);
          setEmailChangeError(null);
          toast({
            title: 'Verification Link Sent',
            description: message,
            variant: 'success',
          });
          setEditEmail(user.email);
          setEmailVerificationTarget('old');
        })
        .catch((err: any) => {
          const message = getErrorMessage(err, 'Failed to request email change.');
          setEmailChangeError(message);
          toast({
            title: 'Error changing email',
            description: message,
            variant: 'destructive',
          });
        })
        .finally(() => {
          setIsSavingProfile(false);
        });
    }
  };

  const handleTriggerPasswordReset = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      await forgotPasswordApi(user.email);
      toast({
        title: 'Password Reset Sent',
        description: 'A password reset link has been sent to your email. Please check your mailbox!',
        variant: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: getErrorMessage(err, 'Failed to trigger password change.'),
        variant: 'destructive',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerName || !managerEmail || !managerPassword) {
      setError('Please fill out all manager details.');
      return;
    }

    setIsCreatingManager(true);
    setError(null);
    setManagerSuccessMsg(null);

    try {
      await registerApi({
        name: managerName,
        email: managerEmail,
        password: managerPassword,
        nickName: managerNickname || undefined,
      });

      setManagerSuccessMsg(
        'Manager account created successfully! Check Mailpit at http://localhost:8025 to verify.'
      );
      setManagerName('');
      setManagerNickname('');
      setManagerEmail('');
      setManagerPassword('');
    } catch (err: any) {
      setError(getErrorMessage(err, 'Error creating manager account.'));
    } finally {
      setIsCreatingManager(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Mobile Top Header Bar */}
      <div className="md:hidden sticky top-0 z-30 w-full bg-white dark:bg-card border-b border-slate-200 dark:border-border px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Shield className="w-5 h-5" />
          </div>
          <h1 className="font-black text-base text-slate-800 dark:text-foreground leading-none tracking-tight">
            Your Dashboard
          </h1>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-xl border border-slate-200 dark:border-border text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer bg-transparent"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden animate-in fade-in duration-200" 
        />
      )}

      {/* LEFT SIDEBAR (Desktop static, Mobile floating drawer) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 md:w-64 bg-white dark:bg-card border-r border-slate-200 dark:border-border shrink-0 flex flex-col justify-between p-6 transition-transform duration-300 md:static md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="space-y-8">
          {/* Logo Brand Header / Close Button on Mobile */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-border/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Shield className="w-6.5 h-6.5" />
              </div>
              <h1 className="font-black text-lg text-slate-800 dark:text-foreground leading-none tracking-tight">
                Your Dashboard
              </h1>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-border text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 cursor-pointer bg-transparent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tab Links based on Roles */}
          <nav className="space-y-1">
            {isAdmin && (
              <>
                <button
                  onClick={() => {
                    handleTabChange('reports');
                    setSolvingReport(null);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-xl text-sm font-black transition-all cursor-pointer ${
                    activeTab === 'reports'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ShieldAlert className="w-5 h-5" />
                  <span>Report Moderation</span>
                </button>
 
                <button
                  onClick={() => {
                    handleTabChange('blogs');
                    setSolvingReport(null);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-xl text-sm font-black transition-all cursor-pointer ${
                    activeTab === 'blogs'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Blog Management</span>
                </button>
 
                <button
                  onClick={() => {
                    handleTabChange('taxonomy');
                    setSolvingReport(null);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-xl text-sm font-black transition-all cursor-pointer ${
                    activeTab === 'taxonomy'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FolderPlus className="w-5 h-5" />
                  <span>Tags & Collections</span>
                </button>

                <button
                  onClick={() => {
                    handleTabChange('managers');
                    setSolvingReport(null);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-xl text-sm font-black transition-all cursor-pointer ${
                    activeTab === 'managers'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Manager Accounts</span>
                </button>
 
                <button
                  onClick={() => {
                    handleTabChange('users');
                    setSolvingReport(null);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-xl text-sm font-black transition-all cursor-pointer ${
                    activeTab === 'users'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span>User Management</span>
                </button>
              </>
            )}
 
            {isManager && (
              <button
                onClick={() => {
                  handleTabChange('my_blogs');
                  setSolvingReport(null);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-xl text-sm font-black transition-all cursor-pointer ${
                  activeTab === 'my_blogs'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span>My Blogs</span>
              </button>
            )}
 
            <button
              onClick={() => {
                handleTabChange('profile');
                setSolvingReport(null);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-xl text-sm font-black transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <User className="w-5 h-5" />
              <span>My Profile</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 mt-8 md:mt-0 border-t border-slate-100 dark:border-border/50 space-y-3.5">
          <Link to="/" className="w-full flex items-center gap-3.5 px-4.5 py-4 rounded-xl text-sm font-black text-slate-600 hover:text-primary hover:bg-slate-100/50 transition-all border border-slate-200">
            <ArrowLeft className="w-4.5 h-4.5" />
            <span>Back to Home</span>
          </Link>
          <button
            onClick={() => setIsSignOutModalOpen(true)}
            className="w-full flex items-center gap-3.5 px-4.5 py-4 rounded-xl text-sm font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT */}
      <main className="grow p-6 md:p-8 space-y-8 overflow-y-auto">
        
        {/* Error notification bar */}
        {error && (
          <div className="p-4.5 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-650 dark:text-red-400 rounded-2xl flex items-center gap-2.5 text-base font-extrabold">
            <AlertCircle className="w-5.5 h-5.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'reports' && isAdmin && (
          <DashboardReports
            reports={reports}
            isLoadingReports={isLoadingReports}
            solvingReport={solvingReport}
            setSolvingReport={setSolvingReport}
            resolutionStatus={resolutionStatus}
            setResolutionStatus={setResolutionStatus}
            resolutionNote={resolutionNote}
            setResolutionNote={setResolutionNote}
            isSolvingSubmit={isSolvingSubmit}
            handleResolveReportSubmit={handleResolveReportSubmit}
            comments={comments}
            isLoadingComments={isLoadingComments}
            isUpdatingCommentId={isUpdatingCommentId}
            handleToggleCommentStatus={handleToggleCommentStatus}
          />
        )}

        {activeTab === 'blogs' && isAdmin && (
          <DashboardBlogs
            blogs={blogs}
            isLoadingBlogs={isLoadingBlogs}
            isUpdatingBlogId={isUpdatingBlogId}
            handleToggleBlogStatus={handleToggleBlogStatus}
            handleDeleteBlog={handleDeleteBlog}
          />
        )}

        {activeTab === 'taxonomy' && isAdmin && (
          <DashboardTaxonomy />
        )}

        {activeTab === 'managers' && isAdmin && (
          <DashboardManagers
            managerName={managerName}
            setManagerName={setManagerName}
            managerNickname={managerNickname}
            setManagerNickname={setManagerNickname}
            managerEmail={managerEmail}
            setManagerEmail={setManagerEmail}
            managerPassword={managerPassword}
            setManagerPassword={setManagerPassword}
            isCreatingManager={isCreatingManager}
            managerSuccessMsg={managerSuccessMsg}
            handleCreateManager={handleCreateManager}
          />
        )}

        {activeTab === 'users' && isAdmin && (
          <DashboardUsers
            usersList={usersList}
            isLoadingUsers={isLoadingUsers}
            updatingUserId={updatingUserId}
            handleToggleUserStatus={handleToggleUserStatus}
            handleEditUserEmail={handleOpenUserEmailEdit}
          />
        )}

        {activeTab === 'my_blogs' && isManager && (
          <DashboardMyBlogs
            managerPosts={managerPosts}
            isLoadingManagerPosts={isLoadingManagerPosts}
            handleDeleteBlog={handleDeleteBlog}
          />
        )}

        {activeTab === 'profile' && (
          <DashboardProfile
            user={user}
            isAdmin={isAdmin}
            isManager={isManager}
            reports={reports}
            managerPosts={managerPosts}
            editName={editName}
            setEditName={setEditName}
            editNickname={editNickname}
            setEditNickname={setEditNickname}
            editEmail={editEmail}
            setEditEmail={setEditEmail}
            emailVerificationTarget={emailVerificationTarget}
            setEmailVerificationTarget={setEmailVerificationTarget}
            emailChangeNotice={emailChangeNotice}
            emailChangeError={emailChangeError}
            isSavingProfile={isSavingProfile}
            handleUpdateProfile={handleUpdateProfile}
            handleEmailUpdateSubmit={handleEmailUpdateSubmit}
            handleTriggerPasswordReset={handleTriggerPasswordReset}
            setIsSignOutModalOpen={setIsSignOutModalOpen}
            isChatbotEnabled={isChatbotEnabled}
            onToggleChatbot={handleToggleChatbot}
          />
        )}

      </main>

      {isSignOutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card w-full max-w-md rounded-2xl border border-slate-200 dark:border-border shadow-lg p-6 space-y-6 transform transition-all scale-100 scale-in duration-200">
            <div className="flex items-center gap-3.5 text-red-500">
              <LogOut className="w-7 h-7" />
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-foreground">
                Confirm Sign Out
              </h3>
            </div>
            <p className="text-slate-550 dark:text-slate-300 text-sm font-semibold leading-relaxed">
              Are you sure you want to sign out of your account? Any unsaved edits will be discarded.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-border/50">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsSignOutModalOpen(false)}
                className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-extrabold px-4 py-2.5 rounded-xl cursor-pointer shadow-none"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsSignOutModalOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="bg-red-600 hover:bg-red-750 text-white text-xs font-black px-5 py-3 rounded-xl shadow-none cursor-pointer"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={blogIdToDelete !== null}
        title="Delete Blog"
        description="Are you sure you want to delete this blog permanently? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDeleteBlog}
        onCancel={() => setBlogIdToDelete(null)}
      />

      <UserEmailChangeModal
        isOpen={selectedUserForEmailEdit !== null}
        user={selectedUserForEmailEdit}
        email={adminUserEmailDraft}
        setEmail={setAdminUserEmailDraft}
        onSubmit={handleSubmitUserEmailEdit}
        onCancel={handleCancelUserEmailEdit}
        isSubmitting={isSubmittingAdminUserEmail}
        errorMessage={adminUserEmailError}
      />

    </div>
  );
};
