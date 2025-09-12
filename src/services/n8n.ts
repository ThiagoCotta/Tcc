export interface N8NPCConfigPayload {
  gpu: string;
  cpu: string;
  motherboard: string;
  ram: string;
  considerReviews: boolean;
}

// Novo formato baseado na resposta do N8N
export interface N8NHardwareItem {
  title: string;
  source: string;
  link: string;
  price: number;
  imageUrl: string;
  rating?: number;
  ratingCount?: number;
  valueScore?: number;
}

export interface N8NHardwareCategory {
  best_price: N8NHardwareItem[];
  best_score: N8NHardwareItem[];
}

export interface N8NResponseData {
  motherboard?: N8NHardwareCategory;
  cpu?: N8NHardwareCategory;
  gpu?: N8NHardwareCategory;
  ram?: N8NHardwareCategory;
}

// Interface para compatibilidade com o frontend existente
export interface HardwareItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  rating?: number;
  reviews?: number;
  model: string;
  specifications: Record<string, string>;
  link: string;
}

export interface HardwareListResponse {
  hardwareType: 'gpu' | 'cpu' | 'motherboard' | 'ram';
  items: HardwareItem[];
  considerReviews: boolean;
  totalItems: number;
}

export interface N8NResponse {
  success: boolean;
  data: {
    gpu?: HardwareListResponse;
    cpu?: HardwareListResponse;
    motherboard?: HardwareListResponse;
    ram?: HardwareListResponse;
  };
  rawData?: N8NResponseData[]; // Armazenar dados brutos para alternância
  message?: string;
}

// Função para converter dados do N8N para o formato esperado pelo frontend
function convertN8NDataToFrontendFormat(n8nData: N8NResponseData[], considerReviews: boolean): N8NResponse {
  const result: N8NResponse = {
    success: true,
    data: {},
    rawData: n8nData, // Armazenar dados brutos
    message: "Configuração processada com sucesso"
  };


  // Processar cada categoria de hardware
  n8nData.forEach((categoryData, index) => {
    
    Object.entries(categoryData).forEach(([hardwareType, hardwareCategory]) => {
      if (hardwareCategory && (hardwareType === 'gpu' || hardwareType === 'cpu' || hardwareType === 'motherboard' || hardwareType === 'ram')) {
        
        // Escolher entre best_price ou best_score baseado em considerReviews
        const sourceArray = considerReviews ? hardwareCategory.best_score : hardwareCategory.best_price;
        
        // Verificar se sourceArray existe e é um array
        if (!sourceArray || !Array.isArray(sourceArray)) {
          console.warn(`No valid data found for ${hardwareType} with considerReviews: ${considerReviews}`);
          return;
        }
        
        
        const items: HardwareItem[] = sourceArray.map((item, index) => ({
          id: `${hardwareType}-${index}`,
          name: item.title,
          price: item.price,
          imageUrl: item.imageUrl,
          rating: item.rating,
          reviews: item.ratingCount,
          model: item.title, // Usar o título como modelo
          specifications: {
            "Fonte": item.source,
            "Valor Score": item.valueScore ? item.valueScore.toFixed(2) : "N/A"
          },
          link: item.link
        }));

        result.data[hardwareType as keyof typeof result.data] = {
          hardwareType: hardwareType as 'gpu' | 'cpu' | 'motherboard' | 'ram',
          items,
          considerReviews,
          totalItems: items.length
        };
        
      }
    });
  });

  return result;
}

// Função para converter dados brutos para um tipo específico de hardware
export function convertRawDataToHardwareItems(
  rawData: N8NResponseData[], 
  hardwareType: 'gpu' | 'cpu' | 'motherboard' | 'ram', 
  considerReviews: boolean
): HardwareItem[] {
  
  const items: HardwareItem[] = [];
  
  rawData.forEach(categoryData => {
    const hardwareCategory = categoryData[hardwareType];
    if (hardwareCategory) {
      const sourceArray = considerReviews ? hardwareCategory.best_score : hardwareCategory.best_price;
      
      if (sourceArray && Array.isArray(sourceArray)) {
        
        const convertedItems = sourceArray.map((item, index) => ({
          id: `${hardwareType}-${index}`,
          name: item.title,
          price: item.price,
          imageUrl: item.imageUrl,
          rating: item.rating,
          reviews: item.ratingCount,
          model: item.title, // Usar o título como modelo
          specifications: {
            "Fonte": item.source,
            "Valor Score": item.valueScore ? item.valueScore.toFixed(2) : "N/A"
          },
          link: item.link
        }));
        
        items.push(...convertedItems);
      }
    }
  });
  
  return items;
}

export async function sendPCConfigToN8N(payload: N8NPCConfigPayload): Promise<N8NResponse> {
  const url = "https://thiagocotta.app.n8n.cloud/webhook-test/pc-config";
  if (!url) {
    throw new Error("VITE_N8N_WEBHOOK_URL não configurada no .env");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source: "pc-builder",
      timestamp: new Date().toISOString(),
      data: payload,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Falha ao enviar para N8N: ${response.status} ${text}`);
  }

  try {
    const rawData = await response.json();
    
    // Tratar diferentes formatos de resposta
    let n8nData: N8NResponseData[];
    
    if (Array.isArray(rawData)) {
      n8nData = rawData;
    } else if (rawData && typeof rawData === 'object') {
      // Se for um objeto, tentar extrair os dados
      if (rawData.data && Array.isArray(rawData.data)) {
        n8nData = rawData.data;
      } else {
        // Se for um objeto com as categorias diretamente
        n8nData = [rawData];
      }
    } else {
      throw new Error(`Formato de resposta inesperado do N8N: ${typeof rawData}`);
    }
    
    
    // Converter para o formato esperado pelo frontend
    return convertN8NDataToFrontendFormat(n8nData, payload.considerReviews);
  } catch (error) {
    console.error('Erro ao processar resposta do N8N:', error);
    throw new Error(`Erro ao processar resposta do N8N: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

// Busca de preços para fluxo iniciante (jogos)
export interface BeginnerPriceItem {
  component: string;
  name: string;
}

export async function sendBeginnerPriceSearch(items: BeginnerPriceItem[]): Promise<any> {
  const url = 'https://thiagocotta.app.n8n.cloud/webhook-test/Buscar-Preco-Hardware-Iniciante';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(items),
    // Timeout opcional pode ser adicionado se necessário
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Falha ao buscar preços (iniciante): ${response.status} ${text}`);
  }

  // Pode retornar array ou objeto; manter flexível
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}