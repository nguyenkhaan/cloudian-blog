import React, { useEffect, useState } from 'react';
import { FolderPlus, Loader2, Plus, Tag as TagIcon, Trash2 } from 'lucide-react';
import { createCollectionApi, createTagApi, deleteCollectionApi, deleteTagApi, getCollectionsApi, getPostsApi, getTagsApi } from '../../api/post';
import { useToast } from '../../hooks/useToast';
import type { Collection, Post, Tag } from '../../types/post';
import { ConfirmModal } from '../ui/ConfirmModal';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const DashboardTaxonomy: React.FC = () => {
  const { toast } = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [tagName, setTagName] = useState('');
  const [tagSlug, setTagSlug] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [collectionThumbnail, setCollectionThumbnail] = useState('');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);

  const [deletingTagId, setDeletingTagId] = useState<number | null>(null);
  const [deletingCollectionId, setDeletingCollectionId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ type: 'tag' | 'collection'; id: number } | null>(null);
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<{ type: 'tag' | 'collection'; item: Tag | Collection } | null>(null);
  const [detailPosts, setDetailPosts] = useState<Post[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const fetchTaxonomy = async () => {
    setIsLoading(true);
    try {
      const [tagsData, collectionsData] = await Promise.all([getTagsApi(), getCollectionsApi()]);
      setTags(tagsData);
      setCollections(collectionsData);
    } catch (error) {
      toast({
        title: 'Unable to load taxonomy',
        description: 'Please refresh the page and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchTaxonomy();
  }, []);

  const handleCreateTag = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = tagName.trim();
    if (!name) {
      toast({ title: 'Tag name is required', description: 'Please enter a tag name.', variant: 'destructive' });
      return;
    }

    setIsCreatingTag(true);
    try {
      await createTagApi({
        name,
        slug: (tagSlug || slugify(name)).trim(),
      });
      setTagName('');
      setTagSlug('');
      await fetchTaxonomy();
      toast({ title: 'Tag created', description: `Tag “${name}” has been added.`, variant: 'success' });
    } catch (error: any) {
      toast({
        title: 'Unable to create tag',
        description: error?.response?.data?.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleRequestDeleteTag = (tagId: number) => {
    setPendingDelete({ type: 'tag', id: tagId });
  };

  const handleRequestDeleteCollection = (collectionId: number) => {
    setPendingDelete({ type: 'collection', id: collectionId });
  };

  const handleOpenTaxonomyDetails = async (type: 'tag' | 'collection', item: Tag | Collection) => {
    setSelectedTaxonomy({ type, item });
    setIsLoadingDetails(true);
    setDetailPosts([]);

    try {
      const posts = type === 'tag'
        ? await getPostsApi({ tag: (item as Tag).name, limit: 50, offset: 0 })
        : await getPostsApi({ collection: String((item as Collection).id), limit: 50, offset: 0 });
      setDetailPosts(posts);
    } catch (error: any) {
      toast({
        title: 'Unable to load related posts',
        description: error?.response?.data?.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    const { type, id } = pendingDelete;
    setPendingDelete(null);

    if (type === 'tag') {
      setDeletingTagId(id);
      try {
        await deleteTagApi(id);
        await fetchTaxonomy();
        toast({ title: 'Tag deleted', description: 'The tag has been removed.', variant: 'success' });
      } catch (error: any) {
        toast({
          title: 'Unable to delete tag',
          description: error?.response?.data?.message || 'Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setDeletingTagId(null);
      }
      return;
    }

    setDeletingCollectionId(id);
    try {
      await deleteCollectionApi(id);
      await fetchTaxonomy();
      toast({ title: 'Collection deleted', description: 'The collection has been removed.', variant: 'success' });
    } catch (error: any) {
      toast({
        title: 'Unable to delete collection',
        description: error?.response?.data?.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setDeletingCollectionId(null);
    }
  };

  const handleCreateCollection = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = collectionName.trim();
    if (!name) {
      toast({ title: 'Collection name is required', description: 'Please enter a collection name.', variant: 'destructive' });
      return;
    }

    setIsCreatingCollection(true);
    try {
      await createCollectionApi({
        name,
        description: collectionDescription.trim() || undefined,
        thumbnail: collectionThumbnail.trim() || undefined,
      });
      setCollectionName('');
      setCollectionDescription('');
      setCollectionThumbnail('');
      await fetchTaxonomy();
      toast({ title: 'Collection created', description: `Collection “${name}” has been added.`, variant: 'success' });
    } catch (error: any) {
      toast({
        title: 'Unable to create collection',
        description: error?.response?.data?.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingCollection(false);
    }
  };
  return (
    <div className="space-y-8">
        <h2 className="text-2xl font-black text-slate-800 dark:text-foreground tracking-tight font-heading">
             Tags & Collections 
        </h2>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
          <div className="mb-5 flex items-center gap-2">
            <div className="rounded-2xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
              <TagIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-foreground">Tags</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Organize posts with relevant keywords.</p>
            </div>
          </div>

          <form onSubmit={handleCreateTag} className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-border">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Tag name</label>
              <input
                value={tagName}
                onChange={(event) => setTagName(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary dark:border-border dark:bg-background dark:text-slate-200"
                placeholder="Example: React"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Slug</label>
              <input
                value={tagSlug}
                onChange={(event) => setTagSlug(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary dark:border-border dark:bg-background dark:text-slate-200"
                placeholder="react"
              />
            </div>
            <button
              type="submit"
              disabled={isCreatingTag}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCreatingTag ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Tag
            </button>
          </form>

          <div className="mt-5 space-y-3">
            {isLoading ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-border dark:text-slate-400">Loading tags...</div>
            ) : tags.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-border dark:text-slate-400">No tags yet.</div>
            ) : (
              tags.map((tag) => (
                <div key={tag.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3 dark:border-border">
                  <button
                    type="button"
                    onClick={() => handleOpenTaxonomyDetails('tag', tag)}
                    className="flex-1 text-left"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{tag.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">/{tag.slug}</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRequestDeleteTag(tag.id)}
                    disabled={deletingTagId === tag.id}
                    className="ml-3 rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed dark:hover:bg-red-950/20"
                  >
                    {deletingTagId === tag.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
          <div className="mb-5 flex items-center gap-2">
            <div className="rounded-2xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
              <FolderPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-foreground">Collections</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Group posts into featured series.</p>
            </div>
          </div>

          <form onSubmit={handleCreateCollection} className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-border">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Collection name</label>
              <input
                value={collectionName}
                onChange={(event) => setCollectionName(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary dark:border-border dark:bg-background dark:text-slate-200"
                placeholder="Example: Backend Masterclass"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                value={collectionDescription}
                onChange={(event) => setCollectionDescription(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary dark:border-border dark:bg-background dark:text-slate-200"
                rows={3}
                placeholder="Short description"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Thumbnail URL</label>
              <input
                value={collectionThumbnail}
                onChange={(event) => setCollectionThumbnail(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary dark:border-border dark:bg-background dark:text-slate-200"
                placeholder="https://..."
              />
            </div>
            <button
              type="submit"
              disabled={isCreatingCollection}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCreatingCollection ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Collection
            </button>
          </form>

          <div className="mt-5 space-y-3">
            {isLoading ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-border dark:text-slate-400">Loading collections...</div>
            ) : collections.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-border dark:text-slate-400">No collections yet.</div>
            ) : (
              collections.map((collection) => (
                <div key={collection.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 p-3 dark:border-border">
                  <button
                    type="button"
                    onClick={() => handleOpenTaxonomyDetails('collection', collection)}
                    className="flex-1 text-left"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{collection.name}</p>
                        {collection.postCount !== undefined && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {collection.postCount} posts
                          </span>
                        )}
                      </div>
                      {collection.description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{collection.description}</p>}
                      {collection.thumbnail && (
                        <img src={collection.thumbnail} alt={collection.name} className="mt-2 h-16 w-full rounded-lg object-cover" />
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRequestDeleteCollection(collection.id)}
                    disabled={deletingCollectionId === collection.id}
                    className="ml-3 rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed dark:hover:bg-red-950/20"
                  >
                    {deletingCollectionId === collection.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {selectedTaxonomy && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setSelectedTaxonomy(null)}>
          <div
            className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-border dark:bg-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                  {selectedTaxonomy.type === 'tag' ? 'Tag details' : 'Collection details'}
                </p>
                <h3 className="mt-1 text-xl font-black text-slate-800 dark:text-foreground">
                  {selectedTaxonomy.item.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaxonomy(null)}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-border dark:text-slate-300"
              >
                Close
              </button>
            </div>

            <div className="mt-6 max-h-[60vh] overflow-y-auto rounded-2xl border border-slate-200 p-4 dark:border-border">
              {isLoadingDetails ? (
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading related posts...
                </div>
              ) : detailPosts.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No posts are linked to this item yet.</p>
              ) : (
                <ul className="space-y-3">
                  {detailPosts.map((post) => (
                    <li key={post.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-border dark:bg-background/60">
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{post.title}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {post.summary || 'No summary available.'}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!pendingDelete}
        title={pendingDelete?.type === 'tag' ? 'Delete tag?' : 'Delete collection?'}
        description={pendingDelete?.type === 'tag' ? 'This action will remove the tag from related posts.' : 'This action will remove the collection from related posts.'}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
