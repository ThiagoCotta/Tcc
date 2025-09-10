import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Gamepad2, Wrench, Bot } from 'lucide-react';
import GameBasedConfig from './GameBasedConfig';
import ComponentBasedConfig from './ComponentBasedConfig';
import AdvancedConfig from './AdvancedConfig';

interface PCBuilderKnowledgeFlowProps {
  onConfigGenerated?: (config: any) => void;
}

const PCBuilderKnowledgeFlow: React.FC<PCBuilderKnowledgeFlowProps> = ({ onConfigGenerated }) => {
  const [userKnowledge, setUserKnowledge] = useState<'beginner' | 'intermediate' | 'advanced' | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<string>('');

  const handleKnowledgeSelect = (knowledge: 'beginner' | 'intermediate' | 'advanced') => {
    setUserKnowledge(knowledge);
  };

  const resetFlow = () => {
    setUserKnowledge(null);
    setSelectedComponent('');
  };

  const handleConfigGenerated = (config: any) => {
    onConfigGenerated?.(config);
  };

  return (
    <div className="space-y-6">
      {/* Pergunta sobre conhecimento */}
      {!userKnowledge && (
        <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex items-center justify-center gap-3">
              <User className="w-8 h-8 text-blue-600" />
              <CardTitle className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                Qual é o seu nível de conhecimento?
              </CardTitle>
            </div>
            <CardDescription className="text-lg text-blue-700 dark:text-blue-300 max-w-2xl mx-auto">
              Vamos personalizar sua experiência de configuração baseada no seu conhecimento sobre componentes de computador
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 p-8">
            <div className="space-y-6">
              {/* Iniciante */}
              <button
                onClick={() => handleKnowledgeSelect('beginner')}
                className="w-full flex items-start space-x-4 p-6 rounded-xl border-2 border-border hover:border-green-300 cursor-pointer transition-all duration-200 hover:shadow-lg text-left focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300 group relative"
              >
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full border-2 border-green-300 group-hover:border-green-400 transition-colors duration-200"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <Gamepad2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-foreground">
                        Iniciante
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Com ajuda da IA baseada em jogos
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Não tenho muito conhecimento sobre componentes. Quero que a IA me ajude baseada nos jogos que pretendo jogar.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-600 font-medium">
                    <Bot className="w-4 h-4" />
                    Recomendado para quem está começando
                  </div>
                </div>
              </button>
              
              {/* Intermediário */}
              <button
                onClick={() => handleKnowledgeSelect('intermediate')}
                className="w-full flex items-start space-x-4 p-6 rounded-xl border-2 border-border hover:border-yellow-300 cursor-pointer transition-all duration-200 hover:shadow-lg text-left focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-300 group relative"
              >
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full border-2 border-yellow-300 group-hover:border-yellow-400 transition-colors duration-200"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                      <Wrench className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-foreground">
                        Intermediário
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Com ajuda da IA baseada em uma peça
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Tenho conhecimento básico sobre componentes. Quero escolher uma peça principal e deixar a IA completar o resto.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-yellow-600 font-medium">
                    <Bot className="w-4 h-4" />
                    Ideal para quem já tem alguma experiência
                  </div>
                </div>
              </button>
              
              {/* Avançado */}
              <button
                onClick={() => handleKnowledgeSelect('advanced')}
                className="w-full flex items-start space-x-4 p-6 rounded-xl border-2 border-border hover:border-purple-300 cursor-pointer transition-all duration-200 hover:shadow-lg text-left focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-300 group relative"
              >
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full border-2 border-purple-300 group-hover:border-purple-400 transition-colors duration-200"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Wrench className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-foreground">
                        Avançado
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Seleção individual de todas as peças
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Tenho bom conhecimento sobre componentes e compatibilidade. Quero escolher cada peça individualmente.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-purple-600 font-medium">
                    <Wrench className="w-4 h-4" />
                    Para usuários experientes
                  </div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fluxo para Iniciantes - Baseado em Jogos */}
      {userKnowledge === 'beginner' && (
        <div className="space-y-6">
          <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardHeader className="text-center space-y-2 pb-6">
              <div className="flex items-center justify-center gap-3">
                <Gamepad2 className="w-8 h-8 text-green-600" />
                <CardTitle className="text-3xl font-bold text-green-900 dark:text-green-100">
                  Configuração para Iniciantes
                </CardTitle>
              </div>
              <CardDescription className="text-lg text-green-700 dark:text-green-300">
                Digite o jogo que você quer jogar e nossa IA criará uma configuração otimizada para você
              </CardDescription>
            </CardHeader>
          </Card>
          
          <GameBasedConfig onConfigGenerated={handleConfigGenerated} />
          
          <div className="text-center">
            <Button
              onClick={resetFlow}
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950/20"
            >
              Voltar ao início
            </Button>
          </div>
        </div>
      )}

      {/* Fluxo para Intermediários - Uma Peça + IA */}
      {userKnowledge === 'intermediate' && (
        <div className="space-y-6">
          <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
            <CardHeader className="text-center space-y-2 pb-6">
              <div className="flex items-center justify-center gap-3">
                <Wrench className="w-8 h-8 text-yellow-600" />
                <CardTitle className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                  Configuração Intermediária
                </CardTitle>
              </div>
              <CardDescription className="text-lg text-yellow-700 dark:text-yellow-300">
                Escolha uma peça principal e nossa IA completará o resto da configuração
              </CardDescription>
            </CardHeader>
          </Card>
          
          <ComponentBasedConfig onConfigGenerated={handleConfigGenerated} />
          
          <div className="text-center">
            <Button
              onClick={resetFlow}
              variant="outline"
              className="text-yellow-600 border-yellow-200 hover:bg-yellow-50 dark:hover:bg-yellow-950/20"
            >
              Voltar ao início
            </Button>
          </div>
        </div>
      )}

      {/* Fluxo para Avançados - Seleção Individual */}
      {userKnowledge === 'advanced' && (
        <div className="space-y-6">
          <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="text-center space-y-2 pb-6">
              <div className="flex items-center justify-center gap-3">
                <Wrench className="w-8 h-8 text-purple-600" />
                <CardTitle className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  Configuração Avançada
                </CardTitle>
              </div>
              <CardDescription className="text-lg text-purple-700 dark:text-purple-300">
                Selecione cada componente individualmente para criar sua configuração personalizada
              </CardDescription>
            </CardHeader>
          </Card>
          
          <AdvancedConfig onConfigGenerated={handleConfigGenerated} />
          
          <div className="text-center">
            <Button
              onClick={resetFlow}
              variant="outline"
              className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/20"
            >
              Voltar ao início
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PCBuilderKnowledgeFlow;
