import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Cpu, HardDrive, MemoryStick, Monitor, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendPCConfigToN8N, N8NResponse, N8NResponseData } from '@/services/n8n';
import { HardwareSelect } from '@/components/ui/hardware-select';
import HardwarePopup from './HardwarePopup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HardwareResults from '@/components/ui/HardwareResults';
import { HistoryService } from '@/services/history';

interface AdvancedConfigProps {
  onConfigGenerated?: (config: any) => void;
}

interface PCConfig {
  gpu: string;
  cpu: string;
  motherboard: string;
  ram: string;
}

const AdvancedConfig: React.FC<AdvancedConfigProps> = ({ onConfigGenerated }) => {
  const [config, setConfig] = useState<PCConfig>({
    gpu: "",
    cpu: "",
    motherboard: "",
    ram: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [hardwareData, setHardwareData] = useState<N8NResponse | null>(null);
  const [rawN8NData, setRawN8NData] = useState<N8NResponseData[] | null>(null);
  
  const { toast } = useToast();

  const handleInputChange = (field: keyof PCConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setHardwareData(null);

    try {
      const response = await sendPCConfigToN8N({
        gpu: config.gpu,
        cpu: config.cpu,
        motherboard: config.motherboard,
        ram: config.ram,
        considerReviews: false
      });

      if (response.success) {
        setHardwareData(response);
        setRawN8NData(response.rawData || null);
        
        // Salvar no histórico
        HistoryService.add({
          source: 'pc-builder',
          title: 'Configuração Avançada - Seleção Individual',
          subtitle: [config.cpu, config.gpu, config.motherboard, config.ram].filter(Boolean).join(' | '),
          request: {
            cpu: config.cpu,
            gpu: config.gpu,
            motherboard: config.motherboard,
            ram: config.ram,
            considerReviews: false,
          },
          response,
        });
        
        onConfigGenerated?.(response);
        toast({
          title: "Configuração processada!",
          description: "Seus componentes foram analisados com sucesso.",
        });
      } else {
        throw new Error(response.message || "Erro ao processar configuração");
      }
    } catch (error) {
      console.error("Erro ao enviar configuração:", error);
      
      // Registrar erro no histórico
      HistoryService.add({
        source: 'pc-builder',
        title: 'Erro - Configuração Avançada - Seleção Individual',
        subtitle: [config.cpu, config.gpu, config.motherboard, config.ram].filter(Boolean).join(' | '),
        request: {
          cpu: config.cpu,
          gpu: config.gpu,
          motherboard: config.motherboard,
          ram: config.ram,
          considerReviews: false,
        },
        response: { 
          error: error instanceof Error ? error.message : 'Erro desconhecido' 
        },
      });
      
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar a configuração.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Pelo menos um campo precisa estar preenchido
  const isFormValid = Boolean(
    config.gpu || config.cpu || config.motherboard || config.ram
  );

  const hardwareButtons = [
    {
      type: 'gpu' as const,
      name: 'Placa de Vídeo',
      icon: <Monitor className="w-5 h-5" />,
      value: config.gpu,
      hasData: hardwareData?.data?.gpu && hardwareData.data.gpu.totalItems > 0
    },
    {
      type: 'cpu' as const,
      name: 'Processador',
      icon: <Cpu className="w-5 h-5" />,
      value: config.cpu,
      hasData: hardwareData?.data?.cpu && hardwareData.data.cpu.totalItems > 0
    },
    {
      type: 'motherboard' as const,
      name: 'Placa Mãe',
      icon: <HardDrive className="w-5 h-5" />,
      value: config.motherboard,
      hasData: hardwareData?.data?.motherboard && hardwareData.data.motherboard.totalItems > 0
    },
    {
      type: 'ram' as const,
      name: 'Memória RAM',
      icon: <MemoryStick className="w-5 h-5" />,
      value: config.ram,
      hasData: hardwareData?.data?.ram && hardwareData.data.ram.totalItems > 0
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Cpu className="w-6 h-6 text-purple-600" />
            Seleção Individual de Componentes
          </CardTitle>
          <CardDescription>
            Selecione cada componente individualmente. Você tem controle total sobre sua configuração.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="gpu" className="flex items-center gap-2 text-sm font-medium">
                  <Monitor className="w-4 h-4 text-primary" />
                  Placa de Vídeo
                </Label>
                <HardwareSelect
                  hardwareType="gpu"
                  placeholder="Selecione uma placa de vídeo"
                  value={config.gpu}
                  onChange={(value) => handleInputChange("gpu", value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="cpu" className="flex items-center gap-2 text-sm font-medium">
                  <Cpu className="w-4 h-4 text-primary" />
                  Processador
                </Label>
                <HardwareSelect
                  hardwareType="cpu"
                  placeholder="Selecione um processador"
                  value={config.cpu}
                  onChange={(value) => handleInputChange("cpu", value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="motherboard" className="flex items-center gap-2 text-sm font-medium">
                  <HardDrive className="w-4 h-4 text-primary" />
                  Placa Mãe
                </Label>
                <HardwareSelect
                  hardwareType="motherboard"
                  placeholder="Selecione uma placa mãe"
                  value={config.motherboard}
                  onChange={(value) => handleInputChange("motherboard", value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="ram" className="flex items-center gap-2 text-sm font-medium">
                  <MemoryStick className="w-4 h-4 text-primary" />
                  Memória RAM
                </Label>
                <HardwareSelect
                  hardwareType="ram"
                  placeholder="Selecione uma memória RAM"
                  value={config.ram}
                  onChange={(value) => handleInputChange("ram", value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-purple-500/20 transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processando configuração...
                </div>
              ) : (
                "Processar Configuração"
              )}
            </Button>

            {/* Loading State */}
            {isLoading && (
              <div className="mt-6 p-6 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-purple-600 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Processando sua configuração
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Analisando compatibilidade e buscando as melhores opções...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Resultados da configuração */}
      {hardwareData && !isLoading && (
        <HardwareResults
          data={hardwareData.data}
          rawData={rawN8NData}
          title="Resultados da Análise"
          subtitle="Sua configuração foi analisada. Navegue pelas categorias para ver todas as opções disponíveis."
        />
      )}
    </div>
  );
};

export default AdvancedConfig;
