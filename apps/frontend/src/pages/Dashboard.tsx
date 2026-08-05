import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ConfirmModal } from '../components/ui/ConfirmModal';

import { DashboardReports } from '../components/dashboard/DashboardReports';
import { DashboardBlogs } from '../components/dashboard/DashboardBlogs';
import { DashboardManagers } from '../components/dashboard/DashboardManagers';
import { DashboardUsers } from '../components/dashboard/DashboardUsers';
import { UserEmailChangeModal } from '../components/dashboard/UserEmailChangeModal';
import { DashboardMyBlogs } from '../components/dashboard/DashboardMyBlogs';
import { DashboardProfile } from '../components/dashboard/DashboardProfile';
import { DashboardTaxonomy } from '../components/dashboard/DashboardTaxonomy';
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
import { useDashboardLogic } from '../hooks/useDashboardLogic';

// Tab parameter maps are handled inside the dashboard logic hook.

export const Dashboard: React.FC = () => {
  const {
    // auth
    user,
    logout,
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
    navigate,
  } = useDashboardLogic();

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
                  className={`w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
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
