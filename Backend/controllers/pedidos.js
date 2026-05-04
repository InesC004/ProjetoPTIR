const Pedido = require("../models/pedido");
const Turno = require("../models/turno");

// função que calcula distância entre 2 pontos geográficos
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371; // raio da terra em km
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
// Criar pedido de táxi (cliente autenticado)
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

    // requisitos de validação
    if (!origem_morada || !origem_lat || !origem_lng) {
      return res.status(400).json({
        success: false,
        message: "Localização de origem é obrigatória.",
      });
    }

    if (!destino_morada || !destino_lat || !destino_lng) {
      return res.status(400).json({
        success: false,
        message: "Localização de destino é obrigatória.",
      });
    }

    if (!numero_pessoas || numero_pessoas < 1 || numero_pessoas > 4) {
      return res.status(400).json({
        success: false,
        message: "Número de pessoas deve ser entre 1 e 4.",
      });
    }

    if (!nivel_conforto || !["basico", "luxuoso"].includes(nivel_conforto)) {
      return res.status(400).json({
        success: false,
        message: "Nível de conforto deve ser básico ou luxuoso.",
      });
    }

    const pedidoAtivo = await Pedido.findOne({
      cliente_id: req.user.id,
      estado: { $in: ["pendente", "aceite", "confirmado"] },
    });

    if (pedidoAtivo) {
      return res.status(400).json({
        success: false,
        message:
          "Já tens um pedido ativo. Cancela ou termina a viagem antes de pedir outra.",
        pedido: pedidoAtivo,
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
    res
      .status(201)
      .json({ success: true, message: "Pedido criado com sucesso.", pedido });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro no servidor." });
  }
};

// Cliente cancela pedido enquanto aguarda
exports.cancelar = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res
        .status(404)
        .json({ success: false, message: "Pedido não encontrado." });
    }

    if (pedido.cliente_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Sem permissão para cancelar este pedido.",
      });
    }

    if (!["pendente", "aceite", "confirmado"].includes(pedido.estado)) {
      return res.status(400).json({
        success: false,
        message: "Pedido não pode ser cancelado neste estado.",
      });
    }

    pedido.estado = "cancelado";
    await pedido.save();

    res.status(200).json({
      success: true,
      message: "Pedido cancelado com sucesso.",
      pedido,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro no servidor." });
  }
};

