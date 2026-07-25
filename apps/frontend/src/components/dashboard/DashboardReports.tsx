import React from 'react';
import { Button } from '../ui/button';
import { Loader2, ArrowLeft, XCircle, CheckCircle } from 'lucide-react';
import type { ReportItem, AdminCommentItem } from '../../api/admin';
import { TableSkeleton } from '../ui/Skeleton';

interface DashboardReportsProps {
  reports: ReportItem[];
  isLoadingReports: boolean;
  solvingReport: ReportItem | null;
  setSolvingReport: (report: ReportItem | null) => void;
  resolutionStatus: 'solved' | 'cancel';
  setResolutionStatus: (status: 'solved' | 'cancel') => void;
  resolutionNote: string;
  setResolutionNote: (note: string) => void;
  isSolvingSubmit: boolean;
  handleResolveReportSubmit: (e: React.FormEvent) => void;
  comments: AdminCommentItem[];
  isLoadingComments: boolean;
  isUpdatingCommentId: number | null;
  handleToggleCommentStatus: (id: number, currentStatus: string) => void;
}

export const DashboardReports: React.FC<DashboardReportsProps> = ({
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
  comments,
  isLoadingComments,
  isUpdatingCommentId,
  handleToggleCommentStatus
}) => {
  if (solvingReport) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSolvingReport(null)}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-550 dark:text-slate-400 transition-colors cursor-pointer border-0 bg-transparent"
            title="Back to Reports"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-foreground tracking-tight font-heading">
              Resolve Report #{solvingReport.id}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Report Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6 space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-foreground uppercase tracking-wider">Report Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-slate-400 font-bold block">Title</span>
                  <span className="font-bold text-slate-850 dark:text-foreground">{solvingReport.title}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold block">Reporter</span>
                  <span className="font-bold text-slate-850 dark:text-foreground">{solvingReport.user?.name || 'Reader'}</span>
                  <span className="text-xs text-slate-400 block mt-0.5">{solvingReport.user?.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold block">Type</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-600 dark:text-slate-350 border border-slate-200">
                    {solvingReport.entity}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6">
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider mb-2">Target Content</span>
              <p className="text-sm font-semibold text-slate-650 dark:text-slate-300 leading-relaxed italic bg-slate-50 dark:bg-background p-4 rounded-xl border border-slate-200/50">
                "{solvingReport.content}"
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6 md:p-8 space-y-6">
            <form onSubmit={handleResolveReportSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-extrabold text-slate-700 dark:text-slate-300 block">Resolution Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700 dark:text-slate-350">
                    <input
                      type="radio"
                      name="status"
                      value="solved"
                      checked={resolutionStatus === 'solved'}
                      onChange={() => setResolutionStatus('solved')}
                      className="w-4 h-4 text-primary"
                    />
                    <span>Solved (Action taken/Valid report)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700 dark:text-slate-350">
                    <input
                      type="radio"
                      name="status"
                      value="cancel"
                      checked={resolutionStatus === 'cancel'}
                      onChange={() => setResolutionStatus('cancel')}
                      className="w-4 h-4 text-primary"
                    />
                    <span>Dismissed (No action/Invalid report)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-extrabold text-slate-700 dark:text-slate-300 block">Resolution Notes</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Explain details of moderation actions or reasons why the report is dismissed..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-border bg-white dark:bg-background focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary text-base text-slate-800 dark:text-foreground placeholder:text-slate-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSolvingReport(null)}
                  className="px-5 py-3 rounded-xl font-bold text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSolvingSubmit}
                  className="bg-primary hover:opacity-95 text-white font-black text-sm rounded-xl px-6 py-3 flex items-center gap-1.5 shadow-none cursor-pointer"
                >
                  {isSolvingSubmit ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Submit Resolution'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-foreground tracking-tight font-heading">
          Abuse Report Moderation
        </h2>
      </div>

      {/* Reports table */}
      <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl overflow-hidden shadow-none transition-colors duration-300">
        <div className="p-5 border-b border-slate-100 dark:border-border/50">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-foreground">Recent Abuse Reports</h3>
        </div>
        
        {isLoadingReports ? (
          <div className="p-6">
            <TableSkeleton rows={4} cols={4} />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm font-semibold">
            No abuse reports found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-card border-b border-slate-100 dark:border-border/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Reporter</th>
                  <th className="px-6 py-4">Target Content</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border/50 text-sm text-slate-700 dark:text-slate-300">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold block text-slate-800 dark:text-foreground">{report.user?.name || 'Reader'}</span>
                      <span className="text-xs text-slate-400 mt-0.5 block">{report.user?.email || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800 dark:text-foreground block">{report.title}</span>
                      <span className="text-xs text-slate-400 block mt-0.5 line-clamp-1 italic">
                        {report.content}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                        report.status === 'solved'
                          ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                          : report.status === 'cancel'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {report.status === 'pending' ? (
                        <Button
                          size="sm"
                          onClick={() => setSolvingReport(report)}
                          className="bg-primary hover:opacity-95 text-white font-bold text-[11px] rounded-lg px-3 py-1.5 shadow-none cursor-pointer"
                        >
                          Solve
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">
                          Resolved {report.solvedAt ? new Date(report.solvedAt).toLocaleDateString() : 'N/A'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Comments table */}
      <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl overflow-hidden shadow-none transition-colors duration-300">
        <div className="p-5 border-b border-slate-100 dark:border-border/50">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-foreground">Reader Comments Moderation</h3>
        </div>
        
        {isLoadingComments ? (
          <div className="p-6">
            <TableSkeleton rows={4} cols={5} />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm font-semibold">
            No comments found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-card border-b border-slate-100 dark:border-border/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Comment</th>
                  <th className="px-6 py-4">Blog</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border/50 text-sm text-slate-700 dark:text-slate-300">
                {comments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-slate-800 dark:text-foreground font-medium line-clamp-2">
                        {comment.content}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        ID: {comment.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-foreground">
                      {comment.postTitle}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800 dark:text-foreground block">{comment.user?.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        comment.status === 'active'
                          ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                          : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                      }`}>
                        {comment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleCommentStatus(comment.id, comment.status)}
                        disabled={isUpdatingCommentId === comment.id}
                        className={`text-[11px] font-bold rounded-lg px-3 py-1.5 cursor-pointer ${
                          comment.status === 'active'
                            ? 'text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20'
                            : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20'
                        }`}
                      >
                        {isUpdatingCommentId === comment.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : comment.status === 'active' ? (
                          <>
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Hide comment
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Unhide
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
