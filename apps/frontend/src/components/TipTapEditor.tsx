import React, { useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import axios from 'axios';
import { getUploadSignatureApi } from '../api/post';
import { Button } from './ui/button';
import { useToast } from '../hooks/useToast';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Maximize2,
  Minimize2,
  Loader2
} from 'lucide-react';

interface TipTapEditorProps {
  content: string;
  onChange: (htmlContent: string) => void;
  isDistractionFree: boolean;
  onToggleDistractionFree: () => void;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  content,
  onChange,
  isDistractionFree,
  onToggleDistractionFree
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      ImageExtension,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[300px] max-w-full px-6 py-4 text-slate-800 text-sm md:text-base leading-relaxed',
      },
    },
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
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

      const uploadedUrl = response.data.secure_url;
      editor.chain().focus().setImage({ src: uploadedUrl }).run();
    } catch (err) {
      console.error('Cloudinary image upload error:', err);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload image to Cloudinary. Please review your settings.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex flex-col border border-slate-200 bg-white transition-all duration-300 ${
      isDistractionFree 
        ? 'fixed inset-0 z-50 rounded-none h-screen w-screen p-6 md:p-12 max-w-full'
        : 'rounded-2xl shadow-sm overflow-hidden'
    }`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap gap-1.5 items-center justify-between shrink-0 select-none">
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)"
            className={`p-1.5 rounded-lg transition-colors ${editor.isActive('bold') ? 'bg-slate-200 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Bold className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)"
            className={`p-1.5 rounded-lg transition-colors ${editor.isActive('italic') ? 'bg-slate-200 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Italic className="w-4 h-4" />
          </Button>

          <span className="h-4 w-px bg-slate-200 mx-1"></span>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1"
            className={`p-1.5 rounded-lg transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Heading1 className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
            className={`p-1.5 rounded-lg transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Heading2 className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3"
            className={`p-1.5 rounded-lg transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-200 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Heading3 className="w-4 h-4" />
          </Button>

          <span className="h-4 w-px bg-slate-200 mx-1"></span>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
            className={`p-1.5 rounded-lg transition-colors ${editor.isActive('bulletList') ? 'bg-slate-200 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <List className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
            className={`p-1.5 rounded-lg transition-colors ${editor.isActive('orderedList') ? 'bg-slate-200 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <ListOrdered className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Blockquote"
            className={`p-1.5 rounded-lg transition-colors ${editor.isActive('blockquote') ? 'bg-slate-200 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Quote className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Code Block"
            className={`p-1.5 rounded-lg transition-colors ${editor.isActive('codeBlock') ? 'bg-slate-200 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Code className="w-4 h-4" />
          </Button>

          <span className="h-4 w-px bg-slate-200 mx-1"></span>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={isUploading ? undefined : handleImageUploadClick}
            disabled={isUploading}
            title="Insert Cloudinary Image"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggleDistractionFree}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center gap-1.5 text-xs font-semibold"
        >
          {isDistractionFree ? (
            <>
              <Minimize2 className="w-4 h-4 text-blue-600" />
              <span>Normal Mode</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4" />
              <span>Distraction Free</span>
            </>
          )}
        </Button>
      </div>

      <div className={`flex-1 overflow-y-auto ${
        isDistractionFree 
          ? 'max-w-3xl mx-auto w-full mt-8 border border-slate-100 shadow-xl rounded-3xl p-6 md:p-8 bg-white' 
          : 'border-t border-slate-200'
      }`}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
