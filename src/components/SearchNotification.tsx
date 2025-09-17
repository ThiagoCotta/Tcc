import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  X, 
  Monitor, 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Search, 
  Bot, 
  Gamepad2,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useSearch, OngoingSearch } from '@/contexts/SearchContext';

const SearchNotification: React.FC = () => {
  const { ongoingSearches, removeSearch, getSearchById } = useSearch();

  const getSearchIcon = (type: string) => {
    switch (type) {
      case 'quick-search': return <Search className="w-4 h-4" />;
      case 'pc-builder': return <Bot className="w-4 h-4" />;
      case 'game-ai': return <Gamepad2 className="w-4 h-4" />;
      case 'component-based': return <Cpu className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getSearchColor = (type: string) => {
    switch (type) {
      case 'quick-search': return 'text-cyan-500';
      case 'pc-builder': return 'text-blue-500';
      case 'game-ai': return 'text-green-500';
      case 'component-based': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getSearchBadgeColor = (type: string) => {
    switch (type) {
      case 'quick-search': return 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20';
      case 'pc-builder': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'game-ai': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'component-based': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const formatDuration = (startTime: number) => {
    const elapsed = Date.now() - startTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  // Atualizar duração a cada segundo apenas para buscas em andamento (sem data e sem erro)
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    // Verificar se há buscas em andamento
    const hasOngoingSearches = ongoingSearches.some(search => !search.data && !search.error);
    
    if (!hasOngoingSearches) {
      return; // Não criar interval se não há buscas em andamento
    }
    
    const interval = setInterval(() => {
      // Verificar novamente se ainda há buscas em andamento
      const stillHasOngoingSearches = ongoingSearches.some(search => !search.data && !search.error);
      if (stillHasOngoingSearches) {
        forceUpdate(prev => prev + 1);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [ongoingSearches]);


  if (ongoingSearches.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {ongoingSearches.map((search) => (
        <Card 
          key={search.id} 
          className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {search.data ? (
                    search.data.error ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )
                  ) : (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={getSearchColor(search.type)}>
                      {getSearchIcon(search.type)}
                    </div>
                    <Badge className={`${getSearchBadgeColor(search.type)} text-xs`}>
                      {search.type.replace('-', ' ')}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDuration(search.startTime)}
                    </div>
                  </div>
                  
                  <div className="font-medium text-sm truncate">{search.title}</div>
                  {search.subtitle && (
                    <div className="text-xs text-muted-foreground truncate">{search.subtitle}</div>
                  )}
                  
                  {search.data && !search.data.error && (
                    <div className="mt-2 text-xs text-green-600 font-medium">
                      ✓ Busca concluída
                    </div>
                  )}
                  
                  {search.data?.error && (
                    <div className="mt-2 text-xs text-red-600 font-medium">
                      ✗ Erro na busca
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeSearch(search.id)}
                  className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SearchNotification;
