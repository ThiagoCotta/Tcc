export interface GameAIAssistanceRequest {
  game: string;
  qualidade: 'minimo' | 'recomendado' | 'alto-60fps' | 'alto-100fps';
}

export interface GameAIAssistanceResponse {
  success: boolean;
  message?: string;
  data?: {
    components: Array<{
      component: string;
      name: string;
    }>;
    Explicacao: string;
  }[];
  error?: string;
}

export const sendGameAIAssistance = async (
  request: GameAIAssistanceRequest
): Promise<GameAIAssistanceResponse> => {
  try {
    console.log('Enviando requisição POST para N8N:', request);
    
    const response = await fetch('https://thiagocotta.app.n8n.cloud/webhook-test/Assistencia-De-IA-Para-Jogos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
      // Adicionar timeout e outras configurações
      signal: AbortSignal.timeout(30000), // 30 segundos de timeout
    });

    console.log('Resposta recebida do N8N:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro HTTP:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    // Verificar se a resposta tem conteúdo antes de tentar fazer parse JSON
    const responseText = await response.text();
    console.log('Resposta bruta do N8N:', responseText);
    console.log('Status da resposta:', response.status);
    console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));
    
    if (!responseText) {
      throw new Error('Resposta vazia do servidor');
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('JSON parseado com sucesso:', data);
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      console.log('Conteúdo que causou erro:', responseText);
      throw new Error(`Erro ao fazer parse do JSON: ${parseError}`);
    }
    
    // Verificar se a resposta é um array (formato atual do webhook)
    if (Array.isArray(data) && data.length > 0) {
      console.log('Resposta é um array válido');
      return {
        success: true,
        data: data,
        message: 'Configuração gerada com sucesso!'
      };
    }
    
    // Se não for array, retornar como estava antes
    console.log('Resposta não é array, retornando como objeto');
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
