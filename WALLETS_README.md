# Sistema de Carteiras do Hyperliquid

Este sistema permite cadastrar, monitorar e seguir carteiras de trading do Hyperliquid para automatizar seus investimentos.

## Funcionalidades

### 📊 Monitoramento de Carteiras
- **Cadastro de carteiras**: Adicione carteiras do Hyperliquid pelo endereço Ethereum
- **Dados em tempo real**: Monitoramento de P&L, valor total, taxa de sucesso, etc.
- **Filtros avançados**: Filtre por status de following, carteiras ativas, etc.
- **Busca**: Procure carteiras por nome, endereço ou descrição

### 🔄 Atualização de Dados
- **Atualização manual**: Atualize dados de qualquer carteira com um clique
- **Dados do Hyperliquid**: Integração com a API do Hyperliquid para dados precisos
- **Histórico**: Mantenha histórico de performance das carteiras

### 👥 Sistema de Following
- **Follow/Unfollow**: Marque carteiras para seguir ou parar de seguir
- **Dashboard personalizado**: Veja apenas as carteiras que você está seguindo
- **Automação**: Prepare-se para automatizar investimentos baseado nas carteiras seguidas

## Estrutura do Banco de Dados

### Modelo Wallet
```typescript
{
  id: string;              // ID único da carteira
  address: string;         // Endereço Ethereum da carteira
  name: string;            // Nome personalizado da carteira
  description?: string;    // Descrição opcional
  isActive: boolean;       // Status ativo/inativo
  isFollowing: boolean;    // Se está sendo seguida
  
  // Dados do Hyperliquid
  totalValue?: number;     // Valor total do portfólio
  pnl24h?: number;         // P&L das últimas 24h
  pnl7d?: number;          // P&L dos últimos 7 dias
  pnl30d?: number;         // P&L dos últimos 30 dias
  
  // Dados de trading
  totalTrades?: number;    // Total de trades
  winRate?: number;        // Taxa de sucesso (%)
  avgTradeSize?: number;   // Tamanho médio dos trades
  
  // Posições
  openPositions?: number;  // Posições abertas
  totalPositions?: number; // Total de posições
  
  // Metadados
  lastUpdated: Date;       // Última atualização
  createdAt: Date;         // Data de criação
  updatedAt: Date;         // Última modificação
  userId?: string;         // Usuário que adicionou
}
```

## API Endpoints

### GET /api/wallets
Lista todas as carteiras com filtros e paginação.

**Parâmetros:**
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10)
- `search`: Termo de busca
- `isFollowing`: Filtrar por following (true/false)
- `isActive`: Filtrar por status ativo (true/false)
- `userId`: Filtrar por usuário

### POST /api/wallets
Adiciona uma nova carteira.

**Body:**
```json
{
  "address": "0x1234567890123456789012345678901234567890",
  "name": "Minha Carteira",
  "description": "Carteira de trading profissional",
  "userId": "user_id_optional"
}
```

### GET /api/wallets/[id]
Obtém dados de uma carteira específica.

### PUT /api/wallets/[id]
Atualiza dados de uma carteira.

**Body:**
```json
{
  "action": "update" | "toggle-following"
}
```

### DELETE /api/wallets/[id]
Remove uma carteira.

## Como Usar

### 1. Adicionar uma Carteira
1. Acesse a página "Wallets" no dashboard
2. Clique em "Add Wallet"
3. Preencha o endereço Ethereum da carteira
4. Adicione um nome e descrição (opcional)
5. Clique em "Add Wallet"

### 2. Monitorar Performance
- A tabela mostra dados em tempo real das carteiras
- Use os filtros para encontrar carteiras específicas
- Clique em "Update Data" para atualizar informações

### 3. Seguir Carteiras
- Clique no menu de ações de uma carteira
- Selecione "Start Following" ou "Stop Following"
- Use o filtro "Following" para ver apenas carteiras seguidas

### 4. Ver no Hyperliquid
- Clique em "View on Hyperliquid" para abrir a carteira no site oficial
- Analise posições, trades e performance detalhada

## Configuração

### Variáveis de Ambiente
```env
DB_STRING="mongodb+srv://user:password@cluster.mongodb.net/database"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Banco de Dados
O sistema usa MongoDB com Prisma ORM. Para configurar:

1. Instale as dependências:
```bash
npm install
```

2. Configure o banco de dados:
```bash
npx prisma generate
npx prisma db push
```

## Próximos Passos

### Automação de Investimentos
- [ ] Sistema de sinais baseado em trades das carteiras seguidas
- [ ] Execução automática de ordens
- [ ] Alertas de entrada/saída
- [ ] Backtesting de estratégias

### Análise Avançada
- [ ] Gráficos de performance
- [ ] Análise de correlação entre carteiras
- [ ] Relatórios de risco
- [ ] Métricas de Sharpe ratio, drawdown, etc.

### Integração
- [ ] Webhooks para atualizações em tempo real
- [ ] API pública para terceiros
- [ ] Integração com outras exchanges
- [ ] Sistema de notificações

## Tecnologias Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Shadcn/ui, Tailwind CSS
- **Backend**: Next.js API Routes
- **Banco de Dados**: MongoDB com Prisma
- **Autenticação**: Clerk
- **Formulários**: React Hook Form + Zod
- **Tabelas**: TanStack Table
- **Notificações**: Sonner

## Contribuição

Para contribuir com o projeto:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Faça commit das mudanças
4. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT.
