#!/bin/bash

# Script para testar o endpoint de avaliações
# Nota: Este script é para desenvolvimento. Em produção, use um token JWT válido.

echo "=========================================="
echo "Teste do Sistema de Avaliações"
echo "=========================================="

# Configuração
API_URL="http://localhost:8080/api"
VIAGEM_ID="seu_viagem_id_aqui"
JWT_TOKEN="seu_token_jwt_aqui"

echo ""
echo "1. Testando avaliação com nota 5 e comentário:"
curl -X PUT "$API_URL/viagens/$VIAGEM_ID/avaliar" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nota": 5,
    "comentario": "Excelente motorista, muito profissional!"
  }' | jq .

echo ""
echo "2. Testando avaliação com nota 4 sem comentário:"
curl -X PUT "$API_URL/viagens/$VIAGEM_ID/avaliar" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nota": 4
  }' | jq .

echo ""
echo "3. Consultando viagem com avaliação:"
curl -X GET "$API_URL/viagens/$VIAGEM_ID" | jq .

echo ""
echo "4. Consultando motorista para ver média:"
curl -X GET "$API_URL/motoristas/motorista_id_aqui" | jq '.motorista | {nome, avaliacao_media, total_avaliacoes}'

echo ""
echo "=========================================="
echo "Testes Concluídos"
echo "=========================================="
