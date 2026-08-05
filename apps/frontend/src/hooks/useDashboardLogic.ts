import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useToast } from './useToast';
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
import { getErrorMessage } from '../utils/errors';
import {
  type EmailChangeVerificationTarget,
  getEmailChangeSuccessMessage,
} from '../utils/emailChange';

type TabType = 'reports' | 'blogs' | 'taxonomy' | 'managers' | 'users' | 'my_blogs' | 'profile';

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

const tabToParamMap: Record<TabType, string> = {
  reports: 'reports',
  blogs: 'blog-management',
  taxonomy: 'taxonomy',
  managers: 'managers',
  users: 'users',
  my_blogs: 'my-blogs',
  profile: 'profile'
};

export function useDashboardLogic() {
  const { user, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const userRoles = user?.roles?.map((r: any) => String(r).toLowerCase()) || [];
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

  return {
    // auth
    user,
    logout,
    isAuthenticated,
    // roles
    isAdmin,
    isManager,
    // tabs
    activeTab,
    handleTabChange,
    // UI
    isChatbotEnabled,
    handleToggleChatbot,
    isSidebarOpen,
    setIsSidebarOpen,
    // reports
    reports,
    isLoadingReports,
    solvingReport,
    setSolvingReport,
    resolutionStatus,
    setResolutionStatus,
    resolutionNote,
    setResolutionNote,
    isSolvingSubmit,
    handleResolveReportSubmit,
    // comments
    comments,
    isLoadingComments,
    isUpdatingCommentId,
    handleToggleCommentStatus,
    // blogs
    blogs,
    isLoadingBlogs,
    isUpdatingBlogId,
    handleToggleBlogStatus,
    handleDeleteBlog,
    blogIdToDelete,
    setBlogIdToDelete,
    handleConfirmDeleteBlog,
    // users
    usersList,
    isLoadingUsers,
    updatingUserId,
    handleToggleUserStatus,
    handleOpenUserEmailEdit,
    selectedUserForEmailEdit,
    adminUserEmailDraft,
    setAdminUserEmailDraft,
    handleCancelUserEmailEdit,
    handleSubmitUserEmailEdit,
    isSubmittingAdminUserEmail,
    adminUserEmailError,
    // manager posts
    managerPosts,
    isLoadingManagerPosts,
    // profile/edit
    editName,
    setEditName,
    editNickname,
    setEditNickname,
    editEmail,
    setEditEmail,
    emailVerificationTarget,
    setEmailVerificationTarget,
    emailChangeNotice,
    emailChangeError,
    isSavingProfile,
    handleUpdateProfile,
    handleEmailUpdateSubmit,
    handleTriggerPasswordReset,
    setIsSignOutModalOpen,
    isSignOutModalOpen,
    // manager form
    managerName,
    setManagerName,
    managerNickname,
    setManagerNickname,
    managerEmail,
    setManagerEmail,
    managerPassword,
    setManagerPassword,
    isCreatingManager,
    managerSuccessMsg,
    handleCreateManager,
    // misc
    error,
    setError,
    navigate,
  };
}
