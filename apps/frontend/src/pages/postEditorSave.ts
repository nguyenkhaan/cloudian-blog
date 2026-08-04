import type { CreatePostPayload } from '../api/post';
import type { PostEditorDraft } from './postEditor.types';

export type SavePostResult = {
  action: 'created' | 'updated';
  postId: number;
};

type SavePostDeps = {
  title: string;
  summary: string;
  content: string;
  banner: string;
  slug: string | null | undefined;
  selectedTagIds: number[];
  selectedCollectionIds: number[];
  status: 'draft' | 'published';
  editPostId: number | null;
  persistedPostId: number | null;
  buildDraft: () => PostEditorDraft;
  createPost: (data: CreatePostPayload) => Promise<{ id: number }>;
  updatePost: (postId: number, data: Partial<CreatePostPayload>) => Promise<unknown>;
  syncSavedSnapshot: (draft: PostEditorDraft) => void;
};

export const buildPostPayload = (deps: Pick<SavePostDeps,
  'title' | 'summary' | 'content' | 'banner' | 'slug' | 'selectedTagIds' | 'selectedCollectionIds' | 'status'
>): CreatePostPayload => {
  const safeSlug = typeof deps.slug === 'string' ? deps.slug : '';
  return {
    title: deps.title.trim(),
    summary: deps.summary.trim() || undefined,
    content: deps.content,
    banner: deps.banner || undefined,
    slug: safeSlug.trim() || undefined,
    tagIds: deps.selectedTagIds,
    collectionIds: deps.selectedCollectionIds,
    status: deps.status,
  };
};

export const savePost = async (deps: SavePostDeps): Promise<SavePostResult> => {
  if (!deps.title.trim()) {
    throw new Error('Missing information');
  }

  const payload = buildPostPayload(deps);
  const currentPostId = deps.persistedPostId ?? deps.editPostId;

  if (currentPostId) {
    await deps.updatePost(currentPostId, payload);
    deps.syncSavedSnapshot(deps.buildDraft());
    return { action: 'updated', postId: currentPostId };
  }

  const createdPost = await deps.createPost(payload);
  deps.syncSavedSnapshot(deps.buildDraft());
  return { action: 'created', postId: createdPost.id };
};
