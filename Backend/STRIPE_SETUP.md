# Setup Stripe - Versão Simplificada

## Passo 1: Obter a Secret Key

1. Acesse https://dashboard.stripe.com/test/apikeys
2. Procure por **"Secret key"** (começa com `sk_test_`)
3. Copie a chave

## Passo 2: Configurar .env

No arquivo `.env` do Backend (crie se não existir):

```bash
STRIPE_SECRET_KEY=sk_test_sua_chave_aqui
```

**⚠️ IMPORTANTE:**
- Nunca compartilhe essa chave
- Nunca faça commit do `.env` (está no .gitignore)
- Cada desenvolvedor tem o seu próprio `.env` local

## Passo 3: Testar Pagamento

### 1. Criar Payment Intent (Cria pagamento em "pendente")

```bash
curl -X POST http://localhost:8080/api/pagamentos/stripe/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "viagem_id": "ID_DA_VIAGEM",
    "cliente_id": "ID_DO_CLIENTE",
    "valor": 25.50,
    "metodo": "cartao"
  }'
```

Resposta:
```json
{
  "success": true,
  "clientSecret": "pi_xxxxx_secret_xxxxx",
  "pagamento": {
    "_id": "xxx",
    "estado": "pendente",
    "valor": 25.50
  }
}
```

### 2. Processar Cartão no Frontend

Use a bibliotequea Stripe.js:
```javascript
const stripe = Stripe('pk_test_xxx'); // Publishable key (pública)
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');

const {paymentIntent, error} = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement
  }
});
```

### 3. Confirmar Pagamento no Backend

```bash
curl -X POST http://localhost:8080/api/pagamentos/stripe/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "pagamento_id": "ID_DO_PAGAMENTO",
    "stripe_payment_intent_id": "pi_xxxxx"
  }'
```

Resposta (se bem-sucedido):
```json
{
  "success": true,
  "message": "Pagamento confirmado com sucesso!",
  "pagamento": {
    "estado": "confirmado",
    "valor": 25.50
  }
}
```

## Métodos de Pagamento

- **cartao** → Via Stripe (fluxo acima)
- **dinheiro** → Sem Stripe (registro direto)
- **multibanco** → Sem Stripe (registro direto)
- **mbway** → Sem Stripe (registro direto)

## Ver Histórico de Pagamentos

```bash
# Todos os pagamentos
curl http://localhost:8080/api/pagamentos

# Histórico de um cliente
curl http://localhost:8080/api/pagamentos/historico/ID_DO_CLIENTE

# Pagamento específico
curl http://localhost:8080/api/pagamentos/ID_DO_PAGAMENTO
```

## Para Relatórios

Seu colega pode usar qualquer um desses endpoints para extrair dados:
- `GET /api/pagamentos` → Todos os dados
- `GET /api/pagamentos/historico/:cliente_id` → Por cliente
- Filtrar por `estado` (pendente, confirmado, falhado)
- Filtrar por `metodo` (cartao, dinheiro, multibanco, mbway)

## Webhook (Comentado)

O webhook está comentado no `app.js`. Se quiser ativá-lo depois para confirmação automática, descomenta:

```javascript
// Em app.js, linha ~44
app.use('/api/webhooks', webhooksRoutes);
```

Depois obtém o webhook secret no Stripe Dashboard.

## Solução de Problemas

**"Stripe não está configurado"** → Defina STRIPE_SECRET_KEY no .env e reinicie

**"viagem_id não encontrado"** → Certifique-se que a viagem existe no MongoDB

**"MONGO_URI não está definida"** → Configure também no .env
