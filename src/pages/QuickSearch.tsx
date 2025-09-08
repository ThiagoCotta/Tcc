import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AllHardwareSelect } from '@/components/ui/all-hardware-select';
import { getAllHardware, QuickSearchItem, sendToN8NWebhook, QuickSearchResults } from '@/services/quick-search-api';
import { OfferResults } from '@/components/ui/offer-results';
import { useToast } from '@/hooks/use-toast';

const QuickSearch: React.FC = () => {
  const [selectedHardware, setSelectedHardware] = useState('');
  const [allHardware, setAllHardware] = useState<QuickSearchItem[]>([]);
  const [filteredHardware, setFilteredHardware] = useState<QuickSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<QuickSearchResults | null>(null);
  const [selectedHardwareType, setSelectedHardwareType] = useState<string>('');
  const { toast } = useToast();


  // Carregar todos os hardwares na inicialização
  const loadAllHardware = async () => {
    setIsLoading(true);
    try {
      const response = await getAllHardware();
      if (response.success) {
        setAllHardware(response.data);
      } else {
        console.error('Erro ao carregar hardwares:', response.error);
      }
    } catch (error) {
      console.error('Erro ao carregar hardwares:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar todos os hardwares na inicialização
  useEffect(() => {
    loadAllHardware();
  }, []);

  // Função para buscar ofertas do hardware selecionado
  const searchOffers = async () => {
    if (!selectedHardware) return;
    
    setIsLoading(true);
    
    try {
      // Encontrar o hardware selecionado
      const selected = allHardware.find(h => h.name === selectedHardware);
      if (!selected) {
        console.error('Hardware selecionado não encontrado na lista');
        return;
      }

      // Enviar dados para o webhook do N8N
      const webhookResult = await sendToN8NWebhook(selected);
      
      if (webhookResult.success) {
        // Mostrar toast de sucesso
        toast({
          title: "Busca realizada com sucesso!",
          description: `Ofertas encontradas para ${selected.name}`,
          variant: "default",
        });
        
        // Armazenar resultados da busca
        if (webhookResult.data) {
          setSearchResults(webhookResult.data);
        } else {
          toast({
            title: "Aviso",
            description: "Busca realizada mas nenhuma oferta foi encontrada.",
            variant: "destructive",
          });
        }
        setSelectedHardwareType(selected.type);
        setFilteredHardware([selected]);
        setHasSearched(true);
      } else {
        // Mostrar toast de erro
        toast({
          title: "Erro na busca",
          description: webhookResult.error || "Falha ao buscar ofertas. Tente novamente.",
          variant: "destructive",
        });
        
        // Mesmo com erro, mostrar o hardware selecionado
        setFilteredHardware([selected]);
        setHasSearched(true);
      }
    } catch (error) {
      console.error('Erro na busca de ofertas:', error);
      
      // Mostrar toast de erro genérico
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'CPU': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      'GPU': 'bg-green-500/10 text-green-600 border-green-500/20',
      'RAM': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      'Motherboard': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      'Storage': 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    };
    return colors[type] || 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Busca Rápida
          </h1>
          <p className="text-muted-foreground">
            Encontre as melhores ofertas para um hardware específico
          </p>
        </div>

        {/* Hardware Selection */}
        <div className="mb-6">
          <div className="space-y-4">
            <AllHardwareSelect
              placeholder="Digite o nome do hardware que você procura..."
              value={selectedHardware}
              onChange={setSelectedHardware}
              disabled={isLoading}
              items={allHardware}
              loading={isLoading}
            />
            
            <Button 
              onClick={searchOffers}
              disabled={!selectedHardware || isLoading}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-primary/20 transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Buscando ofertas...
                </div>
              ) : (
                "Buscar Melhores Ofertas"
              )}
            </Button>
          </div>
        </div>


        {/* Results */}
        {hasSearched && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                <p className="text-muted-foreground">Buscando melhores ofertas...</p>
              </div>
            ) : searchResults ? (
              <OfferResults 
                results={searchResults}
                hardwareType={selectedHardwareType}
                hardwareName={selectedHardware}
              />
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma oferta encontrada</h3>
                <p className="text-muted-foreground">
                  Não foram encontradas ofertas para "{selectedHardware}".
                </p>
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!hasSearched && !isLoading && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">
              Busque por um hardware específico
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Selecione um hardware no campo acima e clique em "Buscar Melhores Ofertas" para encontrar as melhores opções disponíveis
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickSearch;