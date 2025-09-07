# PC Config Builder

Uma aplicação web moderna para configuração e montagem de PCs, permitindo aos usuários selecionar componentes de hardware e obter recomendações personalizadas.

## 🚀 Funcionalidades

- **Seleção de Componentes**: Interface intuitiva para escolher processadores, placas de vídeo, placas-mãe e memória RAM
- **Busca em Tempo Real**: Sistema de busca instantânea com filtros para encontrar componentes específicos
- **Integração com Supabase**: Dados atualizados em tempo real diretamente do banco de dados
- **Interface Responsiva**: Design moderno e adaptável para desktop e mobile
- **Validação de Formulário**: Verificação automática de compatibilidade entre componentes
- **Feedback Visual**: Indicadores de carregamento e estados de erro para melhor UX

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Banco de Dados**: Supabase
- **Ícones**: Lucide React
- **Gerenciamento de Estado**: React Hooks
- **Validação**: Validação customizada de formulários

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Conta no Supabase

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

3. Configure as variáveis de ambiente do Supabase:
   - Edite o arquivo `src/config/supabase.ts`
   - Adicione sua URL do projeto Supabase
   - Adicione sua chave pública (anon key)

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

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes de interface
│   ├── PCConfigForm.tsx # Formulário principal
│   └── HardwarePopup.tsx # Modal de hardware
├── config/             # Configurações
│   └── supabase.ts     # Configuração do Supabase
├── services/           # Serviços e APIs
│   └── hardware-api.ts # API de hardware
├── types/              # Definições de tipos TypeScript
│   └── hardware.ts     # Tipos de hardware
├── hooks/              # Hooks customizados
├── lib/                # Utilitários
└── pages/              # Páginas da aplicação
```

## 🎯 Como Usar

1. **Seleção de Componentes**: Use os dropdowns para selecionar cada componente do PC
2. **Busca**: Digite no campo de busca para filtrar componentes específicos
3. **Visualização**: Veja os componentes selecionados em tempo real
4. **Configuração**: Complete a configuração e envie o formulário

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run preview` - Visualiza a build de produção
- `npm run lint` - Executa o linter

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte ou dúvidas, abra uma issue no repositório do projeto.

---

**Desenvolvido com ❤️ para facilitar a montagem de PCs**
