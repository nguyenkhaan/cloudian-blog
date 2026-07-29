import React, { useState } from 'react';
import { createReportApi } from '../api/comment';
import { Button } from './ui/button';
import { X, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { getErrorMessage } from '../utils/errors';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'comment' | 'post';
  entityId: number;
  entityPreviewText: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityPreviewText
}) => {
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      setError('Please provide report details.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const reportTitle = `Report ${entityType === 'comment' ? 'comment' : 'post'} (ID: ${entityId})`;
    const reportContent = `Reported content: "${entityPreviewText}"\n\nIssue Details: ${details}`;

    try {
      await createReportApi({
        title: reportTitle,
        content: reportContent,
        entity: entityType,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setDetails('');
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to send report. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-card w-full max-w-md rounded-2xl border border-slate-300 dark:border-border shadow-lg overflow-hidden flex flex-col transform transition-all scale-100 scale-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 dark:bg-card border-b border-slate-200 dark:border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 dark:text-foreground">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-black text-base uppercase tracking-wider">Report Him/Her</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-250 dark:hover:bg-slate-800 text-slate-450 hover:text-slate-650 dark:text-foreground transition-colors cursor-pointer border-0 bg-transparent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3 bg-white dark:bg-card">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shadow-none">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-foreground text-base">Report Submitted</h4>
            <p className="text-xs text-slate-450 dark:text-muted-foreground max-w-xs leading-relaxed font-semibold">
              Thank you for your report. Our moderation team will review the content shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white dark:bg-card">
            
            {/* Target Content Preview */}
            <div className="p-3.5 bg-slate-50 dark:bg-background rounded-xl border border-slate-200 dark:border-border space-y-1">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Reported Content</span>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 line-clamp-2 italic">
                "{entityPreviewText}"
              </p>
            </div>

            {/* Input Details */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-450 uppercase tracking-widest block">
                Reason for reporting (Details)
              </label>
              <textarea
                required
                placeholder="Explain why you are reporting this content in detail..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={5}
                className="w-full px-3.5 py-3 bg-white dark:bg-background border border-slate-350 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-800 dark:text-foreground transition-all placeholder:text-slate-400"
              />
            </div>

            {error && (
              <div className="text-red-655 text-xs font-bold bg-red-50 dark:bg-red-950/20 border border-red-105 p-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-350 dark:border-border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-550 dark:text-slate-300 text-xs font-bold cursor-pointer shadow-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-primary hover:opacity-90 text-white font-black text-xs flex items-center gap-1.5 shadow-none cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
                  </>
                ) : (
                  'Submit Report'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
