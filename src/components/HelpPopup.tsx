import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Bot, Wrench, Search, ArrowRight } from 'lucide-react';

interface HelpPopupProps {
  children: React.ReactNode;
  onNavigate?: (tabId: string) => void;
}

const HelpPopup: React.FC<HelpPopupProps> = ({ children, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const helpOptions = [
    {
      icon: Search,
      title: "Busca Rápida",
      description: "Encontre ofertas específicas para peças que você já tem em mente",
      action: "Ir para Busca Rápida",
      tabId: "quick-search"
    },
    {
      icon: Wrench,
      title: "Guia de Compatibilidade",
      description: "Aprenda sobre compatibilidade entre componentes e como escolher as peças certas",
      action: "Ver Guia",
      tabId: "guide"
    }
  ];

  const handleOptionClick = (tabId: string) => {
    setIsOpen(false);
    if (onNavigate) {
      onNavigate(tabId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <HelpCircle className="w-6 h-6 text-primary" />
            Precisa de Ajuda?
          </DialogTitle>
          <DialogDescription className="text-base">
            Escolha uma das opções abaixo para obter assistência na configuração do seu PC
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {helpOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <Card 
                key={index}
                className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-2 hover:border-primary/20"
                onClick={() => handleOptionClick(option.tabId)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{option.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {option.description}
                      </CardDescription>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpPopup;
