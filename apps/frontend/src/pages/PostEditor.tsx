import React, { useEffect, useState, useRef } from 'react';
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
import axios from 'axios';
import { Save, Loader2 } from 'lucide-react';
const MAX_FILE_SIZE = 1.2 * 1024 * 1024
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
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  
  const initialTitleRef = useRef('');
  const initialContentRef = useRef('');
  const isSubmitSavingRef = useRef(false);

  useEffect(() => {
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
      if (!editPostId) return;
      setIsLoading(true);
      try {
        const post = await getPostDetailApi(editPostId.toString());
        setTitle(post.title);
        setSlug(post.slug);
        setBanner(post.banner || '');
        setContent(post.content);
        setStatus(post.status === 'published' ? 'published' : 'draft');
        
        initialTitleRef.current = post.title;
        initialContentRef.current = post.content;

        const safeCollections = Array.isArray(post.collections) ? post.collections : [];
        const safeTags = Array.isArray(post.tags) ? post.tags : [];

        if (safeCollections.length > 0) {
          setSelectedCollectionIds(safeCollections.map((c) => c.id));
        }
        if (safeTags.length > 0) {
          setSelectedTagIds(safeTags.map((t) => t.id));
        }
      } catch (err) {
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

    loadCatalogs().then(loadPostData);
  }, [editPostId, navigate, backUrl]);

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



  const handleSavePost = async () => {
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
      navigate(backUrl);
    } catch (err: any) {
      console.error('Failed to save post:', err);
      isSubmitSavingRef.current = false;
      const errMsg = err.response?.data?.message || 'Could not save post. Please review inputs.';
      toast({
        title: 'Save Failed',
        description: errMsg,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

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
  }, [title, content, banner, slug, selectedCollectionIds, selectedTagIds, editPostId]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasChanges =
        title.trim() !== initialTitleRef.current ||
        content.trim() !== initialContentRef.current;

      if (hasChanges && !isSubmitSavingRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [title, content]);

  const handleBack = () => {
    const hasChanges =
      title.trim() !== initialTitleRef.current ||
      content.trim() !== initialContentRef.current;

    if (hasChanges) {
      setIsConfirmOpen(true);
    } else {
      navigate(backUrl);
    }
  };

  if (isLoading) {
    return <PostEditorSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <input
        type="file"
        ref={bannerFileInputRef}
        onChange={handleBannerFileChange}
        accept="image/*"
        className="hidden"
      />

      {!isDistractionFree && (
        <EditorHeader
          isEditMode={!!editPostId}
          isSaving={isSaving}
          onBack={handleBack}
          onSave={handleSavePost}
        />
      )}

      <main className={`flex-1 max-w-6xl w-full mx-auto px-6 py-8 ${isDistractionFree ? 'pt-4 pb-12' : ''}`}>
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
            
            {/* Banner preview area matching PostDetail.tsx size */}
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
                className={`w-full bg-transparent focus:outline-none font-extrabold text-slate-800 tracking-tight placeholder:text-slate-200 transition-all ${
                  isDistractionFree ? 'text-3xl md:text-5xl mt-6' : 'text-2xl md:text-3xl border-b border-slate-200 pb-3'
                }`}
              />
            </div>

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
