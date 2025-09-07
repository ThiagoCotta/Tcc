import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Cpu, HardDrive, MemoryStick, Monitor, Search, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { sendPCConfigToN8N, N8NResponse, N8NResponseData } from "@/services/n8n";
import HardwarePopup from "./HardwarePopup";
import { HardwareSelect } from "@/components/ui/hardware-select";
import { fetchHardwareList } from "@/services/hardware-api";

interface PCConfig {
  gpu: string;
  cpu: string;
  motherboard: string;
  ram: string;
  considerReviews?: boolean;
}

const PCConfigForm = () => {
  const [config, setConfig] = useState<PCConfig>({
    gpu: "",
    cpu: "",
    motherboard: "",
    ram: "",
    considerReviews: false // Sempre false na tela principal
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [hardwareData, setHardwareData] = useState<N8NResponse | null>(null);
  const [rawN8NData, setRawN8NData] = useState<N8NResponseData[] | null>(null);
  
  const { toast } = useToast();

  const handleInputChange = (field: keyof PCConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value as any }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setHardwareData(null); // Limpar dados anteriores

    try {
      const response = await sendPCConfigToN8N({
        gpu: config.gpu,
        cpu: config.cpu,
        motherboard: config.motherboard,
        ram: config.ram,
        considerReviews: false // Sempre false na requisição inicial
      });

      if (response.success) {
        setHardwareData(response);
        setRawN8NData(response.rawData || null);
        toast({
          title: "Configuração enviada!",
          description: "Seus componentes foram processados com sucesso.",
        });
      } else {
        throw new Error(response.message || "Erro ao processar configuração");
      }
    } catch (error) {
      console.error("Erro ao enviar para N8N:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao enviar a configuração para o N8N.",
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
    <>
      <Card className="w-full max-w-6xl mx-auto bg-gradient-to-br from-card to-card/80 border-border/50 shadow-2xl">
      <CardHeader className="text-center space-y-4">
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Configurador de PC
        </CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          Configure os componentes do seu PC ideal
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
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
              className="w-full mt-8 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-primary/20 transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processando configuração...
                </div>
              ) : (
                "Configurar PC"
              )}
            </Button>

            {/* Loading State */}
            {isLoading && (
              <div className="mt-6 p-6 bg-muted/50 rounded-lg border border-border/50">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Processando sua configuração
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Enviando dados para o N8N e buscando as melhores opções...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sistema de Abas para Hardware */}
            {hardwareData && !isLoading && (
              <div className="mt-8 space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">
                    Opções encontradas
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Navegue pelas categorias para ver todas as opções disponíveis
                  </p>
                </div>
                
                <Tabs defaultValue="gpu" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2">
                    {hardwareButtons.map((hardware) => (
                      <TabsTrigger 
                        key={hardware.type} 
                        value={hardware.type}
                        disabled={!hardware.hasData}
                        className="flex items-center gap-2"
                      >
                        {hardware.icon}
                        <span className="hidden sm:inline">{hardware.name}</span>
                        <span className="sm:hidden">{hardware.name.split(' ')[0]}</span>
                        {hardware.hasData && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            {hardwareData.data?.[hardware.type]?.totalItems || 0}
                          </Badge>
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {hardwareButtons.map((hardware) => (
                    <TabsContent key={hardware.type} value={hardware.type} className="mt-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            {hardware.icon}
                            {hardware.name}
                            <Badge variant="secondary">
                              {hardwareData.data?.[hardware.type]?.totalItems || 0} opções
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <HardwarePopup
                            isOpen={true}
                            onClose={() => {}}
                            hardwareType={hardware.type}
                            hardwareName={hardware.name}
                            icon={hardware.icon}
                            hardwareData={hardwareData.data?.[hardware.type]}
                            rawN8NData={rawN8NData}
                            isEmbedded={true}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}
         </form>
       </CardContent>
     </Card>

   </>
 );
};

export default PCConfigForm;