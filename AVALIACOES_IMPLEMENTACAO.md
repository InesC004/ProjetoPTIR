# Sistema de Avaliações de Motoristas - Guia de Implementação

## ✅ O que foi implementado

### Backend

1. **Modelo de Dados**
   - Campo `avaliacao_motorista` no modelo de Viagem com:
     - `nota` (1-5)
     - `comentario` (até 500 caracteres)
     - `cliente_id`
     - `data`
   - Campos `avaliacao_media` e `total_avaliacoes` no modelo de Motorista

2. **Controladores**
   - `avaliarMotorista()` em viagens.js - adiciona avaliação e atualiza média
   - `getAvaliacoes()` em motoristas.js - retorna avaliações de um motorista
   - `getById()` em motoristas.js - retorna dados de um motorista

3. **Rotas**
   - `PUT /api/viagens/:id/avaliar` - avaliar motorista (protegido)
   - `GET /api/motoristas/:id/avaliacoes` - obter avaliações (público)
   - `GET /api/motoristas/:id` - obter motorista (público)

4. **Middleware**
   - `authWithFallback.js` - autenticação melhorada com suporte para diferentes tipos de token

### Frontend

5. **Exemplos de Componentes React**
   - `AvaliarMotoristaModal` - modal para avaliar
   - `AvaliacoesMotorita` - exibir avaliações
   - `ViagensConcluidasPage` - página de viagens com botão de avaliação
   - Serviço `avaliacoesService` para chamadas à API

---

## 🚀 Próximas Etapas de Implementação

### 1. Integrar no Frontend React

#### a) Adicionar página de histórico de viagens
```jsx
// src/pages/ViagensConcluidasPage.jsx
// Copiar do arquivo exemplos_avaliacoes.jsx
```

#### b) Adicionar componente de avaliação ao fluxo de viagem
- Após viagem concluída, mostrar botão "Avaliar Motorista"
- Abrir modal com formulário de avaliação
- Confirmar envio

#### c) Adicionar página de perfil do motorista
- Exibir foto, nome, média de avaliações
- Listar avaliações recentes
- Mostrar % de clientes satisfeitos

### 2. Melhorias na API

#### a) Adicionar filtros nas avaliações
```javascript
GET /api/motoristas/:id/avaliacoes?nota=5&desde=2024-01-01&ate=2024-12-31
GET /api/motoristas/:id/avaliacoes?ordenar=recentes&limite=10
```

#### b) Endpoint para responder a avaliações (motoristas)
```javascript
PUT /api/viagens/:id/avaliacao-resposta
{
  "resposta": "Obrigado pelo feedback!"
}
```

#### c) Estatísticas para o motorista
```javascript
GET /api/motoristas/:id/estatisticas
{
  "media": 4.8,
  "total": 150,
  "percentagem_5_estrelas": 75,
  "percentagem_4_estrelas": 15,
  "percentagem_3_estrelas": 8,
  "percentagem_2_estrelas": 2,
  "percentagem_1_estrela": 0
}
```

### 3. Testes

#### a) Testar endpoints via curl ou Postman
```bash
# 1. Terminar uma viagem
curl -X PUT http://localhost:8080/api/viagens/ID/terminar

# 2. Avaliar motorista
curl -X PUT http://localhost:8080/api/viagens/ID/avaliar \
  -H "Authorization: Bearer token_aqui" \
  -H "Content-Type: application/json" \
  -d '{"nota": 5, "comentario": "Excelente!"}'

# 3. Obter avaliações do motorista
curl http://localhost:8080/api/motoristas/ID/avaliacoes
```

#### b) Testar no Frontend
1. Fazer login como cliente
2. Concluir uma viagem (ou usar viagem de teste)
3. Clicar em "Avaliar Motorista"
4. Selecionar nota e adicionar comentário
5. Enviar avaliação
6. Verificar se aparece no histórico do motorista

### 4. Validações Adicionais

Adicionar ao controlador `avaliarMotorista`:
```javascript
// Evitar spam - máximo 1 avaliação por dia por cliente
const avaliacaoRecente = await Viagem.findOne({
  cliente_id: req.user.id,
  'avaliacao_motorista.data': { $gte: new Date(Date.now() - 24*60*60*1000) }
})

if (avaliacaoRecente) {
  return res.status(429).json({
    message: 'Pode avaliar apenas 1 motorista por dia'
  })
}
```

### 5. Segurança

- ✅ Apenas cliente autenticado pode avaliar
- ✅ Apenas cliente da viagem pode avaliar esse motorista
- ✅ Cada viagem só pode receber uma avaliação
- ⏳ Adicionar rate limiting
- ⏳ Adicionar moderação para comentários inapropriados
- ⏳ Log de todas as avaliações para auditoria

