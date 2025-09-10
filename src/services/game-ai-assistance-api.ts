export interface GameAIAssistanceRequest {
  game: string;
  qualidade: 'minimo' | 'recomendado' | 'alto-60fps' | 'alto-100fps';
}

export interface GameAIAssistanceResponse {
  success: boolean;
  message?: string;
  data?: {
    suggestedComponents: {
      cpu: string;
      gpu: string;
      ram: string;
      motherboard: string;
      storage: string;
    };
    reasoning: string;
    estimatedPrice: string;
    performanceLevel: string;
  };
  error?: string;
}

export const sendGameAIAssistance = async (
  request: GameAIAssistanceRequest
): Promise<GameAIAssistanceResponse> => {
  try {
    const response = await fetch('https://thiagocotta.app.n8n.cloud/webhook-test/Assistencia-De-IA-Para-Jogos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data,
      message: 'Configuração gerada com sucesso!'
    };
  } catch (error) {
    console.error('Erro ao enviar assistência de IA para jogos:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao processar solicitação'
    };
  }
};
