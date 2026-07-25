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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_REPORTS: ReportItem[] = [
  {
    id: 1,
    title: 'Report comment (ID: 102)',
    content: 'Reported content: "I noticed some issues..."\nReason: Spam / Advertising\nDetails: User posting affiliate links.',
    status: 'pending',
    entity: 'comment',
    createdAt: new Date().toISOString(),
    user: { id: 99, name: 'Google Reader', email: 'reader@gmail.com' }
  }
];

const MOCK_COMMENTS: AdminCommentItem[] = [
  {
    id: 101,
    content: 'This breakdown is extremely thorough! The React 19 compiler optimization details are exactly what I needed to scale my app rendering.',
    status: 'active',
    createdAt: new Date().toISOString(),
    postId: 1,
    postTitle: 'Deep Dive into React 19 Compiler Architecture',
    user: { id: 201, name: 'Alice Watson', email: 'alice@gmail.com' }
  }
];

export const getReportsApi = async (params?: {
  status?: string;
  entity?: string;
}): Promise<ReportItem[]> => {
  await sleep(400);
  let res = [...MOCK_REPORTS];
  if (params?.status) {
    res = res.filter(r => r.status === params.status);
  }
  if (params?.entity) {
    res = res.filter(r => r.entity === params.entity);
  }
  return res;
};

export const updateReportStatusApi = async (
  reportId: number,
  status: 'solved' | 'pending' | 'cancel',
  _resolutionNote?: string
): Promise<{ success: boolean }> => {
  await sleep(400);
  const found = MOCK_REPORTS.find(r => r.id === reportId);
  if (found) {
    found.status = status;
  }
  return { success: true };
};

export const getAllCommentsApi = async (params?: {
  status?: string;
}): Promise<AdminCommentItem[]> => {
  await sleep(400);
  let res = [...MOCK_COMMENTS];
  if (params?.status) {
    res = res.filter(c => c.status === params.status);
  }
  return res;
};

export const updateCommentStatusApi = async (
  commentId: number,
  status: 'active' | 'invalid'
): Promise<{ success: boolean }> => {
  await sleep(400);
  const found = MOCK_COMMENTS.find(c => c.id === commentId);
  if (found) {
    found.status = status;
  }
  return { success: true };
};
