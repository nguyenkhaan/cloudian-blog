export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Collection {
  id: number;
  name: string;
  description?: string | null;
  thumbnail?: string | null;
  postCount?: number;
}

export interface PostAuthor {
  name: string;
  nickName?: string | null;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content?: string | null;
  summary?: string | null;
  banner?: string | null;
  publishedAt?: string | null;
  status: string;
  author: PostAuthor;
  tags: Tag[];
  collections: Collection[];
}

export interface PostDetail {
  id: number;
  title: string;
  content: string;
  slug: string;
  status: string;
  summary?: string | null;
  banner?: string | null;
  publishedAt?: string | null;
  author: {
    name: string;
  };
  tags: { id: number; name: string }[];
  collections: { id: number; name: string }[];
}
