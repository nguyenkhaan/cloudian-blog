import { expect, test } from 'bun:test';
import { savePost } from './postEditorSave';
import type { PostEditorDraft } from './postEditor.types';

const createDraft = (): PostEditorDraft => ({
  title: 'My article',
  summary: 'Summary',
  content: '<p>Hello</p>',
  banner: '',
  slug: 'my-article',
  selectedCollectionIds: [1, 2],
  selectedTagIds: [3],
  status: 'draft',
  updatedAt: 1_725_000_000_000,
});

test('savePost updates an existing post and resolves successfully', async () => {
  const draft = createDraft();
  const updatePost = async (postId: number) => {
    expect(postId).toBe(42);
    return { id: postId };
  };
  let snapshotCount = 0;

  const result = await savePost({
    title: draft.title,
    summary: draft.summary,
    content: draft.content,
    banner: draft.banner,
    slug: draft.slug,
    selectedTagIds: draft.selectedTagIds,
    selectedCollectionIds: draft.selectedCollectionIds,
    status: draft.status,
    editPostId: 42,
    persistedPostId: 42,
    buildDraft: () => draft,
    createPost: async () => ({ id: 999 }),
    updatePost,
    syncSavedSnapshot: () => {
      snapshotCount += 1;
    },
  });

  expect(result).toEqual({ action: 'updated', postId: 42 });
  expect(snapshotCount).toBe(1);
});

test('savePost creates a new post when no id exists', async () => {
  const draft = createDraft();
  const createdIds: number[] = [];
  const result = await savePost({
    title: draft.title,
    summary: draft.summary,
    content: draft.content,
    banner: draft.banner,
    slug: draft.slug,
    selectedTagIds: draft.selectedTagIds,
    selectedCollectionIds: draft.selectedCollectionIds,
    status: draft.status,
    editPostId: null,
    persistedPostId: null,
    buildDraft: () => draft,
    createPost: async () => {
      createdIds.push(7);
      return { id: 7 };
    },
    updatePost: async () => ({}),
    syncSavedSnapshot: () => undefined,
  });

  expect(result).toEqual({ action: 'created', postId: 7 });
  expect(createdIds).toEqual([7]);
});

test('savePost tolerates a missing slug when editing a post', async () => {
  const draft = createDraft();
  const receivedPayloads: Array<Record<string, unknown>> = [];

  const result = await savePost({
    title: draft.title,
    summary: draft.summary,
    content: draft.content,
    banner: draft.banner,
    slug: null as unknown as string,
    selectedTagIds: draft.selectedTagIds,
    selectedCollectionIds: draft.selectedCollectionIds,
    status: draft.status,
    editPostId: 42,
    persistedPostId: 42,
    buildDraft: () => draft,
    createPost: async () => ({ id: 999 }),
    updatePost: async (_postId, payload) => {
      receivedPayloads.push(payload as Record<string, unknown>);
      return {};
    },
    syncSavedSnapshot: () => undefined,
  });

  expect(result).toEqual({ action: 'updated', postId: 42 });
  expect(receivedPayloads[0]?.slug).toBeUndefined();
});