// Cliente confirma ou rejeita o motorista que aceitou
exports.responderMotorista = async (req, res) => {
  try {
    const { resposta } = req.body; // 'confirmar' ou 'rejeitar'

    if (!resposta || !["confirmar", "rejeitar"].includes(resposta)) {
      return res.status(400).json({
        success: false,
        message: "Resposta deve ser confirmar ou rejeitar.",
      });
    }

    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res
        .status(404)
        .json({ success: false, message: "Pedido não encontrado." });
    }

    if (pedido.cliente_id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Sem permissão. pedidos" });
    }

    if (pedido.estado !== "aceite") {
      return res
        .status(400)
        .json({ success: false, message: "Pedido não está em estado aceite." });
    }

    if (resposta === "confirmar") {
      pedido.estado = "confirmado";
    } else {
      // rejeita - volta a pendente para outros motoristas poderem ver
      pedido.estado = "pendente";
      pedido.motorista_id = null;
    }

    await pedido.save();
    res.status(200).json({
      success: true,
      message: `Pedido ${resposta === "confirmar" ? "confirmado" : "rejeitado"} com sucesso.`,
      pedido,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro no servidor." });
  }
};

// Ver pedido ativo do cliente
exports.getAtivoCliente = async (req, res) => {
  try {
    const pedido = await Pedido.findOne({
      cliente_id: req.user.id,
      estado: { $in: ["pendente", "aceite", "confirmado"] },
    }).populate("motorista_id", "nome nif");

    res.status(200).json({
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

// Ver estado atual do pedido (cliente aguarda resposta)
exports.getById = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id).populate(
      "motorista_id",
      "nome nif",
    );

    if (!pedido) {
      return res
        .status(404)
        .json({ success: false, message: "Pedido não encontrado." });
    }

    if (pedido.cliente_id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Sem permissão." });
    }
    // se o pedido está aceite, calcular distância, tempo e custo estimado
    let extra = {};
    if (pedido.estado === "aceite" && pedido.motorista_id) {
      // buscar turno ativo do motorista para saber a posição — por agora usamos a localização da FC como default
      const motoristaLat = 38.756734;
      const motoristaLng = -9.155412;

      const distancia = haversine(
        motoristaLat,
        motoristaLng,
        pedido.origem_lat,
        pedido.origem_lng,
      );
      const tempoChegada = distancia * 4; // 4 minutos por km

      const distanciaViagem = haversine(
        pedido.origem_lat,
        pedido.origem_lng,
        pedido.destino_lat,
        pedido.destino_lng,
      );
      const tempoViagem = distanciaViagem * 4;

      extra = {
        motorista_distancia_km: distancia.toFixed(2),
        motorista_tempo_chegada_min: tempoChegada.toFixed(0),
        viagem_distancia_km: distanciaViagem.toFixed(2),
        viagem_tempo_estimado_min: tempoViagem.toFixed(0),
      };
    }

    res.status(200).json({ success: true, pedido, ...extra });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro no servidor." });
  }
};

//lista os pedidos disponíveis para o motorista aceitar
exports.listarDisponiveis = async (req, res) => {
  try {
    // buscar turno ativo do motorista
    const agora = new Date();
    const turno = await Turno.findOne({
      motorista: req.user.id,
      data_inicio: { $lte: agora },
      data_fim: { $gte: agora },
    });

    if (!turno) {
      return res
        .status(400)
        .json({ success: false, message: "Não tens nenhum turno ativo." });
    }

    // buscar pedidos pendentes
    const pedidos = await Pedido.find({ estado: "pendente" });

    // filtrar pedidos que cabem no tempo restante do turno
    // estimativa: 4 minutos por km, usando haversine
    //deafult localizaçã do motorista, faculdade de ciências
    const VELOCIDADE_MIN_POR_KM = 4;
    const motoristaLat = req.query.lat ? Number(req.query.lat) : 38.756734;
    const motoristaLng = req.query.lng ? Number(req.query.lng) : -9.155412;

    const pedidosFiltrados = pedidos
      .map((pedido) => {
        const distancia = haversine(
          motoristaLat,
          motoristaLng,
          pedido.origem_lat,
          pedido.origem_lng,
        );
        const distanciaDestino = haversine(
          pedido.origem_lat,
          pedido.origem_lng,
          pedido.destino_lat,
          pedido.destino_lng,
        );
        const tempoEstimado =
          (distancia + distanciaDestino) * VELOCIDADE_MIN_POR_KM;
        const minutosRestantes = (turno.data_fim - agora) / 60000;

        return { pedido, distancia, tempoEstimado, minutosRestantes };
      })
      .filter(
        ({ tempoEstimado, minutosRestantes }) =>
          tempoEstimado <= minutosRestantes,
      )
      .sort((a, b) => a.distancia - b.distancia)
      .map(({ pedido, distancia, tempoEstimado }) => ({
        ...pedido.toObject(),
        distancia_km: distancia.toFixed(2),
        tempo_estimado_min: tempoEstimado.toFixed(0),
      }));

    res.status(200).json({ success: true, pedidos: pedidosFiltrados });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro no servidor." });
  }
};

// Motorista aceita pedido
exports.aceitar = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res
        .status(404)
        .json({ success: false, message: "Pedido não encontrado." });
    }

    if (pedido.estado !== "pendente") {
      return res
        .status(400)
        .json({ success: false, message: "Pedido já não está disponível." });
    }

    // verificar turno ativo
    const agora = new Date();
    const turno = await Turno.findOne({
      motorista: req.user.id,
      data_inicio: { $lte: agora },
      data_fim: { $gte: agora },
    });

    if (!turno) {
      return res
        .status(400)
        .json({ success: false, message: "Não tens nenhum turno ativo." });
    }

    pedido.estado = "aceite";
    pedido.motorista_id = req.user.id;
    await pedido.save();

    res
      .status(200)
      .json({ success: true, message: "Pedido aceite com sucesso.", pedido });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro no servidor." });
  }
};

// Motorista cancela aceitação
exports.cancelarAceitacao = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res
        .status(404)
        .json({ success: false, message: "Pedido não encontrado." });
    }

    if (pedido.motorista_id?.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Sem permissão." });
    }

    if (pedido.estado !== "aceite") {
      return res
        .status(400)
        .json({ success: false, message: "Pedido não está em estado aceite." });
    }

    pedido.estado = "pendente";
    pedido.motorista_id = null;
    await pedido.save();

    res.status(200).json({
      success: true,
      message: "Aceitação cancelada, pedido voltou a pendente.",
      pedido,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro no servidor." });
  }
};
