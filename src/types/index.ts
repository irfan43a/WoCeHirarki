export type BlockType =
  | 'paragraph'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'todo'
  | 'bullet'
  | 'numbered'
  | 'callout'
  | 'quote'
  | 'code'
  | 'image'
  | 'divider';

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean; // For todo
  caption?: string; // For image
  icon?: string; // For callout (emoji)
  color?: 'blue' | 'amber' | 'emerald' | 'purple' | 'rose' | 'gray'; // For callout
  language?: string; // For code
}

export interface DocumentNode {
  id: string;
  title: string;
  icon: string;
  coverImage?: string;
  children: DocumentNode[];
  blocks: ContentBlock[];
  createdAt: string;
  updatedAt: string;
  isExpanded?: boolean;
}

export interface TreeSearchMatch {
  doc: DocumentNode;
  path: DocumentNode[];
  matchedInTitle: boolean;
  matchedBlocks: ContentBlock[];
}
