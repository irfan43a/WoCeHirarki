import React, { useState, useEffect, useRef } from 'react';
import { 
  Type, 
  Heading1, 
  Heading2, 
  Heading3, 
  CheckSquare, 
  List, 
  ListOrdered, 
  Image as ImageIcon, 
  Code, 
  AlertCircle, 
  Quote, 
  Minus 
} from 'lucide-react';
import type { BlockType } from '../../types';

interface SlashCommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: BlockType) => void;
  filterText?: string;
}

interface CommandItem {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const COMMAND_ITEMS: CommandItem[] = [
  {
    type: 'paragraph',
    label: 'Teks / Paragraf',
    description: 'Teks biasa dengan format penulisan kaya',
    icon: <Type className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />,
  },
  {
    type: 'h1',
    label: 'Heading 1',
    description: 'Judul bagian utama berukuran besar',
    icon: <Heading1 className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
  },
  {
    type: 'h2',
    label: 'Heading 2',
    description: 'Sub-judul bagian menengah',
    icon: <Heading2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
  },
  {
    type: 'h3',
    label: 'Heading 3',
    description: 'Sub-judul bagian kecil',
    icon: <Heading3 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
  },
  {
    type: 'todo',
    label: 'Daftar Tugas / To-Do',
    description: 'Kotak centang interaktif untuk melacak progres tugas',
    icon: <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
  },
  {
    type: 'bullet',
    label: 'Daftar Poin (Bulleted List)',
    description: 'Daftar butir poin tanpa urutan angka',
    icon: <List className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
  },
  {
    type: 'numbered',
    label: 'Daftar Bernomor (Numbered List)',
    description: 'Daftar urutan langkah-langkah bernomor',
    icon: <ListOrdered className="w-4 h-4 text-orange-600 dark:text-orange-400" />,
  },
  {
    type: 'image',
    label: 'Gambar / Visual',
    description: 'Sematkan gambar via URL, galeri, atau upload',
    icon: <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
  },
  {
    type: 'code',
    label: 'Blok Kode Program',
    description: 'Snippet kode dengan syntax styling dan tombol salin',
    icon: <Code className="w-4 h-4 text-pink-600 dark:text-pink-400" />,
  },
  {
    type: 'callout',
    label: 'Kotak Catatan (Callout)',
    description: 'Sorotan teks penting dengan ikon emoji dan latar warna',
    icon: <AlertCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
  },
  {
    type: 'quote',
    label: 'Kutipan (Quote)',
    description: 'Blok kutipan bergaris samping elegan',
    icon: <Quote className="w-4 h-4 text-neutral-500" />,
  },
  {
    type: 'divider',
    label: 'Garis Pembatas (Divider)',
    description: 'Pemisah horizontal antar segmen konten',
    icon: <Minus className="w-4 h-4 text-neutral-400" />,
  },
];

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  isOpen,
  onClose,
  onSelectType,
  filterText = '',
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredItems = COMMAND_ITEMS.filter(
    (item) =>
      item.label.toLowerCase().includes(filterText.toLowerCase()) ||
      item.description.toLowerCase().includes(filterText.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [filterText]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Keyboard navigation inside slash menu
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? Math.max(0, filteredItems.length - 1) : prev - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          onSelectType(filteredItems[selectedIndex].type);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onSelectType, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="w-72 max-h-80 overflow-y-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="px-2.5 py-1.5 text-[10px] font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase border-b border-neutral-100 dark:border-neutral-800">
        Pilih Jenis Blok Konten
      </div>

      <div className="py-1">
        {filteredItems.length === 0 ? (
          <div className="p-3 text-center text-neutral-400 text-xs">
            Tidak ada perintah yang cocok
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={item.type}
                type="button"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  isSelected
                    ? 'bg-blue-50 text-blue-900 dark:bg-blue-950/70 dark:text-blue-200'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80'
                }`}
                onClick={() => onSelectType(item.type)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="w-7 h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-200/60 dark:border-neutral-700/60">
                  {item.icon}
                </div>
                <div className="flex-1 truncate">
                  <div className="font-medium text-xs truncate">{item.label}</div>
                  <div className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate">
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
