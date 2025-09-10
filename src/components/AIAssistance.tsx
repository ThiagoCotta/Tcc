import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Bot, Loader2, Sparkles, User, Gamepad2, Wrench } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getAIAssistance, AISuggestedComponent } from "@/services/ai-assistance-api";
import { fetchHardwareList } from "@/services/hardware-api";
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select";
import GameBasedConfig from "./GameBasedConfig";

interface AIAssistanceProps {
  onComponentsSelected?: (components: AISuggestedComponent[]) => void;
}

const AIAssistance = ({ onComponentsSelected }: AIAssistanceProps = {}) => {
  const [selectedComponent, setSelectedComponent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableComponents, setAvailableComponents] = useState<SearchableSelectOption[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userKnowledge, setUserKnowledge] = useState<'beginner' | 'intermediate' | 'advanced' | null>(null);
  const [configType, setConfigType] = useState<'component' | 'game' | null>(null);
  
  const { toast } = useToast();

  // Carregar componentes disponíveis quando necessário
  const loadComponents = async () => {
    try {
      const [gpuList, cpuList] = await Promise.all([
        fetchHardwareList('gpu'),
        fetchHardwareList('cpu')
      ]);
      
      const allComponents: SearchableSelectOption[] = [
        ...gpuList.map(item => ({
          value: item.name,
          label: item.name,
          type: 'gpu' as const
        })),
        ...cpuList.map(item => ({
          value: item.name,
          label: item.name,
          type: 'cpu' as const
        }))
      ];
      
      setAvailableComponents(allComponents);
    } catch (error) {
      console.error('Erro ao carregar componentes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de componentes.",
        variant: "destructive",
      });
    }
  };

  const handleKnowledgeSelect = (knowledge: 'beginner' | 'intermediate' | 'advanced') => {
    setUserKnowledge(knowledge);
    if (knowledge === 'beginner') {
      setConfigType('game');
    } else {
      setConfigType('component');
      loadComponents();
    }
  };

  const handleConfigTypeSelect = (type: 'component' | 'game') => {
    setConfigType(type);
    if (type === 'component') {
      loadComponents();
    }
  };

  const resetFlow = () => {
    setUserKnowledge(null);
    setConfigType(null);
    setSelectedComponent('');
    setIsExpanded(false);
  };

  const handleAIAssistance = async () => {
    if (!selectedComponent) {
      toast({
        title: "Seleção necessária",
        description: "Por favor, selecione um componente principal primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await getAIAssistance(selectedComponent);
      
      if (response.success) {
        onComponentsSelected?.(response.components);
        toast({
          title: "Sugestões geradas!",
          description: `A IA sugeriu ${response.components.length} componentes para sua configuração.`,
        });
      } else {
        throw new Error(response.message || "Erro ao obter sugestões da IA");
      }
    } catch (error) {
      console.error("Erro ao obter assistência da IA:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao obter sugestões da IA.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Assistência da IA
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Deixe a inteligência artificial sugerir a configuração perfeita para o seu setup. 
            Vamos personalizar a experiência baseada no seu conhecimento e necessidades.
          </p>
        </div>

        {/* Pergunta sobre conhecimento */}
        {!userKnowledge && (
          <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="text-center space-y-2 pb-6">
              <div className="flex items-center justify-center gap-2">
                <User className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  Qual é o seu nível de conhecimento?
                </CardTitle>
              </div>
              <CardDescription className="text-base text-blue-700 dark:text-blue-300">
                Isso nos ajudará a personalizar a melhor forma de te ajudar
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 p-6">
              <RadioGroup onValueChange={handleKnowledgeSelect} className="space-y-4">
                <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-blue-300 cursor-pointer transition-colors">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <label htmlFor="beginner" className="flex-1 cursor-pointer">
                    <div className="font-medium">Iniciante</div>
                    <div className="text-sm text-muted-foreground">
                      Não tenho muito conhecimento sobre componentes de computador
                    </div>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-blue-300 cursor-pointer transition-colors">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <label htmlFor="intermediate" className="flex-1 cursor-pointer">
                    <div className="font-medium">Intermediário</div>
                    <div className="text-sm text-muted-foreground">
                      Tenho conhecimento básico sobre componentes
                    </div>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-blue-300 cursor-pointer transition-colors">
                  <RadioGroupItem value="advanced" id="advanced" />
                  <label htmlFor="advanced" className="flex-1 cursor-pointer">
                    <div className="font-medium">Avançado</div>
                    <div className="text-sm text-muted-foreground">
                      Tenho bom conhecimento sobre componentes e compatibilidade
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Seleção do tipo de configuração para usuários intermediários/avançados */}
        {userKnowledge && userKnowledge !== 'beginner' && !configType && (
          <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardHeader className="text-center space-y-2 pb-6">
              <div className="flex items-center justify-center gap-2">
                <Wrench className="w-6 h-6 text-green-600" />
                <CardTitle className="text-2xl font-bold text-green-900 dark:text-green-100">
                  Como você gostaria de configurar?
                </CardTitle>
              </div>
              <CardDescription className="text-base text-green-700 dark:text-green-300">
                Escolha a abordagem que melhor se adapta ao que você procura
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleConfigTypeSelect('component')}
                  className="p-6 rounded-lg border-2 border-border hover:border-green-300 cursor-pointer transition-colors text-left"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Wrench className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Por Componente</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Escolha um componente principal e nossa IA criará uma configuração completa
                  </p>
                </button>
                
                <button
                  onClick={() => handleConfigTypeSelect('game')}
                  className="p-6 rounded-lg border-2 border-border hover:border-green-300 cursor-pointer transition-colors text-left"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Gamepad2 className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Por Jogo</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Digite o jogo que quer jogar e escolha a qualidade desejada
                  </p>
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuração baseada em componentes */}
        {configType === 'component' && (
          <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="text-center space-y-2 pb-6">
              <div className="flex items-center justify-center gap-2">
                <Bot className="w-6 h-6 text-purple-600" />
                <CardTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  Configuração por Componente
                </CardTitle>
              </div>
              <CardDescription className="text-base text-purple-700 dark:text-purple-300">
                Escolha um componente principal e nossa IA criará uma configuração completa
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 p-6">
              <div className="space-y-3">
                <Label className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                  Qual será a peça principal do seu computador?
                </Label>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Escolha um processador ou placa de vídeo como base para sua configuração
                </p>
                <SearchableSelect
                  options={availableComponents}
                  value={selectedComponent}
                  onValueChange={setSelectedComponent}
                  placeholder="Digite para buscar um processador ou placa de vídeo..."
                  disabled={isLoading}
                />
              </div>

              <Button 
                onClick={handleAIAssistance}
                disabled={!selectedComponent || isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white disabled:opacity-50 py-4 text-lg font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gerando sugestões...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Bot className="w-5 h-5" />
                    Gerar Configuração com IA
                  </div>
                )}
              </Button>

              {isLoading && (
                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    </div>
                    <div>
                      <p className="text-base font-medium text-purple-900 dark:text-purple-100">
                        IA analisando componentes...
                      </p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        Buscando a melhor configuração para você
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center">
                <Button
                  onClick={resetFlow}
                  variant="outline"
                  className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                >
                  Voltar ao início
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuração baseada em jogos */}
        {configType === 'game' && (
          <div className="space-y-6">
            <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="text-center space-y-2 pb-6">
                <div className="flex items-center justify-center gap-2">
                  <Gamepad2 className="w-6 h-6 text-blue-600" />
                  <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    Configuração por Jogos
                  </CardTitle>
                </div>
                <CardDescription className="text-base text-blue-700 dark:text-blue-300">
                  Digite o jogo que você quer jogar e escolha a qualidade desejada
                </CardDescription>
              </CardHeader>
            </Card>
            
            <GameBasedConfig onConfigGenerated={onComponentsSelected} />
            
            <div className="text-center">
              <Button
                onClick={resetFlow}
                variant="outline"
                className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/20"
              >
                Voltar ao início
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistance;
