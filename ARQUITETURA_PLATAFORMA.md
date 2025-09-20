# 🏗️ Arquitetura da Plataforma de Copytrade

## 📐 Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Dashboard │  │   Analytics │  │   Settings  │        │
│  │   Component │  │   Component │  │   Component │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Trading   │  │   Social    │  │   Mobile    │        │
│  │   Component │  │   Component │  │   Component │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Auth API  │  │  Trading API│  │  Analytics  │        │
│  │   Routes    │  │   Routes    │  │   API Routes│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Social    │  │   WebSocket │  │   Queue     │        │
│  │   API Routes│  │   Handler   │  │   Processor │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Wallet    │  │   Trading   │  │   Analytics │        │
│  │   Service   │  │   Service   │  │   Service   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Risk      │  │   Social    │  │   AI/ML     │        │
│  │   Service   │  │   Service   │  │   Service   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   MongoDB   │  │   Redis     │  │   File      │        │
│  │   Database  │  │   Cache     │  │   Storage   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL APIS                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Hyperliquid │  │   Clerk     │  │   Sentry    │        │
│  │     API     │  │    Auth     │  │ Monitoring  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Dados

### 1. **Autenticação**
```
User → Clerk → JWT Token → API Routes → Database
```

### 2. **Copytrade**
```
Trader Trade → Hyperliquid API → WebSocket → Queue → Copy Service → User Wallet
```

### 3. **Analytics**
```
Trade Data → Analytics Service → Database → API → Frontend Charts
```

## 🗄️ Estrutura do Banco de Dados

### **Collections MongoDB**

#### **Users**
```javascript
{
  _id: ObjectId,
  clerkId: String,
  email: String,
  name: String,
  avatar: String,
  subscription: String, // free, pro, premium
  createdAt: Date,
  updatedAt: Date
}
```

#### **UserWallets**
```javascript
{
  _id: ObjectId,
  userId: String,
  walletAddress: String,
  accountId: String,
  privateKey: String, // encrypted
  isConnected: Boolean,
  maxTradeSize: Number,
  riskPercentage: Number,
  maxOpenPositions: Number,
  autoCopyEnabled: Boolean,
  stopLossEnabled: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Traders**
```javascript
{
  _id: ObjectId,
  address: String,
  name: String,
  description: String,
  isActive: Boolean,
  isFollowing: Boolean,
  totalValue: Number,
  pnl24h: Number,
  pnl7d: Number,
  pnl30d: Number,
  totalTrades: Number,
  winRate: Number,
  avgTradeSize: Number,
  openPositions: Number,
  totalPositions: Number,
  trackRealtime: Boolean,
  lastTradeAt: Date,
  lastPositionUpdate: Date,
  lastUpdated: Date,
  createdAt: Date,
  updatedAt: Date,
  userId: String
}
```

#### **CopyTrades**
```javascript
{
  _id: ObjectId,
  userId: String,
  traderId: String,
  originalTradeId: String,
  copyTradeId: String,
  coin: String,
  side: String, // B or A
  size: Number,
  price: Number,
  multiplier: Number,
  status: String, // pending, copied, failed
  pnl: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Trades**
```javascript
{
  _id: ObjectId,
  traderId: String,
  coin: String,
  side: String,
  size: Number,
  price: Number,
  timestamp: Date,
  pnl: Number,
  status: String,
  createdAt: Date
}
```

## 🔧 Componentes Frontend

### **Dashboard Components**
```
src/
├── components/
│   ├── dashboard/
│   │   ├── PortfolioOverview.tsx
│   │   ├── PerformanceChart.tsx
│   │   ├── ActiveTrades.tsx
│   │   └── RiskMetrics.tsx
│   ├── trading/
│   │   ├── TraderList.tsx
│   │   ├── CopySettings.tsx
│   │   ├── TradeHistory.tsx
│   │   └── PositionManager.tsx
│   ├── analytics/
│   │   ├── PerformanceAnalytics.tsx
│   │   ├── RiskAnalysis.tsx
│   │   ├── CorrelationMatrix.tsx
│   │   └── BacktestResults.tsx
│   └── ui/
│       ├── charts/
│       ├── forms/
│       ├── tables/
│       └── modals/
```

## 🚀 APIs Endpoints

### **Authentication**
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/user`

### **Wallet Management**
- `GET /api/user-wallet`
- `POST /api/user-wallet/connect`
- `PUT /api/user-wallet/settings`
- `DELETE /api/user-wallet/disconnect`

### **Trading**
- `GET /api/traders`
- `GET /api/traders/[id]`
- `POST /api/copy-trade`
- `GET /api/copy-trades`
- `PUT /api/copy-trade/[id]`
- `DELETE /api/copy-trade/[id]`

### **Analytics**
- `GET /api/analytics/performance`
- `GET /api/analytics/risk`
- `GET /api/analytics/correlation`
- `POST /api/analytics/backtest`

### **Real-time**
- `WebSocket /ws/trades`
- `WebSocket /ws/portfolio`
- `WebSocket /ws/notifications`

## 🔒 Segurança

### **Data Protection**
- JWT tokens para autenticação
- Criptografia de chaves privadas
- Rate limiting nas APIs
- Validação de entrada com Zod
- Sanitização de dados

### **Risk Management**
- Stop loss automático
- Position sizing inteligente
- Circuit breakers
- Diversificação automática
- Monitoramento de risco em tempo real

## 📊 Monitoramento

### **Métricas Técnicas**
- Uptime da aplicação
- Latência das APIs
- Taxa de erro
- Performance do banco
- Uso de memória/CPU

### **Métricas de Negócio**
- Usuários ativos
- Trades executados
- Revenue por usuário
- Churn rate
- NPS score

---

*Esta arquitetura será implementada gradualmente seguindo o roadmap definido no plano de negócio.*


