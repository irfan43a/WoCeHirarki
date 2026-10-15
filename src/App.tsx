import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  PanelLeft, 
  Search, 
  Code2, 
  Plus, 
  FileQuestion
} from 'lucide-react';
import type { DocumentNode, ContentBlock, BlockType } from './types';
import { 
  findNode, 
  findPath, 
  addNode, 
  updateNode, 
  deleteNode, 
  duplicateNode, 
  updateDocBlocks, 
  reorderBlocks 
} from './utils/treeOperations';
import { 
  loadWorkspace, 
  saveWorkspace, 
  loadActiveDocId, 
  saveActiveDocId, 
  loadSavedTheme, 
  saveTheme 
} from './utils/storage';
import { 
  exportWorkspaceToJson, 
  exportDocToMarkdown, 
  parseJsonWorkspace 
} from './utils/exportImport';
import { INITIAL_WORKSPACE_DATA } from './utils/initialData';
import { Sidebar } from './components/Sidebar/Sidebar';
import { DocumentHeader } from './components/Editor/DocumentHeader';
import { BlockList } from './components/Editor/BlockList';
import { SearchModal } from './components/Modals/SearchModal';
import { JsonInspectorModal } from './components/Modals/JsonInspectorModal';

export function App() {
  // 1. Core State (Nested JSON Tree)
  const [tree, setTree] = useState<DocumentNode[]>(() => loadWorkspace());
  const [activeDocId, setActiveDocId] = useState<string>(() => loadActiveDocId());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Initial expand of roots and demo
    const ids = new Set<string>();
    function collect(nodes: DocumentNode[]) {
      for (const n of nodes) {
        if (n.isExpanded) ids.add(n.id);
        if (n.children?.length) collect(n.children);
      }
    }
    collect(tree);
    return ids;
  });

  // UI state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadSavedTheme());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isJsonInspectorOpen, setIsJsonInspectorOpen] = useState(false);

  // Sync theme with document class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  // Save workspace changes immutably to localStorage
  useEffect(() => {
    saveWorkspace(tree);
  }, [tree]);

  // Save active document ID
  useEffect(() => {
    saveActiveDocId(activeDocId);
  }, [activeDocId]);

  // Global keyboard shortcuts (Ctrl+K / Cmd+K for search)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Active document resolution
  const activeDoc = useMemo(() => {
    if (!activeDocId) return tree[0] || null;
    const found = findNode(tree, activeDocId);
    if (!found && tree.length > 0) {
      return tree[0];
    }
    return found;
  }, [tree, activeDocId]);

  // Breadcrumb path from root to active document
  const breadcrumbPath = useMemo(() => {
    if (!activeDoc) return [];
    return findPath(tree, activeDoc.id) || [activeDoc];
  }, [tree, activeDoc]);

  // ==========================================
  // IMMUTABLE TREE DISPATCHERS
  // ==========================================

  const handleSelectDoc = useCallback((id: string) => {
    setActiveDocId(id);
  }, []);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    const all = new Set<string>();
    function collect(nodes: DocumentNode[]) {
      for (const n of nodes) {
        all.add(n.id);
        if (n.children?.length) collect(n.children);
      }
    }
    collect(tree);
    setExpandedIds(all);
  }, [tree]);

  const handleCollapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  // Add new Root Document
  const handleAddRootDoc = useCallback(() => {
    const newDocId = `doc_${Date.now()}`;
    const newDoc: DocumentNode = {
      id: newDocId,
      title: 'Halaman Baru',
      icon: '📄',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blocks: [
        {
          id: `block_${Date.now()}_1`,
          type: 'paragraph',
          content: '',
        },
      ],
      children: [],
    };

    setTree((prev) => addNode(prev, null, newDoc));
    setActiveDocId(newDocId);
  }, []);

  // Add new Child (Sub-page) without depth limit!
  const handleAddChildDoc = useCallback((parentId: string) => {
    const newDocId = `doc_${Date.now()}`;
    const newDoc: DocumentNode = {
      id: newDocId,
      title: 'Sub-Halaman Baru',
      icon: '📝',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blocks: [
        {
          id: `block_${Date.now()}_1`,
          type: 'paragraph',
          content: '',
        },
      ],
      children: [],
    };

    setTree((prev) => addNode(prev, parentId, newDoc));
    setExpandedIds((prev) => new Set(prev).add(parentId));
    setActiveDocId(newDocId);
  }, []);

  // Delete Document (and all its sub-tree recursively)
  const handleDeleteDoc = useCallback(
    (id: string) => {
      setTree((prev) => {
        const next = deleteNode(prev, id);
        if (activeDocId === id) {
          setActiveDocId(next[0]?.id || '');
        }
        return next;
      });
    },
    [activeDocId]
  );

  // Duplicate Document
  const handleDuplicateDoc = useCallback((id: string) => {
    setTree((prev) => duplicateNode(prev, id));
  }, []);

  // Rename Document
  const handleRenameDoc = useCallback((id: string, newTitle: string) => {
    setTree((prev) => updateNode(prev, id, { title: newTitle }));
  }, []);

  // Change Document Icon
  const handleChangeIcon = useCallback((id: string, newIcon: string) => {
    setTree((prev) => updateNode(prev, id, { icon: newIcon }));
  }, []);

  // Update Cover Image
  const handleUpdateCover = useCallback(
    (coverUrl: string | undefined) => {
      if (!activeDoc) return;
      setTree((prev) => updateNode(prev, activeDoc.id, { coverImage: coverUrl }));
    },
    [activeDoc]
  );

  // ==========================================
  // IMMUTABLE BLOCK DISPATCHERS
  // ==========================================

  // Update a single block's content/properties
  const handleUpdateBlock = useCallback(
    (blockId: string, updates: Partial<ContentBlock>) => {
      if (!activeDoc) return;
      setTree((prev) =>
        updateDocBlocks(prev, activeDoc.id, (blocks) =>
          blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b))
        )
      );
    },
    [activeDoc]
  );

  // Add block to active document
  const handleAddBlock = useCallback(
    (type: BlockType, afterBlockId?: string) => {
      if (!activeDoc) return;
      const newBlock: ContentBlock = {
        id: `block_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type,
        content: '',
        checked: false,
        icon: type === 'callout' ? '💡' : undefined,
        color: type === 'callout' ? 'blue' : undefined,
        language: type === 'code' ? 'typescript' : undefined,
      };

      setTree((prev) =>
        updateDocBlocks(prev, activeDoc.id, (blocks) => {
          if (!afterBlockId) {
            return [...blocks, newBlock];
          }
          const index = blocks.findIndex((b) => b.id === afterBlockId);
          if (index === -1) return [...blocks, newBlock];
          const next = [...blocks];
          next.splice(index + 1, 0, newBlock);
          return next;
        })
      );
    },
    [activeDoc]
  );

  // Delete block from active document
  const handleDeleteBlock = useCallback(
    (blockId: string) => {
      if (!activeDoc) return;
      setTree((prev) =>
        updateDocBlocks(prev, activeDoc.id, (blocks) => {
          const filtered = blocks.filter((b) => b.id !== blockId);
          // If empty, leave at least one empty paragraph block
          if (filtered.length === 0) {
            return [
              {
                id: `block_${Date.now()}`,
                type: 'paragraph',
                content: '',
              },
            ];
          }
          return filtered;
        })
      );
    },
    [activeDoc]
  );

  // Duplicate block in active document
  const handleDuplicateBlock = useCallback(
    (blockId: string) => {
      if (!activeDoc) return;
      setTree((prev) =>
        updateDocBlocks(prev, activeDoc.id, (blocks) => {
          const index = blocks.findIndex((b) => b.id === blockId);
          if (index === -1) return blocks;
          const orig = blocks[index];
          const cloned: ContentBlock = {
            ...orig,
            id: `block_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          };
          const next = [...blocks];
          next.splice(index + 1, 0, cloned);
          return next;
        })
      );
    },
    [activeDoc]
  );

  // Change block type in active document
  const handleChangeBlockType = useCallback(
    (blockId: string, newType: BlockType) => {
      if (!activeDoc) return;
      setTree((prev) =>
        updateDocBlocks(prev, activeDoc.id, (blocks) =>
          blocks.map((b) => {
            if (b.id !== blockId) return b;
            return {
              ...b,
              type: newType,
              icon: newType === 'callout' ? (b.icon || '💡') : undefined,
              color: newType === 'callout' ? (b.color || 'blue') : undefined,
              language: newType === 'code' ? (b.language || 'typescript') : undefined,
            };
          })
        )
      );
    },
    [activeDoc]
  );

  // Reorder blocks via @dnd-kit drag-and-drop (immutably)
  const handleReorderBlocks = useCallback(
    (activeId: string, overId: string) => {
      if (!activeDoc) return;
      setTree((prev) =>
        updateDocBlocks(prev, activeDoc.id, (blocks) =>
          reorderBlocks(blocks, activeId, overId)
        )
      );
    },
    [activeDoc]
  );

  // ==========================================
  // EXPORT / IMPORT / DEMO DISPATCHERS
  // ==========================================

  const handleExportJson = useCallback(() => {
    exportWorkspaceToJson(tree);
  }, [tree]);

  const handleImportJson = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const parsed = parseJsonWorkspace(content);
          if (parsed) {
            setTree(parsed);
            if (parsed[0]) {
              setActiveDocId(parsed[0].id);
            }
          } else {
            alert('Format file JSON tidak valid!');
          }
        };
        reader.readAsText(file);
      }
    },
    []
  );

  const handleExportMarkdown = useCallback(() => {
    if (activeDoc) {
      exportDocToMarkdown(activeDoc);
    }
  }, [activeDoc]);

  const handleResetDemo = useCallback(() => {
    if (window.confirm('Reset seluruh workspace ke data demo awal?')) {
      setTree(INITIAL_WORKSPACE_DATA);
      setActiveDocId(INITIAL_WORKSPACE_DATA[0].id);
      const all = new Set<string>();
      INITIAL_WORKSPACE_DATA.forEach((n) => all.add(n.id));
      setExpandedIds(all);
    }
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        tree={tree}
        activeDocId={activeDoc?.id || ''}
        expandedIds={expandedIds}
        isOpen={isSidebarOpen}
        theme={theme}
        onToggleSidebar={() => setIsSidebarOpen(false)}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onSelectDoc={handleSelectDoc}
        onToggleExpand={handleToggleExpand}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
        onAddRootDoc={handleAddRootDoc}
        onAddChildDoc={handleAddChildDoc}
        onDeleteDoc={handleDeleteDoc}
        onDuplicateDoc={handleDuplicateDoc}
        onRenameDoc={handleRenameDoc}
        onChangeIcon={handleChangeIcon}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenJsonInspector={() => setIsJsonInspectorOpen(true)}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onResetDemo={handleResetDemo}
      />

      {/* Main Workspace / Document Area */}
      <main className="flex-1 h-full flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Floating App Bar */}
        <header className="h-12 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between px-4 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-2">
            {!isSidebarOpen && (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
                title="Buka Navigasi Sidebar"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            {/* Current Active Doc Quick Title */}
            {activeDoc && (
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5 truncate max-w-[240px]">
                <span>{activeDoc.icon}</span>
                <span className="truncate">{activeDoc.title}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Search Shortcut */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cari</span>
            </button>

            {/* Quick JSON Tree Inspector */}
            <button
              type="button"
              onClick={() => setIsJsonInspectorOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors font-medium"
              title="Periksa Struktur Pohon JSON Bersarang"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pohon JSON</span>
            </button>
          </div>
        </header>

        {/* Document Editor Scrollable Canvas */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {activeDoc ? (
            <div className="pb-32">
              {/* Document Header (Cover, Icon, Title, Breadcrumbs, Meta) */}
              <DocumentHeader
                doc={activeDoc}
                breadcrumbPath={breadcrumbPath}
                onSelectDoc={handleSelectDoc}
                onUpdateTitle={(title) => handleRenameDoc(activeDoc.id, title)}
                onUpdateIcon={(icon) => handleChangeIcon(activeDoc.id, icon)}
                onUpdateCover={handleUpdateCover}
                onExportMarkdown={handleExportMarkdown}
              />

              {/* Drag-and-Drop Sortable Block List */}
              <BlockList
                blocks={activeDoc.blocks}
                onUpdateBlock={handleUpdateBlock}
                onAddBlock={handleAddBlock}
                onDeleteBlock={handleDeleteBlock}
                onDuplicateBlock={handleDuplicateBlock}
                onChangeBlockType={handleChangeBlockType}
                onReorderBlocks={handleReorderBlocks}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-neutral-400">
              <FileQuestion className="w-12 h-12 mb-3 stroke-[1.5]" />
              <h3 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Tidak ada dokumen yang dipilih
              </h3>
              <p className="text-xs mb-4">
                Pilih salah satu halaman dari sidebar atau buat halaman baru untuk mulai mencatat.
              </p>
              <button
                type="button"
                onClick={handleAddRootDoc}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Buat Halaman Utama Baru
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        tree={tree}
        onSelectDoc={handleSelectDoc}
      />

      <JsonInspectorModal
        isOpen={isJsonInspectorOpen}
        onClose={() => setIsJsonInspectorOpen(false)}
        tree={tree}
      />
    </div>
  );
}

export default App;
