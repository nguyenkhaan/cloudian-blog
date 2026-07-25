import React, { createContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastVariant = 'default' | 'success' | 'destructive';

export interface Toast {
  id: string;
  title?: string;
  description: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toast: (options: Omit<Toast, 'id'>) => void;
  toasts: Toast[];
  dismiss: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = 'default', duration = 3000 }: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, description, variant, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, toasts, dismiss }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto w-full p-4 rounded-2xl border shadow-xl flex gap-3 items-start justify-between transition-all duration-300 animate-in slide-in-from-right-5 ${
              t.variant === 'success'
                ? 'bg-green-50 border-green-100 text-green-800'
                : t.variant === 'destructive'
                  ? 'bg-red-50 border-red-100 text-red-800'
                  : 'bg-white border-slate-100 text-slate-800'
            }`}
          >
            <div className="flex gap-2.5 items-start">
              {t.variant === 'success' && <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />}
              {t.variant === 'destructive' && <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
              {t.variant === 'default' && <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}
              
              <div className="space-y-0.5">
                {t.title && <h5 className="font-bold text-sm leading-tight">{t.title}</h5>}
                <p className="text-xs font-semibold leading-relaxed opacity-90">{t.description}</p>
              </div>
            </div>

            <button
              onClick={() => dismiss(t.id)}
              className="p-1 rounded-lg hover:bg-slate-100/50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
