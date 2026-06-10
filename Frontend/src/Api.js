const BASE_URL = "http://localhost:8080";
// const BASE_URL = "https://takeacab.online/";
// ---------------------------------------------------------------------------
// Utilitário interno
// ---------------------------------------------------------------------------

function getToken() {
  return localStorage.getItem("token");
}

/**
 * Wrapper genérico à volta do fetch.
 * Lança um erro com a mensagem do servidor se o status não for 2xx.
 */
async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Tenta sempre ler o corpo como JSON
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || data?.error || `Erro ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

// =============================================================================
// Auth — Login e Registo
// =============================================================================

const auth = {
  /**
   * Tenta login em clientes, motoristas e gestores por ordem.
   * Devolve { token, role, cliente? } em caso de sucesso.
   */
  async login({ nif, access_password, email, password } = {}) {
    const endpoints = [
      "/api/clientes/login",
      "/api/motoristas/login",
      "/api/gestores/login",
    ];

    // Aceita ambos os formatos (nif/access_password e email/password)
    // para compatibilidade com os 3 endpoints.
    const body = {
      nif,
      access_password,
      email: email ?? nif,
      password: password ?? access_password,
    };

    for (const path of endpoints) {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) return data; // { token, role, cliente? }
    }

    throw new Error("Credenciais inválidas.");
  },

  /** Registo de novo cliente. */
  async registarCliente(payload) {
    return request("/api/clientes/register", {
      method: "POST",
      body: payload,
    });
  },

  /** Completar perfil Auth0 de cliente. */
  async completarPerfilCliente(payload) {
    return request("/api/clientes/completar", {
      method: "PUT",
      body: payload,
    });
  },
};

// =============================================================================
// Clientes
// =============================================================================

const clientes = {
  /** Obter perfil do cliente autenticado. */
  async obterPerfil() {
    return request("/api/clientes/perfil", {
      auth: true,
    });
  },

  /** Atualizar perfil do cliente autenticado. */
  async atualizarPerfil(payload) {
    return request("/api/clientes/perfil", {
      method: "PUT",
      body: payload,
      auth: true,
    });
  },
};

// =============================================================================
// Motoristas
// =============================================================================

const motoristas = {
  /** Listar todos os motoristas (requer token de gestor). */
  async listar() {
    return request("/api/motoristas/todos", {
      auth: true,
    });
  },

  /** Criar motorista (requer token de gestor). */
  async criar(payload) {
    return request("/api/motoristas/create", {
      method: "POST",
      body: payload,
      auth: true,
    });
  },

  /** Atualizar motorista por ID (requer token de gestor). */
  async atualizar(id, payload) {
    return request(`/api/motoristas/${id}`, {
      method: "PUT",
      body: payload,
      auth: true,
    });
  },

  /** Remover motorista por ID (requer token de gestor). */
  async remover(id) {
    return request(`/api/motoristas/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
};

// =============================================================================
// Táxis
// =============================================================================

