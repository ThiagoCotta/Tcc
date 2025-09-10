import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { X, Plus, Wrench, Search, Bot, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import PCBuilder from '@/pages/PCBuilder';
import QuickSearch from '@/pages/QuickSearch';

export interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
  closable?: boolean;
}

const TabSystem: React.FC = () => {
  const { toggleTheme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('pc-builder');
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'pc-builder',
      label: 'PC Builder',
      icon: Wrench,
      content: <PCBuilder />,
      closable: false
    },
    {
      id: 'quick-search',
      label: 'Busca Rápida',
      icon: Search,
      content: <QuickSearch />,
      closable: false
    }
  ]);

  const closeTab = (tabId: string) => {
    if (tabs.find(tab => tab.id === tabId)?.closable) {
      const newTabs = tabs.filter(tab => tab.id !== tabId);
      setTabs(newTabs);
      
      // Se a aba fechada era a ativa, mudar para a primeira aba disponível
      if (activeTab === tabId && newTabs.length > 0) {
        setActiveTab(newTabs[0].id);
      }
    }
  };

  const addNewTab = () => {
    // Por enquanto, apenas alternar entre as abas existentes
    // Futuramente pode ser expandido para adicionar novas abas dinamicamente
    const nextTab = activeTab === 'pc-builder' ? 'quick-search' : 'pc-builder';
    setActiveTab(nextTab);
  };

  const handleNavigate = (tabId: string) => {
    if (tabId === 'guide') {
      // Para o guia, podemos implementar um modal ou página de ajuda
      // Por enquanto, apenas mostra um alerta
      alert('Guia de compatibilidade em desenvolvimento!');
      return;
    }
    setActiveTab(tabId);
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Barra de abas */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center px-4 py-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mr-2">
                <Wrench className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">Hardware Store</span>
            </div>

            {/* Lista de abas centralizada */}
            <div className="flex items-center">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <div
                    key={tab.id}
                    className={cn(
                      "flex items-center px-6 py-3 cursor-pointer group min-w-0 flex-shrink-0 rounded-lg mx-1",
                      "hover:bg-muted/50 transition-colors duration-200",
                      isActive 
                        ? "bg-background border-2 border-primary shadow-sm" 
                        : "bg-muted/20 hover:bg-muted/40"
                    )}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className={cn(
                      "w-5 h-5 mr-2 flex-shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-sm font-medium truncate",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {tab.label}
                    </span>
                    {tab.closable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTab(tab.id);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Botões de controle */}
            <div className="flex items-center px-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={addNewTab}
                className="h-8 w-8 p-0"
                title="Nova aba"
              >
                <Plus className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-8 w-8 p-0 ml-1"
                title={isDark ? 'Modo Claro' : 'Modo Escuro'}
              >
                {isDark ? (
                  <Settings className="w-4 h-4" />
                ) : (
                  <Settings className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo da aba ativa */}
      <div className="flex-1 overflow-auto">
        {activeTabData?.id === 'pc-builder' ? (
          <PCBuilder onNavigate={handleNavigate} />
        ) : (
          activeTabData?.content
        )}
      </div>
    </div>
  );
};

export default TabSystem;