### 6. Base de Dados

Verificar se há indexação:
```javascript
// models/viagem.js
viagemSchema.index({ motorista_id: 1, 'avaliacao_motorista.nota': 1 })
viagemSchema.index({ 'avaliacao_motorista.data': 1 })
```

---

## 📊 Dados de Teste

### Seed para Testes

Criar arquivo `Backend/Seed/seedAvaliacoes.js`:
```javascript
const Viagem = require('../models/viagem')
const Motorista = require('../models/motorista')

exports.seedAvaliacoes = async () => {
  try {
    // Encontrar viagens concluídas sem avaliação
    const viagens = await Viagem.find({
      estado: 'concluida',
      'avaliacao_motorista.nota': { $exists: false }
    }).limit(5)

    for (const viagem of viagens) {
      const nota = Math.floor(Math.random() * 5) + 1
      const comentarios = [
        'Excelente motorista!',
        'Muito profissional',
        'Bom serviço',
        'Viagem confortável',
        'Recomendo!'
      ]

      viagem.avaliacao_motorista = {
        nota,
        comentario: comentarios[Math.floor(Math.random() * comentarios.length)],
        cliente_id: viagem.cliente_id,
        data: new Date()
      }

      // Atualizar média do motorista
      const motorista = await Motorista.findById(viagem.motorista_id)
      const total = motorista.total_avaliacoes || 0
      const media = motorista.avaliacao_media || 0
      
      const novaMedia = ((media * total) + nota) / (total + 1)
      motorista.total_avaliacoes = total + 1
      motorista.avaliacao_media = parseFloat(novaMedia.toFixed(2))

      await viagem.save()
      await motorista.save()
    }

    console.log('Seed de avaliações concluído!')
  } catch (error) {
    console.error('Erro no seed:', error)
  }
}
```

---

## 🔗 Estrutura de Ficheiros Atualizada

```
Backend/
├── AVALIACOES_SETUP.md          ✅ (novo)
├── teste_viagens_avaliacoes.sh  ✅ (novo)
├── controllers/
│   ├── viagens.js               ✅ (função avaliarMotorista existente)
│   └── motoristas.js            ✅ (funções getAvaliacoes e getById adicionadas)
├── middleware/
│   ├── auth.js                  (existente - Auth0)
│   └── authWithFallback.js      ✅ (novo - autenticação melhorada)
└── routes/
    ├── viagens.js               ✅ (rota PUT /:id/avaliar adicionada)
    └── motoristas.js            ✅ (rotas GET /:id/avaliacoes e GET /:id adicionadas)

Frontend/
└── exemplos_avaliacoes.jsx      ✅ (novo - componentes e serviço)
```

---

## 📝 Checklist de Integração

- [ ] Copiar componentes do `exemplos_avaliacoes.jsx` para seu projeto
- [ ] Adaptar paths das imports conforme seu projeto
- [ ] Adicionar página de viagens concluídas ao menu
- [ ] Adicionar modal de avaliação ao fluxo de viagem
- [ ] Testar endpoints com curl/Postman
- [ ] Testar no Frontend com cliente real
- [ ] Adicionar validações de segurança
- [ ] Adicionar moderação de comentários
- [ ] Adicionar rate limiting
- [ ] Criar testes automatizados
- [ ] Documentar decisões de design

---

## 🆘 Troubleshooting

### Erro: "Não autenticado"
- Verificar se o token JWT está sendo enviado corretamente
- Verificar se `req.user.id` está disponível
- Tentar com o middleware `authWithFallback`

### Erro: "Viagem não encontrada"
- Verificar se o ID da viagem está correto
- Verificar se a viagem existe na base de dados

### Erro: "Só o cliente desta viagem pode avaliar"
- Verificar se o cliente autenticado é o mesmo que fez a viagem
- Verificar se `req.user.id` está correto

### Avaliação não atualiza a média do motorista
- Verificar se o motorista existe
- Verificar campo `avaliacao_media` e `total_avaliacoes` no motorista
- Reexecutar o seed de motoristas

---

## 📞 Suporte

Para mais informações:
1. Consultar arquivo `AVALIACOES_SETUP.md`
2. Ver exemplos em `exemplos_avaliacoes.jsx`
3. Testar com `teste_viagens_avaliacoes.sh`

---

## 📅 Próxima Iteração

Considerar adicionar:
- Sistema de badges/reputação
- Avaliações bidirecionais (cliente ↔ motorista)
- Histórico de reputação por período
- Bloquear motoristas com média baixa
- Notificações de novas avaliações
