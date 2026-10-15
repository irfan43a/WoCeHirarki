import React from 'react';
import { 
  FolderTree, 
  Plus, 
  Search, 
  Code2, 
  Sun, 
  Moon, 
  Download, 
  Upload, 
  RotateCcw, 
  PanelLeftClose, 
  Layers 
} from 'lucide-react';
import type { DocumentNode } from '../../types';
import { TreeNode } from './TreeNode';
import { countTotalNodes } from '../../utils/treeOperations';

interface SidebarProps {
  tree: DocumentNode[];
  activeDocId: string;
  expandedIds: Set<string>;
  isOpen: boolean;
  theme: 'light' | 'dark';
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onSelectDoc: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onAddRootDoc: () => void;
  onAddChildDoc: (parentId: string) => void;
  onDeleteDoc: (id: string) => void;
  onDuplicateDoc: (id: string) => void;
  onRenameDoc: (id: string, newTitle: string) => void;
  onChangeIcon: (id: string, newIcon: string) => void;
  onOpenSearch: () => void;
  onOpenJsonInspector: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetDemo: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  tree,
  activeDocId,
  expandedIds,
  isOpen,
  theme,
  onToggleSidebar,
  onToggleTheme,
  onSelectDoc,
  onToggleExpand,
  onExpandAll,
  onCollapseAll,
  onAddRootDoc,
  onAddChildDoc,
  onDeleteDoc,
  onDuplicateDoc,
  onRenameDoc,
  onChangeIcon,
  onOpenSearch,
  onOpenJsonInspector,
  onExportJson,
  onImportJson,
  onResetDemo,
}) => {
  const totalCount = countTotalNodes(tree);

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="w-72 md:w-80 h-full flex flex-col bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-all select-none">
      {/* Workspace Header */}
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-sm font-bold text-sm">
            <FolderTree className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-semibold text-sm text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5">
              Workspace
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                Hierarki
              </span>
            </h1>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {totalCount} Halaman bersarang
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          <button
            type="button"
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            onClick={onToggleTheme}
            className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Close Sidebar Toggle */}
          <button
            type="button"
            title="Tutup Sidebar"
            onClick={onToggleSidebar}
            className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="p-2 space-y-1">
        {/* Search button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-800/80 transition-colors group"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-blue-500" />
            Cari Dokumen...
          </span>
          <kbd className="text-[10px] bg-neutral-200/80 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 font-mono">
            Ctrl+K
          </kbd>
        </button>

        {/* Inspect JSON Structure */}
        <button
          type="button"
          onClick={onOpenJsonInspector}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-800/80 transition-colors group"
        >
          <span className="flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5 text-purple-500" />
            Inspeksi Pohon JSON
          </span>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">
            Immutable
          </span>
        </button>
      </div>

      {/* Pages Section Header */}
      <div className="px-3 pt-3 pb-1 flex items-center justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-[11px]">
          <Layers className="w-3.5 h-3.5" />
          Daftar Halaman
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Buka / Tutup Semua"
            onClick={expandedIds.size > 0 ? onCollapseAll : onExpandAll}
            className="text-[10px] lowercase text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 px-1 hover:underline"
          >
            {expandedIds.size > 0 ? 'tutup semua' : 'buka semua'}
          </button>
          <button
            type="button"
            title="Tambah Halaman Utama (Root)"
            onClick={onAddRootDoc}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 
        DOCUMENT TREE (RECURSIVE RENDERING ROOT)
        Di sini seluruh pohon dokumen di-render dengan komponen TreeNode.
        Setiap node akan memanggil dirinya sendiri jika memiliki children.
      */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {tree.length === 0 ? (
          <div className="text-center py-8 px-4 text-neutral-400 dark:text-neutral-500 text-xs">
            <p>Belum ada halaman di workspace.</p>
            <button
              type="button"
              onClick={onAddRootDoc}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Buat Halaman Utama
            </button>
          </div>
        ) : (
          tree.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              activeDocId={activeDocId}
              expandedIds={expandedIds}
              onSelect={onSelectDoc}
              onToggleExpand={onToggleExpand}
              onAddChild={onAddChildDoc}
              onDelete={onDeleteDoc}
              onDuplicate={onDuplicateDoc}
              onRename={onRenameDoc}
              onChangeIcon={onChangeIcon}
            />
          ))
        )}
      </div>

      {/* Sidebar Footer: Data Management */}
      <div className="p-2.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-950/40 text-xs">
        <div className="grid grid-cols-2 gap-1 mb-1.5">
          {/* Export JSON */}
          <button
            type="button"
            onClick={onExportJson}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700/80 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 text-[11px] font-medium transition-colors"
          >
            <Download className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Backup JSON
          </button>

          {/* Import JSON */}
          <label className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700/80 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 text-[11px] font-medium cursor-pointer transition-colors">
            <Upload className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            Restore JSON
            <input
              type="file"
              accept=".json"
              onChange={onImportJson}
              className="hidden"
            />
          </label>
        </div>

        {/* Reset Demo Button */}
        <button
          type="button"
          onClick={onResetDemo}
          className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset ke Data Demo Awal
        </button>
      </div>
    </aside>
  );
};
