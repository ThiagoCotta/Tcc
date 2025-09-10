import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bot, Cpu, Monitor, MemoryStick, HardDrive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAIAssistance, AISuggestedComponent } from '@/services/ai-assistance-api';
import { fetchHardwareList } from '@/services/hardware-api';
import { SearchableSelect, SearchableSelectOption } from '@/components/ui/searchable-select';

interface ComponentBasedConfigProps {
  onConfigGenerated?: (config: any) => void;
}

const ComponentBasedConfig: React.FC<ComponentBasedConfigProps> = ({ onConfigGenerated }) => {
  const [selectedComponent, setSelectedComponent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableComponents, setAvailableComponents] = useState<SearchableSelectOption[]>([]);
  const [suggestedConfig, setSuggestedConfig] = useState<AISuggestedComponent[] | null>(null);
  const { toast } = useToast();

  // Carregar componentes disponíveis apenas quando necessário
  const loadComponents = async () => {
    if (availableComponents.length > 0) return; // Já carregado
    
    try {
      const [gpuList, cpuList] = await Promise.all([
        fetchHardwareList('gpu'),
        fetchHardwareList('cpu')
      ]);
      
      const allComponents: SearchableSelectOption[] = [
        ...gpuList.map(item => ({
          value: item.name,
          label: item.name,
          type: 'gpu' as const
        })),
        ...cpuList.map(item => ({
          value: item.name,
          label: item.name,
          type: 'cpu' as const
        }))
      ];
      
      setAvailableComponents(allComponents);
    } catch (error) {
      console.error('Erro ao carregar componentes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de componentes.",
        variant: "destructive",
      });
    }
  };

  // Carregar componentes quando o componente é montado
  useEffect(() => {
    loadComponents();
  }, []);

  const handleAIAssistance = async () => {
    if (!selectedComponent) {
      toast({
        title: "Seleção necessária",
        description: "Por favor, selecione um componente principal primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSuggestedConfig(null);
    
    try {
      const response = await getAIAssistance(selectedComponent);
      
      if (response.success) {
        setSuggestedConfig(response.components);
        onConfigGenerated?.(response.components);
        toast({
          title: "Configuração gerada!",
          description: `A IA sugeriu ${response.components.length} componentes para sua configuração.`,
        });
      } else {
        throw new Error(response.message || "Erro ao obter sugestões da IA");
      }
    } catch (error) {
      console.error("Erro ao obter assistência da IA:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao obter sugestões da IA.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getComponentIcon = (component: string) => {
    switch (component) {
      case 'gpu':
        return <Monitor className="w-5 h-5" />;
      case 'cpu':
        return <Cpu className="w-5 h-5" />;
      case 'ram':
        return <MemoryStick className="w-5 h-5" />;
      case 'motherboard':
        return <HardDrive className="w-5 h-5" />;
      default:
        return <Cpu className="w-5 h-5" />;
    }
  };

  const getComponentName = (component: string) => {
    switch (component) {
      case 'gpu':
        return 'Placa de Vídeo';
      case 'cpu':
        return 'Processador';
      case 'ram':
        return 'Memória RAM';
      case 'motherboard':
        return 'Placa Mãe';
      default:
        return component;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Bot className="w-6 h-6 text-yellow-600" />
            Escolha uma Peça Principal
          </CardTitle>
          <CardDescription>
            Selecione um processador ou placa de vídeo como base. Nossa IA criará uma configuração completa e compatível.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
              Qual será a peça principal do seu computador?
            </Label>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Escolha um processador ou placa de vídeo como base para sua configuração
            </p>
            <SearchableSelect
              options={availableComponents}
              value={selectedComponent}
              onValueChange={setSelectedComponent}
              placeholder="Digite para buscar um processador ou placa de vídeo..."
              disabled={isLoading}
            />
          </div>

          <Button 
            onClick={handleAIAssistance}
            disabled={!selectedComponent || isLoading}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white disabled:opacity-50 py-4 text-lg font-semibold"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                IA analisando componentes...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Bot className="w-5 h-5" />
                Gerar Configuração Completa
              </div>
            )}
          </Button>

          {isLoading && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-8 h-8 border-4 border-yellow-200 border-t-yellow-600 rounded-full animate-spin"></div>
                </div>
                <div>
                  <p className="text-base font-medium text-yellow-900 dark:text-yellow-100">
                    IA analisando compatibilidade...
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Criando configuração otimizada para {selectedComponent}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultado da configuração */}
      {suggestedConfig && suggestedConfig.length > 0 && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-green-800 dark:text-green-200">
              <Bot className="w-6 h-6" />
              Configuração Sugerida pela IA
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Baseada no componente principal: <strong>{selectedComponent}</strong>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedConfig.map((component, index) => (
                <div key={index} className="p-4 bg-white dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-2">
                    {getComponentIcon(component.component)}
                    <div>
                      <Label className="text-sm font-medium text-green-800 dark:text-green-200">
                        {getComponentName(component.component)}
                      </Label>
                      <p className="text-sm font-semibold text-green-600">
                        {component.name}
                      </p>
                    </div>
                  </div>
                  {component.reasoning && (
                    <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                      {component.reasoning}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-white dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">
                  Próximos Passos
                </span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Esta configuração foi otimizada para compatibilidade e performance. 
                Você pode usar essas sugestões como base para sua configuração final.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComponentBasedConfig;
