import { HardwareListItem } from '../types/hardware';
import { SUPABASE_CONFIG, getSupabaseHeaders, buildSupabaseUrl } from '../config/supabase';

// Interface para resposta da API do Supabase
export interface SupabaseHardwareItem {
  nome: string;
}

// Interface para resposta da API
export interface HardwareApiResponse {
  items: HardwareListItem[];
};

// Função para buscar lista de hardware de um tipo específico do Supabase
export async function fetchHardwareList(type: keyof typeof SUPABASE_CONFIG.tables): Promise<HardwareListItem[]> {
  try {
    const tableName = SUPABASE_CONFIG.tables[type];
    const url = buildSupabaseUrl(tableName, 'nome');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getSupabaseHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }
    
    const data: SupabaseHardwareItem[] = await response.json();
    
    // Converte a estrutura do Supabase para a estrutura esperada
    return data.map(item => ({
      id: item.nome, // Usando o nome como ID temporariamente
      name: item.nome,
      type: type
    }));
  } catch (error) {
    console.error(`Erro ao buscar ${type}:`, error);
    throw error;
  }
}

/**
 * Filtra a lista de hardware com base no termo de busca
 * @param list Lista de hardware
 * @param searchTerm Termo de busca
 * @returns Lista filtrada
 */
export function filterHardwareList(list: HardwareListItem[], searchTerm: string): HardwareListItem[] {
  if (!searchTerm.trim()) {
    return list;
  }
  
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();
  
  return list.filter(item => 
    item.nome.toLowerCase().includes(normalizedSearchTerm)
  );
}