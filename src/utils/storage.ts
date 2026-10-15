import type { DocumentNode } from '../types';
import { INITIAL_WORKSPACE_DATA } from './initialData';

const STORAGE_KEY = 'hierarchical_workspace_data_v1';
const ACTIVE_DOC_KEY = 'hierarchical_workspace_active_doc_id';
const THEME_KEY = 'hierarchical_workspace_theme';

export function loadWorkspace(): DocumentNode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_WORKSPACE_DATA;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse saved workspace data, using fallback', err);
  }
  return INITIAL_WORKSPACE_DATA;
}

export function saveWorkspace(data: DocumentNode[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save workspace data to localStorage', err);
  }
}

export function loadActiveDocId(): string {
  try {
    const saved = localStorage.getItem(ACTIVE_DOC_KEY);
    if (saved) return saved;
  } catch (err) {
    console.error('Failed to load active doc ID', err);
  }
  return INITIAL_WORKSPACE_DATA[0]?.id || '';
}

export function saveActiveDocId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_DOC_KEY, id);
  } catch (err) {
    console.error('Failed to save active doc ID', err);
  }
}

export function loadSavedTheme(): 'light' | 'dark' {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === 'light' || theme === 'dark') return theme;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {
    // fallback
  }
  return 'light';
}

export function saveTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // fallback
  }
}
