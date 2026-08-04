import React, { useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/atom-one-dark-reasonable.css';
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
const MAX_FILE_SIZE = 1.2 * 1024 * 1024

const lowlight = createLowlight();

lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('python', python);
lowlight.register('css', css);
lowlight.register('html', html);

const CODE_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'css', label: 'CSS' },
  { value: 'html', label: 'HTML' },
] as const;

type CodeLanguage = typeof CODE_LANGUAGES[number]['value'];

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  content,
  onChange,
  isDistractionFree,
  onToggleDistractionFree
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>('javascript');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      ImageExtension,
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[300px] max-w-full px-6 py-4 text-[var(--color-foreground)] text-sm md:text-base leading-relaxed',
      },
      handleKeyDown: (_view, event) => {
        const isShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd';
        if (!isShortcut) return false;

        event.preventDefault();
        event.stopPropagation();

        if (editor.isActive('codeBlock')) {
          editor.chain().focus().exitCode().run();
        } else {
          editor.chain().focus().toggleCodeBlock().run();
        }

        return true;
      },
    },
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const handleLanguageChange = (lang: string) => {
    setCodeLanguage(lang as CodeLanguage);
    if (editor.isActive('codeBlock')) {
      editor.chain().focus().updateAttributes('codeBlock', { language: lang }).run();
    }
    setShowLanguageSelector(false);
  };

  const handleExitCodeBlock = () => {
    editor.chain().focus().exitCode().run();
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) 
    {
      alert(`File size must be less than ${MAX_FILE_SIZE}`)
      return 
    }
    console.log(MAX_FILE_SIZE)
    setIsUploading(true);
    try {
      const sigData = await getUploadSignatureApi();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', import.meta.env.VITE_CLOUDINARY_API_KEY);
      formData.append('timestamp', sigData.timestamp.toString());
      formData.append('signature', sigData.signature);
      formData.append('folder', sigData.folder);
      console.log({
        api_key: import.meta.env.VITE_CLOUDINARY_API_KEY,
        timestamp: sigData.timestamp,
        signature: sigData.signature,
        folder: sigData.folder,
      });
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
    <div className={`flex flex-col border border-slate-200 bg-white transition-all duration-300 dark:border-slate-700 dark:bg-black ${
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

      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap gap-1.5 items-center justify-between shrink-0 select-none dark:bg-black dark:border-slate-700">
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)"
            className={`p-1.5 rounded-lg transition-colors ${editor.isActive('bold') ? 'bg-black/10 dark:bg-white/10 text-[var(--color-primary)]' : 'text-[var(--color-foreground)] hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <Bold className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)"
            className={`p-1.5 rounded-lg transition-colors ${editor.isActive('italic') ? 'bg-black/10 dark:bg-white/10 text-[var(--color-primary)]' : 'text-[var(--color-foreground)] hover:bg-black/5 dark:hover:bg-white/5'}`}
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
            className={`p-1.5 rounded-lg transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-black/10 dark:bg-white/10 text-[var(--color-primary)]' : 'text-[var(--color-foreground)] hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <Heading1 className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
            className={`p-1.5 rounded-lg transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-black/10 dark:bg-white/10 text-[var(--color-primary)]' : 'text-[var(--color-foreground)] hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <Heading2 className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3"
            className={`p-1.5 rounded-lg transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-black/10 dark:bg-white/10 text-[var(--color-primary)]' : 'text-[var(--color-foreground)] hover:bg-black/5 dark:hover:bg-white/5'}`}
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
            className={`p-1.5 rounded-lg transition-colors ${editor.isActive('bulletList') ? 'bg-black/10 dark:bg-white/10 text-[var(--color-primary)]' : 'text-[var(--color-foreground)] hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <List className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
            className={`p-1.5 rounded-lg transition-colors ${editor.isActive('orderedList') ? 'bg-black/10 dark:bg-white/10 text-[var(--color-primary)]' : 'text-[var(--color-foreground)] hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <ListOrdered className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Blockquote"
            className={`p-1.5 rounded-lg transition-colors ${editor.isActive('blockquote') ? 'bg-black/10 dark:bg-white/10 text-[var(--color-primary)]' : 'text-[var(--color-foreground)] hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <Quote className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Code Block (Ctrl/Cmd + D)"
            className={`p-1.5 rounded-lg transition-colors ${editor.isActive('codeBlock') ? 'bg-black/10 dark:bg-white/10 text-[var(--color-primary)]' : 'text-[var(--color-foreground)] hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <Code className="w-4 h-4" />
          </Button>

          {editor && editor.isActive('codeBlock') && (
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                title="Select Language"
                className="p-1.5 rounded-lg transition-colors text-[var(--color-foreground)] hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold min-w-[60px]"
              >
                {CODE_LANGUAGES.find(l => l.value === codeLanguage)?.label || 'Code'}
              </Button>
              {showLanguageSelector && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-black border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 py-1 min-w-[120px]">
                  {CODE_LANGUAGES.map((lang) => (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => handleLanguageChange(lang.value)}
                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                        codeLanguage === lang.value
                          ? 'bg-black/10 dark:bg-white/10 text-[var(--color-primary)]'
                          : 'text-[var(--color-foreground)] hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {editor.isActive('codeBlock') && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleExitCodeBlock}
              title="Exit code block (Ctrl/Cmd + D)"
              className="p-1.5 rounded-lg transition-colors text-[var(--color-foreground)] hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold"
            >
              Normal
            </Button>
          )}

          <span className="h-4 w-px bg-slate-200 mx-1 dark:bg-slate-700"></span>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={isUploading ? undefined : handleImageUploadClick}
            disabled={isUploading}
            title="Insert Cloudinary Image"
            className="p-1.5 rounded-lg text-[var(--color-foreground)] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[var(--color-primary)]" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap gap-1.5 items-center justify-between shrink-0 select-none dark:bg-black dark:border-slate-700">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleDistractionFree}
            className="p-1.5 rounded-lg text-[var(--color-foreground)] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1.5 text-xs font-semibold"
          >
            {isDistractionFree ? (
              <>
                <Minimize2 className="w-4 h-4 text-[var(--color-primary)]" />
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
      </div>

      <div className={`flex-1 overflow-y-auto ${
        isDistractionFree 
          ? 'max-w-3xl mx-auto w-full mt-8 border border-slate-100 shadow-xl rounded-3xl p-6 md:p-8 bg-white dark:border-slate-700 dark:bg-black' 
          : 'border-t border-slate-200 dark:border-slate-700'
      }`}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
