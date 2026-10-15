import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronRight, 
  Calendar, 
  FileDown, 
  Image as ImageIcon, 
  Smile, 
  Hash, 
  AlignLeft,
  X
} from 'lucide-react';
import type { DocumentNode } from '../../types';

interface DocumentHeaderProps {
  doc: DocumentNode;
  breadcrumbPath: DocumentNode[];
  onSelectDoc: (id: string) => void;
  onUpdateTitle: (title: string) => void;
  onUpdateIcon: (icon: string) => void;
  onUpdateCover: (url: string | undefined) => void;
  onExportMarkdown: () => void;
}

const EMOJI_OPTIONS = [
  '📄', '🚀', '💡', '📝', '💻', '🗺️', '🎯', '⚡', '🛡️', '📦', '🔍', '🎨', '⚙️', '✨',
  '📚', '🔥', '📊', '🌐', '📌', '🏆', '🎉', '🌟', '🛠️', '🧭', '💼', '💡', '🏷️', '🔑'
];

const COVER_PRESETS = [
  'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
];

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  doc,
  breadcrumbPath,
  onSelectDoc,
  onUpdateTitle,
  onUpdateIcon,
  onUpdateCover,
  onExportMarkdown,
}) => {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);
  const [coverUrlInput, setCoverUrlInput] = useState('');
  const emojiRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);

  // Hitung perkiraan kata
  const totalWords = doc.blocks.reduce((acc, b) => {
    return acc + (b.content ? b.content.trim().split(/\s+/).filter(Boolean).length : 0);
  }, 0);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setIsEmojiPickerOpen(false);
      }
      if (coverRef.current && !coverRef.current.contains(e.target as Node)) {
        setIsCoverPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full relative">
      {/* Cover Banner (jika ada) */}
      {doc.coverImage ? (
        <div className="w-full h-44 sm:h-52 relative group overflow-hidden bg-neutral-200 dark:bg-neutral-800">
          <img
            src={doc.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
          <div className="absolute bottom-3 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => setIsCoverPickerOpen(!isCoverPickerOpen)}
              className="px-2.5 py-1 text-xs font-medium rounded bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-colors flex items-center gap-1.5"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Ganti Cover
            </button>
            <button
              type="button"
              onClick={() => onUpdateCover(undefined)}
              className="p-1 rounded bg-black/60 hover:bg-rose-600 text-white backdrop-blur-sm transition-colors"
              title="Hapus Cover"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="max-w-4xl mx-auto px-6 sm:px-12 pt-6 pb-2">
        {/* Breadcrumbs Navigation (Hirarki Berjenjang) */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-4 select-none">
          {breadcrumbPath.map((item, index) => {
            const isLast = index === breadcrumbPath.length - 1;
            return (
              <React.Fragment key={item.id}>
                {index > 0 && <ChevronRight className="w-3 h-3 text-neutral-400 dark:text-neutral-600 shrink-0" />}
                <button
                  type="button"
                  onClick={() => onSelectDoc(item.id)}
                  className={`inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors truncate max-w-[160px] ${
                    isLast ? 'font-semibold text-neutral-800 dark:text-neutral-200 pointer-events-none' : ''
                  }`}
                  title={item.title}
                >
                  <span className="text-xs">{item.icon}</span>
                  <span className="truncate">{item.title}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Action Header bar: Add icon / cover & Export */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            {!doc.coverImage && (
              <button
                type="button"
                onClick={() => setIsCoverPickerOpen(!isCoverPickerOpen)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Tambah Cover
              </button>
            )}
          </div>

          {/* Export to Markdown Button */}
          <button
            type="button"
            onClick={onExportMarkdown}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-xs"
            title="Download halaman ini sebagai file Markdown (.md)"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Export Markdown
          </button>
        </div>

        {/* Cover Picker Popover */}
        {isCoverPickerOpen && (
          <div
            ref={coverRef}
            className="mb-4 p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg z-20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">
                Pilih atau Masukkan URL Cover Banner:
              </span>
              <button
                type="button"
                onClick={() => setIsCoverPickerOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Presets */}
            <div className="grid grid-cols-5 gap-2 mb-3">
              {COVER_PRESETS.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Preset ${i}`}
                  className="w-full h-14 object-cover rounded-md cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                  onClick={() => {
                    onUpdateCover(url);
                    setIsCoverPickerOpen(false);
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={coverUrlInput}
                onChange={(e) => setCoverUrlInput(e.target.value)}
                className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (coverUrlInput.trim()) {
                    onUpdateCover(coverUrlInput.trim());
                    setCoverUrlInput('');
                    setIsCoverPickerOpen(false);
                  }
                }}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Terapkan
              </button>
            </div>
          </div>
        )}

        {/* Document Icon & Title Container */}
        <div className="relative mb-2">
          {/* Large Emoji Icon */}
          <div className="relative inline-block" ref={emojiRef}>
            <button
              type="button"
              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
              className="text-4xl sm:text-5xl leading-none block hover:scale-105 active:scale-95 transition-transform cursor-pointer mb-2 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/80"
              title="Klik untuk mengganti ikon dokumen"
            >
              {doc.icon || '📄'}
            </button>

            {/* Emoji Selector Popover */}
            {isEmojiPickerOpen && (
              <div className="absolute left-0 top-full mt-1 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl p-3 z-30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Pilih Emoji Ikon:
                  </span>
                  <Smile className="w-3.5 h-3.5 text-neutral-400" />
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:scale-110 transition-transform"
                      onClick={() => {
                        onUpdateIcon(emoji);
                        setIsEmojiPickerOpen(false);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Large Document Title (Auto-resizing input / textarea) */}
          <textarea
            value={doc.title}
            placeholder="Judul Dokumen..."
            rows={1}
            onChange={(e) => {
              onUpdateTitle(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            className="w-full text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-50 bg-transparent border-none outline-none resize-none placeholder-neutral-400 dark:placeholder-neutral-600 focus:ring-0 p-0 leading-tight"
            style={{ minHeight: '44px' }}
          />
        </div>

        {/* Document Metadata Bar */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-neutral-400 dark:text-neutral-500 pb-4 border-b border-neutral-200/80 dark:border-neutral-800">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            Diperbarui: {new Date(doc.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(doc.updatedAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1.5">
            <AlignLeft className="w-3 h-3" />
            {totalWords} kata
          </span>
          <span className="flex items-center gap-1.5">
            <Hash className="w-3 h-3" />
            {doc.blocks.length} blok konten
          </span>
        </div>
      </div>
    </div>
  );
};
