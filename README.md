# Hardware Store - PC Config Builder

Uma aplicação web moderna para configuração e montagem de PCs, permitindo aos usuários selecionar componentes de hardware e obter recomendações personalizadas com integração N8N e IA.

## 🚀 Funcionalidades

### 🔧 Configuração de PC
- **Seleção de Componentes**: Interface intuitiva para escolher processadores, placas de vídeo, placas-mãe e memória RAM
- **Busca em Tempo Real**: Sistema de busca instantânea com filtros para encontrar componentes específicos
- **Integração N8N**: Processamento inteligente de configurações via webhooks N8N
- **Análise de Preços**: Busca automática de melhores ofertas em tempo real

### 🎮 Configuração Baseada em Jogos
- **Assistência de IA**: Configuração automática baseada no jogo desejado
- **Níveis de Qualidade**: Mínimo, Recomendado, Alto 60fps, Alto 100+fps
- **Explicação Interativa**: Efeito de digitação explicando as escolhas da IA
- **Busca de Preços**: Integração com APIs de preços para componentes sugeridos

### 🔍 Busca Rápida
- **Busca Específica**: Encontre ofertas para um hardware específico
- **Múltiplas Fontes**: Integração com AliExpress, Mercado Livre, Shopee e outras
- **Filtros Inteligentes**: Por tipo de hardware (CPU, GPU, RAM, etc.)

### 📊 Histórico de Buscas
- **Persistência Local**: Histórico salvo no localStorage
- **Detalhes Completos**: Visualização de requisições e respostas do N8N
- **Filtros por Origem**: PC Builder, Busca Rápida, Assistência de IA
- **Interface Intuitiva**: Lista com resumos e detalhes expandíveis

### 🎨 Interface e UX
- **Tema Escuro/Claro**: Alternância com ícones de lua/sol
- **Interface Responsiva**: Design moderno e adaptável para desktop e mobile
- **Feedback Visual**: Indicadores de carregamento e estados de erro
- **Componentes Reutilizáveis**: Sistema de design consistente com shadcn/ui

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Banco de Dados**: Supabase
- **Automação**: N8N (webhooks e workflows)
- **IA**: Integração com APIs de IA para assistência
- **Ícones**: Lucide React
- **Gerenciamento de Estado**: React Hooks
- **Armazenamento Local**: localStorage para histórico
- **Validação**: Validação customizada de formulários

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Conta no Supabase
- Acesso aos webhooks N8N configurados

## ⚙️ Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd pc-config-builder
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - **Supabase**: Edite o arquivo `src/config/supabase.ts`
     - Adicione sua URL do projeto Supabase
     - Adicione sua chave pública (anon key)
   - **N8N**: Os webhooks estão configurados nos serviços:
     - `src/services/n8n.ts` - Configuração de PC
     - `src/services/game-ai-assistance-api.ts` - Assistência de IA para jogos
     - `src/services/quick-search-api.ts` - Busca rápida

4. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
```

5. Acesse a aplicação em `http://localhost:3000`

## 🗄️ Estrutura do Banco de Dados

O projeto utiliza as seguintes tabelas no Supabase:

- **Cpus**: Processadores disponíveis
- **Video Cards**: Placas de vídeo
- **Motherboards**: Placas-mãe
- **Rams**: Módulos de memória RAM

Cada tabela deve conter pelo menos o campo `nome` (string).

## 🔗 Integração N8N

O projeto integra com os seguintes webhooks N8N:

- **PC Config**: `https://thiagoctt.app.n8n.cloud/webhook/pc-config`
- **Preços Iniciante**: `https://thiagoctt.app.n8n.cloud/webhook/Buscar-Preco-Hardware-Iniciante`
  - Processa configurações de PC e retorna ofertas
- **Assistência IA Jogos**: `https://thiagoctt.app.n8n.cloud/webhook/Assistencia-De-IA-Para-Jogos`
  - Gera configurações baseadas em jogos com IA
- **Busca Rápida**: `https://thiagoctt.app.n8n.cloud/webhook/BuscaRapida`
  - Busca ofertas para hardware específico
  - Busca preços para componentes sugeridos pela IA

## 📁 Estrutura do Projeto

```
src/
├── components/                    # Componentes React
│   ├── ui/                       # Componentes de interface (shadcn/ui)
│   ├── PCConfigForm.tsx          # Formulário principal de configuração
│   ├── GameBasedConfig.tsx       # Configuração baseada em jogos
│   ├── AIAssistance.tsx          # Assistência de IA
│   ├── HardwarePopup.tsx         # Modal de hardware
│   ├── TypewriterEffect.tsx      # Efeito de digitação
│   └── TabSystem.tsx             # Sistema de abas principal
├── config/                       # Configurações
│   └── supabase.ts               # Configuração do Supabase
├── services/                     # Serviços e APIs
│   ├── hardware-api.ts           # API de hardware (Supabase)
│   ├── n8n.ts                    # Webhooks N8N (PC Builder)
│   ├── game-ai-assistance-api.ts # IA para jogos
│   ├── quick-search-api.ts       # Busca rápida
│   ├── ai-assistance-api.ts      # Assistência de IA geral
│   └── history.ts                # Serviço de histórico
├── pages/                        # Páginas da aplicação
│   ├── PCBuilder.tsx             # Página principal
│   ├── QuickSearch.tsx           # Busca rápida
│   ├── History.tsx               # Histórico de buscas
│   └── Index.tsx                 # Página inicial
├── types/                        # Definições de tipos TypeScript
│   └── hardware.ts               # Tipos de hardware
├── hooks/                        # Hooks customizados
│   ├── use-theme.tsx             # Gerenciamento de tema
│   └── use-toast.ts              # Notificações
└── lib/                          # Utilitários
    └── utils.ts                  # Funções auxiliares
```

## 🎯 Como Usar

### 🔧 PC Builder
1. **Seleção de Componentes**: Use os dropdowns para selecionar cada componente do PC
2. **Busca**: Digite no campo de busca para filtrar componentes específicos
3. **Configuração**: Complete a configuração e envie o formulário
4. **Análise**: Aguarde o processamento via N8N e visualize as ofertas encontradas

### 🎮 Configuração por Jogos
1. **Escolha o Jogo**: Digite o nome do jogo que deseja jogar
2. **Selecione a Qualidade**: Escolha entre Mínimo, Recomendado, Alto 60fps ou Alto 100+fps
3. **Geração Automática**: A IA criará uma configuração otimizada
4. **Explicação Interativa**: Veja a explicação com efeito de digitação
5. **Busca de Preços**: Aguarde a busca automática de melhores ofertas

### 🔍 Busca Rápida
1. **Selecione o Hardware**: Digite o nome do hardware específico
2. **Busca Instantânea**: Clique em "Buscar Melhores Ofertas"
3. **Visualização**: Veja as ofertas de múltiplas fontes

### 📊 Histórico
1. **Acesso**: Clique no ícone de relógio na barra superior
2. **Visualização**: Veja todas as buscas realizadas
3. **Detalhes**: Clique em qualquer item para ver os dados completos do N8N
4. **Limpeza**: Use o botão "Limpar" para remover o histórico
