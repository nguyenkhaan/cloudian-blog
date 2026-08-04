export interface PostEditorDraft {
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
