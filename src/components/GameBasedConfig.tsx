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
import { sendBeginnerPriceSearch } from '@/services/n8n';
import TypewriterEffect from './TypewriterEffect';

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
          // Atualiza resultado com retorno de preços (mesma interface usada no avançado quando implementado)
          setResult({ ...processedData, priceData: priceResponse });
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
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gerando configuração...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5" />
                  Gerar Configuração para {game || 'Jogo'}
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Explicação com efeito de digitação */}
      {showExplanation && explanation && (
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-purple-800 dark:text-purple-200">
              <Sparkles className="w-6 h-6" />
              Explicação da Configuração
            </CardTitle>
            <CardDescription className="text-purple-700 dark:text-purple-300">
              Nossa IA explica por que escolheu cada componente para {game}
            </CardDescription>
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
          </CardContent>
        </Card>
      )}

      {/* Busca de preços */}
      {isSearchingPrices && (
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-8 h-8 border-4 border-yellow-200 border-t-yellow-600 rounded-full animate-spin"></div>
              </div>
              <div>
                <p className="text-base font-medium text-yellow-900 dark:text-yellow-100">
                  Buscando melhores preços...
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Analisando ofertas em tempo real para sua configuração
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado da configuração */}
      {result && result.components && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-green-800 dark:text-green-200">
              <Zap className="w-6 h-6" />
              Configuração Gerada para {game}
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Componentes selecionados pela IA para {qualidadeOptions.find(opt => opt.value === qualidade)?.label}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.components.map((component: any, index: number) => {
                const getComponentIcon = (componentType: string) => {
                  switch (componentType) {
                    case 'gpu':
                      return <Monitor className="w-4 h-4 text-green-600" />;
                    case 'cpu':
                      return <Cpu className="w-4 h-4 text-green-600" />;
                    case 'ram':
                      return <MemoryStick className="w-4 h-4 text-green-600" />;
                    case 'motherboard':
                      return <HardDrive className="w-4 h-4 text-green-600" />;
                    default:
                      return <Cpu className="w-4 h-4 text-green-600" />;
                  }
                };

                const getComponentName = (componentType: string) => {
                  switch (componentType) {
                    case 'gpu':
                      return 'Placa de Vídeo';
                    case 'cpu':
                      return 'Processador';
                    case 'ram':
                      return 'Memória RAM';
                    case 'motherboard':
                      return 'Placa Mãe';
                    default:
                      return componentType;
                  }
                };

                return (
                  <div key={index} className="space-y-2">
                    <Label className="text-sm font-medium text-green-800 dark:text-green-200">
                      {getComponentName(component.component)}
                    </Label>
                    <div className="flex items-center gap-2 p-3 bg-white dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                      {getComponentIcon(component.component)}
                      <span className="font-medium">{component.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between p-4 bg-white dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <div>
                <Label className="text-sm font-medium text-green-800 dark:text-green-200">
                  Qualidade Selecionada
                </Label>
                <p className="text-lg font-bold text-green-600">
                  {qualidadeOptions.find(opt => opt.value === qualidade)?.label}
                </p>
              </div>
              <div className="text-right">
                <Label className="text-sm font-medium text-green-800 dark:text-green-200">
                  Status
                </Label>
                <p className="text-lg font-bold text-green-600">
                  {isSearchingPrices ? 'Buscando preços...' : 'Configuração pronta!'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GameBasedConfig;
