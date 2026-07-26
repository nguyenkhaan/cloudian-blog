import type { Comment, CreateReportPayload } from '../types/comment';
import client from './client';

export const getCommentsApi = async (postId: number): Promise<Comment[]> => {
  const response = await client.get<Comment[]>(`/comments/post/${postId}`);
  return response.data;
};

export const createCommentApi = async (postId: number, content: string): Promise<{ success: boolean; commentId: number }> => {
  const response = await client.post<{ success: boolean; commentId: number }>(`/comments/post/${postId}`, { content });
  return response.data;
};

export const updateCommentApi = async (commentId: number, content: string): Promise<any> => {
  const response = await client.patch<any>(`/comments/${commentId}`, { content });
  return response.data;
};

export const deleteCommentApi = async (commentId: number): Promise<{ success: boolean }> => {
  const response = await client.delete<{ success: boolean }>(`/comments/${commentId}`);
  return response.data;
};

export const createReportApi = async (data: CreateReportPayload): Promise<{ success: boolean; reportId: number }> => {
  const response = await client.post<{ success: boolean; reportId: number }>('/reports', data);
  return response.data;
};
