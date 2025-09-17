/**
 * Função utilitária para fazer requisições fetch com timeout configurável
 */
export interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number; // timeout em milissegundos
}

export async function fetchWithTimeout(
  url: string, 
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeout = 60000, ...fetchOptions } = options; // timeout padrão de 60 segundos
  
  // Criar AbortController para controlar o timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Verificar se foi um erro de timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Timeout: A requisição excedeu o tempo limite de ${timeout}ms`);
    }
    
    throw error;
  }
}

/**
 * Função específica para requisições N8N com timeout estendido
 */
export async function fetchN8NWithTimeout(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  return fetchWithTimeout(url, {
    ...options,
    timeout: 120000, // 2 minutos para requisições N8N
  });
}
