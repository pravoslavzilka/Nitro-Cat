export interface HistoryEntry {
  id: string;        // pathway id or a generated reaction id
  type: 'pathway' | 'reaction';
  name: string;      // pathway name or "Substrate → Product" label
  subtitle: string;  // citation for pathways, enzyme name for reactions
  visitedAt: number; // Date.now() timestamp
}

const KEY = 'nitrocat_history';
const MAX = 20;

export function addHistoryEntry(entry: Omit<HistoryEntry, 'visitedAt'>) {
  const existing: HistoryEntry[] = getHistory();
  const deduped = existing.filter(e => e.id !== entry.id);
  const updated = [{ ...entry, visitedAt: Date.now() }, ...deduped].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function getHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  localStorage.removeItem(KEY);
}