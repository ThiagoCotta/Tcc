import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Star, TrendingUp, DollarSign, Cpu, Monitor, HardDrive, MemoryStick, Zap } from 'lucide-react';
import { OfferItem, QuickSearchResults } from '@/services/quick-search-api';

interface OfferResultsProps {
  results: QuickSearchResults;
  hardwareType: string;
  hardwareName: string;
}

// Mapear tipos para ícones
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'CPU': return <Cpu className="w-5 h-5" />;
    case 'GPU': return <Monitor className="w-5 h-5" />;
    case 'RAM': return <MemoryStick className="w-5 h-5" />;
    case 'Motherboard': return <HardDrive className="w-5 h-5" />;
    case 'Storage': return <HardDrive className="w-5 h-5" />;
    default: return <Zap className="w-5 h-5" />;
  }
};

// Mapear tipos para cores
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

const OfferCard: React.FC<{ offer: OfferItem; index: number }> = ({ offer, index }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Imagem do produto */}
          <div className="flex-shrink-0">
            <img
              src={offer.imageUrl}
              alt={offer.title}
              className="w-16 h-16 object-cover rounded-lg border border-border/50"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAyNEg0MFY0MEgyNFYyNFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
              }}
            />
          </div>

          {/* Informações do produto */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight mb-2 line-clamp-2">
              {offer.title}
            </h3>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {offer.source}
              </Badge>
              {offer.rating && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{offer.rating}</span>
                  {offer.ratingCount && (
                    <span>({offer.ratingCount})</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">
                {formatPrice(offer.price)}
              </span>
              
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3"
                onClick={() => window.open(offer.link, '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Ver Oferta
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const OfferResults: React.FC<OfferResultsProps> = ({ results, hardwareType, hardwareName }) => {
  console.log('🔍 OfferResults recebeu:', results);
  
  if (!results || typeof results !== 'object') {
    console.log('❌ Results inválido:', results);
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhuma oferta encontrada para este hardware.</p>
      </div>
    );
  }

  // Pegar o primeiro tipo de hardware disponível nos dados retornados
  const availableTypes = Object.keys(results);
  const firstType = availableTypes[0];
  const hardwareData = results[firstType];
  
  console.log('🔍 Tipo encontrado:', firstType, 'Dados:', hardwareData);
  
  if (!hardwareData || !hardwareData.best_price || !hardwareData.best_score) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhuma oferta encontrada para este hardware.</p>
      </div>
    );
  }

  const { best_price, best_score } = hardwareData;
  
  // Determinar o tipo de hardware baseado nos dados retornados
  const actualHardwareType = firstType.toUpperCase();
  const actualHardwareName = hardwareName || `Hardware ${actualHardwareType}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          {getTypeIcon(actualHardwareType)}
          <Badge className={getTypeColor(actualHardwareType)}>
            {actualHardwareType}
          </Badge>
        </div>
        <h2 className="text-xl font-semibold mb-1">{actualHardwareName}</h2>
        <p className="text-muted-foreground text-sm">
          Encontradas {best_price.length + best_score.length} ofertas disponíveis
        </p>
      </div>

      {/* Melhores Preços */}
      {best_price.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Melhores Preços</h3>
          </div>
          
          <div className="grid gap-4">
            {best_price.map((offer, index) => (
              <OfferCard key={`price-${index}`} offer={offer} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Melhores Avaliações */}
      {best_score.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Melhores Avaliações</h3>
          </div>
          
          <div className="grid gap-4">
            {best_score.map((offer, index) => (
              <OfferCard key={`score-${index}`} offer={offer} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
