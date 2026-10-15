import React, { useRef, useEffect, useState } from 'react';
import { 
  Check, 
  Copy, 
  CheckCheck, 
  Upload, 
  Palette
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ContentBlock } from '../../types';

interface BlockItemProps {
  block: ContentBlock;
  index: number;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  onEnter: () => void;
  onDeleteEmpty: () => void;
  onOpenSlashMenu: (triggerRect: DOMRect) => void;
}

const CALLOUT_COLORS = {
  blue: 'bg-blue-50/70 border-blue-200 text-blue-900 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-200',
  amber: 'bg-amber-50/70 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200',
  emerald: 'bg-emerald-50/70 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200',
  purple: 'bg-purple-50/70 border-purple-200 text-purple-900 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-200',
  rose: 'bg-rose-50/70 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200',
  gray: 'bg-neutral-100/70 border-neutral-200 text-neutral-900 dark:bg-neutral-800/50 dark:border-neutral-700 dark:text-neutral-200',
};

const CALLOUT_EMOJIS = ['💡', '📌', '⚠️', '🚀', '🎯', '⚡', 'ℹ️', '🔥', '🛡️', '💬'];

const CODE_LANGUAGES = ['typescript', 'javascript', 'python', 'sql', 'html', 'css', 'json', 'bash'];

