// controllers/pedidos.js

const Pedido = require("../models/pedido");
const Turno = require("../models/turno");
const Preco = require("../models/preco");

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ════════════════════════════════════════
// criar pedido
// ════════════════════════════════════════

exports.create = async (req, res) => {
  try {
    const {
      origem_morada,
      origem_lat,
      origem_lng,
      destino_morada,
      destino_lat,
      destino_lng,
      numero_pessoas,
      nivel_conforto,
    } = req.body;

    if (
      !origem_morada ||
      origem_lat == null ||
      origem_lng == null
    ) {
      return res.status(400).json({
        success: false,
        message: "Origem inválida.",
      });
    }

    if (
      !destino_morada ||
      destino_lat == null ||
      destino_lng == null
    ) {
      return res.status(400).json({
        success: false,
        message: "Destino inválido.",
      });
    }

    if (
      !numero_pessoas ||
      numero_pessoas < 1 ||
      numero_pessoas > 4
    ) {
      return res.status(400).json({
        success: false,
        message: "Número de pessoas inválido.",
      });
    }

    if (
      !["basico", "luxuoso"].includes(nivel_conforto)
    ) {
      return res.status(400).json({
        success: false,
        message: "Nível de conforto inválido.",
      });
    }

    // impedir múltiplos pedidos ativos
    const pedidoAtivo = await Pedido.findOne({
      cliente_id: req.user.id,
      estado: {
        $nin: ["cancelado", "concluido"],
      },
    });

    if (pedidoAtivo) {
      return res.status(409).json({
        success: false,
        message: "Já tens um pedido ativo.",
      });
    }

    const pedido = new Pedido({
      cliente_id: req.user.id,

      origem_morada,
      origem_lat,
      origem_lng,

      destino_morada,
      destino_lat,
      destino_lng,

      numero_pessoas,
      nivel_conforto,

      estado: "pendente",
    });

    await pedido.save();

    res.status(201).json({
      success: true,
      message: "Pedido criado com sucesso.",
      pedido,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Erro no servidor.",
    });
  }
};

// ════════════════════════════════════════
// listar pedidos disponíveis
// ════════════════════════════════════════

exports.listarDisponiveis = async (req, res) => {
  try {

    const agora = new Date();

    const turno = await Turno.findOne({
      motorista: req.user.id,
      data_inicio: { $lte: agora },
      data_fim: { $gte: agora },
    }).populate("taxi", "nivel_conforto matricula marca modelo");

    if (!turno) {
      return res.status(400).json({
        success: false,
        message: "Não tens turno ativo.",
      });
    }

    const pedidos = await Pedido.find({
      estado: "pendente",
      nivel_conforto: turno.taxi?.nivel_conforto,
    });

    const motoristaLat = req.query.lat
      ? Number(req.query.lat)
      : 38.756734;

    const motoristaLng = req.query.lng
      ? Number(req.query.lng)
      : -9.155412;

    const pedidosFiltrados = pedidos
      .map((pedido) => {

        const distancia = haversine(
          motoristaLat,
          motoristaLng,
          pedido.origem_lat,
          pedido.origem_lng
        );

        return {
          ...pedido.toObject(),
          distancia_km: distancia.toFixed(2),
        };
      })
      .sort(
        (a, b) =>
          Number(a.distancia_km) -
          Number(b.distancia_km)
      );

    res.json({
      success: true,
      pedidos: pedidosFiltrados,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Erro no servidor.",
    });
  }
};

// ════════════════════════════════════════
// motorista aceita pedido
// ════════════════════════════════════════

exports.aceitar = async (req, res) => {
  try {

    const agora = new Date();

    const turno = await Turno.findOne({
      motorista: req.user.id,
      data_inicio: { $lte: agora },
      data_fim: { $gte: agora },
    });

    if (!turno) {
      return res.status(400).json({
        success: false,
        message: "Não tens turno ativo.",
      });
    }

    // evitar race condition
    const pedido = await Pedido.findOneAndUpdate(
      {
        _id: req.params.id,
        estado: "pendente",
      },
      {
        estado: "aceite",
        motorista_id: req.user.id,
      },
      {
        new: true,
      }
    );

    if (!pedido) {
      return res.status(409).json({
        success: false,
        message: "Pedido já não disponível.",
      });
    }

    res.json({
      success: true,
      message: "Pedido aceite.",
      pedido,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Erro no servidor.",
    });
  }
};

// ════════════════════════════════════════
// cancelar aceitação
// ════════════════════════════════════════

exports.cancelarAceitacao = async (req, res) => {
  try {

    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: "Pedido não encontrado.",
      });
    }

    if (
      pedido.motorista_id?.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Sem permissão.",
      });
    }

    if (pedido.estado !== "aceite") {
      return res.status(400).json({
        success: false,
        message: "Pedido não está aceite.",
      });
    }

    pedido.estado = "pendente";
    pedido.motorista_id = null;

    await pedido.save();

    res.json({
      success: true,
      message: "Aceitação cancelada.",
      pedido,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Erro no servidor.",
    });
  }
};

