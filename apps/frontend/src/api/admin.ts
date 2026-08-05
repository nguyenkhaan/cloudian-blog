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

export interface AdminUserItem {
  id: number;
  name: string;
  email: string;
  nickName: string | null;
  roles: string[];
  providers: string[];
  joinedAt: string | null;
  status: 'active' | 'suspended';
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

export const getUsersApi = async (): Promise<AdminUserItem[]> => {
  const response = await client.get<AdminUserItem[]>('/users');
  return response.data;
};

export const updateUserStatusApi = async (
  userId: number
): Promise<{ success: boolean; user: AdminUserItem }> => {
  const response = await client.patch<{ success: boolean; user: AdminUserItem }>(`/users/${userId}/status`);
  return response.data;
};

export const requestAdminUserEmailChangeApi = async (
  userId: number,
  email: string
): Promise<{ success: boolean; sentTo: string; verificationTarget: 'new'; email: string }> => {
  const response = await client.post<{ success: boolean; sentTo: string; verificationTarget: 'new'; email: string }>(
    `/users/${userId}/change-email`,
    { email }
  );
  return response.data;
};
