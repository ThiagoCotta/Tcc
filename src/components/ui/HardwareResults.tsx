import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import HardwarePopup from '@/components/HardwarePopup';

interface HardwareResultsProps {
  data: {
    gpu?: any;
    cpu?: any;
    motherboard?: any;
    ram?: any;
  };
  rawData?: any;
  title?: string;
  subtitle?: string;
}

const hardwareButtons = [
  { type: 'gpu', name: 'Placa de Vídeo', icon: null },
  { type: 'cpu', name: 'Processador', icon: null },
  { type: 'motherboard', name: 'Placa Mãe', icon: null },
  { type: 'ram', name: 'Memória RAM', icon: null },
] as const;

const HardwareResults: React.FC<HardwareResultsProps> = ({ data, rawData, title = 'Resultados da Análise', subtitle = 'Sua configuração foi analisada. Navegue pelas categorias para ver todas as opções disponíveis.' }) => {
  const itemsCount = (type: 'gpu' | 'cpu' | 'motherboard' | 'ram') => data?.[type]?.totalItems || 0;

  const available = hardwareButtons.map(h => ({ ...h, hasData: itemsCount(h.type as any) > 0 }));

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-green-800 dark:text-green-200">
          {title}
        </CardTitle>
        <CardDescription className="text-green-700 dark:text-green-300">
          {subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={available.find(h => h.hasData)?.type || 'gpu'} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2">
            {available.map((hardware) => (
              <TabsTrigger 
                key={hardware.type} 
                value={hardware.type}
                disabled={!hardware.hasData}
                className="flex items-center gap-2"
              >
                <span className="hidden sm:inline">{hardware.name}</span>
                <span className="sm:hidden">{hardware.name.split(' ')[0]}</span>
                {hardware.hasData && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {data?.[hardware.type as keyof typeof data]?.totalItems || 0}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {available.map((hardware) => (
            <TabsContent key={hardware.type} value={hardware.type} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {hardware.name}
                    <Badge variant="secondary">
                      {data?.[hardware.type as keyof typeof data]?.totalItems || 0} opções
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <HardwarePopup
                    isOpen={true}
                    onClose={() => {}}
                    hardwareType={hardware.type as any}
                    hardwareName={hardware.name}
                    icon={null as any}
                    hardwareData={data?.[hardware.type as keyof typeof data]}
                    rawN8NData={rawData}
                    isEmbedded={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HardwareResults;


