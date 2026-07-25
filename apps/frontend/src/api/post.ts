import type { Post, PostDetail, Collection, Tag } from '../types/post';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_COLLECTIONS: Collection[] = [
  { id: 1, name: 'AI & LLM Services' },
  { id: 2, name: 'Database & Scale' },
  { id: 3, name: 'Systems Architecture' },
  { id: 4, name: 'Frontend UI Engineering' },
];

const MOCK_TAGS: Tag[] = [
  { id: 1, name: 'react-19', slug: 'react-19' },
  { id: 2, name: 'websockets', slug: 'websockets' },
  { id: 3, name: 'ai', slug: 'ai' },
  { id: 4, name: 'sqlite', slug: 'sqlite' },
  { id: 5, name: 'drizzle', slug: 'drizzle' },
  { id: 6, name: 'cloudflare', slug: 'cloudflare' },
  { id: 7, name: 'nextjs', slug: 'nextjs' },
  { id: 8, name: 'tailwindcss', slug: 'tailwindcss' },
];

const MOCK_POSTS: Post[] = [
  {
    id: 1,
    title: 'Deep Dive into React 19 Compiler Architecture',
    slug: 'react-19-compiler-architecture',
    summary: 'Detailed architecture reviews, scaling benchmarks, state management optimizations, and core security configurations engineered for React 19.',
    banner: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
    publishedAt: '2026-07-20T10:00:00.000Z',
    author: { name: 'Alex Rivera', nickName: 'alex_r' },
    tags: [MOCK_TAGS[0], MOCK_TAGS[7]],
    collections: [MOCK_COLLECTIONS[3]],
  },
  {
    id: 2,
    title: 'Scaling WebSockets on Cloudflare Workers',
    slug: 'scaling-websockets-cloudflare-workers',
    summary: 'Detailed architecture reviews, scaling benchmarks, state management optimizations, and core security configurations engineered for WebSockets on Cloudflare Workers.',
    banner: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    publishedAt: '2026-07-18T14:30:00.000Z',
    author: { name: 'Sarah Chen', nickName: 'sarah_c' },
    tags: [MOCK_TAGS[1], MOCK_TAGS[5]],
    collections: [MOCK_COLLECTIONS[1], MOCK_COLLECTIONS[2]],
  },
  {
    id: 3,
    title: 'Building Real-time AI RAG Systems with LangChain',
    slug: 'real-time-ai-rag-langchain',
    summary: 'Detailed architecture reviews, scaling benchmarks, state management optimizations, and core security configurations engineered for LangChain RAG applications.',
    banner: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
    publishedAt: '2026-07-15T09:15:00.000Z',
    author: { name: 'Michael Novak', nickName: 'mike_n' },
    tags: [MOCK_TAGS[2], MOCK_TAGS[4]],
    collections: [MOCK_COLLECTIONS[0]],
  },
  {
    id: 4,
    title: 'SQLite vs PostgreSQL: The Ultimate Scale Analysis',
    slug: 'sqlite-vs-postgresql-scale-analysis',
    summary: 'Detailed architecture reviews, scaling benchmarks, state management optimizations, and core security configurations engineered for comparing D1 SQLite and PostgreSQL.',
    banner: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
    publishedAt: '2026-07-12T16:45:00.000Z',
    author: { name: 'Alex Rivera', nickName: 'alex_r' },
    tags: [MOCK_TAGS[3], MOCK_TAGS[4]],
    collections: [MOCK_COLLECTIONS[1]],
  },
  {
    id: 5,
    title: 'Optimizing Next.js SSR Core Performance',
    slug: 'optimizing-nextjs-ssr-performance',
    summary: 'Detailed architecture reviews, scaling benchmarks, state management optimizations, and core security configurations engineered for Next.js SSR performance.',
    banner: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=800&auto=format&fit=crop&q=80',
    publishedAt: '2026-07-10T11:00:00.000Z',
    author: { name: 'Emma Watson', nickName: 'emma_w' },
    tags: [MOCK_TAGS[6]],
    collections: [MOCK_COLLECTIONS[3]],
  },
  {
    id: 6,
    title: 'Architecting High-Throughput Message Queues',
    slug: 'architecting-high-throughput-message-queues',
    summary: 'Detailed architecture reviews, scaling benchmarks, state management optimizations, and core security configurations engineered for enterprise-grade message queuing.',
    banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    publishedAt: '2026-07-08T08:00:00.000Z',
    author: { name: 'Sarah Chen', nickName: 'sarah_c' },
    tags: [MOCK_TAGS[1]],
    collections: [MOCK_COLLECTIONS[2]],
  },
  {
    id: 7,
    title: 'Leveraging Vector DBs for Semantic Search',
    slug: 'vector-dbs-for-semantic-search',
    summary: 'Detailed architecture reviews, scaling benchmarks, state management optimizations, and core security configurations engineered for semantic search indexing.',
    banner: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    publishedAt: '2026-07-05T15:20:00.000Z',
    author: { name: 'Michael Novak', nickName: 'mike_n' },
    tags: [MOCK_TAGS[2]],
    collections: [MOCK_COLLECTIONS[0], MOCK_COLLECTIONS[2]],
  },
  {
    id: 8,
    title: 'Designing Accessible CSS Design Systems',
    slug: 'designing-accessible-css-design-systems',
    summary: 'Detailed architecture reviews, scaling benchmarks, state management optimizations, and core security configurations engineered for WCAG-compliant design systems.',
    banner: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4b2e?w=800&auto=format&fit=crop&q=80',
    publishedAt: '2026-07-02T13:10:00.000Z',
    author: { name: 'Emma Watson', nickName: 'emma_w' },
    tags: [MOCK_TAGS[7]],
    collections: [MOCK_COLLECTIONS[3]],
  },
  {
    id: 9,
    title: 'Deploying Edge Functions with Drizzle ORM',
    slug: 'deploying-edge-functions-drizzle-orm',
    summary: 'Detailed architecture reviews, scaling benchmarks, state management optimizations, and core security configurations engineered for edge-native Drizzle database queries.',
    banner: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=800&auto=format&fit=crop&q=80',
    publishedAt: '2026-06-29T10:30:00.000Z',
    author: { name: 'Alex Rivera', nickName: 'alex_r' },
    tags: [MOCK_TAGS[4], MOCK_TAGS[5]],
    collections: [MOCK_COLLECTIONS[1], MOCK_COLLECTIONS[2]],
  },
  {
    id: 10,
    title: 'Implementing Multi-Tenant Database Architecture',
    slug: 'implementing-multi-tenant-database-architecture',
    summary: 'Detailed architecture reviews, scaling benchmarks, state management optimizations, and core security configurations engineered for multi-tenant isolation schemas.',
    banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    publishedAt: '2026-06-25T14:00:00.000Z',
    author: { name: 'Sarah Chen', nickName: 'sarah_c' },
    tags: [MOCK_TAGS[3]],
    collections: [MOCK_COLLECTIONS[1]],
  },
  {
    id: 11,
    title: 'Demystifying LLM Quantization Tech Stack',
    slug: 'demystifying-llm-quantization-tech-stack',
    summary: 'Detailed architecture reviews, scaling benchmarks, state management optimizations, and core security configurations engineered for low-memory LLM quantization deployment.',
    banner: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
    publishedAt: '2026-06-20T09:00:00.000Z',
    author: { name: 'Michael Novak', nickName: 'mike_n' },
    tags: [MOCK_TAGS[2]],
    collections: [MOCK_COLLECTIONS[0]],
  },
  {
    id: 12,
    title: 'Micro-Frontend Orchestration at Enterprise Scale',
    slug: 'micro-frontend-orchestration-scale',
    summary: 'Detailed architecture reviews, scaling benchmarks, state management optimizations, and core security configurations engineered for modular micro-frontends.',
    banner: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80',
    publishedAt: '2026-06-15T11:45:00.000Z',
    author: { name: 'Emma Watson', nickName: 'emma_w' },
    tags: [MOCK_TAGS[0], MOCK_TAGS[6]],
    collections: [MOCK_COLLECTIONS[3]],
  },
];

