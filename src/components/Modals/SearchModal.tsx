import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight, X, CornerDownLeft } from 'lucide-react';
import type { DocumentNode, TreeSearchMatch } from '../../types';
import { searchTree } from '../../utils/treeOperations';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tree: DocumentNode[];
  onSelectDoc: (id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  tree,
  onSelectDoc,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results: TreeSearchMatch[] = query.trim() ? searchTree(tree, query) : [];

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (results.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? Math.max(0, results.length - 1) : prev - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          onSelectDoc(results[selectedIndex].doc.id);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onSelectDoc, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik untuk mencari dokumen atau isi paragraf..."
            className="w-full bg-transparent text-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-1.5 py-0.5 text-neutral-500 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="py-10 text-center text-xs text-neutral-400 dark:text-neutral-500">
              Cari halaman, dokumen bersarang, atau blok teks di seluruh workspace.
            </div>
          ) : results.length === 0 ? (
            <div className="py-10 text-center text-xs text-neutral-400 dark:text-neutral-500">
              Tidak ada hasil yang cocok dengan &quot;{query}&quot;
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((match, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={match.doc.id}
                    onClick={() => {
                      onSelectDoc(match.doc.id);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`p-2.5 rounded-xl cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/60 border border-transparent'
                    }`}
                  >
                    {/* Breadcrumb Path */}
                    <div className="flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500 mb-1 truncate">
                      {match.path.map((p, i) => (
                        <React.Fragment key={p.id}>
                          {i > 0 && <ChevronRight className="w-3 h-3 shrink-0" />}
                          <span className="truncate">{p.title}</span>
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Doc Title */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-medium text-sm text-neutral-800 dark:text-neutral-200 truncate">
                        <span>{match.doc.icon}</span>
                        <span className="truncate">{match.doc.title}</span>
                      </div>
                      {isSelected && (
                        <span className="hidden sm:flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400">
                          <CornerDownLeft className="w-3 h-3" /> Buka
                        </span>
                      )}
                    </div>

                    {/* Matching Block Snippet */}
                    {match.matchedBlocks.length > 0 && (
                      <div className="mt-1.5 pl-6 text-xs text-neutral-500 dark:text-neutral-400 italic line-clamp-1">
                        &quot;{match.matchedBlocks[0].content}&quot;
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
