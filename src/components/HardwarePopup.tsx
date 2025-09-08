import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ExternalLink, DollarSign, Award, Loader2 } from "lucide-react";
import { HardwareItem, HardwareListResponse, N8NResponseData, convertRawDataToHardwareItems } from "@/services/n8n";

interface HardwarePopupProps {
  isOpen: boolean;
  onClose: () => void;
  hardwareType: 'gpu' | 'cpu' | 'motherboard' | 'ram';
  hardwareName: string;
  icon: React.ReactNode;
  hardwareData?: HardwareListResponse;
  rawN8NData?: N8NResponseData[] | null;
  isEmbedded?: boolean;
}

const HardwarePopup = ({ 
  isOpen, 
  onClose, 
  hardwareType, 
  hardwareName, 
  icon, 
  hardwareData,
  rawN8NData,
  isEmbedded = false
}: HardwarePopupProps) => {
  const [items, setItems] = useState<HardwareItem[]>([]);
  const [considerReviews, setConsiderReviews] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && hardwareData) {
      setItems(hardwareData.items || []);
      setConsiderReviews(hardwareData.considerReviews || false);
      setError(null);
      
      // Armazenar os dados brutos do N8N para poder alternar entre best_price e best_score
      // Isso seria ideal se tivéssemos acesso aos dados originais
      // Por enquanto, vamos simular com os dados existentes
    }
  }, [isOpen, hardwareData]);

  const handleConsiderReviewsChange = async (checked: boolean) => {
    setConsiderReviews(checked);
    setIsLoading(true);
    setError(null);

    try {
      if (!rawN8NData) {
        setError("Dados não disponíveis para atualização");
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
      
      // Usar os dados brutos para converter com considerReviews atualizado
      const newItems = convertRawDataToHardwareItems(rawN8NData, hardwareType, checked);
      
      setItems(newItems);
    } catch (error) {
      setError("Erro ao atualizar itens");
      console.error("Erro ao atualizar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < Math.floor(rating) 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">
          ({rating.toFixed(1)})
        </span>
      </div>
    );
  };

  const content = (
    <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="considerReviews"
                checked={considerReviews}
                onCheckedChange={handleConsiderReviewsChange}
                disabled={isLoading}
              />
              <label htmlFor="considerReviews" className="text-sm font-medium">
                Considerar avaliações
              </label>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Atualizar
            </Button>
          </div>

          {error && (
            <div className="text-center text-destructive py-4 bg-destructive/10 rounded-lg">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <div className="relative mx-auto w-12 h-12 mb-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>
              <p className="text-muted-foreground">
                {considerReviews ? 'Ordenando por melhor avaliação...' : 'Ordenando por menor preço...'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-3">
              {items.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105 h-full">
                  <CardContent className="p-4 h-full flex flex-col">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm md:text-base line-clamp-2 leading-tight">
                            {item.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">{item.model}</p>
                        </div>
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-12 h-12 md:w-16 md:h-16 object-contain rounded-lg flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="text-lg md:text-xl font-bold text-green-600">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                        {/* Exibir estrelas ou mensagem de sem avaliações */}
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-500" />
                          {item.rating && item.rating > 0 ? (
                            renderStars(item.rating)
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Sem avaliações disponíveis
                            </span>
                          )}
                        </div>
                      </div>

                      {item.specifications && Object.keys(item.specifications).length > 0 && (
                        <div className="space-y-1">
                          {Object.entries(item.specifications).slice(0, 3).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-xs md:text-sm">
                              <span className="text-muted-foreground">{key}:</span>
                              <span className="font-medium text-right">{value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2 mt-auto">
                        <Button 
                          asChild 
                          size="sm" 
                          className="flex-1"
                          variant="outline"
                        >
                          <a 
                            href={item.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 justify-center"
                          >
                            <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="text-xs md:text-sm">Ver Produto</span>
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {items.length === 0 && !isLoading && !error && (
            <div className="text-center py-8 text-muted-foreground">
              <div className="space-y-2">
                <p className="text-lg font-medium">Nenhum item encontrado</p>
                <p className="text-sm">Não foram encontradas opções para {hardwareName}</p>
              </div>
            </div>
          )}
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl md:text-2xl">
            {icon}
            {hardwareName}
            {items.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {items.length} opções
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default HardwarePopup;
