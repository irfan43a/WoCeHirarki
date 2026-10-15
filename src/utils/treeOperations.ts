import type { ContentBlock, DocumentNode, TreeSearchMatch } from '../types';

/**
 * PURE & IMMUTABLE TREE OPERATIONS
 * Menangani struktur data JSON yang sangat bersarang (infinite depth)
 * tanpa melakukan mutasi state secara langsung.
 */

/**
 * Mencari node dokumen berdasarkan ID secara rekursif (pure search)
 */
export function findNode(tree: DocumentNode[], id: string): DocumentNode | null {
  for (const node of tree) {
    if (node.id === id) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Mencari jalur hierarki (breadcrumb path) dari root ke node target secara rekursif
 */
export function findPath(
  tree: DocumentNode[],
  id: string,
  currentPath: DocumentNode[] = []
): DocumentNode[] | null {
  for (const node of tree) {
    const newPath = [...currentPath, node];
    if (node.id === id) {
      return newPath;
    }
    if (node.children && node.children.length > 0) {
      const result = findPath(node.children, id, newPath);
      if (result) return result;
    }
  }
  return null;
}

/**
 * Menambahkan node baru secara immutably.
 * Jika parentId null, tambahkan di level root.
 * Jika parentId ditentukan, cari parent secara rekursif dan tambahkan ke `children`-nya.
 */
export function addNode(
  tree: DocumentNode[],
  parentId: string | null,
  newNode: DocumentNode
): DocumentNode[] {
  if (!parentId) {
    return [...tree, newNode];
  }

  return tree.map((node) => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...node.children, newNode],
      };
    }

    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: addNode(node.children, parentId, newNode),
      };
    }

    return node;
  });
}

/**
 * Memperbarui node yang cocok dengan ID secara rekursif tanpa mutasi langsung.
 */
export function updateNode(
  tree: DocumentNode[],
  id: string,
  updater: Partial<DocumentNode> | ((node: DocumentNode) => DocumentNode)
): DocumentNode[] {
  return tree.map((node) => {
    if (node.id === id) {
      const updated =
        typeof updater === 'function' ? updater(node) : { ...node, ...updater };
      return {
        ...updated,
        updatedAt: new Date().toISOString(),
      };
    }

    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: updateNode(node.children, id, updater),
      };
    }

    return node;
  });
}

/**
 * Menghapus node dengan ID tertentu dari pohon hierarki secara rekursif.
 */
export function deleteNode(tree: DocumentNode[], id: string): DocumentNode[] {
  return tree
    .filter((node) => node.id !== id)
    .map((node) => {
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: deleteNode(node.children, id),
        };
      }
      return node;
    });
}

/**
 * Menduplikasi sub-pohon dokumen secara rekursif dengan ID baru
 */
