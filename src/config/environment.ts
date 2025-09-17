// Configurações de ambiente
export const ENV_CONFIG = {
  // URLs do N8N
  N8N_BASE_URL: import.meta.env.VITE_N8N_BASE_URL || 'https://thiagoctt.app.n8n.cloud/webhook',
  
  // URLs específicas dos webhooks
  WEBHOOKS: {
    PC_CONFIG: import.meta.env.VITE_N8N_PC_CONFIG_URL || 'https://thiagoctt.app.n8n.cloud/webhook/pc-config',
    GAME_AI_ASSISTANCE: import.meta.env.VITE_N8N_GAME_AI_URL || 'https://thiagoctt.app.n8n.cloud/webhook/Assistencia-De-IA-Para-Jogos',
    QUICK_SEARCH: import.meta.env.VITE_N8N_QUICK_SEARCH_URL || 'https://thiagoctt.app.n8n.cloud/webhook/BuscaRapida',
    BEGINNER_PRICE: import.meta.env.VITE_N8N_BEGINNER_PRICE_URL || 'https://thiagoctt.app.n8n.cloud/webhook/Buscar-Preco-Hardware-Iniciante',
    INTERMEDIATE_PRICE: import.meta.env.VITE_N8N_INTERMEDIATE_PRICE_URL || 'https://thiagoctt.app.n8n.cloud/webhook/Buscar-Preco-Hardware-Intermediaria',
    AI_ASSISTANCE: import.meta.env.VITE_N8N_AI_ASSISTANCE_URL || 'https://thiagoctt.app.n8n.cloud/webhook/Assistencia-De-IA'
  },
  
  // Configurações do Supabase
  SUPABASE: {
    URL: import.meta.env.VITE_SUPABASE_URL || 'https://ftbzdhplddmxiezxzjqf.supabase.co',
    ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_PrtXg6KJGAEkzevMa8rE0g_rI8qXkDE'
  }
};

// Função para verificar se estamos em produção
export const isProduction = () => {
  return import.meta.env.PROD;
};

// Função para obter a URL base do N8N
export const getN8NBaseUrl = () => {
  return ENV_CONFIG.N8N_BASE_URL;
};

// Função para obter URL de um webhook específico
export const getWebhookUrl = (webhookName: keyof typeof ENV_CONFIG.WEBHOOKS) => {
  return ENV_CONFIG.WEBHOOKS[webhookName];
};

