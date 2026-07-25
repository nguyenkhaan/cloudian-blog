import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';

export const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;



  const handleSignOut = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-slate-150 dark:hover:bg-slate-800 transition-all cursor-pointer border border-slate-200 dark:border-border"
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
          {user.name ? user.name[0].toUpperCase() : 'U'}
        </div>
        <span className="hidden sm:inline text-xs font-black text-slate-700 dark:text-slate-350">
          {user.name}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card shadow-lg py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Info Header */}
          <div className="px-4 py-2 border-b border-slate-100 dark:border-border/50 mb-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Signed in as</p>
            <p className="text-sm font-extrabold text-slate-800 dark:text-foreground truncate mt-0.5">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>

          {/* Action Links */}
          <div className="space-y-0.5 px-1.5">
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-extrabold text-slate-750 dark:text-slate-300 hover:bg-primary hover:text-white rounded-lg transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Go to Dashboard</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-extrabold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
