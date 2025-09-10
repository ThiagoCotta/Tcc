import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Loader2, Gamepad2, Zap, Monitor, Cpu, MemoryStick } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendGameAIAssistance, GameAIAssistanceRequest } from '@/services/game-ai-assistance-api';

interface GameBasedConfigProps {
  onConfigGenerated?: (config: any) => void;
}

const GameBasedConfig: React.FC<GameBasedConfigProps> = ({ onConfigGenerated }) => {
  const [game, setGame] = useState('');
  const [qualidade, setQualidade] = useState<'minimo' | 'recomendado' | 'alto-60fps' | 'alto-100fps'>('recomendado');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
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

    try {
      const request: GameAIAssistanceRequest = {
        game: game.trim(),
        qualidade
      };

      const response = await sendGameAIAssistance(request);

      if (response.success && response.data) {
        setResult(response.data);
        onConfigGenerated?.(response.data);
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

      {/* Resultado da configuração */}
      {result && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-green-800 dark:text-green-200">
              <Zap className="w-6 h-6" />
              Configuração Gerada para {game}
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              {result.reasoning}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-green-800 dark:text-green-200">
                  Processador
                </Label>
                <div className="flex items-center gap-2 p-3 bg-white dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <Cpu className="w-4 h-4 text-green-600" />
                  <span className="font-medium">{result.suggestedComponents.cpu}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-green-800 dark:text-green-200">
                  Placa de Vídeo
                </Label>
                <div className="flex items-center gap-2 p-3 bg-white dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <Monitor className="w-4 h-4 text-green-600" />
                  <span className="font-medium">{result.suggestedComponents.gpu}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-green-800 dark:text-green-200">
                  Memória RAM
                </Label>
                <div className="flex items-center gap-2 p-3 bg-white dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <MemoryStick className="w-4 h-4 text-green-600" />
                  <span className="font-medium">{result.suggestedComponents.ram}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-green-800 dark:text-green-200">
                  Placa Mãe
                </Label>
                <div className="flex items-center gap-2 p-3 bg-white dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <Cpu className="w-4 h-4 text-green-600" />
                  <span className="font-medium">{result.suggestedComponents.motherboard}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <div>
                <Label className="text-sm font-medium text-green-800 dark:text-green-200">
                  Nível de Performance
                </Label>
                <p className="text-lg font-bold text-green-600">{result.performanceLevel}</p>
              </div>
              <div className="text-right">
                <Label className="text-sm font-medium text-green-800 dark:text-green-200">
                  Preço Estimado
                </Label>
                <p className="text-lg font-bold text-green-600">{result.estimatedPrice}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GameBasedConfig;
