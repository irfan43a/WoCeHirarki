import type { DocumentNode } from '../types';

export function exportWorkspaceToJson(tree: DocumentNode[]): void {
  const jsonStr = JSON.stringify(tree, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `workspace_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportDocToMarkdown(doc: DocumentNode): void {
  const lines: string[] = [];

  lines.push(`# ${doc.icon} ${doc.title}\n`);
  lines.push(`*Dibuat: ${new Date(doc.createdAt).toLocaleString()} | Diperbarui: ${new Date(doc.updatedAt).toLocaleString()}*\n`);

  for (const block of doc.blocks) {
    switch (block.type) {
      case 'h1':
        lines.push(`\n# ${block.content}\n`);
        break;
      case 'h2':
        lines.push(`\n## ${block.content}\n`);
        break;
      case 'h3':
        lines.push(`\n### ${block.content}\n`);
        break;
      case 'paragraph':
        lines.push(`\n${block.content}\n`);
        break;
      case 'todo':
        lines.push(`- [${block.checked ? 'x' : ' '}] ${block.content}`);
        break;
      case 'bullet':
        lines.push(`- ${block.content}`);
        break;
      case 'numbered':
        lines.push(`1. ${block.content}`);
        break;
      case 'callout':
        lines.push(`\n> **${block.icon || '💡'} CATATAN:** ${block.content}\n`);
        break;
      case 'quote':
        lines.push(`\n> ${block.content}\n`);
        break;
      case 'code':
        lines.push(`\n\`\`\`${block.language || 'text'}\n${block.content}\n\`\`\`\n`);
        break;
      case 'image':
        lines.push(`\n![${block.caption || 'Gambar'}](${block.content})\n`);
        if (block.caption) lines.push(`*${block.caption}*\n`);
        break;
      case 'divider':
        lines.push(`\n---\n`);
        break;
    }
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeTitle = doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  a.download = `${safeTitle || 'dokumen'}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseJsonWorkspace(jsonStr: string): DocumentNode[] | null {
  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) {
      return parsed as DocumentNode[];
    }
  } catch (err) {
    console.error('Invalid JSON structure', err);
  }
  return null;
}