export const BlockItem: React.FC<BlockItemProps> = ({
  block,
  index,
  onUpdate,
  onEnter,
  onDeleteEmpty,
  onOpenSlashMenu,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCalloutColorPicker, setShowCalloutColorPicker] = useState(false);
  const [showCalloutEmojiPicker, setShowCalloutEmojiPicker] = useState(false);
  const [imageInputMode, setImageInputMode] = useState(!block.content);

  // Auto-resize textarea
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [block.content]);

  // Handle keyboard events (Enter for new block, Backspace on empty to delete)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // In code blocks, Enter is a newline!
      if (block.type === 'code') return;

      e.preventDefault();
      onEnter();
    } else if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      onDeleteEmpty();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onUpdate({ content: val });

    // Open slash menu if user types '/'
    if (val === '/' && textareaRef.current) {
      const rect = textareaRef.current.getBoundingClientRect();
      onOpenSlashMenu(rect);
    }
  };

  // Image upload handler (converts to base64 DataURL for offline persistence)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdate({
            content: event.target.result as string,
            caption: block.caption || file.name,
          });
          setImageInputMode(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Copy code snippet
  const handleCopyCode = () => {
    navigator.clipboard.writeText(block.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Toggle To-do item with confetti when completed
  const handleTodoToggle = () => {
    const nextState = !block.checked;
    onUpdate({ checked: nextState });

    if (nextState) {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  // Render by Block Type
  switch (block.type) {
    case 'h1':
      return (
        <textarea
          ref={textareaRef}
          value={block.content}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Heading 1..."
          rows={1}
          className="w-full text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 bg-transparent resize-none outline-none focus:ring-0 p-0 leading-snug"
        />
      );

    case 'h2':
      return (
        <textarea
          ref={textareaRef}
          value={block.content}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Heading 2..."
          rows={1}
          className="w-full text-xl sm:text-2xl font-semibold text-neutral-800 dark:text-neutral-200 bg-transparent resize-none outline-none focus:ring-0 p-0 leading-snug"
        />
      );

    case 'h3':
      return (
        <textarea
          ref={textareaRef}
          value={block.content}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Heading 3..."
          rows={1}
          className="w-full text-lg sm:text-xl font-medium text-neutral-800 dark:text-neutral-200 bg-transparent resize-none outline-none focus:ring-0 p-0 leading-snug"
        />
      );

    case 'todo':
      return (
        <div className="flex items-start gap-2.5 w-full">
          <button
            type="button"
            onClick={handleTodoToggle}
            className={`mt-1 w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
              block.checked
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-neutral-400 hover:border-blue-500 bg-white dark:bg-neutral-800'
            }`}
          >
            {block.checked && <Check className="w-3 h-3 stroke-[3]" />}
          </button>
          <textarea
            ref={textareaRef}
            value={block.content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Daftar tugas (To-Do)..."
            rows={1}
            className={`flex-1 text-sm bg-transparent resize-none outline-none focus:ring-0 p-0 leading-relaxed transition-all ${
              block.checked
                ? 'line-through text-neutral-400 dark:text-neutral-500'
                : 'text-neutral-800 dark:text-neutral-200'
            }`}
          />
        </div>
      );

    case 'bullet':
      return (
        <div className="flex items-start gap-2.5 w-full">
          <div className="mt-2 w-1.5 h-1.5 rounded-full bg-neutral-600 dark:bg-neutral-400 shrink-0" />
          <textarea
            ref={textareaRef}
            value={block.content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Poin butir..."
            rows={1}
            className="flex-1 text-sm text-neutral-800 dark:text-neutral-200 bg-transparent resize-none outline-none focus:ring-0 p-0 leading-relaxed"
          />
        </div>
      );

    case 'numbered':
      return (
        <div className="flex items-start gap-2.5 w-full">
          <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 shrink-0 w-4 text-right">
            {index + 1}.
          </span>
          <textarea
            ref={textareaRef}
            value={block.content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Daftar nomor..."
            rows={1}
            className="flex-1 text-sm text-neutral-800 dark:text-neutral-200 bg-transparent resize-none outline-none focus:ring-0 p-0 leading-relaxed"
          />
        </div>
      );

    case 'quote':
      return (
        <div className="border-l-3 border-neutral-400 dark:border-neutral-600 pl-3.5 italic w-full">
          <textarea
            ref={textareaRef}
            value={block.content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Tulis kutipan..."
            rows={1}
            className="w-full text-sm text-neutral-700 dark:text-neutral-300 bg-transparent resize-none outline-none focus:ring-0 p-0 leading-relaxed"
          />
        </div>
      );

    case 'callout': {
      const colorClass =
        CALLOUT_COLORS[block.color || 'blue'] || CALLOUT_COLORS.blue;
      return (
        <div
          className={`w-full p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${colorClass}`}
        >
          {/* Callout Icon & Picker */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowCalloutEmojiPicker(!showCalloutEmojiPicker)}
              className="text-xl leading-none hover:scale-110 transition-transform"
              title="Ganti Emoji Callout"
            >
              {block.icon || '💡'}
            </button>

            {showCalloutEmojiPicker && (
              <div className="absolute left-0 top-full mt-1 p-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl grid grid-cols-5 gap-1 z-30">
                {CALLOUT_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="w-7 h-7 flex items-center justify-center text-sm rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    onClick={() => {
                      onUpdate({ icon: emoji });
                      setShowCalloutEmojiPicker(false);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={block.content}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Catatan khusus atau highlight penting..."
              rows={1}
              className="w-full text-sm bg-transparent resize-none outline-none focus:ring-0 p-0 leading-relaxed"
            />
          </div>

          {/* Color Selector */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowCalloutColorPicker(!showCalloutColorPicker)}
              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-neutral-500 transition-colors"
              title="Ganti Warna Latar"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
            {showCalloutColorPicker && (
              <div className="absolute right-0 top-full mt-1 p-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl flex gap-1 z-30">
                {(Object.keys(CALLOUT_COLORS) as (keyof typeof CALLOUT_COLORS)[]).map((col) => (
                  <button
                    key={col}
                    type="button"
                    className={`w-4 h-4 rounded-full border border-black/20 ${
                      col === 'blue'
                        ? 'bg-blue-400'
                        : col === 'amber'
                        ? 'bg-amber-400'
                        : col === 'emerald'
                        ? 'bg-emerald-400'
                        : col === 'purple'
                        ? 'bg-purple-400'
                        : col === 'rose'
                        ? 'bg-rose-400'
                        : 'bg-neutral-400'
                    }`}
                    onClick={() => {
                      onUpdate({ color: col });
                      setShowCalloutColorPicker(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'code':
      return (
        <div className="w-full rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 text-neutral-100 shadow-md">
          {/* Code Header Bar */}
          <div className="px-3 py-1.5 bg-neutral-950/80 border-b border-neutral-800 flex items-center justify-between text-xs">
            {/* Language Selector */}
            <select
              value={block.language || 'typescript'}
              onChange={(e) => onUpdate({ language: e.target.value })}
              className="bg-neutral-800 text-neutral-300 rounded px-2 py-0.5 border border-neutral-700 outline-none text-[11px]"
            >
              {CODE_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white px-2 py-0.5 rounded hover:bg-neutral-800 transition-colors"
            >
              {copiedCode ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>

          {/* Code Textarea */}
          <div className="p-3">
            <textarea
              ref={textareaRef}
              value={block.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="// Tulis kode di sini..."
              rows={2}
              className="w-full font-mono text-xs sm:text-sm bg-transparent resize-none outline-none focus:ring-0 p-0 text-emerald-300 leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>
      );

    case 'image':
      return (
        <div className="w-full rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-2 sm:p-3">
          {block.content && !imageInputMode ? (
            <div className="space-y-2 group/img">
              <div className="relative rounded-lg overflow-hidden max-h-[480px] bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <img
                  src={block.content}
                  alt={block.caption || 'Gambar'}
                  className="w-full h-auto max-h-[480px] object-contain rounded-lg"
                  onError={() => setImageInputMode(true)}
                />
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => setImageInputMode(true)}
                    className="px-2 py-1 text-[11px] font-medium rounded bg-black/70 hover:bg-black/90 text-white backdrop-blur-xs transition-colors"
                  >
                    Ganti URL
                  </button>
                </div>
              </div>

              {/* Caption input */}
              <input
                type="text"
                value={block.caption || ''}
                onChange={(e) => onUpdate({ caption: e.target.value })}
                placeholder="Tulis takarir (caption) gambar..."
                className="w-full text-center text-xs text-neutral-500 dark:text-neutral-400 bg-transparent border-none outline-none italic placeholder:text-neutral-400"
              />
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <div className="flex items-center justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300">
                <span>Sematkan Gambar / Media</span>
                {block.content && (
                  <button
                    type="button"
                    onClick={() => setImageInputMode(false)}
                    className="text-blue-500 hover:underline text-[11px]"
                  >
                    Batal
                  </button>
                )}
              </div>

              {/* URL Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={block.content}
                  onChange={(e) => onUpdate({ content: e.target.value })}
                  placeholder="Masukkan link gambar (https://...)"
                  className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setImageInputMode(false)}
                  disabled={!block.content}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Terapkan
                </button>
              </div>

              {/* Or Local File Upload */}
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  Unggah File dari Komputer
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-neutral-400">
                  (Otomatis disimpan secara offline)
                </span>
              </div>
            </div>
          )}
        </div>
      );

    case 'divider':
      return (
        <div className="w-full py-2 flex items-center">
          <hr className="w-full border-t border-neutral-200 dark:border-neutral-800" />
        </div>
      );

    case 'paragraph':
    default:
      return (
        <textarea
          ref={textareaRef}
          value={block.content}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Ketik teks atau '/' untuk memilih jenis blok..."
          rows={1}
          className="w-full text-sm sm:text-base text-neutral-800 dark:text-neutral-200 bg-transparent resize-none outline-none focus:ring-0 p-0 leading-relaxed placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
        />
      );
  }
};
