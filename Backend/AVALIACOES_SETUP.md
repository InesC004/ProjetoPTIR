# Sistema de Avaliações de Motoristas

## Overview
Os clientes podem agora avaliar motoristas após a conclusão de uma viagem. O sistema calcula automaticamente a média de avaliações e o total de avaliações para cada motorista.

## Funcionalidades Implementadas

### 1. Modelo de Dados
- **Viagem**: Campo `avaliacao_motorista` com:
  - `nota`: Número entre 1 e 5
  - `comentario`: Texto opcional até 500 caracteres
  - `cliente_id`: ID do cliente que fez a avaliação
  - `data`: Data da avaliação

- **Motorista**: Novos campos
  - `avaliacao_media`: Média de todas as avaliações
  - `total_avaliacoes`: Total de avaliações recebidas

### 2. Endpoint de Avaliação

**Rota:**
```
PUT /api/viagens/:id/avaliar
```

**Autenticação:** Requerida (JWT Token do cliente)

**Corpo da Requisição:**
```json
{
  "nota": 5,
  "comentario": "Excelente serviço, muito profissional!"
}
```

**Validações:**
- `nota` deve ser um inteiro entre 1 e 5 (obrigatório)
- `comentario` é opcional e tem limite de 500 caracteres
- Viagem deve estar em estado "concluida"
- Apenas o cliente da viagem pode avaliar
- Cada viagem só pode receber uma avaliação
- Motorista deve ser encontrado na base de dados

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Motorista avaliado com sucesso.",
  "servidor": "HOSTNAME",
  "avaliacao": {
    "nota": 5,
    "comentario": "Excelente serviço!",
    "cliente_id": "cliente_uuid",
    "data": "2026-06-11T10:30:00.000Z"
  },
  "motorista": {
    "_id": "motorista_uuid",
    "nome": "João Silva",
    "avaliacao_media": 4.8,
    "total_avaliacoes": 5
  }
}
```

### 3. Fluxo de Uso

1. Cliente realiza uma viagem
2. Viagem é concluída (estado = "concluida")
3. Cliente envia uma avaliação com nota (1-5) e comentário opcional
4. Sistema valida os dados
5. Sistema atualiza a viagem com a avaliação
6. Sistema recalcula a média de avaliações do motorista

### 4. Cálculo de Média

A média é calculada dinamicamente:
```javascript
novaMedia = ((mediaAtual * totalAtual) + novaNota) / (totalAtual + 1)
```

Exemplo:
- Motorista tem 4 avaliações com média 4.0
- Cliente dá nota 5
- Nova média = ((4.0 * 4) + 5) / (4 + 1) = 21 / 5 = 4.2

### 5. Tratamento de Erros

| Erro | Código HTTP | Motivo |
|------|-------------|--------|
| Nota fora do intervalo | 400 | Nota deve ser inteiro entre 1-5 |
| Comentário muito longo | 400 | Máximo 500 caracteres |
| Viagem não encontrada | 404 | ID de viagem inválido |
| Viagem não concluída | 400 | Estado não é "concluida" |
| Não é o cliente da viagem | 403 | Apenas o cliente pode avaliar |
| Viagem já tem avaliação | 409 | Não pode avaliar duas vezes |
| Motorista não encontrado | 404 | Motorista não existe |

## Exemplos de Uso

### cURL
```bash
curl -X PUT http://localhost:8080/api/viagens/12345/avaliar \
  -H "Authorization: Bearer seu_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "nota": 5,
    "comentario": "Motorista muito profissional e atencioso!"
  }'
```

### JavaScript/Fetch
```javascript
const avaliarMotorista = async (viagemId, nota, comentario) => {
  try {
    const response = await fetch(`/api/viagens/${viagemId}/avaliar`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nota,
        comentario
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Avaliação salva!', data.avaliacao);
      console.log(`Motorista média: ${data.motorista.avaliacao_media}`);
    }
  } catch (error) {
    console.error('Erro ao avaliar:', error);
  }
};

// Usar
avaliarMotorista('viagem_id_aqui', 5, 'Excelente motorista!');
```

## Consultar Avaliações

As avaliações estão incluídas ao obter detalhes de uma viagem:

```bash
GET /api/viagens/:id
```

A resposta incluirá:
```json
{
  "avaliacao_motorista": {
    "nota": 5,
    "comentario": "Excelente!",
    "cliente_id": "...",
    "data": "2026-06-11T10:30:00.000Z"
  }
}
```

## Funcionalidades Futuras Sugeridas

1. **Avaliar Cliente**: Motoristas avaliam clientes
2. **Resposta a Avaliações**: Motoristas podem responder a avaliações
3. **Filtros**: Listar avaliações por período, motorista, nota mínima, etc.
4. **Badges**: Motoristas com média alta ganham badges (⭐⭐⭐⭐⭐ Excellent)
5. **Histórico**: Sistema de reputação com histórico
6. **Bloqueio**: Clientes bloqueados se muitas avaliações ruins
7. **Relatórios**: Relatórios de avaliações por motorista, período, etc.

## Autenticação

Atualmente, o sistema usa **Auth0** para autenticação. O middleware `jwtCheck` valida o token JWT e passa `req.user` com os dados do utilizador.

⚠️ **Nota importante**: Se o campo `req.user.id` não estiver disponível após a autenticação, pode ser necessário verificar:
- Configuração do Auth0
- Nome do campo no token JWT (pode ser `sub` em vez de `id`)
- Middleware de autenticação no app.js

## Próximos Passos

1. ✅ Adicionar rota no frontend para formulário de avaliação
2. ✅ Testar com cliente real e token válido
3. ✅ Considerar adicionar validações adicionais (ex: spam)
4. ✅ Adicionar auditoria/logs das avaliações
