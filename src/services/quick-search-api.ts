import { supabaseConfig } from '@/config/supabase';
import { getWebhookUrl } from '@/config/environment';

export interface QuickSearchItem {
  id: string;
  name: string;
  type: string;
  price?: number;
  specifications?: string;
  brand?: string;
  model?: string;
}

export interface QuickSearchResponse {
  success: boolean;
  data: QuickSearchItem[];
  total: number;
  error?: string;
}

export interface N8NWebhookPayload {
  source: string;
  timestamp: string;
  data: {
    cpu?: string;
    gpu?: string;
    motherboard?: string;
    ram?: string;
    storage?: string;
  };
}

export interface OfferItem {
  title: string;
  source: string;
  link: string;
  price: number;
  imageUrl: string;
  rating?: number;
  ratingCount?: number;
  valueScore?: number;
}

export interface HardwareOffers {
  best_price: OfferItem[];
  best_score: OfferItem[];
}

export interface QuickSearchResults {
  [key: string]: HardwareOffers;
}

// Tipo para a resposta do N8N (array)
export type N8NResponse = Array<{
  [key: string]: HardwareOffers;
}>;

// Mapear tipos de hardware para nomes amigáveis
const hardwareTypeMap: Record<string, string> = {
  'Cpus': 'CPU',
  'Video Cards': 'GPU',
  'Motherboards': 'Motherboard',
  'Rams': 'RAM',
  'Storages': 'Storage'
};

// Função para buscar em uma tabela específica
const searchInTable = async (tableName: string, searchTerm: string): Promise<QuickSearchItem[]> => {
  try {
    const url = supabaseConfig.buildUrl(tableName as keyof typeof supabaseConfig.tables);
    
    // Construir query com filtro de busca
    const searchUrl = `${url}?or=(nome.ilike.*${encodeURIComponent(searchTerm)}*,marca.ilike.*${encodeURIComponent(searchTerm)}*,modelo.ilike.*${encodeURIComponent(searchTerm)}*)`;
    
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: supabaseConfig.headers
    });

    if (!response.ok) {
      console.warn(`Erro ao buscar na tabela ${tableName}:`, response.status);
      return [];
    }

    const data = await response.json();
    
    // Converter dados para formato unificado
    return data.map((item: any) => ({
      id: item.id?.toString() || Math.random().toString(),
      name: item.nome || item.name || 'Nome não disponível',
      type: hardwareTypeMap[tableName] || tableName,
      price: item.preco || item.price,
      specifications: item.especificacoes || item.specifications,
      brand: item.marca || item.brand,
      model: item.modelo || item.model
    }));
  } catch (error) {
    console.error(`Erro ao buscar na tabela ${tableName}:`, error);
    return [];
  }
};

// Função principal de busca unificada
export const performQuickSearch = async (searchTerm: string): Promise<QuickSearchResponse> => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return {
        success: true,
        data: [],
        total: 0
      };
    }

    const trimmedTerm = searchTerm.trim();
    const tableNames = Object.keys(supabaseConfig.tables);
    
    // Buscar em todas as tabelas simultaneamente
    const searchPromises = tableNames.map(tableName => 
      searchInTable(supabaseConfig.tables[tableName as keyof typeof supabaseConfig.tables], trimmedTerm)
    );
    
    const results = await Promise.all(searchPromises);
    
    // Consolidar resultados de todas as tabelas
    const allResults = results.flat();
    
    // Ordenar por relevância (nome exato primeiro, depois por tipo)
    const sortedResults = allResults.sort((a, b) => {
      const aExactMatch = a.name.toLowerCase().includes(trimmedTerm.toLowerCase());
      const bExactMatch = b.name.toLowerCase().includes(trimmedTerm.toLowerCase());
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      // Se ambos são matches exatos ou não, ordenar por tipo
      return a.type.localeCompare(b.type);
    });
    
    return {
      success: true,
      data: sortedResults,
      total: sortedResults.length
    };
  } catch (error) {
    console.error('Erro na busca unificada:', error);
    return {
      success: false,
      data: [],
      total: 0,
      error: 'Erro interno do servidor'
    };
  }
};

// Função para buscar sugestões (primeiros resultados)
export const getSearchSuggestions = async (searchTerm: string, limit: number = 5): Promise<string[]> => {
  try {
    const response = await performQuickSearch(searchTerm);
    
    if (!response.success) {
      return [];
    }
    
    // Extrair nomes únicos para sugestões
    const suggestions = response.data
      .map(item => item.name)
      .filter((name, index, array) => array.indexOf(name) === index)
      .slice(0, limit);
    
    return suggestions;
  } catch (error) {
    console.error('Erro ao buscar sugestões:', error);
    return [];
  }
};

