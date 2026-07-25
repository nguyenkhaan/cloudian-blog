import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 dark:bg-card border-t border-slate-200 dark:border-border py-10 text-center text-sm text-black dark:text-muted-foreground font-extrabold transition-colors">
      <div className="max-w-[1600px] mx-auto px-6">
        <p>© {new Date().getFullYear()} CloudianZea. </p>
        <p className='my-2'>Build with Cloudian 💙 Cloud</p>
      </div>
    </footer>
  );
};
