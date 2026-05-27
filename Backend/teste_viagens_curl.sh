#!/usr/bin/env bash
set -u

BASE_URL="${BASE_URL:-http://localhost:8080}"

RUN_ID="${RUN_ID:-$(date +%s)}"
CLIENT_NIF="${CLIENT_NIF:-$(printf '%09d' $(( (RANDOM % 900000000) + 100000000 )))}"
CLIENT_PASSWORD="${CLIENT_PASSWORD:-TesteCliente@${RUN_ID}}"
CLIENT_NAME="${CLIENT_NAME:-Cliente Teste ${RUN_ID}}"
CLIENT_EMAIL="${CLIENT_EMAIL:-cliente${RUN_ID}@teste.local}"

MOTORISTA_NIF="${MOTORISTA_NIF:-$(printf '%09d' $(( (RANDOM % 900000000) + 100000000 )))}"
MOTORISTA_PASSWORD="${MOTORISTA_PASSWORD:-TesteMotorista@${RUN_ID}}"
MOTORISTA_NAME="${MOTORISTA_NAME:-Motorista Teste ${RUN_ID}}"
MOTORISTA_EMAIL="${MOTORISTA_EMAIL:-motorista${RUN_ID}@teste.local}"
MOTORISTA_CARTA="${MOTORISTA_CARTA:-$(printf '%08d' $((RANDOM % 100000000)))}"

GESTOR_NIF="${GESTOR_NIF:-$(printf '%09d' $(( (RANDOM % 900000000) + 100000000 )))}"
GESTOR_PASSWORD="${GESTOR_PASSWORD:-TesteGestor@${RUN_ID}}"
GESTOR_NAME="${GESTOR_NAME:-Gestor Teste ${RUN_ID}}"
GESTOR_EMAIL="${GESTOR_EMAIL:-gestor${RUN_ID}@teste.local}"

LAST_BODY=""
LAST_HTTP_STATUS=""

extract_token() {
  python3 -c 'import sys, json
payload = json.load(sys.stdin)
print(payload.get("token", ""))'
}

extract_field() {
  local field="$1"
  python3 -c 'import sys, json
payload = json.load(sys.stdin)
print(payload.get(sys.argv[1], ""))' "$field"
}

extract_id() {
  python3 -c 'import sys, json
payload = json.load(sys.stdin)
print(payload.get("_id", payload.get("id", "")))'
}

http_json() {
  local method="$1"
  local url="$2"
  local auth_header="${3:-}"
  local payload="${4:-}"
  local tmpfile
  tmpfile="$(mktemp)"

  local curl_args=(
    -sS
    -o "$tmpfile"
    -w '%{http_code}'
    -X "$method"
    "$url"
  )

  if [[ -n "$auth_header" ]]; then
    curl_args+=( -H "$auth_header" )
  fi

  if [[ -n "$payload" ]]; then
    curl_args+=( -H "Content-Type: application/json" -d "$payload" )
  fi

  if ! LAST_HTTP_STATUS="$(curl "${curl_args[@]}" | tr -d '\r')"; then
    echo "Não foi possível ligar ao backend em $BASE_URL" >&2
    rm -f "$tmpfile"
    exit 1
  fi

  LAST_BODY="$(cat "$tmpfile")"
  rm -f "$tmpfile"
  printf '%s' "$LAST_BODY"
}

print_json() {
  python3 -m json.tool
}

check_backend() {
  local status
  status="$(curl -sS -o /tmp/ptir-test-body -w '%{http_code}' "$BASE_URL/api" || true)"
  if [[ "$status" != "200" ]]; then
    echo "Backend indisponível em $BASE_URL"
    if [[ -s /tmp/ptir-test-body ]]; then
      cat /tmp/ptir-test-body
    fi
    rm -f /tmp/ptir-test-body
    exit 1
  fi
  rm -f /tmp/ptir-test-body
}

show_credentials() {
  echo "=== Credenciais de teste ==="
  echo "Gestor: $GESTOR_NIF / $GESTOR_PASSWORD"
  echo "Cliente: $CLIENT_NIF / $CLIENT_PASSWORD"
  echo "Motorista: $MOTORISTA_NIF / $MOTORISTA_PASSWORD"
  echo
}

create_or_login_gestor() {
  local body token

  body="$(http_json POST "$BASE_URL/api/gestores/login" "" "{\"nif\":\"$GESTOR_NIF\",\"password\":\"$GESTOR_PASSWORD\"}")"
  token="$(printf '%s' "$body" | extract_token)"

  if [[ -z "$token" ]]; then
    body="$(http_json POST "$BASE_URL/api/gestores/create" "" "{\"nome\":\"$GESTOR_NAME\",\"nif\":\"$GESTOR_NIF\",\"email\":\"$GESTOR_EMAIL\",\"password\":\"$GESTOR_PASSWORD\"}")"
    if ! printf '%s' "$body" | grep -q '"success"[[:space:]]*:[[:space:]]*true'; then
      echo "Erro ao criar gestor. Resposta: $body"
      exit 1
    fi
    body="$(http_json POST "$BASE_URL/api/gestores/login" "" "{\"nif\":\"$GESTOR_NIF\",\"password\":\"$GESTOR_PASSWORD\"}")"
    token="$(printf '%s' "$body" | extract_token)"
  fi

  if [[ -z "$token" ]]; then
    echo "Não foi possível obter token do gestor. Resposta: $body"
    exit 1
  fi

  GESTOR_TOKEN="$token"
}

