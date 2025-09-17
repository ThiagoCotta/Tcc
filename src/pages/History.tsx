import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Trash2, List, Monitor, Cpu, MemoryStick, HardDrive, Gamepad2, Bot, Search, AlertCircle, RotateCcw } from 'lucide-react';
import { HistoryService, HistoryEntry } from '@/services/history';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const History: React.FC = () => {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => HistoryService.list());
  const [selectedId, setSelectedId] = useState<string | null>(entries[0]?.id ?? null);
  const navigate = useNavigate();
  const { toast } = useToast();


  const selected = useMemo(() => entries.find((e) => e.id === selectedId), [entries, selectedId]);

  // Função para obter ícone baseado no tipo de componente
  const getComponentIcon = (component: string) => {
    switch (component) {
      case 'gpu': return <Monitor className="w-4 h-4" />;
      case 'cpu': return <Cpu className="w-4 h-4" />;
      case 'ram': return <MemoryStick className="w-4 h-4" />;
      case 'motherboard': return <HardDrive className="w-4 h-4" />;
      default: return <Cpu className="w-4 h-4" />;
    }
  };

  // Função para obter nome do componente
  const getComponentName = (component: string) => {
    switch (component) {
      case 'gpu': return 'Placa de Vídeo';
      case 'cpu': return 'Processador';
      case 'ram': return 'Memória RAM';
      case 'motherboard': return 'Placa Mãe';
      default: return component;
    }
  };

  // Função para obter cores baseadas no tipo de configuração
  const getConfigColors = (source: string, title: string) => {
    // Cores baseadas no tipo de configuração
    if (source === 'game-ai') {
      return {
        bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20',
        border: 'border-green-200 dark:border-green-800',
        icon: 'text-green-600',
        badge: 'bg-green-500/10 text-green-600 border-green-500/20',
        accent: 'text-green-700 dark:text-green-300'
      };
    }
    
    if (source === 'pc-builder') {
      // Cores baseadas no título para diferenciar tipos
      if (title.includes('Avançada') || title.includes('Individual')) {
        return {
          bg: 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20',
          border: 'border-purple-200 dark:border-purple-800',
          icon: 'text-purple-600',
          badge: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
          accent: 'text-purple-700 dark:text-purple-300'
        };
      } else if (title.includes('baseada em')) {
        return {
          bg: 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          icon: 'text-yellow-600',
          badge: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
          accent: 'text-yellow-700 dark:text-yellow-300'
        };
      } else {
        return {
          bg: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
          border: 'border-blue-200 dark:border-blue-800',
          icon: 'text-blue-600',
          badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
          accent: 'text-blue-700 dark:text-blue-300'
        };
      }
    }
    
    if (source === 'quick-search') {
      return {
        bg: 'bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20',
        border: 'border-cyan-200 dark:border-cyan-800',
        icon: 'text-cyan-600',
        badge: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
        accent: 'text-cyan-700 dark:text-cyan-300'
      };
    }
    
    // Cores padrão
    return {
      bg: 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20',
      border: 'border-gray-200 dark:border-gray-800',
      icon: 'text-gray-600',
      badge: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
      accent: 'text-gray-700 dark:text-gray-300'
    };
  };

  // Função para renderizar componentes de forma organizada
  const renderComponents = (components: any[], colors?: any) => {
    if (!components || !Array.isArray(components)) return null;
    
    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-foreground mb-2">Componentes Sugeridos:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {components.map((comp, index) => (
            <div key={index} className={`flex items-center gap-3 p-3 rounded-lg border ${colors?.bg || 'bg-muted/30'}`}>
              {getComponentIcon(comp.component)}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{getComponentName(comp.component)}</div>
                <div className="text-xs text-muted-foreground truncate">{comp.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Função para renderizar explicação
  const renderExplanation = (explanation: string) => {
    if (!explanation) return null;
    
    return (
      <div className="space-y-2">
        <h4 className="font-semibold text-sm text-foreground">Explicação:</h4>
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
            {explanation}
          </p>
        </div>
      </div>
    );
  };

  // Função para renderizar dados de hardware
  const renderHardwareData = (data: any) => {
    if (!data) return null;

    const hardwareTypes = ['gpu', 'cpu', 'motherboard', 'ram'];
    const hasHardwareData = hardwareTypes.some(type => data[type] && data[type].totalItems > 0);
    
    if (!hasHardwareData) return null;

    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-foreground">Dados de Hardware Encontrados:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {hardwareTypes.map(type => {
            const typeData = data[type];
            if (!typeData || typeData.totalItems === 0) return null;
            
            return (
              <div key={type} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                {getComponentIcon(type)}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium">{getComponentName(type)}</div>
                  <div className="text-xs text-muted-foreground">{typeData.totalItems} itens</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const clearAll = () => {
    HistoryService.clear();
    setEntries([]);
    setSelectedId(null);
  };

  // Função para carregar dados do histórico na tela
  const loadHistoryData = (entry: HistoryEntry) => {
    // Salvar dados no localStorage para serem carregados pela tela
    const historyData = {
      id: entry.id,
      source: entry.source,
      title: entry.title,
      subtitle: entry.subtitle,
      timestamp: entry.timestamp,
      request: (entry as any).request,
      response: (entry as any).response,
      loadedFromHistory: true
    };
    
    localStorage.setItem('history-load-data', JSON.stringify(historyData));
    
    // Mostrar toast de carregamento
    toast({
      title: "Carregando dados do histórico",
      description: "Redirecionando para a tela com os dados...",
    });
    
    // Usar setTimeout para garantir que o localStorage seja salvo antes da navegação
    setTimeout(() => {
      // Navegar para a página apropriada
      switch (entry.source) {
        case 'quick-search':
          window.location.href = '/quick-search';
          break;
        case 'pc-builder':
        case 'game-ai':
        case 'component-based':
          window.location.href = '/pc-builder';
          break;
        default:
          window.location.href = '/pc-builder';
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <List className="w-5 h-5" /> Histórico
            </h2>
            {entries.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll} title="Limpar histórico" className="gap-2">
                <Trash2 className="w-4 h-4" /> Limpar
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {entries.length === 0 ? (
              <Card className="bg-card border-border/60">
                <CardContent className="p-4 text-muted-foreground">Nenhum item no histórico ainda.</CardContent>
              </Card>
            ) : (
              entries.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setSelectedId(e.id)}
                  className={`w-full text-left rounded-lg border px-4 py-3 transition-colors ${
                    selectedId === e.id ? 'bg-muted/40 border-primary' : 'bg-card hover:bg-muted/30 border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {e.title.includes('Erro') ? (
                          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        ) : (
                          <>
                            {e.source === 'quick-search' && <Search className="w-3.5 h-3.5 text-cyan-500" />}
                            {e.source === 'pc-builder' && (
                              e.title.includes('Avançada') || e.title.includes('Individual') ? 
                                <Bot className="w-3.5 h-3.5 text-purple-500" /> :
                                e.title.includes('baseada em') ?
                                  <Bot className="w-3.5 h-3.5 text-yellow-500" /> :
                                  <Bot className="w-3.5 h-3.5 text-blue-500" />
                            )}
                            {e.source === 'game-ai' && <Gamepad2 className="w-3.5 h-3.5 text-green-500" />}
                          </>
                        )}
                        <Badge className={`${e.title.includes('Erro') ? 'bg-red-500/10 text-red-600 border-red-500/20' : getConfigColors(e.source, e.title).badge} capitalize text-xs`}>
                          {e.title.includes('Erro') ? 'Erro' : e.source.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="truncate font-medium text-sm">{e.title}</div>
                      {e.subtitle && (
                        <div className="truncate text-xs text-muted-foreground">{e.subtitle}</div>
                      )}
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> {new Date(e.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          {!selected ? (
            <Card className="bg-card border-border/60">
              <CardContent className="p-6 text-muted-foreground">Selecione um item para ver os detalhes.</CardContent>
            </Card>
          ) : (
            <Card className={`${getConfigColors(selected.source, selected.title).bg} ${getConfigColors(selected.source, selected.title).border} border-2`}>
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {selected.source === 'quick-search' && <Search className={`w-6 h-6 ${getConfigColors(selected.source, selected.title).icon}`} />}
                    {selected.source === 'pc-builder' && <Bot className={`w-6 h-6 ${getConfigColors(selected.source, selected.title).icon}`} />}
                    {selected.source === 'game-ai' && <Gamepad2 className={`w-6 h-6 ${getConfigColors(selected.source, selected.title).icon}`} />}
                    <h3 className="text-2xl font-semibold">{selected.title}</h3>
                  </div>
                  {selected.subtitle && <p className={`${getConfigColors(selected.source, selected.title).accent} font-medium`}>{selected.subtitle}</p>}
                  <div className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                    <Badge className={`${getConfigColors(selected.source, selected.title).badge} capitalize`}>{selected.source.replace('-', ' ')}</Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {new Date(selected.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Botão para visualizar novamente */}
                  <div className="mt-4">
                    <Button 
                      onClick={() => loadHistoryData(selected)}
                      className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Visualizar novamente
                    </Button>
                  </div>
                </div>

                {/* Resumo específico por fonte */}
                {selected.source === 'quick-search' && (
                  <div className="space-y-3">
                    <div className={`flex items-center gap-2 p-3 rounded-lg border ${getConfigColors(selected.source, selected.title).bg}`}>
                      <Search className={`w-4 h-4 ${getConfigColors(selected.source, selected.title).icon}`} />
                      <div>
                        <div className="font-medium text-sm">Hardware Buscado</div>
                        <div className="text-xs text-muted-foreground">
                          {/* @ts-ignore */}
                          {(selected as any).request?.hardwareName} ({(selected as any).request?.hardwareType})
                        </div>
                      </div>
                    </div>
                    {/* @ts-ignore */}
                    {renderHardwareData((selected as any).response)}
                  </div>
                )}
                
                {selected.source === 'pc-builder' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {/* @ts-ignore */}
                      {Object.entries((selected as any).request || {}).map(([k, v]) => {
                        if (!v || k === 'considerReviews') return null;
                        return (
                          <div key={k} className={`flex items-center gap-2 p-2 rounded-lg border ${getConfigColors(selected.source, selected.title).bg}`}>
                            {getComponentIcon(k)}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium">{getComponentName(k)}</div>
                              <div className="text-xs text-muted-foreground truncate">{String(v)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* @ts-ignore */}
                    {renderHardwareData((selected as any).response?.data)}
                    {/* @ts-ignore */}
                    {renderComponents((selected as any).response?.components, getConfigColors(selected.source, selected.title))}
                    {/* @ts-ignore */}
                    {renderExplanation((selected as any).response?.explanation)}
                  </div>
                )}
                
                {selected.source === 'game-ai' && (
                  <div className="space-y-4">
                    <div className={`flex items-center gap-2 p-3 rounded-lg border ${getConfigColors(selected.source, selected.title).bg}`}>
                      <Gamepad2 className={`w-4 h-4 ${getConfigColors(selected.source, selected.title).icon}`} />
                      <div className="flex-1">
                        <div className="font-medium text-sm">Configuração para Jogo</div>
                        <div className="text-xs text-muted-foreground">
                          {/* @ts-ignore */}
                          {(selected as any).request?.jogo || '—'} - {(selected as any).request?.qualidade || '—'}
                        </div>
                      </div>
                    </div>
                    {/* @ts-ignore */}
                    {renderComponents((selected as any).response?.components, getConfigColors(selected.source, selected.title))}
                    {/* @ts-ignore */}
                    {renderExplanation((selected as any).response?.explanation)}
                    {/* @ts-ignore */}
                    {renderHardwareData((selected as any).response?.priceData?.data)}
                  </div>
                )}

                {/* Dados técnicos (colapsível) */}
                <div className="mt-6">
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      Dados Técnicos (JSON)
                    </summary>
                    <div className="mt-2">
                      <pre className="max-h-[300px] overflow-auto text-xs bg-muted/30 p-3 rounded-md border">
{JSON.stringify((selected as any).response ?? null, null, 2)}
                      </pre>
                    </div>
                  </details>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;


