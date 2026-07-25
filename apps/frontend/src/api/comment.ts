import type { Comment, CreateReportPayload } from '../types/comment';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_COMMENTS_MAP: Record<number, Comment[]> = {
  1: [
    {
      id: 101,
      content: 'This breakdown is extremely thorough! The React 19 compiler optimization details are exactly what I needed to scale my app rendering.',
      createdAt: '2026-07-21T12:00:00.000Z',
      updatedAt: '2026-07-21T12:00:00.000Z',
      user: { id: 201, name: 'Alice Watson' },
    },
    {
      id: 102,
      content: 'I noticed some issues with context re-evaluation when using the compiler. Do you have any insights on how it handles memoization boundaries?',
      createdAt: '2026-07-22T08:30:00.000Z',
      updatedAt: '2026-07-22T08:30:00.000Z',
      user: { id: 202, name: 'Bob Carter' },
    },
  ],
  2: [
    {
      id: 201,
      content: 'WebSockets on Workers are super fast, but what about the pricing and duration limit? Does Cloudflare bill for active idle connections?',
      createdAt: '2026-07-19T10:15:00.000Z',
      updatedAt: '2026-07-19T10:15:00.000Z',
      user: { id: 203, name: 'Clara Oswald' },
    },
  ],
};

export const getCommentsApi = async (postId: number): Promise<Comment[]> => {
  await sleep(400);
  return MOCK_COMMENTS_MAP[postId] || [];
};

export const createCommentApi = async (postId: number, content: string): Promise<{ success: boolean; commentId: number }> => {
  await sleep(600);
  if (!MOCK_COMMENTS_MAP[postId]) {
    MOCK_COMMENTS_MAP[postId] = [];
  }
  const commentId = Date.now();
  MOCK_COMMENTS_MAP[postId].unshift({
    id: commentId,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: { id: 99, name: 'Google Reader' },
  });
  return { success: true, commentId };
};

export const updateCommentApi = async (commentId: number, content: string): Promise<Comment> => {
  await sleep(500);
  for (const postId of Object.keys(MOCK_COMMENTS_MAP).map(Number)) {
    const list = MOCK_COMMENTS_MAP[postId];
    const index = list.findIndex(c => c.id === commentId);
    if (index !== -1) {
      list[index] = {
        ...list[index],
        content,
        updatedAt: new Date().toISOString(),
      };
      return list[index];
    }
  }
  throw new Error('Comment not found');
};

export const deleteCommentApi = async (commentId: number): Promise<{ success: boolean }> => {
  await sleep(400);
  for (const postId of Object.keys(MOCK_COMMENTS_MAP).map(Number)) {
    const list = MOCK_COMMENTS_MAP[postId];
    const index = list.findIndex(c => c.id === commentId);
    if (index !== -1) {
      list.splice(index, 1);
      return { success: true };
    }
  }
  return { success: true };
};

export const createReportApi = async (_data: CreateReportPayload): Promise<{ success: boolean; reportId: number }> => {
  await sleep(400);
  return { success: true, reportId: Date.now() };
};
