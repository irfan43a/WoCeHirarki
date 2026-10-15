import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Copy, 
  Edit3, 
  MoreHorizontal
} from 'lucide-react';
import type { DocumentNode } from '../../types';

interface TreeNodeProps {
  node: DocumentNode;
  depth: number;
  activeDocId: string;
  expandedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onChangeIcon: (id: string, newIcon: string) => void;
}

const EMOJI_PRESETS = ['📄', '🚀', '📐', '💡', '📝', '💻', '🗺️', '🎯', '⚡', '🛡️', '📦', '🔍', '🎨', '⚙️', '✨'];

/**
 * RECURSIVE RENDERING COMPONENT
 * Komponen React yang memanggil dirinya sendiri untuk merender hierarki
 * pohon navigasi tanpa batasan kedalaman (infinite depth nesting).
 */
export const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  depth,
  activeDocId,
  expandedIds,
  onSelect,
  onToggleExpand,
  onAddChild,
  onDelete,
  onDuplicate,
  onRename,
  onChangeIcon,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node.title);
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isExpanded = expandedIds.has(node.id);
  const isActive = activeDocId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  useEffect(() => {
    setEditTitle(node.title);
  }, [node.title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle click outside menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setShowEmojiPicker(false);
      }
    }
    if (showMenu || showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu, showEmojiPicker]);

  const handleTitleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRename(node.id, editTitle.trim());
    } else {
      setEditTitle(node.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setEditTitle(node.title);
      setIsEditing(false);
    }
  };

  return (
    <div className="select-none text-sm group/node">
      {/* Node Row */}
      <div
        className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg cursor-pointer transition-all duration-150 relative group ${
          isActive
            ? 'bg-blue-50 text-blue-900 font-semibold dark:bg-blue-950/60 dark:text-blue-200'
            : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/60'
        }`}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        onClick={() => {
          onSelect(node.id);
        }}
      >
        {/* Expand / Collapse Chevron */}
        <button
          type="button"
          aria-label={isExpanded ? "Collapse" : "Expand"}
          className={`w-4 h-4 flex items-center justify-center rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700 transition-colors ${
            hasChildren ? 'opacity-80' : 'opacity-20 hover:opacity-40'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(node.id);
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
            )
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
          )}
        </button>

        {/* Node Icon / Emoji */}
        <button
          type="button"
          title="Ubah Ikon"
          className="text-base leading-none hover:scale-110 transition-transform px-0.5"
          onClick={(e) => {
            e.stopPropagation();
            setShowEmojiPicker(!showEmojiPicker);
            setShowMenu(false);
          }}
        >
          {node.icon || '📄'}
        </button>

        {/* Node Title or Inline Edit Input */}
        <div className="flex-1 truncate mr-1">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => handleTitleSubmit()}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white dark:bg-neutral-900 border border-blue-400 rounded px-1.5 py-0.5 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
            />
          ) : (
            <span
              className="truncate block"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              title={node.title}
            >
              {node.title || 'Tanpa Judul'}
            </span>
          )}
        </div>

        {/* Children Count Pill (if has sub-pages) */}
        {hasChildren && !isExpanded && (
          <span className="text-[10px] px-1.5 py-0.2 bg-neutral-200/70 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-full font-mono mr-1">
            {node.children.length}
          </span>
        )}

        {/* Action Buttons on Hover */}
        <div
          className={`flex items-center gap-0.5 transition-opacity ${
            showMenu || showEmojiPicker ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Add Sub-Page Button */}
          <button
            type="button"
            title="Tambah sub-halaman"
            className="p-1 rounded hover:bg-neutral-200/80 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100"
            onClick={() => {
              onAddChild(node.id);
            }}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* More Menu Toggle */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              title="Opsi Dokumen"
              className="p-1 rounded hover:bg-neutral-200/80 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100"
              onClick={() => {
                setShowMenu(!showMenu);
                setShowEmojiPicker(false);
              }}
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl py-1 z-30 text-xs">
                <button
                  type="button"
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  onClick={() => {
                    setShowMenu(false);
                    onAddChild(node.id);
                  }}
                >
                  <Plus className="w-3.5 h-3.5 text-blue-500" />
                  <span>Tambah Sub-Halaman</span>
                </button>
                <button
                  type="button"
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  onClick={() => {
                    setShowMenu(false);
                    setIsEditing(true);
                  }}
                >
                  <Edit3 className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Ubah Nama</span>
                </button>
                <button
                  type="button"
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  onClick={() => {
                    setShowMenu(false);
                    onDuplicate(node.id);
                  }}
                >
                  <Copy className="w-3.5 h-3.5 text-purple-500" />
                  <span>Duplikasi Halaman</span>
                </button>
                <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />
                <button
                  type="button"
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(node.id);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Halaman</span>
                </button>
              </div>
            )}

            {/* Emoji Quick Picker */}
            {showEmojiPicker && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl p-2 z-30">
                <div className="text-[10px] font-medium text-neutral-400 mb-1.5 px-1">Pilih Ikon Halaman:</div>
                <div className="grid grid-cols-5 gap-1">
                  {EMOJI_PRESETS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="w-7 h-7 flex items-center justify-center text-sm rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      onClick={() => {
                        onChangeIcon(node.id, emoji);
                        setShowEmojiPicker(false);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 
        RECURSIVE CALL:
        Komponen ini memanggil dirinya sendiri (<TreeNode />) untuk setiap elemen di dalam node.children.
        Kedalaman (depth) diteruskan dan ditambah 1 (depth + 1), memungkinkan hierarki tanpa batas.
      */}
      {isExpanded && hasChildren && (
        <div className="relative pl-2.5">
          {/* Vertical hierarchy guideline */}
          <div
            className="absolute left-3.5 top-0 bottom-2 w-px bg-neutral-200 dark:bg-neutral-800"
            style={{ left: `${depth * 14 + 14}px` }}
          />
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              activeDocId={activeDocId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              onAddChild={onAddChild}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onRename={onRename}
              onChangeIcon={onChangeIcon}
            />
          ))}
        </div>
      )}
    </div>
  );
};
