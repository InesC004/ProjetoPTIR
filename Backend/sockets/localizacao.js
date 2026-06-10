const jwt = require("jsonwebtoken");
const Pedido = require("../models/pedido");

const localizacoesAtivas = new Map();
let ioRef = null;

function roomPedido(pedidoId) {
  return `pedido:${pedidoId}`;
}

function normalizarId(valor) {
  if (!valor) return null;
  return valor._id ? valor._id.toString() : valor.toString();
}

function getToken(socket) {
  const authToken = socket.handshake.auth?.token;
  if (authToken) return authToken;

  const header = socket.handshake.headers?.authorization;
  if (!header) return null;
  return header.startsWith("Bearer ") ? header.slice(7) : header;
}

async function autenticarSocket(socket, next) {
  try {
    const token = getToken(socket);
    if (!token) return next(new Error("Não autenticado."));

    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new Error("Token inválido."));
  }
}

async function obterPedidoAutorizado(pedidoId, user) {
  const pedido = await Pedido.findById(pedidoId);
  if (!pedido) return { erro: "Pedido não encontrado." };

  const clienteId = normalizarId(pedido.cliente_id);
  const motoristaId = normalizarId(pedido.motorista_id);
  const userId = normalizarId(user.id);

  const autorizado =
    (user.role === "cliente" && clienteId === userId) ||
    (user.role === "motorista" && motoristaId === userId);

  if (!autorizado) return { erro: "Sem permissão." };
  return { pedido };
}

function payloadLocalizacao(pedidoId, dados) {
  return {
    pedidoId,
    lat: Number(dados.lat),
    lng: Number(dados.lng),
    accuracy:
      dados.accuracy === undefined || dados.accuracy === null
        ? null
        : Number(dados.accuracy),
    heading:
      dados.heading === undefined || dados.heading === null
        ? null
        : Number(dados.heading),
    speed:
      dados.speed === undefined || dados.speed === null
        ? null
        : Number(dados.speed),
    timestamp: dados.timestamp || new Date().toISOString(),
  };
}

function emitirEventoPedido(pedidoId, evento, payload = {}) {
  if (!ioRef || !pedidoId) return;
  ioRef.to(roomPedido(pedidoId)).emit(evento, {
    pedidoId: pedidoId.toString(),
    ...payload,
  });
}

function limparLocalizacaoPedido(pedidoId) {
  if (!pedidoId) return;
  localizacoesAtivas.delete(pedidoId.toString());
}

function configurarSocketLocalizacao(io) {
  ioRef = io;
  io.use(autenticarSocket);

  io.on("connection", (socket) => {
    socket.on("pedido:join", async ({ pedidoId } = {}) => {
      try {
        if (!pedidoId) {
          socket.emit("tracking:error", { message: "Pedido inválido." });
          return;
        }

        const { pedido, erro } = await obterPedidoAutorizado(
          pedidoId,
          socket.user,
        );

        if (erro) {
          socket.emit("tracking:error", { pedidoId, message: erro });
          return;
        }

        socket.join(roomPedido(pedidoId));
        socket.emit("pedido:joined", {
          pedidoId: pedido._id.toString(),
          estado: pedido.estado,
        });

        const ultimaLocalizacao = localizacoesAtivas.get(pedidoId.toString());
        if (ultimaLocalizacao) {
          socket.emit("motorista:localizacao:update", ultimaLocalizacao);
        }
      } catch {
        socket.emit("tracking:error", {
          pedidoId,
          message: "Erro ao entrar no acompanhamento.",
        });
      }
    });

    socket.on("pedido:leave", ({ pedidoId } = {}) => {
      if (pedidoId) socket.leave(roomPedido(pedidoId));
    });

    socket.on("motorista:localizacao", async (dados = {}) => {
      try {
        const { pedidoId } = dados;
        if (!pedidoId || socket.user?.role !== "motorista") return;

        const lat = Number(dados.lat);
        const lng = Number(dados.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          socket.emit("tracking:error", {
            pedidoId,
            message: "Coordenadas inválidas.",
          });
          return;
        }

        const { pedido, erro } = await obterPedidoAutorizado(
          pedidoId,
          socket.user,
        );

        if (erro) {
          socket.emit("tracking:error", { pedidoId, message: erro });
          return;
        }

        if (!["confirmado", "em_viagem"].includes(pedido.estado)) {
          socket.emit("tracking:error", {
            pedidoId,
            message: "O pedido não permite acompanhamento neste estado.",
          });
          return;
        }

        const payload = payloadLocalizacao(pedidoId.toString(), {
          ...dados,
          lat,
          lng,
        });

        localizacoesAtivas.set(pedidoId.toString(), payload);
        io.to(roomPedido(pedidoId)).emit("motorista:localizacao:update", payload);
      } catch {
        socket.emit("tracking:error", {
          pedidoId: dados.pedidoId,
          message: "Erro ao atualizar localização.",
        });
      }
    });
  });
}

module.exports = {
  configurarSocketLocalizacao,
  emitirEventoPedido,
  limparLocalizacaoPedido,
};
