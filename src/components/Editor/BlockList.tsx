import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { 
  Plus, 
  Type, 
  Heading2, 
  CheckSquare, 
  Image as ImageIcon, 
  Code, 
  AlertCircle 
} from 'lucide-react';
import type { ContentBlock, BlockType } from '../../types';
import { SortableBlockItem } from './SortableBlockItem';
import { SlashCommandMenu } from './SlashCommandMenu';
import { BlockItem } from './BlockItem';

interface BlockListProps {
  blocks: ContentBlock[];
  onUpdateBlock: (blockId: string, updates: Partial<ContentBlock>) => void;
  onAddBlock: (type: BlockType, afterBlockId?: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
  onChangeBlockType: (blockId: string, newType: BlockType) => void;
  onReorderBlocks: (activeId: string, overId: string) => void;
}

/**
 * INTEGRASI PUSTAKA DRAG-AND-DROP (@dnd-kit)
 * Mengelola daftar blok konten yang dapat digeser (drag and drop)
 * untuk menyusun ulang urutan paragraf, heading, gambar, to-do, atau kode.
 */
export const BlockList: React.FC<BlockListProps> = ({
  blocks,
  onUpdateBlock,
  onAddBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onChangeBlockType,
  onReorderBlocks,
}) => {
  const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);
  const [slashMenuState, setSlashMenuState] = useState<{
    isOpen: boolean;
    targetBlockId: string | null;
    position: { top: number; left: number };
  }>({
    isOpen: false,
    targetBlockId: null,
    position: { top: 0, left: 0 },
  });

  // Sensor configuration: Pointer constraint 5px prevents accidental drags when clicking text to edit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDraggingId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDraggingId(null);

    if (over && active.id !== over.id) {
      onReorderBlocks(active.id as string, over.id as string);
    }
  };

  const handleOpenSlashMenu = (blockId: string, rect: DOMRect) => {
    setSlashMenuState({
      isOpen: true,
      targetBlockId: blockId,
      position: {
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      },
    });
  };

  const handleSelectSlashType = (type: BlockType) => {
    if (slashMenuState.targetBlockId) {
      // Clear the '/' trigger char and change type
      onUpdateBlock(slashMenuState.targetBlockId, { content: '' });
      onChangeBlockType(slashMenuState.targetBlockId, type);
    } else {
      onAddBlock(type);
    }
    setSlashMenuState((prev) => ({ ...prev, isOpen: false }));
  };

  const activeDraggingBlock = blocks.find((b) => b.id === activeDraggingId);

  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-12 py-4 pl-16 sm:pl-20">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1 min-h-[120px]">
            {blocks.map((block, index) => (
              <SortableBlockItem
                key={block.id}
                block={block}
                index={index}
                onUpdate={(updates) => onUpdateBlock(block.id, updates)}
                onEnter={() => onAddBlock('paragraph', block.id)}
                onDelete={() => onDeleteBlock(block.id)}
                onDuplicate={() => onDuplicateBlock(block.id)}
                onChangeType={(newType) => onChangeBlockType(block.id, newType)}
                onInsertBelow={() => onAddBlock('paragraph', block.id)}
                onOpenSlashMenu={(rect) => handleOpenSlashMenu(block.id, rect)}
              />
            ))}
          </div>
        </SortableContext>

        {/* 
          DRAG OVERLAY:
          Memberikan preview visual mengambang (ghost item) dengan bayangan halus
          saat elemen sedang ditarik oleh kursor pengguna.
        */}
        <DragOverlay>
          {activeDraggingBlock ? (
            <div className="p-3 bg-white/95 dark:bg-neutral-800/95 border-2 border-blue-500 rounded-xl shadow-2xl opacity-90 backdrop-blur-xs scale-[1.02] cursor-grabbing">
              <BlockItem
                block={activeDraggingBlock}
                index={0}
                onUpdate={() => {}}
                onEnter={() => {}}
                onDeleteEmpty={() => {}}
                onOpenSlashMenu={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Floating Slash Command Menu */}
      {slashMenuState.isOpen && (
        <div
          className="fixed z-50"
          style={{
            top: `${Math.min(slashMenuState.position.top, window.innerHeight - 340)}px`,
            left: `${Math.min(slashMenuState.position.left, window.innerWidth - 300)}px`,
          }}
        >
          <SlashCommandMenu
            isOpen={slashMenuState.isOpen}
            onClose={() =>
              setSlashMenuState((prev) => ({ ...prev, isOpen: false }))
            }
            onSelectType={handleSelectSlashType}
          />
        </div>
      )}

      {/* Quick Add Block Bar at the bottom */}
      <div className="mt-8 pt-6 border-t border-dashed border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center gap-2">
        <span className="text-xs text-neutral-400 dark:text-neutral-500 mr-2 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Tambah Blok:
        </span>
        <button
          type="button"
          onClick={() => onAddBlock('paragraph')}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
        >
          <Type className="w-3 h-3 text-neutral-500" />
          Paragraf
        </button>
        <button
          type="button"
          onClick={() => onAddBlock('h2')}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
        >
          <Heading2 className="w-3 h-3 text-indigo-500" />
          Heading
        </button>
        <button
          type="button"
          onClick={() => onAddBlock('todo')}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
        >
          <CheckSquare className="w-3 h-3 text-emerald-500" />
          To-Do
        </button>
        <button
          type="button"
          onClick={() => onAddBlock('image')}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
        >
          <ImageIcon className="w-3 h-3 text-purple-500" />
          Gambar
        </button>
        <button
          type="button"
          onClick={() => onAddBlock('code')}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
        >
          <Code className="w-3 h-3 text-pink-500" />
          Kode
        </button>
        <button
          type="button"
          onClick={() => onAddBlock('callout')}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
        >
          <AlertCircle className="w-3 h-3 text-teal-500" />
          Callout
        </button>
      </div>
    </div>
  );
};
