import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={`bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl ${className}`} />
);

export const BlogCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-card border border-slate-150 dark:border-border rounded-2xl p-5 space-y-4">
    <Skeleton className="aspect-[16/9] w-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
    <div className="flex items-center gap-3 pt-2">
      <Skeleton className="h-9 w-9 rounded-full" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  </div>
);

export const PostDetailSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
    {/* Breadcrumbs skeleton */}
    <div className="flex gap-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-24" />
    </div>

    {/* Title & Author Skeleton */}
    <div className="space-y-4">
      <Skeleton className="h-10 md:h-12 w-5/6" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>

    {/* Large Banner Image Skeleton */}
    <Skeleton className="aspect-[21/9] w-full rounded-2xl" />

    {/* Content paragraph Skeletons */}
    <div className="space-y-4 pt-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
    
    <div className="space-y-4 pt-8">
      <Skeleton className="h-6 w-1/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
);

export const PostEditorSkeleton: React.FC = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-background flex flex-col">
    {/* Header skeleton */}
    <div className="bg-white dark:bg-card border-b border-slate-100 dark:border-border px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-20 rounded-xl" />
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
    </div>
    
    {/* Body skeleton */}
    <div className="max-w-7xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 space-y-6">
        <Skeleton className="aspect-[21/9] w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="space-y-4 pt-4">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border p-5 space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border p-5 space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => (
  <div className="w-full space-y-4">
    {/* Table Header Skeleton */}
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-24" />
      ))}
    </div>
    {/* Table Row Skeletons */}
    <div className="space-y-3.5">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center justify-between py-4 border-b border-slate-50 dark:border-border/30">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-5 w-28 rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  </div>
);