export const getPostsApi = async (params?: {
  tag?: string;
  collection?: string;
  keyword?: string;
  limit?: number;
  offset?: number;
}): Promise<Post[]> => {
  await sleep(400); // Simulate network latency

  let filtered = [...MOCK_POSTS];

  if (params?.collection) {
    const colId = parseInt(params.collection, 10);
    filtered = filtered.filter(p => p.collections.some(c => c.id === colId));
  }

  if (params?.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(kw) || 
      (p.author?.name || '').toLowerCase().includes(kw)
    );
  }

  if (params?.tag) {
    const tagVal = params.tag;
    filtered = filtered.filter(p => p.tags.some(t => t.name === tagVal));
  }

  const offset = params?.offset !== undefined ? params.offset : 0;
  const limit = params?.limit !== undefined ? params.limit : 10;

  return filtered.slice(offset, offset + limit);
};

export const getPostDetailApi = async (slugOrId: string): Promise<PostDetail> => {
  await sleep(400);
  const found = MOCK_POSTS.find(p => p.slug === slugOrId || p.id.toString() === slugOrId);
  if (!found) {
    throw new Error('Blog not found');
  }

  return {
    ...found,
    status: found.publishedAt ? 'published' : 'draft',
    content: found.content || `
# ${found.title}

Welcome to this technical breakdown of **${found.title}**. This is simulated mock documentation rendered from Markdown content.

## Introduction
Modern cloud infrastructures require robust architectures, structured APIs, and optimized query pathways.

## Implementation Details
Here is an example code snippet simulating production code:
\`\`\`typescript
export function optimizeQuery(params: QueryParams) {
  const cacheKey = \`query:\${params.id}\`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  const result = db.execute(params.sql);
  cache.set(cacheKey, result, 3600);
  return result;
}
\`\`\`

### Key Takeaways
1. Always cache heavy queries.
2. Monitor database connection pools.
3. Secure endpoints with middleware validation.
    `,
  };
};

