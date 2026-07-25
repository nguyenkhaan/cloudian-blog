import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { UserMenu } from './UserMenu';
import { Button } from './ui/button';
import { BookOpen, Home as HomeIcon, Moon, Sun, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeTab?: 'home' | 'blog';
  onSubscribe?: () => void;
  homeLabel?: string;
  blogsLabel?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab = 'home',
  onSubscribe,
  homeLabel = 'Home',
  blogsLabel = 'Blogs'
}) => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, openLoginModal } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-background/80 backdrop-blur-md border-b border-slate-200 dark:border-border transition-colors duration-300">
      <div className="max-w-[1600px] w-full mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-black transition-transform duration-300 group-hover:rotate-6 shadow-none">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-2xl text-black dark:text-foreground tracking-tight font-heading group-hover:text-primary transition-colors">
            CloudianZea
          </span>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-1.5 text-black dark:text-muted-foreground">
          <Link 
            to="/" 
            className={`rounded-xl px-5 py-3 flex items-center gap-2 text-sm font-black transition-all ${
              activeTab === 'home'
                ? 'bg-primary text-white'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-black dark:text-foreground'
            }`}
          >
            <HomeIcon className={`w-4 h-4 ${activeTab === 'home' ? 'text-white' : 'text-black dark:text-foreground'}`} />
            <span>{homeLabel}</span>
          </Link>
          <Link 
            to="/blog" 
            className={`rounded-xl px-5 py-3 flex items-center gap-2 text-sm font-black transition-all ${
              activeTab === 'blog'
                ? 'bg-primary text-white'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-black dark:text-foreground'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${activeTab === 'blog' ? 'text-white' : 'text-black dark:text-foreground'}`} />
            <span>{blogsLabel}</span>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            title="Theme Toggle"
            className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-black dark:text-slate-400 transition-colors cursor-pointer border border-slate-200 dark:border-border bg-transparent"
          >
            {theme === 'light' ? <Moon className="w-5 h-5 text-black" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>

          {/* User Auth or Subscribe trigger */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <UserMenu />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button 
                onClick={openLoginModal}
                className="hover:text-primary transition-colors text-sm font-black text-black dark:text-muted-foreground cursor-pointer bg-transparent border-0 p-0"
              >
                Sign In
              </button>
              <Button 
                onClick={onSubscribe}
                className="hidden sm:inline-flex bg-primary hover:opacity-95 text-white font-black text-sm rounded-xl px-6 py-3 cursor-pointer shadow-none"
              >
                Subscribe
              </Button>
            </div>
          )}

          {/* Mobile Menu Hamburger Trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-black dark:text-slate-400 transition-colors cursor-pointer border border-slate-200 dark:border-border bg-transparent"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-border bg-white dark:bg-card px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-2">
            <Link 
              to="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`rounded-xl px-5 py-3.5 flex items-center gap-3 text-sm font-black transition-all ${
                activeTab === 'home'
                  ? 'bg-primary text-white'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-black dark:text-foreground'
              }`}
            >
              <HomeIcon className={`w-4.5 h-4.5 ${activeTab === 'home' ? 'text-white' : 'text-black dark:text-foreground'}`} />
              <span>{homeLabel}</span>
            </Link>
            <Link 
              to="/blog" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`rounded-xl px-5 py-3.5 flex items-center gap-3 text-sm font-black transition-all ${
                activeTab === 'blog'
                  ? 'bg-primary text-white'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-black dark:text-foreground'
              }`}
            >
              <BookOpen className={`w-4.5 h-4.5 ${activeTab === 'blog' ? 'text-white' : 'text-black dark:text-foreground'}`} />
              <span>{blogsLabel}</span>
            </Link>
          </nav>

          {!isAuthenticated && (
            <div className="pt-4 border-t border-slate-100 dark:border-border/50 flex flex-col gap-3">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openLoginModal();
                }}
                className="w-full text-center py-3.5 text-sm font-black text-black dark:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer bg-transparent border border-slate-200 dark:border-border"
              >
                Sign In
              </button>
              <Button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onSubscribe?.();
                }}
                className="w-full bg-primary hover:opacity-95 text-white font-black text-sm rounded-xl py-3.5 cursor-pointer shadow-none"
              >
                Subscribe
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
