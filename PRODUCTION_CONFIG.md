# Configurações de Produção

Este documento descreve como configurar o projeto para ambiente de produção.

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# URLs do N8N (Produção)
VITE_N8N_BASE_URL=https://thiagocotta.app.n8n.cloud/webhook
VITE_N8N_PC_CONFIG_URL=https://thiagoctt.app.n8n.cloud/webhook-test/pc-config
VITE_N8N_GAME_AI_URL=https://thiagocotta.app.n8n.cloud/webhook/Assistencia-De-IA-Para-Jogos
VITE_N8N_QUICK_SEARCH_URL=https://thiagocotta.app.n8n.cloud/webhook/BuscaRapida
VITE_N8N_BEGINNER_PRICE_URL=https://thiagocotta.app.n8n.cloud/webhook/Buscar-Preco-Hardware-Iniciante
VITE_N8N_AI_ASSISTANCE_URL=https://thiagoctt.app.n8n.cloud/webhook/Buscar-Preco-Hardware-Iniciante

# Configurações do Supabase (Produção)
VITE_SUPABASE_URL=https://ftbzdhplddmxiezxzjqf.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_PrtXg6KJGAEkzevMa8rE0g_rI8qXkDE
```

## URLs Configuradas

### N8N Webhooks
- **PC Config**: `https://thiagocotta.app.n8n.cloud/webhook-test/pc-config`
- **Game AI Assistance**: `https://thiagocotta.app.n8n.cloud/webhook-test/Assistencia-De-IA-Para-Jogos`
- **Quick Search**: `https://thiagocotta.app.n8n.cloud/webhook-test/BuscaRapida`
- **Beginner Price**: `https://thiagocotta.app.n8n.cloud/webhook-test/Buscar-Preco-Hardware-Iniciante`
- **AI Assistance**: `https://thiagocotta.app.n8n.cloud/webhook-test/Assistencia-De-IA`

### Supabase
- **URL**: `https://ftbzdhplddmxiezxzjqf.supabase.co`
- **Anon Key**: `sb_publishable_PrtXg6KJGAEkzevMa8rE0g_rI8qXkDE`

## Build de Produção

Para gerar a build de produção:

```bash
npm run build
```

A build será gerada na pasta `dist/` e estará otimizada para produção com:
- Minificação de código
- Chunks otimizados
- Sourcemaps desabilitados
- Tree shaking ativado

## Deploy

A pasta `dist/` contém todos os arquivos necessários para deploy em qualquer servidor web estático.

### Vercel
```bash
vercel --prod
```

### Netlify
```bash
netlify deploy --prod --dir=dist
```

### Servidor próprio
Simplesmente faça upload da pasta `dist/` para seu servidor web.

