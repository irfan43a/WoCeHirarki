import type { DocumentNode } from '../types';

export const INITIAL_WORKSPACE_DATA: DocumentNode[] = [
  {
    id: 'doc_getting_started',
    title: 'Panduan Workspace Hierarkis',
    icon: '🚀',
    coverImage: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-10-01T08:00:00.000Z',
    updatedAt: '2026-10-03T10:30:00.000Z',
    isExpanded: true,
    blocks: [
      {
        id: 'block_intro_callout',
        type: 'callout',
        content: 'Selamat datang di Aplikasi Workspace Hierarkis! Aplikasi ini mendemonstrasikan Recursive Rendering pohon dokumen tanpa batas kedalaman, drag-and-drop blok konten dengan @dnd-kit, dan manipulasi struktur data JSON bersarang secara immutable.',
        icon: '💡',
        color: 'blue',
      },
      {
        id: 'block_intro_h1',
        type: 'h1',
        content: 'Fitur Utama Workspace',
      },
      {
        id: 'block_intro_p1',
        type: 'paragraph',
        content: 'Anda dapat membuat sub-halaman di dalam sub-halaman tanpa batasan kedalaman menggunakan ikon "+" di sidebar. Di editor ini, setiap paragraf, gambar, kode, atau daftar tugas dapat digeser (drag & drop) untuk mengatur ulang posisinya dengan mulus.',
      },
      {
        id: 'block_todo_1',
        type: 'todo',
        content: 'Coba seret pegangan (grip icon ⠿) pada blok ini ke atas atau ke bawah',
        checked: false,
      },
      {
        id: 'block_todo_2',
        type: 'todo',
        content: 'Klik tombol "+" di sidebar untuk menambahkan sub-halaman baru',
        checked: true,
      },
      {
        id: 'block_todo_3',
        type: 'todo',
        content: 'Ketik "/" atau gunakan toolbar untuk menyisipkan blok jenis lain',
        checked: false,
      },
      {
        id: 'block_divider_1',
        type: 'divider',
        content: '',
      },
      {
        id: 'block_h2_showcase',
        type: 'h2',
        content: 'Blok Media & Visual',
      },
      {
        id: 'block_img_workspace',
        type: 'image',
        content: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1000&q=80',
        caption: 'Blok gambar responsif yang mendukung drag-and-drop antar paragraf',
      },
      {
        id: 'block_quote_1',
        type: 'quote',
        content: 'Struktur data yang rapi dan penulisan berbasis blok memberikan fleksibilitas maksimal dalam mengorganisir pengetahuan.',
      },
    ],
    children: [
      {
        id: 'doc_arch',
        title: 'Arsitektur Teknis Sistem',
        icon: '📐',
        createdAt: '2026-10-01T09:00:00.000Z',
        updatedAt: '2026-10-02T14:15:00.000Z',
        isExpanded: true,
        blocks: [
          {
            id: 'block_arch_h1',
            type: 'h1',
            content: 'Fondasi Teknis Aplikasi',
          },
          {
            id: 'block_arch_callout',
            type: 'callout',
            content: 'Komponen TreeNode menggunakan teknik Recursive Rendering yang memanggil dirinya sendiri secara deklaratif berdasarkan properti node.children.',
            icon: '⚡',
            color: 'purple',
          },
          {
            id: 'block_code_recursive',
            type: 'code',
            content: `// Contoh Inti Recursive Component:
function TreeNode({ node, depth }: Props) {
  return (
    <div>
      <TreeItem node={node} depth={depth} />
      {node.isExpanded && node.children.map(child => (
        <TreeNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}`,
            language: 'typescript',
          },
        ],
        children: [
          {
            id: 'doc_state_mgmt',
            title: 'Immutable State Management',
            icon: '🛡️',
            createdAt: '2026-10-01T11:00:00.000Z',
            updatedAt: '2026-10-02T16:45:00.000Z',
            isExpanded: true,
            blocks: [
              {
                id: 'block_state_h1',
                type: 'h1',
                content: 'Manajemen Data Tanpa Mutasi Langsung',
              },
              {
                id: 'block_state_p',
                type: 'paragraph',
                content: 'Untuk menangani JSON bersarang yang dalam tanpa mutating state langsung (zero mutation), seluruh operasi menggunakan recursive mapping dan pure object spread syntax (...).',
              },
              {
                id: 'block_code_immutable',
                type: 'code',
                content: `export function updateNode(tree: DocumentNode[], id: string, updater: Function): DocumentNode[] {
  return tree.map(node => {
    if (node.id === id) return updater(node);
    if (node.children?.length) {
      return { ...node, children: updateNode(node.children, id, updater) };
    }
    return node;
  });
}`,
                language: 'typescript',
              },
            ],
            children: [
              {
                id: 'doc_deep_specs',
                title: 'Spesifikasi Tingkat 4 (Deep Nested)',
                icon: '🔬',
                createdAt: '2026-10-01T13:00:00.000Z',
                updatedAt: '2026-10-02T17:00:00.000Z',
                isExpanded: false,
                blocks: [
                  {
                    id: 'block_deep_callout',
                    type: 'callout',
                    content: 'Halaman ini berada di tingkat ke-4 dalam pohon dokumen untuk membuktikan kemampuan rendering rekursif pada kedalaman tak terbatas.',
                    icon: '🎯',
                    color: 'emerald',
                  },
                  {
                    id: 'block_deep_p',
                    type: 'paragraph',
                    content: 'Perhatikan garis pemandu hierarki (indent guide) di sidebar yang beradaptasi secara dinamis sesuai kedalaman nesting.',
                  },
                ],
                children: [],
              },
            ],
          },
          {
            id: 'doc_dnd_kit',
            title: 'Integrasi @dnd-kit',
            icon: '🧲',
            createdAt: '2026-10-01T12:00:00.000Z',
            updatedAt: '2026-10-02T18:20:00.000Z',
            isExpanded: false,
            blocks: [
              {
                id: 'block_dnd_h1',
                type: 'h1',
                content: 'Reordering Blok dengan @dnd-kit',
              },
              {
                id: 'block_dnd_p',
                type: 'paragraph',
                content: '@dnd-kit/core dan @dnd-kit/sortable menyediakan hook useSortable yang ringan dan fleksibel. Kami menggunakan drag handle khusus dengan styling visual saat hover dan drag overlay beranimasi.',
              },
              {
                id: 'block_dnd_todo_1',
                type: 'todo',
                content: 'Sensor sentuhan & pointer dengan jarak aktivasi 5px untuk mencegah drag tidak disengaja',
                checked: true,
              },
              {
                id: 'block_dnd_todo_2',
                type: 'todo',
                content: 'Animasi transisi halus saat item bertukar posisi',
                checked: true,
              },
            ],
            children: [],
          },
        ],
      },
      {
        id: 'doc_roadmap',
        title: 'Roadmap & Rencana Fitur',
        icon: '🗺️',
        createdAt: '2026-10-02T08:00:00.000Z',
        updatedAt: '2026-10-03T09:00:00.000Z',
        isExpanded: false,
        blocks: [
          {
            id: 'block_rm_h1',
            type: 'h1',
            content: 'Rencana Pengembangan',
          },
          {
            id: 'block_rm_callout',
            type: 'callout',
            content: 'Daftar prioritas peningkatan pengalaman pengguna untuk rilis berikutnya.',
            icon: '📌',
            color: 'amber',
          },
          {
            id: 'block_rm_t1',
            type: 'todo',
            content: 'Export dokumen aktif ke format Markdown (.md)',
            checked: true,
          },
          {
            id: 'block_rm_t2',
            type: 'todo',
            content: 'Backup dan restore seluruh hierarki dalam format JSON',
            checked: true,
          },
          {
            id: 'block_rm_t3',
            type: 'todo',
            content: 'Quick Search (Ctrl+K) lintas dokumen & blok',
            checked: true,
          },
          {
            id: 'block_rm_t4',
            type: 'todo',
            content: 'Dark mode & light mode toggle',
            checked: true,
          },
        ],
        children: [],
      },
    ],
  },
  {
    id: 'doc_quick_notes',
    title: 'Catatan Harian & Ide Cepat',
    icon: '📝',
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-03T11:00:00.000Z',
    isExpanded: false,
    blocks: [
      {
        id: 'block_qn_h1',
        type: 'h1',
        content: 'Ide & Refleksi',
      },
      {
        id: 'block_qn_p1',
        type: 'paragraph',
        content: 'Dokumen root kedua ini menunjukkan bahwa pohon dokumen dapat memiliki banyak cabang utama di level root sekaligus anak-anak bercabang yang tak terbatas.',
      },
      {
        id: 'block_qn_quote',
        type: 'quote',
        content: 'Simplicity is prerequisite for reliability. — Edsger W. Dijkstra',
      },
    ],
    children: [
      {
        id: 'doc_snippet_collection',
        title: 'Koleksi Snippet Kode',
        icon: '💻',
        createdAt: '2026-10-02T11:00:00.000Z',
        updatedAt: '2026-10-03T11:30:00.000Z',
        isExpanded: false,
        blocks: [
          {
            id: 'block_snip_h1',
            type: 'h1',
            content: 'Algoritma Rekursif Populer',
          },
          {
            id: 'block_code_py',
            type: 'code',
            content: `def flatten_tree(nodes):
    result = []
    for node in nodes:
        result.append(node["title"])
        if node.get("children"):
            result.extend(flatten_tree(node["children"]))
    return result`,
            language: 'python',
          },
        ],
        children: [],
      },
    ],
  },
];