const taxis = {
  async listar() {
    return request("/api/taxis/todos", {
      auth: true,
    });
  },

  async criar(payload) {
    return request("/api/taxis/create", {
      method: "POST",
      body: payload,
      auth: true,
    });
  },

  async atualizar(id, payload) {
    return request(`/api/taxis/${id}`, {
      method: "PUT",
      body: payload,
      auth: true,
    });
  },

  async remover(id) {
    return request(`/api/taxis/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
};

// =============================================================================
// Modelos de Táxi
// =============================================================================

const modelosTaxi = {
  async listarMarcas() {
    return request("/api/modelos-taxi/marcas");
  },

  async listarModelosPorMarca(marca) {
    return request(`/api/modelos-taxi/modelos/${marca}`);
  },
};
// =============================================================================
// Preços
// =============================================================================

const precos = {
  /** Listar todos os preços. */
  async listar() {
    return request("/api/precos");
  },

  /** Criar novo preço. */
  async criar(payload) {
    return request("/api/precos", {
      method: "POST",
      auth: true,
      body: payload,
    });
  },

  /** Atualizar preço por ID. */
  async atualizar(id, payload) {
    return request(`/api/precos/${id}`, {
      method: "PUT",
      auth: true,
      body: payload,
    });
  },
};

// =============================================================================
// Pedidos de Táxi
// =============================================================================

const pedidos = {
  /** Listar pedidos de táxi disponíveis para o motorista autenticado. */
  async listarDisponiveis(posicao = {}) {
    const params = new URLSearchParams();

    if (posicao.lat !== undefined && posicao.lng !== undefined) {
      params.set("lat", posicao.lat);
      params.set("lng", posicao.lng);
    }

    const query = params.toString();

    return request(`/api/pedidos/disponiveis${query ? `?${query}` : ""}`, {
      auth: true,
    });
  },

  /** Aceitar um pedido de táxi. */
  async aceitar(id) {
    return request(`/api/pedidos/${id}/aceitar`, {
      method: "PUT",
      auth: true,
    });
  },

  /** Cancelar a aceitação de um pedido de táxi. */
  async cancelarAceitacao(id) {
    return request(`/api/pedidos/${id}/cancelar-aceitacao`, {
      method: "PUT",
      auth: true,
    });
  },

  /** Obter um pedido específico pelo ID. */
  async obter(id) {
    return request(`/api/pedidos/${id}`, {
      auth: true,
    });
  },

  async iniciarViagem(id) {
    return request(`/api/pedidos/${id}/iniciar-viagem`, {
      method: "PUT",
      auth: true,
    });
  },

  async terminarViagem(id) {
    return request(`/api/pedidos/${id}/terminar-viagem`, {
      method: "PUT",
      auth: true,
    });
  },

  async obterAtivoMotorista() {
    return request("/api/pedidos/motorista/ativo", {
      auth: true,
    });
  },
};

// =============================================================================
// Faturas
// =============================================================================

const faturas = {
  /** Emitir fatura para uma viagem (requer pagamento confirmado). */
  async emitir(viagemId) {
    return request("/api/faturas", {
      method: "POST",
      body: { viagem_id: viagemId },
      auth: true,
    });
  },

  /** Listar faturas de um motorista específico. */
  async listarPorMotorista(motoristaId) {
    return request(`/api/faturas/motorista/${motoristaId}`, {
      auth: true,
    });
  },

  async listarMinhas() {
    return request("/api/faturas/motorista/me", {
      auth: true,
    });
  },
};

// =============================================================================
// Pagamentos
// =============================================================================

const pagamentos = {
  async criar(payload) {
    return request("/api/pagamentos", {
      method: "POST",
      body: payload,
      auth: true,
    });
  },

  async criarStripeIntent(payload) {
    return request("/api/pagamentos/stripe/create-intent", {
      method: "POST",
      body: payload,
      auth: true,
    });
  },

  async confirmarStripe(payload) {
    return request("/api/pagamentos/stripe/confirm", {
      method: "POST",
      body: payload,
      auth: true,
    });
  },
};

// =============================================================================
// Relatórios
// =============================================================================

const relatorios = {
  async motoristaMeu({ data_inicio, data_fim } = {}) {
    const params = new URLSearchParams();
    if (data_inicio) params.set("data_inicio", data_inicio);
    if (data_fim) params.set("data_fim", data_fim);
    const query = params.toString();

    return request(`/api/relatorios/motorista/me${query ? `?${query}` : ""}`, {
      auth: true,
    });
  },
};

// =============================================================================
// Serviços externos
// =============================================================================

const externos = {
  /**
   * Resolver localidade a partir de código postal português.
   * Formato: "XXXX-XXX"
   */
  async resolverCodigoPostal(codigoPostal) {
    const [cp4, cp3] = codigoPostal.split("-");
    if (!cp4 || !cp3) throw new Error("Código postal inválido.");

    const res = await fetch(`https://json.geoapi.pt/cp/${cp4}-${cp3}`);

    if (!res.ok) throw new Error("Código postal não encontrado.");

    return res.json(); // { concelho, distrito, ... }
  },

  /**
   * Geocodificação inversa via Nominatim (OpenStreetMap).
   * Devolve o endereço para as coordenadas dadas.
   */
  async geocodificarInverso(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

    const res = await fetch(url);

    if (!res.ok) throw new Error("Erro ao obter morada.");

    return res.json();
  },

  /**
   * Calcular rota entre dois pontos via OpenRouteService.
   * Requer a chave de API (CHAVE_ORS) definida no ambiente.
   */
  async calcularRota(latOrigem, lngOrigem, latDestino, lngDestino, apiKey) {
    const url =
      `https://api.openrouteservice.org/v2/directions/driving-car` +
      `?api_key=${apiKey}&start=${lngOrigem},${latOrigem}&end=${lngDestino},${latDestino}`;

    const res = await fetch(url);

    if (!res.ok) throw new Error("Erro ao calcular rota.");

    return res.json();
  },
};

// =============================================================================
// Gestores
// =============================================================================

const gestores = {
  /** Criar gestor. */
  async criar(payload) {
    return request("/api/gestores/create", {
      method: "POST",
      body: payload,
      auth: true,
    });
  },

  /** Listar todos os gestores. */
  async listar() {
    return request("/api/gestores/todos", {
      auth: true,
    });
  },
};

// =============================================================================
// Exportação
// =============================================================================

const api = {
  auth,
  gestores,
  clientes,
  motoristas,
  taxis,
  modelosTaxi,
  precos,
  pedidos,
  externos,
  faturas,
  pagamentos,
  relatorios,
};

export default api;
