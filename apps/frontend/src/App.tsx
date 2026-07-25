import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Blog } from './pages/Blog';
import { PostDetail } from './pages/PostDetail';
import { PostEditor } from './pages/PostEditor';
import { Dashboard } from './pages/Dashboard';
import { Verify } from './pages/Verify';
import { ResetPassword } from './pages/ResetPassword';
import { useAuth } from './hooks/useAuth';
import { ChatWidget } from './components/ChatWidget';

function App() {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  const userRoles = user?.roles || [];
  const isAdmin = userRoles.includes('admin') || user?.email === 'admin@gmail.com';
  const isManager = userRoles.includes('manager') || user?.email === 'manager@gmail.com';
  const hasEditorAccess = isAuthenticated && (isAdmin || isManager);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Navigate to="/?login=true" replace />} />
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/posts/:slugOrId" element={<PostDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/manager/editor" element={hasEditorAccess ? <PostEditor /> : <Navigate to="/dashboard" />} />
        <Route path="/manager" element={<Navigate to="/dashboard" />} />
        <Route path="/admin" element={<Navigate to="/dashboard" />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/verify-email-change" element={<Verify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ChatWidget />
    </BrowserRouter>
  );
}

export default App;
