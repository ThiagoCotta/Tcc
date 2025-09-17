import { getWebhookUrl } from '@/config/environment';
import { fetchN8NWithTimeout } from '@/utils/fetchWithTimeout';

// Interface para resposta da IA
export interface AIAssistanceResponse {
  output: string;
}

// Interface para componente sugerido pela IA
export interface AISuggestedComponent {
  component: 'gpu' | 'cpu' | 'motherboard' | 'ram';
  name: string;
}

// Interface para resposta processada
export interface ProcessedAIResponse {
  success: boolean;
  components: AISuggestedComponent[];
  message?: string;
}

/**
 * Chama o webhook da IA para obter sugestões de componentes
 * @param primaryComponent Componente principal selecionado pelo usuário
 * @returns Resposta processada com componentes sugeridos
 */
export async function getAIAssistance(primaryComponent: string): Promise<ProcessedAIResponse> {
  try {
    console.log('Enviando requisição para IA Assistência:', { primaryComponent });
    
    const response = await fetchN8NWithTimeout(getWebhookUrl('AI_ASSISTANCE'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        primaryComponent: primaryComponent
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const raw = await response.json();

    // Suporte a formatos:
    // 1) Novo: Array|Objeto com .data (lista de items contendo {component,name} e opcional {Explicacao})
    // 2) Antigo: Array com { output: "```json ... ```" }

    // Caso seja objeto com data
    if (raw && typeof raw === 'object' && !Array.isArray(raw) && (raw as any).data) {
      const items = Array.isArray((raw as any).data) ? (raw as any).data : [];
      const components = items.filter((i: any) => i.component && i.name) as AISuggestedComponent[];
      const exp = items.find((i: any) => i.Explicacao)?.Explicacao as string | undefined;
      return { success: true, components, message: exp };
    }

    // Caso seja array (novo ou antigo)
    if (Array.isArray(raw) && raw.length > 0) {
      const first = raw[0];
      // Novo formato
      if (first && typeof first === 'object' && (first as any).data) {
        const items = Array.isArray((first as any).data) ? (first as any).data : [];
        const components = items.filter((i: any) => i.component && i.name) as AISuggestedComponent[];
        const exp = items.find((i: any) => i.Explicacao)?.Explicacao as string | undefined;
        return { success: true, components, message: exp };
      }
      // Antigo formato
      if (first && typeof first === 'object' && (first as any).output) {
        const data: AIAssistanceResponse[] = raw;
        const jsonMatch = data[0].output.match(/```json\n([\s\S]*?)\n```/);
        if (!jsonMatch) {
          throw new Error('Formato de resposta inválido da IA');
        }
        const components: AISuggestedComponent[] = JSON.parse(jsonMatch[1]);
        return { success: true, components };
      }
    }

    throw new Error('Formato de resposta da IA não reconhecido');

  } catch (error) {
    console.error('Erro ao chamar assistência de IA:', error);
    return {
      success: false,
      components: [],
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}
