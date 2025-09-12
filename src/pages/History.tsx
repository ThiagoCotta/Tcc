import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Trash2, List } from 'lucide-react';
import { HistoryService, HistoryEntry } from '@/services/history';

const History: React.FC = () => {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => HistoryService.list());
  const [selectedId, setSelectedId] = useState<string | null>(entries[0]?.id ?? null);

  const selected = useMemo(() => entries.find((e) => e.id === selectedId), [entries, selectedId]);

  const clearAll = () => {
    HistoryService.clear();
    setEntries([]);
    setSelectedId(null);
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
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">{e.source.replace('-', ' ')}</Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {new Date(e.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="truncate font-medium">{e.title}</div>
                      {e.subtitle && (
                        <div className="truncate text-sm text-muted-foreground">{e.subtitle}</div>
                      )}
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
            <Card className="bg-card border-border/60">
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-semibold mb-1">{selected.title}</h3>
                  {selected.subtitle && <p className="text-muted-foreground">{selected.subtitle}</p>}
                  <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{selected.source.replace('-', ' ')}</Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {new Date(selected.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Resumo específico por fonte */}
                {selected.source === 'quick-search' && (
                  <div className="text-sm text-muted-foreground">
                    {/* @ts-ignore */}
                    <div><span className="font-medium">Hardware:</span> {(selected as any).request?.hardwareName} ({(selected as any).request?.hardwareType})</div>
                  </div>
                )}
                {selected.source === 'pc-builder' && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    {/* @ts-ignore */}
                    {Object.entries((selected as any).request || {}).map(([k, v]) => (
                      v ? <div key={k}><span className="font-medium">{k.toUpperCase()}:</span> {String(v)}</div> : null
                    ))}
                  </div>
                )}
                {selected.source === 'game-ai' && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    {/* @ts-ignore */}
                    <div><span className="font-medium">Nível:</span> {(selected as any).request?.nivel || '—'}</div>
                    {/* @ts-ignore */}
                    <div><span className="font-medium">Jogo:</span> {(selected as any).request?.jogo || '—'}</div>
                    {/* @ts-ignore */}
                    <div><span className="font-medium">Qualidade desejada:</span> {(selected as any).request?.qualidade || '—'}</div>
                  </div>
                )}

                {/* Dados completos do retorno do N8N */}
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Dados completos</div>
                  <pre className="max-h-[420px] overflow-auto text-xs bg-muted/30 p-3 rounded-md border">
{JSON.stringify((selected as any).response ?? null, null, 2)}
                  </pre>
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


