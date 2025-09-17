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
import { convertN8NDataToFrontendFormat, sendIntermediatePriceSearch } from '@/services/n8n';
import HardwareResults from '@/components/ui/HardwareResults';

interface ComponentBasedConfigProps {
  onConfigGenerated?: (config: any) => void;
}

const ComponentBasedConfig: React.FC<ComponentBasedConfigProps> = ({ onConfigGenerated }) => {
  const [selectedComponent, setSelectedComponent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableComponents, setAvailableComponents] = useState<SearchableSelectOption[]>([]);
  const [suggestedConfig, setSuggestedConfig] = useState<AISuggestedComponent[] | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [unifiedData, setUnifiedData] = useState<any>(null);
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
    setExplanation('');
    setUnifiedData(null);
    
    try {
      const response = await getAIAssistance(selectedComponent);
      
      if (response.success) {
        setSuggestedConfig(response.components);
        // Explicação vinda do webhook (novo formato)
        if (response.message) setExplanation(response.message);

        // Montar payload para preços e chamar webhook intermediário
        const items = response.components
          .filter((c) => (c as any).component && (c as any).name)
          .map((c) => ({ component: (c as any).component, name: (c as any).name }));

        if (items.length > 0) {
          try {
            const priceResponse = await sendIntermediatePriceSearch(items as any);
            const rawArray = Array.isArray(priceResponse) ? priceResponse : [priceResponse];
            const converted = convertN8NDataToFrontendFormat(rawArray, false);
            setUnifiedData(converted);
          } catch (err) {
            console.error('Erro ao buscar preços (intermediário):', err);
          }
        }
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
      {!suggestedConfig && (
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
      )}

      {/* Explicação e Resultados (formato unificado, igual ao Iniciante) */}
      {suggestedConfig && suggestedConfig.length > 0 && (
        <>
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Bot className="w-6 h-6" />
                    Explicação da Configuração
                  </CardTitle>
                  <CardDescription>
                    Baseada no componente principal: <strong>{selectedComponent}</strong>
                  </CardDescription>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  {['gpu','cpu','motherboard','ram'].map((key) => {
                    const comp = suggestedConfig.find((c: any) => c.component === key);
                    if (!comp) return null;
                    const icon = key === 'gpu' ? <Monitor className="w-3.5 h-3.5" />
                               : key === 'cpu' ? <Cpu className="w-3.5 h-3.5" />
                               : key === 'ram' ? <MemoryStick className="w-3.5 h-3.5" />
                               : <HardDrive className="w-3.5 h-3.5" />;
                    return (
                      <div key={key} className="flex items-center gap-1 px-2 py-1 rounded-md border bg-white/70 dark:bg-purple-950/30 text-xs">
                        {icon}
                        <span className="max-w-[140px] truncate">{comp.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {explanation && (
                <p className="text-sm text-purple-800 dark:text-purple-200">{explanation}</p>
              )}
            </CardContent>
          </Card>

          {unifiedData?.data && (
            <HardwareResults
              data={unifiedData.data}
              rawData={unifiedData.rawData}
              title="Resultados da Análise"
              subtitle="Navegue pelas categorias para ver todas as opções disponíveis"
            />
          )}
        </>
      )}
    </div>
  );
};

export default ComponentBasedConfig;
