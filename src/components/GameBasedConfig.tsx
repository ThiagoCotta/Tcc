import React, { useState } from 'react';
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
        try {
          setIsSearchingPrices(true);
          const beginnerPayload = components.map((c: any) => ({ component: c.component, name: c.name }));
          const priceResponse = await sendBeginnerPriceSearch(beginnerPayload);
          // Converter formato do iniciante para o formato unificado usado no Avançado
          const rawArray = Array.isArray(priceResponse) ? priceResponse : [priceResponse];
          const converted = convertN8NDataToFrontendFormat(rawArray, false);
          setResult({ ...processedData, priceData: priceResponse, unifiedData: converted });
        } catch (err) {
          console.error('Erro ao buscar preços (iniciante):', err);
          setResult(processedData);
        } finally {
          setIsSearchingPrices(false);
        }
        
        // Mostrar explicação com efeito de digitação enquanto preços são buscados em paralelo
        if (processedData.Explicacao) {
          setExplanation(processedData.Explicacao);
          setShowExplanation(true);
        }
        
        onConfigGenerated?.(processedData);
        toast({
          title: "Configuração gerada!",
          description: `Configuração otimizada para ${game} criada com sucesso.`,
        });
      } else {
        throw new Error(response.error || 'Erro ao gerar configuração');
      }
    } catch (error) {
      console.error('Erro ao gerar configuração baseada em jogos:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao gerar configuração para o jogo.",
        variant: "destructive",
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
      {result?.unifiedData?.data && (
        <HardwareResults
          data={result.unifiedData.data}
          rawData={result.unifiedData.rawData}
          title="Resultados da Análise"
          subtitle="Navegue pelas categorias para ver todas as opções disponíveis"
        />
      )}
    </div>
  );
};

export default GameBasedConfig;