create_or_login_cliente() {
  local body token

  body="$(http_json POST "$BASE_URL/api/clientes/login" "" "{\"nif\":\"$CLIENT_NIF\",\"access_password\":\"$CLIENT_PASSWORD\"}")"
  token="$(printf '%s' "$body" | extract_token)"

  if [[ -z "$token" ]]; then
    body="$(http_json POST "$BASE_URL/api/clientes/register" "" "{\"name\":\"$CLIENT_NAME\",\"nif\":\"$CLIENT_NIF\",\"email\":\"$CLIENT_EMAIL\",\"gender\":\"Outro\",\"birth_day\":1,\"birth_month\":1,\"birth_year\":1990,\"address\":\"Rua de Teste\",\"postal_code\":\"1000-200\",\"access_password\":\"$CLIENT_PASSWORD\"}")"
    if ! printf '%s' "$body" | grep -q '"success"[[:space:]]*:[[:space:]]*true'; then
      echo "Erro ao criar cliente. Resposta: $body"
      exit 1
    fi
    body="$(http_json POST "$BASE_URL/api/clientes/login" "" "{\"nif\":\"$CLIENT_NIF\",\"access_password\":\"$CLIENT_PASSWORD\"}")"
    token="$(printf '%s' "$body" | extract_token)"
  fi

  if [[ -z "$token" ]]; then
    echo "Não foi possível obter token do cliente. Resposta: $body"
    exit 1
  fi

  CLIENT_TOKEN="$token"
}

create_or_login_motorista() {
  local body token

  body="$(http_json POST "$BASE_URL/api/motoristas/login" "" "{\"nif\":\"$MOTORISTA_NIF\",\"password\":\"$MOTORISTA_PASSWORD\"}")"
  token="$(printf '%s' "$body" | extract_token)"

  if [[ -z "$token" ]]; then
    body="$(http_json POST "$BASE_URL/api/motoristas/create" "Authorization: Bearer $GESTOR_TOKEN" "{\"nome\":\"$MOTORISTA_NAME\",\"nif\":\"$MOTORISTA_NIF\",\"email\":\"$MOTORISTA_EMAIL\",\"password\":\"$MOTORISTA_PASSWORD\",\"numero_carta\":\"$MOTORISTA_CARTA\",\"genero\":\"Outro\",\"birth_day\":1,\"birth_month\":1,\"birth_year\":1990,\"morada\":\"Rua do Motorista\",\"codigo_postal\":\"1000-200\"}")"
    if ! printf '%s' "$body" | grep -q '"success"[[:space:]]*:[[:space:]]*true'; then
      echo "Erro ao criar motorista. Resposta: $body"
      exit 1
    fi
    body="$(http_json POST "$BASE_URL/api/motoristas/login" "" "{\"nif\":\"$MOTORISTA_NIF\",\"password\":\"$MOTORISTA_PASSWORD\"}")"
    token="$(printf '%s' "$body" | extract_token)"
  fi

  if [[ -z "$token" ]]; then
    echo "Não foi possível obter token do motorista. Resposta: $body"
    exit 1
  fi

  MOTORISTA_TOKEN="$token"
}

ensure_preco_basico() {
  local body
  body="$(http_json GET "$BASE_URL/api/precos" "")"

  if printf '%s' "$body" | python3 -c 'import sys, json
payload = json.load(sys.stdin)
print(any(p.get("nivel_conforto") == "basico" for p in payload))' | grep -q '^True$'; then
    return
  fi

  body="$(http_json POST "$BASE_URL/api/precos" "Authorization: Bearer $GESTOR_TOKEN" "{\"nivel_conforto\":\"basico\",\"preco_minuto\":0.75,\"acrescimo_noturno\":0}")"
  if ! printf '%s' "$body" | grep -q '"_id"[[:space:]]*:'; then
    echo "Erro ao criar preço básico. Resposta: $body"
    exit 1
  fi
}

