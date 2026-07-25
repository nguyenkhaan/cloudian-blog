export interface CommentUser {
  id: number;
  name: string;
  nickName?: string | null;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
}

export interface CreateReportPayload {
  title: string;
  content: string;
  entity: 'post' | 'comment';
}