function cloneNodeWithNewIds(node: DocumentNode, isRootClone = false): DocumentNode {
  const newId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    ...node,
    id: newId,
    title: isRootClone ? `${node.title} (Copy)` : node.title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: node.blocks.map((block) => ({
      ...block,
      id: `block_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    })),
    children: node.children.map((child) => cloneNodeWithNewIds(child, false)),
  };
}

/**
 * Menduplikasi dokumen dan meletakkannya di samping dokumen aslinya
 */
export function duplicateNode(tree: DocumentNode[], id: string): DocumentNode[] {
  const target = findNode(tree, id);
  if (!target) return tree;

  const cloned = cloneNodeWithNewIds(target, true);

  // Helper rekursif untuk menyisipkan setelah node target
  function insertAfterInTree(nodes: DocumentNode[]): DocumentNode[] {
    const result: DocumentNode[] = [];
    for (const node of nodes) {
      result.push(node);
      if (node.id === id) {
        result.push(cloned);
      }
      if (node.children && node.children.length > 0) {
        // Update children secara immutably
        result[result.length - (node.id === id ? 2 : 1)] = {
          ...node,
          children: insertAfterInTree(node.children),
        };
      }
    }
    return result;
  }

  return insertAfterInTree(tree);
}

/**
 * Mengeluarkan node dari pohon (ekstraksi) secara immutably
 */
function extractNode(
  tree: DocumentNode[],
  id: string
): { updatedTree: DocumentNode[]; extractedNode: DocumentNode | null } {
  let extracted: DocumentNode | null = null;

  function recurse(nodes: DocumentNode[]): DocumentNode[] {
    const remaining: DocumentNode[] = [];
    for (const node of nodes) {
      if (node.id === id) {
        extracted = node;
        continue; // skip from remaining
      }
      if (node.children && node.children.length > 0) {
        remaining.push({
          ...node,
          children: recurse(node.children),
        });
      } else {
        remaining.push(node);
      }
    }
    return remaining;
  }

  const updatedTree = recurse(tree);
  return { updatedTree, extractedNode: extracted };
}

/**
 * Memindahkan node ke parent baru atau index baru secara immutably
 */
export function moveNode(
  tree: DocumentNode[],
  sourceId: string,
  targetParentId: string | null,
  targetIndex?: number
): DocumentNode[] {
  // Cegah memindahkan node ke dirinya sendiri
  if (sourceId === targetParentId) return tree;

  const { updatedTree, extractedNode } = extractNode(tree, sourceId);
  if (!extractedNode) return tree;

  // Jika dipindah ke root
  if (!targetParentId) {
    if (typeof targetIndex === 'number' && targetIndex >= 0) {
      const next = [...updatedTree];
      next.splice(targetIndex, 0, extractedNode);
      return next;
    }
    return [...updatedTree, extractedNode];
  }

  // Jika dipindah ke dalam parent tertentu
  function insertIntoParent(nodes: DocumentNode[]): DocumentNode[] {
    return nodes.map((node) => {
      if (node.id === targetParentId) {
        const nextChildren = [...node.children];
        if (typeof targetIndex === 'number' && targetIndex >= 0) {
          nextChildren.splice(targetIndex, 0, extractedNode!);
        } else {
          nextChildren.push(extractedNode!);
        }
        return {
          ...node,
          children: nextChildren,
        };
      }
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: insertIntoParent(node.children),
        };
      }
      return node;
    });
  }

  return insertIntoParent(updatedTree);
}

/**
 * Update blok dalam dokumen tertentu secara immutably
 */
export function updateDocBlocks(
  tree: DocumentNode[],
  docId: string,
  updater: (blocks: ContentBlock[]) => ContentBlock[]
): DocumentNode[] {
  return updateNode(tree, docId, (doc) => ({
    ...doc,
    blocks: updater(doc.blocks),
  }));
}

/**
 * Reorder blok konten menggunakan dnd-kit array move logic (pure)
 */
export function reorderBlocks(
  blocks: ContentBlock[],
  activeId: string,
  overId: string
): ContentBlock[] {
  const oldIndex = blocks.findIndex((b) => b.id === activeId);
  const newIndex = blocks.findIndex((b) => b.id === overId);

  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
    return blocks;
  }

  const result = [...blocks];
  const [removed] = result.splice(oldIndex, 1);
  result.splice(newIndex, 0, removed);
  return result;
}

/**
 * Menghitung total seluruh dokumen dalam pohon secara rekursif
 */
export function countTotalNodes(tree: DocumentNode[]): number {
  let count = 0;
  for (const node of tree) {
    count += 1;
    if (node.children && node.children.length > 0) {
      count += countTotalNodes(node.children);
    }
  }
  return count;
}

/**
 * Pencarian dokumen dan konten di seluruh kedalaman pohon (deep recursive search)
 */
export function searchTree(tree: DocumentNode[], query: string): TreeSearchMatch[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  const results: TreeSearchMatch[] = [];

  function traverse(nodes: DocumentNode[], currentPath: DocumentNode[]) {
    for (const node of nodes) {
      const path = [...currentPath, node];
      const titleMatches = node.title.toLowerCase().includes(q);
      const matchedBlocks = node.blocks.filter(
        (b) =>
          b.content.toLowerCase().includes(q) ||
          (b.caption && b.caption.toLowerCase().includes(q))
      );

      if (titleMatches || matchedBlocks.length > 0) {
        results.push({
          doc: node,
          path,
          matchedInTitle: titleMatches,
          matchedBlocks,
        });
      }

      if (node.children && node.children.length > 0) {
        traverse(node.children, path);
      }
    }
  }

  traverse(tree, []);
  return results;
}
