import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import {
  createPostApi,
  updatePostApi,
  getPostDetailApi,
  getCollectionsApi,
  getTagsApi,
  getUploadSignatureApi
} from '../api/post';
import type { Collection, Tag } from '../types/post';
import { TipTapEditor } from '../components/TipTapEditor';
import { Button } from '../components/ui/button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { PostEditorSkeleton } from '../components/ui/Skeleton';
import { EditorHeader } from '../components/editor/EditorHeader';
import { EditorBanner } from '../components/editor/EditorBanner';
import { EditorSidebar } from '../components/editor/EditorSidebar';
import { getErrorMessage } from '../utils/errors';
import axios from 'axios';
import { Save, Loader2 } from 'lucide-react';

const MAX_FILE_SIZE = 1.2 * 1024 * 1024
const SUMMARY_MAX_LENGTH = 300;
const AUTO_SAVE_INTERVAL_MS = 8 * 60 * 1000;
const AUTO_SAVE_STORAGE_PREFIX = 'post-editor-draft';

interface PostEditorDraft {
  title: string;
  summary: string;
  content: string;
  banner: string;
  slug: string;
  selectedCollectionIds: number[];
  selectedTagIds: number[];
  status: 'draft' | 'published';
  updatedAt: number;
}

export const PostEditor: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const userRoles = user?.roles?.map(r => String(r).toLowerCase()) || [];
  const isAdmin = userRoles.includes('admin') || user?.email === 'admin@gmail.com';
  const backUrl = isAdmin ? '/dashboard?tab=blog-management' : '/dashboard?tab=my-blogs';
  const [searchParams] = useSearchParams();
  const postIdStr = searchParams.get('postId');
  const editPostId = postIdStr ? Number(postIdStr) : null;

  const [collections, setCollections] = useState<Collection[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [slug, setSlug] = useState('');
  const [banner, setBanner] = useState('');
  const [content, setContent] = useState('');
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<number[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const [isDistractionFree, setIsDistractionFree] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBannerUploading, setIsBannerUploading] = useState(false);
  const [isInitialDataReady, setIsInitialDataReady] = useState(false);
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState<number | null>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  
  const initialTitleRef = useRef('');
  const initialSummaryRef = useRef('');
  const initialContentRef = useRef('');
  const initialBannerRef = useRef('');
  const initialSlugRef = useRef('');
  const initialCollectionIdsRef = useRef<number[]>([]);
  const initialTagIdsRef = useRef<number[]>([]);
  const isSubmitSavingRef = useRef(false);
  const isDraftRestoredRef = useRef(false);
  const draftRef = useRef<PostEditorDraft | null>(null);
  const hasEditorChangesRef = useRef(false);

  const draftKey = `${AUTO_SAVE_STORAGE_PREFIX}:${user?.id ?? user?.email ?? 'anonymous'}:${editPostId ?? 'new'}`;

  const buildDraft = useCallback((): PostEditorDraft => ({
    title,
    summary,
    content,
    banner,
    slug,
    selectedCollectionIds,
    selectedTagIds,
    status,
    updatedAt: Date.now(),
  }), [title, summary, content, banner, slug, selectedCollectionIds, selectedTagIds, status]);

  const hasEditorChanges = useCallback(() => (
    title.trim() !== initialTitleRef.current ||
    summary.trim() !== initialSummaryRef.current ||
    content.trim() !== initialContentRef.current ||
    banner !== initialBannerRef.current ||
    (slug && slug.trim() !== initialSlugRef.current) || (slug != initialSlugRef.current) ||
    selectedCollectionIds.join(',') !== initialCollectionIdsRef.current.join(',') ||
    selectedTagIds.join(',') !== initialTagIdsRef.current.join(',')
  ), [title, summary, content, banner, slug, selectedCollectionIds, selectedTagIds]);

  const readStoredDraft = useCallback((): PostEditorDraft | null => {
    try {
      const rawDraft = localStorage.getItem(draftKey);
      if (!rawDraft) return null;
      const parsed = JSON.parse(rawDraft) as Partial<PostEditorDraft>;
      if (typeof parsed.updatedAt !== 'number') return null;
      return {
        title: parsed.title ?? '',
        summary: parsed.summary ?? '',
        content: parsed.content ?? '',
        banner: parsed.banner ?? '',
        slug: parsed.slug ?? '',
        selectedCollectionIds: Array.isArray(parsed.selectedCollectionIds) ? parsed.selectedCollectionIds : [],
        selectedTagIds: Array.isArray(parsed.selectedTagIds) ? parsed.selectedTagIds : [],
        status: parsed.status === 'published' ? 'published' : 'draft',
        updatedAt: parsed.updatedAt,
      };
    } catch (err) {
      console.error('Failed to read editor draft:', err);
      return null;
    }
  }, [draftKey]);

  const persistDraft = useCallback((draft: PostEditorDraft) => {
    try {
      localStorage.setItem(draftKey, JSON.stringify(draft));
      setLastAutoSavedAt(draft.updatedAt);
    } catch (err) {
      console.error('Failed to save editor draft:', err);
    }
  }, [draftKey]);

  const clearStoredDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey);
    } catch (err) {
      console.error('Failed to clear editor draft:', err);
    }
  }, [draftKey]);

  const applyDraft = useCallback((draft: PostEditorDraft) => {
    setTitle(draft.title);
    setSummary(draft.summary);
    setContent(draft.content);
    setBanner(draft.banner);
    setSlug(draft.slug);
    setSelectedCollectionIds(draft.selectedCollectionIds);
    setSelectedTagIds(draft.selectedTagIds);
    setStatus(draft.status);
    setLastAutoSavedAt(draft.updatedAt);
  }, []);

  useEffect(() => {
    setIsInitialDataReady(false);
    isDraftRestoredRef.current = false;
    setLastAutoSavedAt(null);

    const loadCatalogs = async () => {
      try {
        const [collectionsData, tagsData] = await Promise.all([
          getCollectionsApi(),
          getTagsApi(),
        ]);
        setCollections(collectionsData);
        setTags(tagsData);
      } catch (err) {
        console.error('Failed to load collections/tags:', err);
      }
    };

    const loadPostData = async () => {
      if (!editPostId) {
        setTitle('');
        setSummary('');
        setSlug('');
        setBanner('');
        setContent('');
        setStatus('draft');
        setSelectedCollectionIds([]);
        setSelectedTagIds([]);
        initialTitleRef.current = '';
        initialSummaryRef.current = '';
        initialContentRef.current = '';
        initialBannerRef.current = '';
        initialSlugRef.current = '';
        initialCollectionIdsRef.current = [];
        initialTagIdsRef.current = [];
        return;
      }
      setIsLoading(true);
      try {
        const post = await getPostDetailApi(editPostId.toString());
        setTitle(post.title);
        setSummary(post.summary || '');
        setSlug(post.slug);
        setBanner(post.banner || '');
        setContent(post.content);
        setStatus(post.status === 'published' ? 'published' : 'draft');
        
        initialTitleRef.current = post.title;
        initialSummaryRef.current = post.summary || '';
        initialContentRef.current = post.content;
        initialBannerRef.current = post.banner || '';
        initialSlugRef.current = post.slug;

        const safeCollections = Array.isArray(post.collections) ? post.collections : [];
        const safeTags = Array.isArray(post.tags) ? post.tags : [];
        const initialCollectionIds = safeCollections.map((c) => c.id);
        const initialTagIds = safeTags.map((t) => t.id);

        initialCollectionIdsRef.current = initialCollectionIds;
        initialTagIdsRef.current = initialTagIds;

        setSelectedCollectionIds(initialCollectionIds);
        setSelectedTagIds(initialTagIds);
      } catch {
        toast({
          title: 'Load Failed',
          description: 'Failed to load post details.',
          variant: 'destructive',
        });
        navigate(backUrl);
      } finally {
        setIsLoading(false);
      }
    };

    const loadInitialData = async () => {
      await loadCatalogs();
      await loadPostData();
      setIsInitialDataReady(true);
    };

    loadInitialData();
  }, [editPostId, navigate, backUrl, toast]);

  useEffect(() => {
    draftRef.current = buildDraft();
  }, [buildDraft]);

  useEffect(() => {
    hasEditorChangesRef.current = hasEditorChanges();
  }, [hasEditorChanges]);

  useEffect(() => {
    if (!isInitialDataReady || isDraftRestoredRef.current) return;
    const storedDraft = readStoredDraft();
    if (storedDraft) {
      applyDraft(storedDraft);
      toast({
        title: 'Draft Restored',
        description: 'Autosaved edits from this browser were restored.',
        variant: 'success',
      });
    }
    isDraftRestoredRef.current = true;
  }, [isInitialDataReady, readStoredDraft, applyDraft, toast]);

  useEffect(() => {
    const saveDraft = () => {
      if (!isDraftRestoredRef.current || isSubmitSavingRef.current || !hasEditorChangesRef.current) return;
      if (!draftRef.current) return;
      const nextDraft = { ...draftRef.current, updatedAt: Date.now() };
      persistDraft(nextDraft);
    };

    const intervalId = window.setInterval(saveDraft, AUTO_SAVE_INTERVAL_MS);
    window.addEventListener('beforeunload', saveDraft);
    document.addEventListener('visibilitychange', saveDraft);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('beforeunload', saveDraft);
      document.removeEventListener('visibilitychange', saveDraft);
    };
  }, [persistDraft]);

  const handleBannerUploadClick = () => {
    bannerFileInputRef.current?.click();
  };

  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size >= MAX_FILE_SIZE) {
      alert(`File must be less then ${MAX_FILE_SIZE}MB`) 
      return 
    }
    setIsBannerUploading(true);
    try {
      const sigData = await getUploadSignatureApi();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', import.meta.env.VITE_CLOUDINARY_API_KEY || '461458269566955');
      formData.append('timestamp', sigData.timestamp.toString());
      formData.append('signature', sigData.signature);
      formData.append('folder', sigData.folder);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dikd164hg'}/image/upload`;
      const response = await axios.post<{ secure_url: string }>(cloudinaryUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setBanner(response.data.secure_url);
    } catch (err) {
      console.error('Banner upload error:', err);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload cover image.',
        variant: 'destructive',
      });
    } finally {
      setIsBannerUploading(false);
      if (bannerFileInputRef.current) bannerFileInputRef.current.value = '';
    }
  };



  const handleSavePost = useCallback(async () => {
    if (!title.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please enter a post title.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    isSubmitSavingRef.current = true;
    
    const payload = {
      title: title.trim(),
      summary: summary.trim() || undefined,
      content,
      banner: banner || undefined,
      slug: slug.trim() || undefined,
      tagIds: selectedTagIds,
      collectionIds: selectedCollectionIds,
      status,
    };

    try {
      if (editPostId) {
        await updatePostApi(editPostId, payload);
        toast({
          title: 'Post Updated',
          description: 'Your changes have been saved successfully.',
          variant: 'success',
        });
      } else {
        await createPostApi(payload);
        toast({
          title: 'Post Created',
          description: 'Your new post has been published.',
          variant: 'success',
        });
      }
      clearStoredDraft();
      navigate(backUrl);
    } catch (err: any) {
      console.error('Failed to save post:', err);
      isSubmitSavingRef.current = false;
      const errMsg = getErrorMessage(err, 'Could not save post. Please review inputs.');
      toast({
        title: 'Save Failed',
        description: errMsg,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    title,
    toast,
    summary,
    content,
    banner,
    slug,
    selectedTagIds,
    selectedCollectionIds,
    status,
    editPostId,
    clearStoredDraft,
    navigate,
    backUrl,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSavePost();
      }
      if (e.key === 'Escape') {
        setIsDistractionFree((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSavePost]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasEditorChanges() && !isSubmitSavingRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasEditorChanges]);

  const handleBack = () => {
    if (hasEditorChanges()) {
      setIsConfirmOpen(true);
    } else {
      navigate(backUrl);
    }
  };

  if (isLoading) {
    return <PostEditorSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[var(--background)] flex flex-col">
      <input
        type="file"
        ref={bannerFileInputRef}
        onChange={handleBannerFileChange}
        accept="image/*"
        className="hidden"
      />

            <EditorHeader
              isEditMode={!!editPostId}
              isSaving={isSaving}
              onBack={handleBack}
              onSave={handleSavePost}
            />

          <main className={`flex-1 max-w-6xl w-full mx-auto px-6 py-8 ${isDistractionFree ? 'pt-4 pb-12' : ''} dark:bg-[var(--background)]`}>
        {isDistractionFree && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
            <Button
              onClick={handleSavePost}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl px-4 py-2.5 shadow-xl flex items-center gap-1.5 cursor-pointer"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Save
                </>
              )}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <div className={`space-y-6 ${isDistractionFree ? 'lg:col-span-4 max-w-3xl mx-auto w-full' : 'lg:col-span-3'}`}>
            

            {!isDistractionFree && (
              <EditorBanner
                banner={banner}
                isBannerUploading={isBannerUploading}
                onUploadClick={handleBannerUploadClick}
                onRemove={() => setBanner('')}
              />
            )}

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Post title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full bg-transparent focus:outline-none font-extrabold text-[var(--color-foreground)] tracking-tight placeholder:text-[var(--color-muted-foreground)] transition-all ${
                  isDistractionFree ? 'text-3xl md:text-5xl mt-6' : 'text-2xl md:text-3xl border-b border-slate-200 pb-3 dark:border-slate-700'
                }`}
              />
            </div>

            <div className="bg-[var(--background)] rounded-2xl border border-slate-200 shadow-sm overflow-hidden dark:border-slate-700">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <label htmlFor="post-summary" className="text-sm font-bold text-slate-700 dark:text-[var(--color-foreground)]">
                  Summary
                </label>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-[var(--color-muted-foreground)]">
                  {summary.length}/{SUMMARY_MAX_LENGTH}
                </span>
              </div>
              <textarea
                id="post-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value.slice(0, SUMMARY_MAX_LENGTH))}
                maxLength={SUMMARY_MAX_LENGTH}
                placeholder="Write a short summary for this blog..."
                className="min-h-28 w-full resize-y bg-[var(--background)] px-4 py-3 text-sm leading-relaxed text-slate-700 dark:text-[var(--color-foreground)] placeholder:text-slate-300 dark:placeholder:text-[var(--color-muted-foreground)] focus:outline-none"
              />
            </div>

            {!isDistractionFree && lastAutoSavedAt && (
              <p className="text-xs font-medium text-slate-400">
                Draft autosaved at {new Date(lastAutoSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}

            <TipTapEditor
              content={content}
              onChange={setContent}
              isDistractionFree={isDistractionFree}
              onToggleDistractionFree={() => setIsDistractionFree(!isDistractionFree)}
            />
          </div>

          {!isDistractionFree && (
            <EditorSidebar
              collections={collections}
              tags={tags}
              selectedCollectionIds={selectedCollectionIds}
              selectedTagIds={selectedTagIds}
              onCollectionsChange={setSelectedCollectionIds}
              onTagsChange={setSelectedTagIds}
              slug={slug}
              onSlugChange={setSlug}
            />
          )}

        </div>
      </main>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to leave? Your edits will be lost."
        confirmText="Leave Page"
        cancelText="Stay Here"
        variant="warning"
        onConfirm={() => {
          setIsConfirmOpen(false);
          navigate(backUrl);
        }}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};