// ════════════════════════════════════════
// cliente responde ao motorista
// ════════════════════════════════════════

exports.responderMotorista = async (req, res) => {
  try {

    const { resposta } = req.body;

    if (
      !["confirmar", "rejeitar"].includes(resposta)
    ) {
      return res.status(400).json({
        success: false,
        message: "Resposta inválida.",
      });
    }

    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: "Pedido não encontrado.",
      });
    }

    if (
      pedido.cliente_id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Sem permissão.",
      });
    }

    if (pedido.estado !== "aceite") {
      return res.status(400).json({
        success: false,
        message: "Pedido não está aceite.",
      });
    }

    if (resposta === "confirmar") {
      pedido.estado = "confirmado";
    } else {
      pedido.estado = "pendente";
      pedido.motorista_id = null;
    }

    await pedido.save();

    res.json({
      success: true,
      message: `Motorista ${resposta} com sucesso.`,
      pedido,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Erro no servidor.",
    });
  }
};

// ════════════════════════════════════════
// cancelar pedido
// ════════════════════════════════════════

exports.cancelar = async (req, res) => {
  try {

    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: "Pedido não encontrado.",
      });
    }

    if (
      pedido.cliente_id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Sem permissão.",
      });
    }

    if (
      !["pendente", "aceite", "confirmado"].includes(
        pedido.estado
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Pedido não pode ser cancelado.",
      });
    }

    pedido.estado = "cancelado";

    await pedido.save();

    res.json({
      success: true,
      message: "Pedido cancelado.",
      pedido,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Erro no servidor.",
    });
  }
};

// ════════════════════════════════════════
// obter pedido por id
// ════════════════════════════════════════

exports.getById = async (req, res) => {
  try {

    const pedido = await Pedido.findById(req.params.id)
      .populate("cliente_id", "nome nif")
      .populate("motorista_id", "nome nif")
      .populate("viagem_id");

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: "Pedido não encontrado.",
      });
    }

    res.json({
      success: true,
      pedido,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Erro no servidor.",
    });
  }
};

// ════════════════════════════════════════
// pedido ativo cliente
// ════════════════════════════════════════

exports.getAtivoCliente = async (req, res) => {
  try {
    const pedido = await Pedido.findOne({
      cliente_id: req.user.id,
      estado: {
        $nin: ["cancelado", "concluido"],
      },
    })
      .populate("motorista_id", "nome nif")
      .populate("viagem_id");

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: "Não tens pedido ativo.",
      });
    }

    res.json({
      success: true,
      pedido,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Erro no servidor.",
    });
  }
};

// iniciar viagem
exports.iniciarViagem = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: "Pedido não encontrado.",
      });
    }

    if (pedido.motorista_id?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Sem permissão.",
      });
    }

    if (pedido.estado !== "confirmado") {
      return res.status(400).json({
        success: false,
        message: "O pedido ainda não foi confirmado pelo cliente.",
      });
    }

    pedido.estado = "em_viagem";
    pedido.data_inicio_viagem = new Date();
    await pedido.save();

    res.json({
      success: true,
      message: "Viagem iniciada.",
      pedido,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Erro no servidor.",
    });
  }
};

// terminar viagem
exports.terminarViagem = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: "Pedido não encontrado.",
      });
    }

    if (pedido.motorista_id?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Sem permissão.",
      });
    }

    if (pedido.estado !== "em_viagem") {
      return res.status(400).json({
        success: false,
        message: "A viagem não está em curso.",
      });
    }
    const agora = new Date();

    const quilometros = haversine(
      pedido.origem_lat,
      pedido.origem_lng,
      pedido.destino_lat,
      pedido.destino_lng,
    );

    const inicio = pedido.data_inicio_viagem || pedido.updatedAt || agora;

    const duracaoMinutos = Math.max(
      1,
      Math.round((agora - new Date(inicio)) / 60000),
    );
    const preco = await Preco.findOne({
      nivel_conforto: pedido.nivel_conforto,
    });

    if (!preco) {
      return res.status(400).json({
        success: false,
        message: "Preço não definido para este nível de conforto.",
      });
    }

    const precoBase = duracaoMinutos * Number(preco.preco_minuto || 0);

    const hora = agora.getHours();
    const eNoturno = hora >= 22 || hora < 7;

    const precoFinal = eNoturno
      ? precoBase + Number(preco.acrescimo_noturno || 0)
      : precoBase;
    pedido.estado = "concluido";
    pedido.data_fim_viagem = agora;
    pedido.morada_fim = pedido.destino_morada;
    pedido.quilometros_percorridos = Number(quilometros.toFixed(2));
    pedido.duracao_minutos = duracaoMinutos;
    pedido.preco_final = Number(precoFinal.toFixed(2));
    pedido.pagamento_estado = "pendente";
    await pedido.save();

    res.json({
      success: true,
      message: "Viagem terminada.",
      pedido,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Erro no servidor.",
    });
  }
};
