import React from 'react';
import PCBuilderKnowledgeFlow from '@/components/PCBuilderKnowledgeFlow';

interface PCBuilderProps {
  onNavigate?: (tabId: string) => void;
}

const PCBuilder: React.FC<PCBuilderProps> = ({ onNavigate }) => {
  const handleConfigGenerated = (config: any) => {
    // Aqui você pode implementar lógica adicional quando uma configuração é gerada
    console.log('Configuração gerada:', config);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            PC Builder
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Monte a configuração perfeita para o seu setup. Escolha o método que melhor se adapta ao seu conhecimento.
          </p>
        </div>
        
        <PCBuilderKnowledgeFlow onConfigGenerated={handleConfigGenerated} />
      </div>
    </div>
  );
};

export default PCBuilder;
