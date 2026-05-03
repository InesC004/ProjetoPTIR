// =============================================================================
// api.js — Cliente centralizado para todas as chamadas à API
// =============================================================================
// Todas as chamadas ao backend passam por aqui.
// Não uses fetch() diretamente nos componentes — usa as funções deste ficheiro.
//
// Uso:
//   import api from "@/api";
//   const motoristas = await api.motoristas.listar();
//   await api.motoristas.criar(payload);
// =============================================================================

const BASE_URL = "http://localhost:8080";

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
  async login({ email, password }) {
    const endpoints = [
      "/api/clientes/login",
      "/api/motoristas/login",
      "/api/gestores/login",
    ];

    for (const path of endpoints) {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        return data; // { token, role, cliente? }
      }
    }

    throw new Error("Credenciais inválidas.");
  },

  /** Registo de novo cliente. */
  async registarCliente(payload) {
    return request("/api/clientes/register", { method: "POST", body: payload });
  },

  /** Completar perfil Auth0 de cliente. */
  async completarPerfilCliente(payload) {
    return request("/api/clientes/completar", { method: "PUT", body: payload });
  },
};

// =============================================================================
// Clientes
// =============================================================================

const clientes = {
  /** Obter perfil do cliente autenticado. */
  async obterPerfil() {
    return request("/api/clientes/perfil", { auth: true });
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
    return request("/api/motoristas/todos", { auth: true });
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
  /** Listar todos os táxis. */
  async listar() {
    return request("/taxis");
  },

  /** Criar táxi. */
  async criar(payload) {
    return request("/taxis", { method: "POST", body: payload });
  },

  /** Atualizar táxi por ID. */
  async atualizar(id, payload) {
    return request(`/taxis/${id}`, { method: "PUT", body: payload });
  },

  /** Remover táxi por ID. */
  async remover(id) {
    return request(`/taxis/${id}`, { method: "DELETE" });
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
    return request("/api/precos", { method: "POST", body: payload });
  },

  /** Atualizar preço por ID. */
  async atualizar(id, payload) {
    return request(`/api/precos/${id}`, { method: "PUT", body: payload });
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
    return request("/api/gestores/todos", { auth: true });
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
  precos,
  externos,
};

export default api;
