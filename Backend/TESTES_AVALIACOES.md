# Guia de Testes - Sistema de Avaliações

## 🧪 Executar Testes Automatizados

### Pré-requisitos
- Node.js e npm instalados
- Servidor Backend a correr em `http://localhost:8080`
- Token JWT válido (se tiver autenticação ativa)
- Dependência `axios` instalada: `npm install axios`

### Executar Testes

```bash
# Na pasta Backend
cd Backend

# Executar testes com token (recomendado)
export AUTH_TOKEN="seu_token_jwt_aqui"
node testes/avaliacoes.test.js

# Ou sem token (alguns testes falharão)
node testes/avaliacoes.test.js
```

### O que cada teste verifica

1. **Teste 1**: Obter todas as viagens
   - Busca viagem concluída para testar avaliação

2. **Teste 2**: Avaliar motorista
   - Envia avaliação com nota 5
   - Verifica se foi registada
   - Verifica atualização da média

3. **Teste 3**: Obter avaliações de motorista
   - Busca avaliações do motorista
   - Exibe média e histórico

4. **Teste 4**: Validações de entrada
   - Testa nota fora do intervalo
   - Testa comentário muito longo
   - Testa ID inválido

5. **Teste 5**: Fluxo completo
   - Simula processo completo de avaliação

---

## 🔍 Testes Manuais com cURL

### 1. Listar todas as viagens

```bash
curl -X GET http://localhost:8080/api/viagens | jq .
```

### 2. Terminar uma viagem

```bash
curl -X PUT http://localhost:8080/api/viagens/ID_VIAGEM/terminar \
  -H "Content-Type: application/json" | jq .
```

### 3. Avaliar motorista (com autenticação)

```bash
curl -X PUT http://localhost:8080/api/viagens/ID_VIAGEM/avaliar \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nota": 5,
    "comentario": "Excelente motorista!"
  }' | jq .
```

### 4. Avaliar motorista (sem autenticação - desenvolvimento)

```bash
curl -X PUT http://localhost:8080/api/viagens/ID_VIAGEM/avaliar \
  -H "X-User-Id: cliente_id_teste" \
  -H "Content-Type: application/json" \
  -d '{
    "nota": 4,
    "comentario": "Muito bom!"
  }' | jq .
```

### 5. Obter avaliações de um motorista

```bash
curl -X GET http://localhost:8080/api/motoristas/ID_MOTORISTA/avaliacoes | jq .
```

### 6. Obter detalhes de motorista

```bash
curl -X GET http://localhost:8080/api/motoristas/ID_MOTORISTA | jq .
```

### 7. Obter viagem específica (com avaliação)

```bash
curl -X GET http://localhost:8080/api/viagens/ID_VIAGEM | jq '.viagem | {motorista_id, avaliacao_motorista}'
```

---

## 📝 Exemplos de IDs para Testar

Para obter IDs reais:

```bash
# Listar viagens e extrair IDs
curl http://localhost:8080/api/viagens | jq '.viagens[] | {_id, estado, motorista_id}' | head -20

# Listar motoristas
curl http://localhost:8080/api/motoristas/todos | jq '.[] | {_id, nome, avaliacao_media}'
```

---

## 🧩 Testes no Postman

### Importar Collection

1. Abrir Postman
2. Click em "Import"
3. Cole o seguinte JSON:

```json
{
  "info": {
    "name": "Avaliações Motoristas",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Listar Viagens",
      "request": {
        "method": "GET",
        "url": "http://localhost:8080/api/viagens"
      }
    },
    {
      "name": "Avaliar Motorista",
      "request": {
        "method": "PUT",
        "url": "http://localhost:8080/api/viagens/{{viagem_id}}/avaliar",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"nota\": 5,\n  \"comentario\": \"Excelente motorista!\"\n}"
        }
      }
    },
    {
      "name": "Obter Avaliações Motorista",
      "request": {
        "method": "GET",
        "url": "http://localhost:8080/api/motoristas/{{motorista_id}}/avaliacoes"
      }
    }
  ]
}
```

### Variáveis de Ambiente

Criar variáveis no Postman:
- `token`: seu JWT token
- `viagem_id`: ID de viagem de teste
- `motorista_id`: ID de motorista de teste

---

## 🐛 Debugging

### Ver logs do servidor

```bash
# Terminal onde Backend está a correr
# Os logs mostrarão:
# - Autenticação: [AUTH] User autenticado: ...
# - Erros: [ERR] ...
# - Info: [INFO] ...
```

### Verificar Middleware de Autenticação

Se receber "Não autenticado", verifique:

1. Token está sendo enviado?
```bash
curl -i -X PUT http://localhost:8080/api/viagens/ID/avaliar \
  -H "Authorization: Bearer seu_token"
```

2. Token é válido?
```bash
# Decodificar token (sem verificação - apenas para debug)
# Use site como jwt.io
```

3. Campo `req.user.id` existe?
Adicionar ao controlador:
```javascript
console.log('req.user:', req.user)
console.log('req.user.id:', req.user.id)
```

---

## ✅ Checklist de Testes

- [ ] Listar viagens retorna array
- [ ] Viagem concluída pode ser avaliada
- [ ] Nota deve estar entre 1-5
- [ ] Comentário tem limite de 500 caracteres
- [ ] Cada viagem só pode receber uma avaliação
- [ ] Apenas cliente da viagem pode avaliar
- [ ] Média de motorista é calculada corretamente
- [ ] Avaliações aparecem na lista do motorista
- [ ] Dados persistem após restart do servidor
- [ ] Autenticação funciona corretamente

---

## 🔧 Troubleshooting

### "Authorization header required"
```bash
# Solução: Incluir token correto
curl -H "Authorization: Bearer SEU_TOKEN" ...

# Ou em modo desenvolvimento:
curl -H "X-User-Id: cliente_id" ...
```

### "Viagem não encontrada"
```bash
# Verificar se ID é válido
curl http://localhost:8080/api/viagens | jq '.viagens[0]._id'
```

### "Só o cliente desta viagem pode avaliar"
```bash
# Verificar se está usando token/ID do cliente correto
curl -H "Authorization: Bearer $(seu_token_cliente)" ...
```

### "Esta viagem já tem avaliação"
```bash
# Viagem já foi avaliada. Testar com outra viagem:
curl http://localhost:8080/api/viagens | jq '.viagens[] | select(.avaliacao_motorista.nota == null) | ._id' | head -1
```

---

## 📊 Dados de Teste Recomendados

### Para Seed Rápido

```javascript
// backend/Seed/seedAvaliacoes.js
const avaliacoes = [
  { nota: 5, comentario: 'Excelente!' },
  { nota: 4, comentario: 'Muito bom!' },
  { nota: 3, comentario: 'Aceitável' },
  { nota: 5, comentario: 'Recomendo!' },
  { nota: 4, comentario: 'Bom serviço' }
]

// Usar em seedAvaliacoes para popular dados
```

---

## 📞 Contacto & Suporte

- Documentação: `AVALIACOES_SETUP.md`
- Guia de Implementação: `AVALIACOES_IMPLEMENTACAO.md`
- Script de Testes: `testes/avaliacoes.test.js`