export const getCollectionsApi = async (): Promise<Collection[]> => {
  await sleep(200);
  return MOCK_COLLECTIONS;
};

export const getTagsApi = async (): Promise<Tag[]> => {
  await sleep(200);
  return MOCK_TAGS;
};

export const getManagerPostsApi = async (): Promise<Post[]> => {
  await sleep(300);
  return MOCK_POSTS.slice(0, 5);
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
  await sleep(800);
  const postTags = data.tagIds ? MOCK_TAGS.filter(t => data.tagIds!.includes(t.id)) : [];
  const postCollections = data.collectionIds ? MOCK_COLLECTIONS.filter(c => data.collectionIds!.includes(c.id)) : [];
  const newPost: Post = {
    id: Date.now(),
    title: data.title,
    slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    content: data.content,
    summary: data.summary || '',
    banner: data.banner || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
    publishedAt: data.status === 'draft' ? null : new Date().toISOString(),
    author: { name: 'System Administrator', nickName: 'admin' },
    tags: postTags,
    collections: postCollections,
  };
  MOCK_POSTS.unshift(newPost);
  return newPost;
};

export const updatePostApi = async (postId: number, data: Partial<CreatePostPayload>): Promise<Post> => {
  await sleep(600);
  const index = MOCK_POSTS.findIndex(p => p.id === postId);
  if (index === -1) throw new Error('Post not found');
  
  let publishedAt = MOCK_POSTS[index].publishedAt;
  if (data.status === 'published') {
    publishedAt = new Date().toISOString();
  } else if (data.status === 'draft') {
    publishedAt = null;
  }

  const postTags = data.tagIds ? MOCK_TAGS.filter(t => data.tagIds!.includes(t.id)) : MOCK_POSTS[index].tags;
  const postCollections = data.collectionIds ? MOCK_COLLECTIONS.filter(c => data.collectionIds!.includes(c.id)) : MOCK_POSTS[index].collections;

  const updated: Post = {
    ...MOCK_POSTS[index],
    title: data.title || MOCK_POSTS[index].title,
    slug: data.slug || MOCK_POSTS[index].slug,
    content: data.content !== undefined ? data.content : MOCK_POSTS[index].content,
    summary: data.summary !== undefined ? data.summary : MOCK_POSTS[index].summary,
    banner: data.banner || MOCK_POSTS[index].banner,
    publishedAt,
    tags: postTags,
    collections: postCollections,
  };
  MOCK_POSTS[index] = updated;
  return updated;
};

export const deletePostApi = async (postId: number): Promise<{ success: boolean }> => {
  await sleep(500);
  const index = MOCK_POSTS.findIndex(p => p.id === postId);
  if (index !== -1) {
    MOCK_POSTS.splice(index, 1);
  }
  return { success: true };
};

export const updatePostStatusApi = async (postId: number, status: 'draft' | 'published'): Promise<{ success: boolean }> => {
  await sleep(400);
  const index = MOCK_POSTS.findIndex(p => p.id === postId);
  if (index !== -1) {
    MOCK_POSTS[index] = {
      ...MOCK_POSTS[index],
      publishedAt: status === 'published' ? new Date().toISOString() : null,
    };
  }
  return { success: true };
};

export interface UploadSignatureResponse {
  signature: string;
  timestamp: number;
  folder: string;
}

export const getUploadSignatureApi = async (): Promise<UploadSignatureResponse> => {
  await sleep(300);
  return {
    signature: 'mock-signature',
    timestamp: Date.now(),
    folder: 'mock-folder',
  };
};