ensure_taxi() {
  local body taxi_id
  TAXI_MATRICULA="${TAXI_MATRICULA:-AB-${RUN_ID: -2}-${RUN_ID: -4:2}}"

  body="$(http_json POST "$BASE_URL/api/taxis/create" "Authorization: Bearer $GESTOR_TOKEN" "{\"matricula\":\"$TAXI_MATRICULA\",\"modelo\":\"Corolla\",\"marca\":\"Toyota\",\"ano_compra\":2020,\"tipo_motor\":\"combustao\",\"nivel_conforto\":\"basico\"}")"
  taxi_id="$(printf '%s' "$body" | extract_id)"

  if [[ -z "$taxi_id" ]]; then
    body="$(http_json GET "$BASE_URL/api/taxis/todos" "Authorization: Bearer $GESTOR_TOKEN")"
    taxi_id="$(printf '%s' "$body" | python3 -c 'import sys, json
payload = json.load(sys.stdin)
for taxi in payload:
    if taxi.get("matricula") == sys.argv[1]:
        print(taxi.get("_id", taxi.get("id", "")))
        break
' "$TAXI_MATRICULA")"
  fi

  if [[ -z "$taxi_id" ]]; then
    echo "Não foi possível identificar o taxi de teste."
    exit 1
  fi

  TAXI_ID="$taxi_id"
}

ensure_turno() {
  local body agora inicio fim
  agora="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  inicio="$agora"
  fim="$(date -u -d '+2 hours' +"%Y-%m-%dT%H:%M:%SZ")"

  body="$(http_json GET "$BASE_URL/api/turnos/meus" "Authorization: Bearer $MOTORISTA_TOKEN")"
  if [[ "$LAST_HTTP_STATUS" == "200" ]]; then
    if printf '%s' "$body" | python3 -c 'import sys, json
payload = json.load(sys.stdin)
now = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
for turno in payload:
    inicio = __import__("datetime").datetime.fromisoformat(turno["data_inicio"].replace("Z", "+00:00"))
    fim = __import__("datetime").datetime.fromisoformat(turno["data_fim"].replace("Z", "+00:00"))
    if inicio <= now <= fim:
        print("ACTIVE")
        break
' | grep -q '^ACTIVE$'; then
      return
    fi
  fi

  body="$(http_json POST "$BASE_URL/api/turnos/create" "Authorization: Bearer $MOTORISTA_TOKEN" "{\"taxi_id\":\"$TAXI_ID\",\"data_inicio\":\"$inicio\",\"data_fim\":\"$fim\"}")"
  if ! printf '%s' "$body" | grep -q '"_id"[[:space:]]*:'; then
    echo "Erro ao criar turno. Resposta: $body"
    exit 1
  fi
}

check_backend
show_credentials
create_or_login_gestor
create_or_login_cliente
create_or_login_motorista
ensure_preco_basico
ensure_taxi
ensure_turno

echo "=== 1) Criar pedido do cliente ==="
BODY="$(http_json POST "$BASE_URL/api/pedidos/create" "Authorization: Bearer $CLIENT_TOKEN" '{"origem_morada":"Lisboa - Centro","origem_lat":38.7567,"origem_lng":-9.1554,"destino_morada":"Lisboa - Campo Grande","destino_lat":38.7600,"destino_lng":-9.1650,"numero_pessoas":2,"nivel_conforto":"basico"}')"
PEDIDO_ID="$(printf '%s' "$BODY" | python3 -c 'import sys, json
payload = json.load(sys.stdin)
print(payload.get("pedido", {}).get("_id", ""))')"
printf '%s\n' "$BODY" | print_json

echo

echo "=== 2) Ver pedido ativo do cliente ==="
http_json GET "$BASE_URL/api/pedidos/ativo" "Authorization: Bearer $CLIENT_TOKEN" "" | print_json

echo

echo "=== 3) Listar pedidos disponíveis para o motorista ==="
http_json GET "$BASE_URL/api/pedidos/disponiveis" "Authorization: Bearer $MOTORISTA_TOKEN" "" | print_json

echo

echo "=== 4) Aceitar o pedido criado ==="
if [[ -z "$PEDIDO_ID" ]]; then
  echo "Não foi possível identificar o pedido criado."
  exit 0
fi

http_json PUT "$BASE_URL/api/pedidos/$PEDIDO_ID/aceitar" "Authorization: Bearer $MOTORISTA_TOKEN" "" | print_json

echo

echo "=== 5) Confirmar pedido pelo cliente ==="
http_json PUT "$BASE_URL/api/pedidos/$PEDIDO_ID/responder" "Authorization: Bearer $CLIENT_TOKEN" '{"resposta":"confirmar"}' | print_json

echo

echo "=== 6) Criar viagem a partir do pedido confirmado ==="
http_json POST "$BASE_URL/api/viagens" "Authorization: Bearer $MOTORISTA_TOKEN" "{\"pedido_id\":\"$PEDIDO_ID\"}" | print_json

echo

echo "=== 7) Listar viagens ==="
http_json GET "$BASE_URL/api/viagens" "" "" | print_json

echo

echo "=== 8) Ver detalhes da última viagem ==="
VIAGEM_ID="$(http_json GET "$BASE_URL/api/viagens" "" "" | python3 -c 'import sys, json
payload = json.load(sys.stdin)
viagens = payload.get("viagens", [])
print(viagens[-1]["_id"] if viagens else "")')"

if [[ -n "$VIAGEM_ID" ]]; then
  http_json GET "$BASE_URL/api/viagens/$VIAGEM_ID" "" "" | print_json
fi

echo

echo "Fluxo concluído com sucesso."
