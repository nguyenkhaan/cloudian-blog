import React from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import { Button } from './button';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'info' | 'warning' | 'danger';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-full">
            <AlertTriangle className="w-6 h-6" />
          </div>
        );
      case 'warning':
        return (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-full">
            <AlertTriangle className="w-6 h-6" />
          </div>
        );
      default:
        return (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-full">
            <HelpCircle className="w-6 h-6" />
          </div>
        );
    }
  };

  const getConfirmButtonStyles = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl px-5 py-3 shadow-none';
      case 'warning':
      default:
        return 'bg-primary hover:bg-primary-hover text-white font-semibold text-xs rounded-xl px-5 py-3 shadow-none';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Dialog */}
      <div 
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6 shadow-2xl space-y-6 text-center md:text-left animate-in zoom-in-95 duration-200"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
          {getIcon()}
          <div className="space-y-2 flex-1">
            <h3 className="text-lg font-black text-slate-800 dark:text-foreground tracking-tight leading-none">
              {title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full md:w-auto px-5 py-3 rounded-xl border border-slate-355 dark:border-border text-black dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 shadow-none cursor-pointer"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={`w-full md:w-auto cursor-pointer ${getConfirmButtonStyles()}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
