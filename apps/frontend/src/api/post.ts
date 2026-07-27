import type { Post, PostDetail, Collection, Tag } from '../types/post';
import client from './client';

const normalizeArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') {
    const candidate = value as Record<string, unknown>;
    if (Array.isArray(candidate.items)) return candidate.items as T[];
    if (Array.isArray(candidate.data)) return candidate.data as T[];
    if (Array.isArray(candidate.posts)) return candidate.posts as T[];
  }
  return [];
};

export const getPostsApi = async (params?: {
  tag?: string;
  collection?: string;
  keyword?: string;
  limit?: number;
  offset?: number;
}): Promise<Post[]> => {
  const response = await client.get<unknown>('/posts', { params });
  return normalizeArray<Post>(response.data);
};

export const getAdminPostsApi = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<Post[]> => {
  const response = await client.get<unknown>('/posts/admin', { params });
  return normalizeArray<Post>(response.data);
};

export const getPostDetailApi = async (slugOrId: string): Promise<PostDetail> => {
  const response = await client.get<unknown>(`/posts/${slugOrId}`);
  const data = response.data as Partial<PostDetail> | undefined;
  const safeData = data ?? {};
  const normalized = {
    id: 0,
    title: '',
    content: '',
    slug: '',
    status: 'draft',
    tags: [],
    collections: [],
    ...safeData,
  } as PostDetail;

  return {
    ...normalized,
    tags: normalizeArray<{ id: number; name: string }>(safeData.tags),
    collections: normalizeArray<{ id: number; name: string }>(safeData.collections),
  } as PostDetail;
};

export const getCollectionsApi = async (): Promise<Collection[]> => {
  const response = await client.get<unknown>('/collections');
  return normalizeArray<Collection>(response.data);
};

export const getTagsApi = async (): Promise<Tag[]> => {
  const response = await client.get<unknown>('/tags');
  return normalizeArray<Tag>(response.data);
};

export const createTagApi = async (data: { name: string; slug: string }): Promise<{ success: boolean; tagId: number }> => {
  const response = await client.post<{ success: boolean; tagId: number }>('/tags', data);
  return response.data;
};

export const deleteTagApi = async (tagId: number): Promise<{ success: boolean }> => {
  const response = await client.delete<{ success: boolean }>(`/tags/${tagId}`);
  return response.data;
};

export const createCollectionApi = async (data: { name: string; description?: string; thumbnail?: string }): Promise<{ success: boolean; collectionId: number }> => {
  const response = await client.post<{ success: boolean; collectionId: number }>('/collections', data);
  return response.data;
};

export const deleteCollectionApi = async (collectionId: number): Promise<{ success: boolean }> => {
  const response = await client.delete<{ success: boolean }>(`/collections/${collectionId}`);
  return response.data;
};

export const getManagerPostsApi = async (): Promise<Post[]> => {
  const response = await client.get<unknown>('/posts/me');
  return normalizeArray<Post>(response.data);
};

export interface CreatePostPayload {
  title: string;
  content: string;
  summary?: string;
  banner?: string;
  slug?: string;
  tagIds?: number[];
  collectionIds?: number[];
  status?: 'draft' | 'published';
}

export const createPostApi = async (data: CreatePostPayload): Promise<Post> => {
  const response = await client.post<Post>('/posts', data);
  return response.data;
};

export const updatePostApi = async (postId: number, data: Partial<CreatePostPayload>): Promise<Post> => {
  const response = await client.put<Post>(`/posts/${postId}`, data);
  return response.data;
};

export const deletePostApi = async (postId: number): Promise<{ success: boolean }> => {
  const response = await client.delete<{ success: boolean }>(`/posts/${postId}`);
  return response.data;
};

export const updatePostStatusApi = async (postId: number, status: 'draft' | 'published'): Promise<{ success: boolean }> => {
  const response = await client.patch<{ success: boolean }>(`/posts/${postId}/status`, { status });
  return response.data;
};

export const downloadPost = async (postId: number): Promise<{ blob: Blob; fileName: string }> => {
  const response = await client.post(`/posts/download/${postId}`, null, {
    responseType: 'blob',
    headers: {
      Accept: 'application/pdf',
    },
  });

  const contentDisposition = response.headers['content-disposition'] || '';
  const match = contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^;"']+)/i);
  const fileName = match?.[1]
    ? decodeURIComponent(match[1])
    : `post-${postId}.pdf`;

  return {
    blob: response.data as Blob,
    fileName,
  };
};

export interface UploadSignatureResponse {
  signature: string;
  timestamp: number;
  folder: string;
}

export const getUploadSignatureApi = async (): Promise<UploadSignatureResponse> => {
  const response = await client.post<UploadSignatureResponse>('/posts/upload');
  return response.data;
};
