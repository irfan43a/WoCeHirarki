import React, { useState } from 'react';
import { X, Copy, Check, Download, ShieldCheck, Binary } from 'lucide-react';
import type { DocumentNode } from '../../types';
import { countTotalNodes } from '../../utils/treeOperations';
import { exportWorkspaceToJson } from '../../utils/exportImport';

interface JsonInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tree: DocumentNode[];
}

function getMaxDepth(nodes: DocumentNode[], currentDepth = 1): number {
  let max = currentDepth;
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      const childMax = getMaxDepth(node.children, currentDepth + 1);
      if (childMax > max) max = childMax;
    }
  }
  return max;
}

function countTotalBlocks(nodes: DocumentNode[]): number {
  let total = 0;
  for (const node of nodes) {
    total += node.blocks.length;
    if (node.children && node.children.length > 0) {
      total += countTotalBlocks(node.children);
    }
  }
  return total;
}

export const JsonInspectorModal: React.FC<JsonInspectorModalProps> = ({
  isOpen,
  onClose,
  tree,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalDocs = countTotalNodes(tree);
  const maxDepth = getMaxDepth(tree);
  const totalBlocks = countTotalBlocks(tree);
  const jsonString = JSON.stringify(tree, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[88vh] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center">
              <Binary className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-neutral-800 dark:text-neutral-100">
                Inspektur Pohon Struktur Data JSON
              </h2>
              <p className="text-xs text-neutral-500">
                Pohon dokumen bersarang (nested) dikelola secara murni tanpa mutasi state langsung
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin JSON</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => exportWorkspaceToJson(tree)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-neutral-50 dark:bg-neutral-950/60 border-b border-neutral-200 dark:border-neutral-800 text-xs">
          <div className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="text-[10px] text-neutral-400">Total Dokumen</div>
            <div className="text-base font-bold text-neutral-800 dark:text-neutral-100">
              {totalDocs} Dokumen
            </div>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="text-[10px] text-neutral-400">Kedalaman Maksimal</div>
            <div className="text-base font-bold text-blue-600 dark:text-blue-400">
              Tingkat {maxDepth} (Level)
            </div>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="text-[10px] text-neutral-400">Total Blok Konten</div>
            <div className="text-base font-bold text-neutral-800 dark:text-neutral-100">
              {totalBlocks} Blok
            </div>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="text-[10px] text-neutral-400">Metode Mutasi</div>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Pure Immutable
            </div>
          </div>
        </div>

        {/* JSON Code Viewer */}
        <div className="flex-1 overflow-auto p-4 bg-neutral-950 font-mono text-xs text-neutral-200">
          <pre className="text-emerald-400">
            <code>{jsonString}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
