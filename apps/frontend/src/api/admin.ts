import client from './client';

export interface ReportItem {
  id: number;
  title: string;
  content: string;
  status: 'solved' | 'pending' | 'cancel';
  entity: 'post' | 'comment';
  createdAt: string;
  solvedAt?: string | null;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface AdminCommentItem {
  id: number;
  content: string;
  status: 'active' | 'invalid';
  createdAt: string;
  postId: number;
  postTitle: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export const getReportsApi = async (params?: {
  status?: string;
  entity?: string;
}): Promise<ReportItem[]> => {
  const response = await client.get<ReportItem[]>('/reports', { params });
  return response.data;
};

export const updateReportStatusApi = async (
  reportId: number,
  status: 'solved' | 'pending' | 'cancel',
  resolutionNote?: string
): Promise<{ success: boolean }> => {
  const response = await client.post<{ success: boolean }>(`/reports/${reportId}/status`, {
    status,
    resolutionNote,
  });
  return response.data;
};

export const getAllCommentsApi = async (params?: {
  status?: string;
}): Promise<AdminCommentItem[]> => {
  const response = await client.get<AdminCommentItem[]>('/comments', { params });
  return response.data;
};

export const updateCommentStatusApi = async (
  commentId: number,
  status: 'active' | 'invalid'
): Promise<{ success: boolean }> => {
  const response = await client.put<{ success: boolean }>(`/comments/${commentId}/status`, {
    status,
  });
  return response.data;
};