// Função para buscar por categoria específica
export const searchByCategory = async (searchTerm: string, category: string): Promise<QuickSearchResponse> => {
  try {
    const tableName = Object.entries(hardwareTypeMap)
      .find(([_, type]) => type === category)?.[0];
    
    if (!tableName) {
      return {
        success: false,
        data: [],
        total: 0,
        error: 'Categoria não encontrada'
      };
    }
    
    const results = await searchInTable(tableName, searchTerm);
    
    return {
      success: true,
      data: results,
      total: results.length
    };
  } catch (error) {
    console.error('Erro na busca por categoria:', error);
    return {
      success: false,
      data: [],
      total: 0,
      error: 'Erro interno do servidor'
    };
  }
};

// Função para buscar dados de uma tabela específica
const fetchTableData = async (tableName: string, type: string): Promise<QuickSearchItem[]> => {
  try {
    const url = `${supabaseConfig.url}/rest/v1/${tableName}?select=*`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: supabaseConfig.headers
    });

    if (!response.ok) {
      console.warn(`Erro ao buscar na tabela ${tableName}:`, response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    // Converter dados para formato unificado
    const items = data.map((item: any) => ({
      id: item.id?.toString() || Math.random().toString(),
      name: item.nome || item.name || 'Nome não disponível',
      type: type,
      price: item.preco || item.price,
      specifications: item.especificacoes || item.specifications,
      brand: item.marca || item.brand,
      model: item.modelo || item.model
    }));
    
    return items;
  } catch (error) {
    console.error(`Erro ao buscar na tabela ${tableName}:`, error);
    return [];
  }
};

// Função para buscar todos os hardwares
export const getAllHardware = async (): Promise<QuickSearchResponse> => {
  try {
    // Fazer 4 requisições diretas para cada tabela
    const promises = [
      fetchTableData('Cpus', 'CPU'),
      fetchTableData('Video Cards', 'GPU'),
      fetchTableData('Motherboards', 'Motherboard'),
      fetchTableData('Rams', 'RAM')
    ];
    
    const results = await Promise.all(promises);
    
    // Consolidar resultados de todas as tabelas
    const allResults = results.flat();
    
    // Ordenar por tipo e depois por nome
    const sortedResults = allResults.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type);
      }
      return a.name.localeCompare(b.name);
    });
    
    return {
      success: true,
      data: sortedResults,
      total: sortedResults.length
    };
  } catch (error) {
    console.error('Erro ao buscar todos os hardwares:', error);
    return {
      success: false,
      data: [],
      total: 0,
      error: 'Erro interno do servidor'
    };
  }
};

// Função para enviar dados para o webhook do N8N
export const sendToN8NWebhook = async (hardware: QuickSearchItem): Promise<{ success: boolean; data?: QuickSearchResults; error?: string }> => {
  try {
    // Mapear tipo de hardware para o campo correto
    const getHardwareField = (type: string) => {
      switch (type) {
        case 'CPU': return 'cpu';
        case 'GPU': return 'gpu';
        case 'Motherboard': return 'motherboard';
        case 'RAM': return 'ram';
        case 'Storage': return 'storage';
        default: return 'cpu'; // fallback
      }
    };

    const hardwareField = getHardwareField(hardware.type);
    
    const payload: N8NWebhookPayload = {
      source: 'quick-search',
      timestamp: new Date().toISOString(),
      data: {
        [hardwareField]: hardware.name
      }
    };

    const response = await fetch(getWebhookUrl('QUICK_SEARCH'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro HTTP: ${response.status} - ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('📡 Resposta do N8N webhook:', result);
    
    // Processar resposta do N8N (aceita tanto array quanto objeto direto)
    let processedData: QuickSearchResults = {};
    
    // Verificar se é array ou objeto direto
    let hardwareData;
    if (Array.isArray(result) && result.length > 0) {
      hardwareData = result[0];
    } else if (result && typeof result === 'object') {
      hardwareData = result;
    } else {
      console.warn('⚠️ Resposta do N8N não é um formato válido');
      return { success: false, error: 'Formato de resposta inválido' };
    }
    
    // Verificar se contém dados de hardware válidos
    const hardwareTypes = ['cpu', 'gpu', 'motherboard', 'ram', 'storage'];
    let validHardwareType = null;
    
    for (const type of hardwareTypes) {
      if (hardwareData[type] && 
          hardwareData[type].best_price && 
          Array.isArray(hardwareData[type].best_price) &&
          hardwareData[type].best_score &&
          Array.isArray(hardwareData[type].best_score)) {
        validHardwareType = type;
        break;
      }
    }
    
    if (validHardwareType) {
      // Extrair apenas os dados do tipo de hardware encontrado
      processedData = {
        [validHardwareType]: hardwareData[validHardwareType]
      };
      console.log('✅ Dados processados com sucesso para:', validHardwareType);
    } else {
      console.warn('⚠️ Dados do hardware não possuem estrutura válida');
      return { success: false, error: 'Estrutura de dados inválida' };
    }

    return { success: true, data: processedData };
  } catch (error) {
    console.error('❌ Erro ao enviar para N8N webhook:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
};