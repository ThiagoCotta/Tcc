// Configuração do Supabase
// Substitua pelos seus valores reais

export const SUPABASE_CONFIG = {
  // URL do seu projeto Supabase
  url: 'https://ftbzdhplddmxiezxzjqf.supabase.co',
  
  // Chave pública (anon key) do Supabase
  anonKey: 'sb_publishable_PrtXg6KJGAEkzevMa8rE0g_rI8qXkDE',
  
  // Nomes das tabelas para cada componente
  tables: {
    cpu: 'Cpus',
    gpu: 'Video Cards', 
    motherboard: 'Motherboards',
    ram: 'Rams',
    storage: 'Storages'
  }
};

// Headers padrão para requisições ao Supabase
export const getSupabaseHeaders = () => ({
  'apikey': SUPABASE_CONFIG.anonKey,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
});

// Função para construir URLs da API do Supabase
export const buildSupabaseUrl = (table: string, select: string = '*') => {
  return `${SUPABASE_CONFIG.url}/rest/v1/${table}?select=${select}`;
};

// Configuração compatível com quick-search-api
export const supabaseConfig = {
  url: SUPABASE_CONFIG.url,
  anonKey: SUPABASE_CONFIG.anonKey,
  tables: SUPABASE_CONFIG.tables,
  headers: getSupabaseHeaders(),
  buildUrl: (tableName: keyof typeof SUPABASE_CONFIG.tables) => {
    const table = SUPABASE_CONFIG.tables[tableName];
    return buildSupabaseUrl(table);
  }
};