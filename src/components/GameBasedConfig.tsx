import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Loader2, Gamepad2, Zap, Monitor, Cpu, MemoryStick, HardDrive, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendGameAIAssistance, GameAIAssistanceRequest } from '@/services/game-ai-assistance-api';
import { sendBeginnerPriceSearch, convertN8NDataToFrontendFormat } from '@/services/n8n';
import TypewriterEffect from './TypewriterEffect';
import { OfferResults } from '@/components/ui/offer-results';
import HardwareResults from '@/components/ui/HardwareResults';
import { HistoryService } from '@/services/history';
import { useSearch } from '@/contexts/SearchContext';

interface GameBasedConfigProps {
  onConfigGenerated?: (config: any) => void;
}

const GameBasedConfig: React.FC<GameBasedConfigProps> = ({ onConfigGenerated }) => {
  const [game, setGame] = useState('');
  const [qualidade, setQualidade] = useState<'minimo' | 'recomendado' | 'alto-60fps' | 'alto-100fps'>('recomendado');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingPrices, setIsSearchingPrices] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [explanation, setExplanation] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const { toast } = useToast();
  const { addSearch, completeSearch, errorSearch } = useSearch();

  // Carregar dados do histórico se disponível
  useEffect(() => {
    const historyData = localStorage.getItem('history-load-data');
    if (historyData) {
      try {
        const data = JSON.parse(historyData);
        if (data.source === 'game-ai' && data.loadedFromHistory) {
          console.log('Carregando dados do histórico:', data);
          
          // Carregar dados do jogo
          if (data.request?.jogo) {
            setGame(data.request.jogo);
          }
          if (data.request?.qualidade) {
            setQualidade(data.request.qualidade);
          }
          
          // Carregar resultado
          if (data.response) {
            setResult(data.response);
            if (data.response.explanation) {
              setExplanation(data.response.explanation);
              setShowExplanation(true);
            }
            onConfigGenerated?.(data.response);
          }
          
          // Limpar dados do localStorage
          localStorage.removeItem('history-load-data');
          
          toast({
            title: "Dados carregados do histórico",
            description: "Configuração restaurada com sucesso.",
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados do histórico:', error);
      }
    }
  }, [onConfigGenerated, toast]);

  const handleNewSearch = () => {
    setIsLoading(false);
    setIsSearchingPrices(false);
    setResult(null);
    setExplanation('');
    setShowExplanation(false);
    setGame('');
  };

  const qualidadeOptions = [
    {
      value: 'minimo' as const,
      label: 'Requisitos Mínimos',
      description: 'Jogo roda, mas com qualidade baixa',
      icon: <Gamepad2 className="w-4 h-4" />,
      color: 'bg-red-500/10 text-red-600 border-red-500/20'
    },
    {
      value: 'recomendado' as const,
      label: 'Requisitos Recomendados',
      description: 'Qualidade média com boa performance',
      icon: <Monitor className="w-4 h-4" />,
      color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
    },
    {
      value: 'alto-60fps' as const,
      label: 'Alto + 60 FPS',
      description: 'Alta qualidade com 60 FPS estáveis',
      icon: <Zap className="w-4 h-4" />,
      color: 'bg-green-500/10 text-green-600 border-green-500/20'
    },
    {
      value: 'alto-100fps' as const,
      label: 'Alto + 100+ FPS',
      description: 'Máxima qualidade com alta taxa de quadros',
      icon: <Cpu className="w-4 h-4" />,
      color: 'bg-purple-500/10 text-purple-600 border-purple-500/20'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!game.trim()) {
      toast({
        title: "Jogo necessário",
        description: "Por favor, digite o nome do jogo que você deseja jogar.",
        variant: "destructive",
      });
      return;
    }

    // Adicionar busca ao sistema persistente
    const searchId = addSearch({
      type: 'game-ai',
      title: `Configuração para ${game}`,
      subtitle: `Qualidade: ${qualidadeOptions.find(opt => opt.value === qualidade)?.label}`,
      onComplete: (result) => {
        // Atualizar estado local também
        setResult(result);
        if (result.explanation) {
          setExplanation(result.explanation);
          setShowExplanation(true);
        }
        onConfigGenerated?.(result);
        toast({
          title: "Configuração gerada!",
          description: `Configuração otimizada para ${game} criada com sucesso.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Erro",
          description: error instanceof Error ? error.message : "Erro ao gerar configuração para o jogo.",
          variant: "destructive",
        });
      }
    });

    setIsLoading(true);
    setResult(null);
    setExplanation('');
    setShowExplanation(false);

    try {
      const request: GameAIAssistanceRequest = {
        game: game.trim(),
        qualidade
      };

      const response = await sendGameAIAssistance(request);
      console.log('Resposta completa da API:', response);

      if (response.success && response.data) {
        const configData: any = Array.isArray(response.data) ? response.data[0] : response.data;
        console.log('Dados de configuração:', configData);
        
        // Separar componentes da explicação
        const itemsArray = Array.isArray(configData?.data) ? configData.data : [];
        const components = itemsArray.filter((item: any) => item.component);
        const explanationItem = itemsArray.find((item: any) => item.Explicacao);
        
        console.log('Componentes filtrados:', components);
        console.log('Item de explicação:', explanationItem);
        
        const processedData = {
          components: components,
          Explicacao: explanationItem?.Explicacao || ''
        };
        
        console.log('Dados processados:', processedData);

        // Iniciar busca de preços (iniciante) ANTES de exibir explicação
        let priceData = null;
        let unifiedData = null;
        
        try {
          setIsSearchingPrices(true);
          const beginnerPayload = components.map((c: any) => ({ component: c.component, name: c.name }));
          console.log('Buscando preços com payload:', beginnerPayload);
          const priceResponse = await sendBeginnerPriceSearch(beginnerPayload);
          console.log('Resposta de preços recebida:', priceResponse);
          
          // Converter formato do iniciante para o formato unificado usado no Avançado
          const rawArray = Array.isArray(priceResponse) ? priceResponse : [priceResponse];
          unifiedData = convertN8NDataToFrontendFormat(rawArray, false);
          priceData = priceResponse;
          
          console.log('Dados de preços processados:', { priceData, unifiedData });
        } catch (err) {
          console.error('Erro ao buscar preços (iniciante):', err);
          // Continuar mesmo com erro na busca de preços
        } finally {
          setIsSearchingPrices(false);
        }
        
        // Definir resultado final com ou sem dados de preços
        const finalResult = { 
          ...processedData, 
          priceData, 
          unifiedData 
        };
        
        console.log('Resultado final definido:', finalResult);
        setResult(finalResult);
        
        // Atualizar estado local
        if (processedData.Explicacao) {
          setExplanation(processedData.Explicacao);
          setShowExplanation(true);
        }
        onConfigGenerated?.(finalResult);
        
        // Toast de sucesso
        toast({
          title: "Configuração gerada!",
          description: `Configuração otimizada para ${game} criada com sucesso.`,
        });
        
        // Completar busca com sucesso
        completeSearch(searchId, finalResult);

        // Salvar no histórico
        HistoryService.add({
          source: 'game-ai',
          title: `Configuração para ${game}`,
          subtitle: `Qualidade: ${qualidadeOptions.find(opt => opt.value === qualidade)?.label}`,
          request: {
            jogo: game,
            qualidade: qualidade,
            nivel: qualidade === 'minimo' ? 'Iniciante' : qualidade === 'recomendado' ? 'Intermediário' : 'Avançado'
          },
          response: {
            components: components,
            explanation: processedData.Explicacao,
            priceData: priceData,
            unifiedData: unifiedData
          },
        });
      } else {
        throw new Error(response.error || 'Erro ao gerar configuração');
      }
    } catch (error) {
      console.error('Erro ao gerar configuração baseada em jogos:', error);
      
      // Completar busca com erro
      errorSearch(searchId, error);
      
      // Registrar erro no histórico
      HistoryService.add({
        source: 'game-ai',
        title: `Erro - Configuração para ${game}`,
        subtitle: `Qualidade: ${qualidadeOptions.find(opt => opt.value === qualidade)?.label}`,
        request: {
          jogo: game,
          qualidade: qualidade,
          nivel: qualidade === 'minimo' ? 'Iniciante' : qualidade === 'recomendado' ? 'Intermediário' : 'Avançado'
        },
        response: { 
          error: error instanceof Error ? error.message : 'Erro desconhecido' 
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!isLoading && !result && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Gamepad2 className="w-6 h-6 text-blue-600" />
              Configuração Baseada em Jogos
            </CardTitle>
            <CardDescription>
              Digite o jogo que você quer jogar e escolha a qualidade desejada. Nossa IA criará uma configuração otimizada.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="game" className="text-base font-semibold">
                Qual jogo você quer jogar?
              </Label>
              <Input
                id="game"
                placeholder="Ex: Cyberpunk 2077, Elden Ring, Valorant..."
                value={game}
                onChange={(e) => setGame(e.target.value)}
                disabled={isLoading}
                className="text-base"
              />
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">
                Qual qualidade você deseja?
              </Label>
              <RadioGroup
                value={qualidade}
                onValueChange={(value) => setQualidade(value as any)}
                disabled={isLoading}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {qualidadeOptions.map((option) => (
                  <div key={option.value} className="space-y-2">
                    <label
                      htmlFor={option.value}
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        qualidade === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {option.icon}
                          <span className="font-medium">{option.label}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>

              <Button
                type="submit"
                disabled={!game.trim() || isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-base font-semibold"
              >
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5" />
                  Gerar Configuração para {game || 'Jogo'}
                </div>
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Estado de carregamento após envio */}
      {isLoading && !showExplanation && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-8">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-base font-medium">Gerando configuração com IA...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Explicação com efeito de digitação + resumo compacto */}
      {showExplanation && explanation && (
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl text-purple-800 dark:text-purple-200">
                  <Sparkles className="w-6 h-6" />
                  Explicação da Configuração
                </CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Nossa IA explica por que escolheu cada componente para {game}
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                {/* Tags de componentes */}
                <div className="hidden md:flex items-center gap-2">
                  {['gpu','cpu','motherboard','ram'].map((key) => {
                    const comp = result?.components?.find((c: any) => c.component === key);
                    if (!comp) return null;
                    const icon = (() => {
                      switch (key) {
                        case 'gpu': return <Monitor className="w-3.5 h-3.5" />;
                        case 'cpu': return <Cpu className="w-3.5 h-3.5" />;
                        case 'ram': return <MemoryStick className="w-3.5 h-3.5" />;
                        case 'motherboard': return <HardDrive className="w-3.5 h-3.5" />;
                        default: return <Cpu className="w-3.5 h-3.5" />;
                      }
                    })();
                    return (
                      <div key={key} className="flex items-center gap-1 px-2 py-1 rounded-md border bg-white/70 dark:bg-purple-950/30 text-xs">
                        {icon}
                        <span className="max-w-[140px] truncate">{comp.name}</span>
                      </div>
                    );
                  })}
                </div>

                <Button size="sm" variant="outline" onClick={handleNewSearch} className="whitespace-nowrap">
                  Nova consulta
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="p-4 bg-white dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
              <TypewriterEffect
                text={explanation}
                speed={30}
                className="text-purple-800 dark:text-purple-200"
                onComplete={() => {
                  console.log('Explicação completa!');
                }}
              />
            </div>

            {/* Resumo compacto removido; tags no topo já informam os componentes */}
          </CardContent>
        </Card>
      )}

      {/* Removido o card de busca de preços para manter foco na explicação */}

      {/* Card de configuração detalhada removido; resumo já incluso na explicação */}

      {/* Resultados do iniciante usando o mesmo componente unificado */}
      {result?.unifiedData?.data ? (
        <HardwareResults
          data={result.unifiedData.data}
          rawData={result.unifiedData.rawData}
          title="Resultados da Análise"
          subtitle="Navegue pelas categorias para ver todas as opções disponíveis"
        />
      ) : result?.components && result.components.length > 0 ? (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-green-800 dark:text-green-200">
              <Gamepad2 className="w-6 h-6" />
              Componentes Recomendados
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Configuração otimizada para {game}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.components.map((comp: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-white/50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  {comp.component === 'gpu' && <Monitor className="w-5 h-5 text-green-600" />}
                  {comp.component === 'cpu' && <Cpu className="w-5 h-5 text-green-600" />}
                  {comp.component === 'ram' && <MemoryStick className="w-5 h-5 text-green-600" />}
                  {comp.component === 'motherboard' && <HardDrive className="w-5 h-5 text-green-600" />}
                  <div className="flex-1">
                    <div className="font-medium text-sm text-green-900 dark:text-green-100">
                      {comp.component === 'gpu' ? 'Placa de Vídeo' : 
                       comp.component === 'cpu' ? 'Processador' :
                       comp.component === 'ram' ? 'Memória RAM' :
                       comp.component === 'motherboard' ? 'Placa Mãe' : comp.component}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">{comp.name}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Nota:</strong> A busca de preços não foi concluída. Os componentes foram selecionados com base na compatibilidade e performance para {game}.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default GameBasedConfig;
