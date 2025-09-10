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
    const response = await fetch('https://thiagocotta.app.n8n.cloud/webhook-test/Assistencia-De-IA', {
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

    const data: AIAssistanceResponse[] = await response.json();
    
    if (!data || data.length === 0 || !data[0].output) {
      throw new Error('Resposta inválida da IA');
    }

    // Extrair JSON da string de resposta
    const jsonMatch = data[0].output.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch) {
      throw new Error('Formato de resposta inválido da IA');
    }

    const components: AISuggestedComponent[] = JSON.parse(jsonMatch[1]);
    
    return {
      success: true,
      components: components
    };

  } catch (error) {
    console.error('Erro ao chamar assistência de IA:', error);
    return {
      success: false,
      components: [],
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}
