export type HistorySource = 'pc-builder' | 'quick-search' | 'game-ai';

export interface HistoryEntryBase {
  id: string;
  source: HistorySource;
  timestamp: string; // ISO
  title: string;
  subtitle?: string;
}

export interface PCBuilderHistoryEntry extends HistoryEntryBase {
  source: 'pc-builder';
  request: {
    gpu?: string;
    cpu?: string;
    motherboard?: string;
    ram?: string;
    considerReviews?: boolean;
  };
  response?: unknown;
}

export interface QuickSearchHistoryEntry extends HistoryEntryBase {
  source: 'quick-search';
  request: {
    hardwareType: string;
    hardwareName: string;
  };
  response?: unknown;
}

export interface GameAIHistoryEntry extends HistoryEntryBase {
  source: 'game-ai';
  request: {
    nivel?: string; // Iniciante/Intermediário/Avançado
    jogo?: string;
    qualidade?: string;
  };
  response?: unknown;
}

export type HistoryEntry = PCBuilderHistoryEntry | QuickSearchHistoryEntry | GameAIHistoryEntry;

const STORAGE_KEY = 'app:search-history:v1';

function makeJSONSafe<T>(value: T): T {
  try {
    // Tenta serializar diretamente
    JSON.stringify(value);
    return value;
  } catch {
    try {
      // Remove referências não serializáveis
      return JSON.parse(JSON.stringify(value)) as T;
    } catch {
      // Último recurso: retorna apenas um marcador
      return { message: 'Conteúdo não serializável' } as unknown as T;
    }
  }
}

function readAll(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

function writeAll(entries: HistoryEntry[]): void {
  // Garante que todo o conteúdo seja serializável
  const safe = entries.map((e) => ({
    ...e,
    request: makeJSONSafe(e.request),
    response: makeJSONSafe(e.response),
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
}

export const HistoryService = {
  list(): HistoryEntry[] {
    return readAll().sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  },

  getById(id: string): HistoryEntry | undefined {
    return readAll().find((e) => e.id === id);
  },

  add(entry: Omit<HistoryEntry, 'id' | 'timestamp'> & Partial<Pick<HistoryEntry, 'timestamp'>>): HistoryEntry {
    const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const timestamp = entry.timestamp ?? new Date().toISOString();
    const newEntry = { ...(entry as HistoryEntry), id, timestamp } as HistoryEntry;
    const all = readAll();
    all.unshift(newEntry);
    // Limitar tamanho para evitar crescimento infinito
    writeAll(all.slice(0, 200));
    return newEntry;
  },

  clear(): void {
    writeAll([]);
  },
};


