// controllers/pedidos.js

const Pedido = require("../models/pedido");
const Viagem = require("../models/viagem");
const Turno = require("../models/turno");
const Preco = require("../models/preco");
const mongoose = require("mongoose");
const {
  emitirEventoPedido,
  limparLocalizacaoPedido,
} = require("../sockets/localizacao");

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

function calcularPrecoPorMinutos(minutos, preco, dataReferencia = new Date()) {
  const precoBase = minutos * Number(preco.preco_minuto || 0);
  const hora = dataReferencia.getHours();
  const eNoturno = hora >= 21 || hora < 6;
  const multiplicadorNoturno = eNoturno
    ? 1 + Number(preco.acrescimo_noturno || 0) / 100
    : 1;

  return Number((precoBase * multiplicadorNoturno).toFixed(2));
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
      motoristas_recusaram: { $ne: req.user.id },
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
          tempo_estimado_min: Math.max(1, Math.round(distancia * 2.5)),
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
        motoristas_recusaram: { $ne: req.user.id },
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
    const userId = req.user.id || req.user._id || req.user.sub;
    const pedidoQuery = mongoose.isValidObjectId(req.params.id)
      ? {
          $or: [
            { _id: req.params.id },
            { viagem_id: req.params.id },
          ],
        }
      : { _id: req.params.id };

    const pedido = await Pedido.findOne(pedidoQuery);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: "Pedido não encontrado.",
      });
    }

    if (
      pedido.motorista_id?.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Sem permissão.",
      });
    }

    if (!["aceite", "confirmado"].includes(pedido.estado)) {
      return res.status(400).json({
        success: false,
        message: "Este pedido já foi atualizado. Recarregue o estado do pedido.",
        pedido,
      });
    }

    pedido.estado = "pendente";
    pedido.motoristas_recusaram = (pedido.motoristas_recusaram || []).filter(
      (id) => id.toString() !== userId,
    );
    pedido.motorista_id = null;

    await pedido.save();
    limparLocalizacaoPedido(pedido._id);
    emitirEventoPedido(pedido._id, "pedido:cancelled", {
      estado: pedido.estado,
      motivo: "aceitacao_cancelada",
      pedido,
    });

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

    if (resposta === "confirmar" && pedido.estado === "confirmado") {
      return res.json({
        success: true,
        message: "Motorista confirmado com sucesso.",
        pedido,
      });
    }

    if (
      resposta === "rejeitar" &&
      pedido.estado === "pendente" &&
      !pedido.motorista_id
    ) {
      return res.json({
        success: true,
        message: "Motorista rejeitado com sucesso.",
        pedido,
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
      const motoristaRejeitado = pedido.motorista_id;
      pedido.estado = "pendente";
      if (
        motoristaRejeitado &&
        !pedido.motoristas_recusaram?.some(
          (id) => id.toString() === motoristaRejeitado.toString(),
        )
      ) {
        pedido.motoristas_recusaram = [
          ...(pedido.motoristas_recusaram || []),
          motoristaRejeitado,
        ];
      }
      pedido.motorista_id = null;
    }

    await pedido.save();
    if (resposta === "confirmar") {
      emitirEventoPedido(pedido._id, "pedido:confirmed", {
        estado: pedido.estado,
      });
    } else {
      limparLocalizacaoPedido(pedido._id);
      emitirEventoPedido(pedido._id, "pedido:cancelled", {
        estado: pedido.estado,
        motivo: "motorista_rejeitado",
      });
    }

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
    limparLocalizacaoPedido(pedido._id);
    emitirEventoPedido(pedido._id, "pedido:cancelled", {
      estado: pedido.estado,
      motivo: "pedido_cancelado",
    });

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
      .populate("motorista_id", "nome nif avaliacao_media total_avaliacoes")
      .populate("viagem_id");

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: "Pedido não encontrado.",
      });
    }

    let viagem_distancia_km = null;
    let viagem_tempo_estimado_min = null;
    let custo_estimado = null;
    //
    let taxi = null;

    if (pedido.motorista_id) {
      const turno = await Turno.findOne({
        motorista: pedido.motorista_id._id || pedido.motorista_id,
      })
        .populate("taxi", "matricula marca modelo nivel_conforto")
        .sort({ data_inicio: -1 });

      if (turno?.taxi) {
        taxi = turno.taxi;
      }
    }//

    if (
      pedido.origem_lat &&
      pedido.origem_lng &&
      pedido.destino_lat &&
      pedido.destino_lng
    ) {
      viagem_distancia_km = Number(
        haversine(
          pedido.origem_lat,
          pedido.origem_lng,
          pedido.destino_lat,
          pedido.destino_lng,
        ).toFixed(2),
      );

      viagem_tempo_estimado_min = Math.max(
        1,
        Math.round(viagem_distancia_km * 2.5),
      );
    }

    const preco = await Preco.findOne({
      nivel_conforto: pedido.nivel_conforto,
    });

    if (preco && viagem_tempo_estimado_min) {
      custo_estimado = Number(
        (
          viagem_tempo_estimado_min * Number(preco.preco_minuto || 0)
        ).toFixed(2),
      );
    }

    res.json({
      success: true,
      pedido,
      motorista_distancia_km: viagem_distancia_km,
      motorista_tempo_chegada_min: viagem_tempo_estimado_min,
      viagem_distancia_km,
      viagem_tempo_estimado_min,
      custo_estimado,
      taxi,
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
      .populate("motorista_id", "nome nif avaliacao_media total_avaliacoes")
      .populate("viagem_id");

    if (!pedido) {
      return res.json({
        success: false,
        message: "Não tens pedido ativo.",
        pedido: null,
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

// histórico de viagens concluídas do motorista
exports.getHistoricoMotorista = async (req, res) => {
  try {
    const pedidos = await Pedido.find({
      motorista_id: req.user.id,
      estado: "concluido",
    })
      .populate("cliente_id", "nome nif")
      .populate("motorista_id", "nome nif avaliacao_media total_avaliacoes")
      .populate("viagem_id")
      .sort({ data_fim_viagem: -1, updatedAt: -1 });

    res.json({
      success: true,
      pedidos,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Erro no servidor.",
    });
  }
};

// pedido ativo do motorista
exports.getAtivoMotorista = async (req, res) => {
  try {
    const pedido = await Pedido.findOne({
      motorista_id: req.user.id,
      estado: { $in: ["confirmado", "em_viagem"] },
    })
      .populate("cliente_id", "nome nif")
      .populate("motorista_id", "nome nif avaliacao_media total_avaliacoes")
      .populate("viagem_id")
      .sort({ updatedAt: -1 });

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
    emitirEventoPedido(pedido._id, "pedido:started", {
      estado: pedido.estado,
    });

    let viagem = pedido.viagem_id
      ? await Viagem.findById(pedido.viagem_id)
      : await Viagem.findOne({ pedido_id: pedido._id });

    if (!viagem) {
      const turno = await Turno.findOne({
        motorista: pedido.motorista_id,
      })
        .populate("taxi")
        .sort({ data_inicio: -1 });

      viagem = new Viagem({
        pedido_id: pedido._id,
        turno_id: turno?._id,
        cliente_id: pedido.cliente_id,
        motorista_id: pedido.motorista_id,
        taxi_id: turno?.taxi?._id,
        origem_morada: pedido.origem_morada,
        origem_lat: pedido.origem_lat,
        origem_lng: pedido.origem_lng,
        destino_morada: pedido.destino_morada,
        destino_lat: pedido.destino_lat,
        destino_lng: pedido.destino_lng,
        numero_pessoas: pedido.numero_pessoas,
        nivel_conforto: pedido.nivel_conforto,
        estado: "a_decorrer",
        pagamento_estado: "pendente",
        data_inicio: pedido.data_inicio_viagem,
      });
      await viagem.save();
      pedido.viagem_id = viagem._id;
      await pedido.save();
    } else {
      viagem.estado = "a_decorrer";
      viagem.pagamento_estado = "pendente";
      viagem.data_inicio = pedido.data_inicio_viagem;
      await viagem.save();
    }

    const viagemDistanciaKm =
      pedido.origem_lat &&
      pedido.origem_lng &&
      pedido.destino_lat &&
      pedido.destino_lng
        ? Number(
            haversine(
              pedido.origem_lat,
              pedido.origem_lng,
              pedido.destino_lat,
              pedido.destino_lng,
            ).toFixed(2),
          )
        : null;

    const viagemTempoEstimadoMin = viagemDistanciaKm
      ? Math.max(1, Math.round(viagemDistanciaKm * 2.5))
      : null;

    res.json({
      success: true,
      message: "Viagem iniciada.",
      pedido,
      viagem,
      viagem_distancia_km: viagemDistanciaKm,
      viagem_tempo_estimado_min: viagemTempoEstimadoMin,
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

    const precoFinal = calcularPrecoPorMinutos(duracaoMinutos, preco, agora);
    pedido.estado = "concluido";
    pedido.data_fim_viagem = agora;
    pedido.morada_fim = pedido.destino_morada;
    pedido.quilometros_percorridos = Number(quilometros.toFixed(2));
    pedido.duracao_minutos = duracaoMinutos;
    pedido.preco_final = Number(precoFinal.toFixed(2));
    pedido.pagamento_estado = "pendente";
    await pedido.save();
    limparLocalizacaoPedido(pedido._id);
    emitirEventoPedido(pedido._id, "pedido:finished", {
      estado: pedido.estado,
    });

    const viagem = pedido.viagem_id
      ? await Viagem.findById(pedido.viagem_id)
      : await Viagem.findOne({ pedido_id: pedido._id });

    if (viagem) {
      viagem.estado = "concluida";
      viagem.data_fim = agora;
      viagem.km = Number(quilometros.toFixed(2));
      viagem.preco_total = Number(precoFinal.toFixed(2));
      viagem.pagamento_estado = "pendente";
      await viagem.save();
    }

    res.json({
      success: true,
      message: "Viagem terminada.",
      pedido,
      viagem,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Erro no servidor.",
    });
  }
};
