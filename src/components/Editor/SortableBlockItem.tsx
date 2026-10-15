import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  Copy, 
  Type, 
  Heading1, 
  Heading2, 
  CheckSquare, 
  Image as ImageIcon, 
  Code, 
  AlertCircle, 
  Quote 
} from 'lucide-react';
import type { ContentBlock, BlockType } from '../../types';
import { BlockItem } from './BlockItem';

interface SortableBlockItemProps {
  block: ContentBlock;
  index: number;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  onEnter: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onChangeType: (type: BlockType) => void;
  onInsertBelow: () => void;
  onOpenSlashMenu: (triggerRect: DOMRect) => void;
}

export const SortableBlockItem: React.FC<SortableBlockItemProps> = ({
  block,
  index,
  onUpdate,
  onEnter,
  onDelete,
  onDuplicate,
  onChangeType,
  onInsertBelow,
  onOpenSlashMenu,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // dnd-kit sortable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 40 : 1,
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group/block relative flex items-start gap-1 py-1 my-0.5 rounded-lg transition-colors"
    >
      {/* 
        DRAG HANDLE & ACTION CONTROLS (Left gutter)
        Muncul secara halus saat kursor mengarah ke blok (hover).
      */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover/block:opacity-100 transition-opacity select-none pt-1 shrink-0 -ml-14 sm:-ml-12 w-12 sm:w-10 justify-end">
        {/* Insert block below (+) button */}
        <button
          type="button"
          title="Tambah blok di bawah"
          onClick={onInsertBelow}
          className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {/* Drag handle (Grip icon with dnd-kit listeners) */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            {...attributes}
            {...listeners}
            onClick={(e) => {
              // Jika diklik biasa (bukan drag), buka opsi menu
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded cursor-grab active:cursor-grabbing hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            title="Tahan & geser untuk memindahkan blok, atau klik untuk opsi"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>

          {/* Block Action Options Popup */}
          {showMenu && (
            <div className="absolute left-full top-0 ml-1 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl py-1.5 z-50 text-xs">
              <div className="px-3 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                Ubah Tipe Blok
              </div>
              <div className="grid grid-cols-4 gap-1 px-2 py-1 border-b border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  title="Paragraf"
                  onClick={() => {
                    onChangeType('paragraph');
                    setShowMenu(false);
                  }}
                  className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 flex justify-center text-neutral-600 dark:text-neutral-300"
                >
                  <Type className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Heading 1"
                  onClick={() => {
                    onChangeType('h1');
                    setShowMenu(false);
                  }}
                  className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 flex justify-center text-blue-500"
                >
                  <Heading1 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Heading 2"
                  onClick={() => {
                    onChangeType('h2');
                    setShowMenu(false);
                  }}
                  className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 flex justify-center text-indigo-500"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="To-Do"
                  onClick={() => {
                    onChangeType('todo');
                    setShowMenu(false);
                  }}
                  className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 flex justify-center text-emerald-500"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Gambar"
                  onClick={() => {
                    onChangeType('image');
                    setShowMenu(false);
                  }}
                  className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 flex justify-center text-purple-500"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Kode"
                  onClick={() => {
                    onChangeType('code');
                    setShowMenu(false);
                  }}
                  className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 flex justify-center text-pink-500"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Callout"
                  onClick={() => {
                    onChangeType('callout');
                    setShowMenu(false);
                  }}
                  className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 flex justify-center text-teal-500"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Kutipan"
                  onClick={() => {
                    onChangeType('quote');
                    setShowMenu(false);
                  }}
                  className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 flex justify-center text-neutral-500"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onDuplicate();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                >
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Duplikasi Blok</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Blok</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actual Content Block Renderer */}
      <div className="flex-1 min-w-0">
        <BlockItem
          block={block}
          index={index}
          onUpdate={onUpdate}
          onEnter={onEnter}
          onDeleteEmpty={onDelete}
          onOpenSlashMenu={onOpenSlashMenu}
        />
      </div>
    </div>
  );
};
