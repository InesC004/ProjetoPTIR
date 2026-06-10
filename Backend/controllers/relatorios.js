// controllers/relatorios.js
const mongoose = require("mongoose");
const Viagem = require("../models/viagem");
const Reabastecimento = require("../models/reabastecimento");
const Turno = require("../models/turno");
require("../models/cliente");
require("../models/motorista");
require("../models/taxi");

const os = require("os");
const HOSTNAME = os.hostname();

function responderErro(res, err) {
  console.error(err);
  res.status(500).json({
    success: false,
    message: err.message || "Erro no servidor",
    servidor: HOSTNAME,
  });
}

function validarObjectId(res, id, nome) {
  if (mongoose.Types.ObjectId.isValid(id)) return true;
  res.status(400).json({
    success: false,
    message: `${nome} inválido.`,
    servidor: HOSTNAME,
  });
  return false;
}

// Helper para obter início e fim do dia de hoje (caso não enviem datas na query)
function periodoHoje() {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  const fim = new Date();
  fim.setHours(23, 59, 59, 999);
  return { inicio, fim };
}

// Helper para normalizar strings de motores (Ex: "Elétrico" -> "eletrico")
function normalizarTipoMotor(tipo) {
  return String(tipo || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function horasEntre(inicio, fim) {
  if (!inicio || !fim) return 0;
  return (new Date(fim) - new Date(inicio)) / (1000 * 60 * 60);
}

function arredondar(valor, casas = 2) {
  return Number((Number(valor) || 0).toFixed(casas));
}

function chaveDia(data) {
  return new Date(data).toISOString().slice(0, 10);
}

function filtroViagensConcluidas(inicio, fim, extras = {}) {
  return {
    data_inicio: { $gte: inicio },
    data_fim: { $lte: fim },
    $or: [{ estado: "concluida" }, { data_fim: { $ne: null } }],
    ...extras,
  };
}

// Relatório próprio do motorista autenticado
exports.getRelatorioMotoristaAutenticado = async (req, res) => {
  try {
    let { data_inicio, data_fim } = req.query;
    const inicio = data_inicio
      ? new Date(`${data_inicio}T00:00:00.000`)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const fim = data_fim
      ? new Date(`${data_fim}T23:59:59.999`)
      : periodoHoje().fim;

    const motoristaId = req.user.id;

    const viagens = await Viagem.find(
      filtroViagensConcluidas(inicio, fim, { motorista_id: motoristaId }),
    )
      .populate("cliente_id", "nome nif")
      .populate("taxi_id", "matricula marca modelo")
      .sort({ data_inicio: -1 });

    const turnos = await Turno.find({
      motorista: motoristaId,
      data_inicio: { $lte: fim },
      data_fim: { $gte: inicio },
    }).select("_id data_inicio data_fim taxi");

    const turnoIds = turnos.map((turno) => turno._id);

    const reabastecimentos = await Reabastecimento.find({
      turno: { $in: turnoIds },
      data_inicio: { $lte: fim },
      data_fim: { $gte: inicio },
    })
      .populate("taxi", "matricula marca modelo tipo_motor")
      .sort({ data_inicio: -1 });

    const totalViagens = viagens.length;
    const totalKm = viagens.reduce((acc, v) => acc + (Number(v.km) || 0), 0);
    const totalHoras = viagens.reduce(
      (acc, v) => acc + horasEntre(v.data_inicio, v.data_fim),
      0,
    );
    const totalFaturado = viagens.reduce(
      (acc, v) => acc + (Number(v.preco_total) || 0),
      0,
    );
    const viagensPagas = viagens.filter((v) => v.pagamento_estado === "pago").length;
    const totalReabastecimentos = reabastecimentos.length;
    const totalReabastecimentoEuros = reabastecimentos.reduce(
      (acc, r) => acc + (Number(r.euros) || 0),
      0,
    );
    const totalLitros = reabastecimentos.reduce(
      (acc, r) => acc + (Number(r.litros) || 0),
      0,
    );
    const totalKwh = reabastecimentos.reduce(
      (acc, r) => acc + (Number(r.kwh) || 0),
      0,
    );

    const porDiaMap = {};
    viagens.forEach((v) => {
      const dia = chaveDia(v.data_inicio);
      if (!porDiaMap[dia]) {
        porDiaMap[dia] = {
          data: dia,
          viagens: 0,
          km: 0,
          horas: 0,
          faturado: 0,
        };
      }
      porDiaMap[dia].viagens += 1;
      porDiaMap[dia].km += Number(v.km) || 0;
      porDiaMap[dia].horas += horasEntre(v.data_inicio, v.data_fim);
      porDiaMap[dia].faturado += Number(v.preco_total) || 0;
    });

    const porDia = Object.values(porDiaMap)
      .sort((a, b) => a.data.localeCompare(b.data))
      .map((dia) => ({
        ...dia,
        km: arredondar(dia.km),
        horas: arredondar(dia.horas),
        faturado: arredondar(dia.faturado),
      }));

    res.json({
      success: true,
      servidor: HOSTNAME,
      periodo: { inicio, fim },
      totais: {
        total_viagens: totalViagens,
        total_km: arredondar(totalKm),
        total_horas: arredondar(totalHoras),
        total_faturado: arredondar(totalFaturado),
        preco_medio: totalViagens ? arredondar(totalFaturado / totalViagens) : 0,
        km_medio: totalViagens ? arredondar(totalKm / totalViagens) : 0,
        viagens_pagas: viagensPagas,
        viagens_pagamento_pendente: totalViagens - viagensPagas,
        total_reabastecimentos: totalReabastecimentos,
        total_reabastecimento_euros: arredondar(totalReabastecimentoEuros),
        total_litros: arredondar(totalLitros),
        total_kwh: arredondar(totalKwh),
      },
      por_dia: porDia,
      viagens: viagens.map((v) => ({
        _id: v._id,
        data_inicio: v.data_inicio,
        data_fim: v.data_fim,
        horas: arredondar(horasEntre(v.data_inicio, v.data_fim)),
        km: arredondar(v.km),
        preco_total: arredondar(v.preco_total),
        pagamento_estado: v.pagamento_estado,
        origem_morada: v.origem_morada,
        destino_morada: v.destino_morada,
        cliente: v.cliente_id,
        taxi: v.taxi_id,
      })),
      reabastecimentos: reabastecimentos.map((r) => ({
        _id: r._id,
        data_inicio: r.data_inicio,
        data_fim: r.data_fim,
        horas: arredondar(horasEntre(r.data_inicio, r.data_fim)),
        quilometros: arredondar(r.quilometros),
        euros: arredondar(r.euros),
        litros: arredondar(r.litros),
        kwh: arredondar(r.kwh),
        taxi: r.taxi,
      })),
    });
  } catch (err) {
    responderErro(res, err);
  }
};

// ══════════════════════════════════════════════
// US14 — Relatório de táxis e motoristas
// ══════════════════════════════════════════════

// Totais gerais — viagens, horas, quilómetros
exports.getTotaisViagens = async (req, res) => {
  try {
    let { data_inicio, data_fim } = req.query;
    const inicio = data_inicio ? new Date(`${data_inicio}T00:00:00.000`) : periodoHoje().inicio;
    const fim = data_fim ? new Date(`${data_fim}T23:59:59.999`) : periodoHoje().fim;

    const viagens = await Viagem.find(filtroViagensConcluidas(inicio, fim));

    const totalViagens = viagens.length;
    const totalKm = viagens.reduce((acc, v) => acc + (v.km || 0), 0);
    const totalHoras = viagens.reduce((acc, v) => {
      if (v.data_inicio && v.data_fim) {
        return acc + (new Date(v.data_fim) - new Date(v.data_inicio)) / (1000 * 60 * 60);
      }
      return acc;
    }, 0);

    res.json({
      success: true,
      servidor: HOSTNAME,
      periodo: { inicio, fim },
      total_viagens: totalViagens,
      total_km: parseFloat(totalKm.toFixed(2)),
      total_horas: parseFloat(totalHoras.toFixed(2)),
    });
  } catch (err) {
    responderErro(res, err);
  }
};

// Subtotais por motorista
exports.getSubtotaisPorMotorista = async (req, res) => {
  try {
    let { data_inicio, data_fim, tipo } = req.query;
    const inicio = data_inicio ? new Date(`${data_inicio}T00:00:00.000`) : periodoHoje().inicio;
    const fim = data_fim ? new Date(`${data_fim}T23:59:59.999`) : periodoHoje().fim;

    const viagens = await Viagem.find(
      filtroViagensConcluidas(inicio, fim, {
        motorista_id: { $exists: true, $ne: null },
      }),
    ).populate("motorista_id", "nome nif");

    const mapaMotoristas = {};
    for (const v of viagens) {
      if (!v.motorista_id) continue;
      const id = v.motorista_id._id.toString();
      if (!mapaMotoristas[id]) {
        mapaMotoristas[id] = {
          motorista: { _id: id, nome: v.motorista_id.nome, nif: v.motorista_id.nif },
          total_viagens: 0,
          total_km: 0,
          total_horas: 0,
        };
      }
      mapaMotoristas[id].total_viagens++;
      mapaMotoristas[id].total_km += v.km || 0;
      if (v.data_inicio && v.data_fim) {
        mapaMotoristas[id].total_horas += (new Date(v.data_fim) - new Date(v.data_inicio)) / (1000 * 60 * 60);
      }
    }

    let resultado = Object.values(mapaMotoristas);
    if (tipo === "viagens") resultado.sort((a, b) => b.total_viagens - a.total_viagens);
    else if (tipo === "km") resultado.sort((a, b) => b.total_km - a.total_km);
    else resultado.sort((a, b) => b.total_horas - a.total_horas);

    resultado = resultado.map((r) => ({
      ...r,
      total_km: parseFloat(r.total_km.toFixed(2)),
      total_horas: parseFloat(r.total_horas.toFixed(2)),
    }));

    res.json({ success: true, servidor: HOSTNAME, periodo: { inicio, fim }, subtotais: resultado });
  } catch (err) {
    responderErro(res, err);
  }
};

// Subtotais por táxi
exports.getSubtotaisPorTaxi = async (req, res) => {
  try {
    let { data_inicio, data_fim, tipo } = req.query;
    const inicio = data_inicio ? new Date(`${data_inicio}T00:00:00.000`) : periodoHoje().inicio;
    const fim = data_fim ? new Date(`${data_fim}T23:59:59.999`) : periodoHoje().fim;

    const viagens = await Viagem.find(
      filtroViagensConcluidas(inicio, fim, {
        taxi_id: { $exists: true, $ne: null },
      }),
    ).populate("taxi_id", "matricula marca modelo");

    const mapaTaxis = {};
    for (const v of viagens) {
      if (!v.taxi_id) continue;
      const id = v.taxi_id._id.toString();
      if (!mapaTaxis[id]) {
        mapaTaxis[id] = {
          taxi: { _id: id, matricula: v.taxi_id.matricula, marca: v.taxi_id.marca, modelo: v.taxi_id.modelo },
          total_viagens: 0,
          total_km: 0,
          total_horas: 0,
        };
      }
      mapaTaxis[id].total_viagens++;
      mapaTaxis[id].total_km += v.km || 0;
      if (v.data_inicio && v.data_fim) {
        mapaTaxis[id].total_horas += (new Date(v.data_fim) - new Date(v.data_inicio)) / (1000 * 60 * 60);
      }
    }

    let resultado = Object.values(mapaTaxis);
    if (tipo === "viagens") resultado.sort((a, b) => b.total_viagens - a.total_viagens);
    else if (tipo === "km") resultado.sort((a, b) => b.total_km - a.total_km);
    else resultado.sort((a, b) => b.total_horas - a.total_horas);

    resultado = resultado.map((r) => ({
      ...r,
      total_km: parseFloat(r.total_km.toFixed(2)),
      total_horas: parseFloat(r.total_horas.toFixed(2)),
    }));

    res.json({ success: true, servidor: HOSTNAME, periodo: { inicio, fim }, subtotais: resultado });
  } catch (err) {
    responderErro(res, err);
  }
};

// Detalhes de viagens de um motorista específico
exports.getDetalhesMotorista = async (req, res) => {
  try {
    const { motorista_id } = req.params;
    if (!validarObjectId(res, motorista_id, "Motorista")) return;

    let { data_inicio, data_fim } = req.query;
    const inicio = data_inicio ? new Date(`${data_inicio}T00:00:00.000`) : periodoHoje().inicio;
    const fim = data_fim ? new Date(`${data_fim}T23:59:59.999`) : periodoHoje().fim;

    const viagens = await Viagem.aggregate([
      {
        $match: filtroViagensConcluidas(inicio, fim, {
          motorista_id: new mongoose.Types.ObjectId(motorista_id),
        }),
      },
      {
        $lookup: {
          from: "taxis",
          localField: "taxi_id",
          foreignField: "_id",
          as: "taxi",
        },
      },
      {
        $lookup: {
          from: "clientes",
          localField: "cliente_id",
          foreignField: "_id",
          as: "cliente",
        },
      },
      { $unwind: { path: "$taxi", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$cliente", preserveNullAndEmptyArrays: true } },
      { $sort: { data_inicio: -1 } },
      {
        $project: {
          _id: 1,
          data_inicio: 1,
          data_fim: 1,
          km: 1,
          taxi: {
            _id: "$taxi._id",
            matricula: "$taxi.matricula",
            marca: "$taxi.marca",
            modelo: "$taxi.modelo",
          },
          cliente: {
            _id: "$cliente._id",
            nome: "$cliente.nome",
            nif: "$cliente.nif",
          },
        },
      },
    ]);

    const resultado = viagens.map((v) => ({
      ...v,
      horas: arredondar(horasEntre(v.data_inicio, v.data_fim)),
    }));

    res.json({ success: true, servidor: HOSTNAME, periodo: { inicio, fim }, viagens: resultado });
  } catch (err) {
    responderErro(res, err);
  }
};

// Detalhes de viagens de um táxi específico
exports.getDetalhesTaxi = async (req, res) => {
  try {
    const { taxi_id } = req.params;
    if (!validarObjectId(res, taxi_id, "Táxi")) return;

    let { data_inicio, data_fim } = req.query;
    const inicio = data_inicio ? new Date(`${data_inicio}T00:00:00.000`) : periodoHoje().inicio;
    const fim = data_fim ? new Date(`${data_fim}T23:59:59.999`) : periodoHoje().fim;

    const viajes = await Viagem.find(
      filtroViagensConcluidas(inicio, fim, { taxi_id }),
    )
      .populate("motorista_id", "nome nif")
      .populate("cliente_id", "nome nif")
      .sort({ data_inicio: -1 });

    const resultado = viajes.map((v) => ({
      _id: v._id,
      data_inicio: v.data_inicio,
      data_fim: v.data_fim,
      km: v.km,
      horas: v.data_inicio && v.data_fim ? parseFloat(((new Date(v.data_fim) - new Date(v.data_inicio)) / (1000 * 60 * 60)).toFixed(2)) : 0,
      motorista: v.motorista_id,
      cliente: v.cliente_id,
    }));

    res.json({ success: true, servidor: HOSTNAME, periodo: { inicio, fim }, viagens: resultado });
  } catch (err) {
    responderErro(res, err);
  }
};

// Detalhes de uma viagem específica
exports.getDetalhesViagem = async (req, res) => {
  try {
    const { viagem_id } = req.params;
    const viagem = await Viagem.findById(viagem_id)
      .populate("cliente_id", "nome nif email")
      .populate("motorista_id", "nome nif")
      .populate("taxi_id", "matricula marca modelo tipo_motor")
      .populate("turno_id", "data_inicio data_fim");

    if (!viagem) return res.status(404).json({ success: false, message: "Viagem não encontrada.", servidor: HOSTNAME });
    res.json({ success: true, servidor: HOSTNAME, viagem });
  } catch (err) {
    responderErro(res, err);
  }
};

// ══════════════════════════════════════════════
// US15 — Relatório de clientes e faturação
// ══════════════════════════════════════════════

// Total de euros cobrados
exports.getTotalEurosViagens = async (req, res) => {
  try {
    let { data_inicio, data_fim } = req.query;
    const inicio = data_inicio ? new Date(`${data_inicio}T00:00:00.000`) : periodoHoje().inicio;
    const fim = data_fim ? new Date(`${data_fim}T23:59:59.999`) : periodoHoje().fim;

    const viagens = await Viagem.find(
      filtroViagensConcluidas(inicio, fim, {
        preco_total: { $exists: true, $ne: null },
      }),
    );

    const totalEuros = viagens.reduce((acc, v) => acc + (v.preco_total || 0), 0);

    res.json({
      success: true,
      servidor: HOSTNAME,
      periodo: { inicio, fim },
      total_euros: parseFloat(totalEuros.toFixed(2)),
    });
  } catch (err) {
    responderErro(res, err);
  }
};

// Subtotais por cliente
exports.getSubtotaisPorCliente = async (req, res) => {
  try {
    let { data_inicio, data_fim } = req.query;
    const inicio = data_inicio ? new Date(`${data_inicio}T00:00:00.000`) : periodoHoje().inicio;
    const fim = data_fim ? new Date(`${data_fim}T23:59:59.999`) : periodoHoje().fim;

    const viagens = await Viagem.find(
      filtroViagensConcluidas(inicio, fim, {
        cliente_id: { $exists: true, $ne: null },
      }),
    ).populate("cliente_id", "nome nif email");

    const mapaClientes = {};
    for (const v of viagens) {
      if (!v.cliente_id) continue;
      const id = v.cliente_id._id.toString();
      if (!mapaClientes[id]) {
        mapaClientes[id] = {
          cliente: { _id: id, nome: v.cliente_id.nome, nif: v.cliente_id.nif, email: v.cliente_id.email },
          total_euros: 0,
          total_viagens: 0,
        };
      }
      mapaClientes[id].total_euros += v.preco_total || 0;
      mapaClientes[id].total_viagens++;
    }

    let resultado = Object.values(mapaClientes);
    resultado.sort((a, b) => b.total_euros - a.total_euros);
    resultado = resultado.map((r) => ({
      ...r,
      total_euros: parseFloat(r.total_euros.toFixed(2)),
    }));

    res.json({ success: true, servidor: HOSTNAME, periodo: { inicio, fim }, subtotais: resultado });
  } catch (err) {
    responderErro(res, err);
  }
};

// Detalhes de viagens de um cliente específico
exports.getDetalhesCliente = async (req, res) => {
  try {
    const { cliente_id } = req.params;
    if (!validarObjectId(res, cliente_id, "Cliente")) return;

    let { data_inicio, data_fim } = req.query;
    const inicio = data_inicio ? new Date(`${data_inicio}T00:00:00.000`) : periodoHoje().inicio;
    const fim = data_fim ? new Date(`${data_fim}T23:59:59.999`) : periodoHoje().fim;

    const viagens = await Viagem.find(
      filtroViagensConcluidas(inicio, fim, { cliente_id }),
    )
      .populate("taxi_id", "matricula marca modelo")
      .populate("motorista_id", "nome nif")
      .sort({ preco_total: -1 });

    const resultado = viagens.map((v) => ({
      _id: v._id,
      data_inicio: v.data_inicio,
      data_fim: v.data_fim,
      preco_total: v.preco_total || 0,
      km: v.km,
      taxi: v.taxi_id,
      motorista: v.motorista_id,
    }));

    res.json({ success: true, servidor: HOSTNAME, periodo: { inicio, fim }, viagens: resultado });
  } catch (err) {
    responderErro(res, err);
  }
};

// ══════════════════════════════════════════════
// US16 — Relatório de reabastecimentos
// ══════════════════════════════════════════════

exports.getTotaisReabastecimentos = async (req, res) => {
  try {
    let { data_inicio, data_fim } = req.query;
    const inicio = data_inicio ? new Date(`${data_inicio}T00:00:00.000`) : periodoHoje().inicio;
    const fim = data_fim ? new Date(`${data_fim}T23:59:59.999`) : periodoHoje().fim;

    const reabastecimentos = await Reabastecimento.find({
      data_inicio: { $lte: fim },
      data_fim: { $gte: inicio },
    });

    const totalEuros = reabastecimentos.reduce((acc, r) => acc + (Number(r.euros) || 0), 0);
    const totalHoras = reabastecimentos.reduce((acc, r) => {
      return acc + (new Date(r.data_fim) - new Date(r.data_inicio)) / (1000 * 60 * 60);
    }, 0);

    res.json({
      success: true,
      servidor: HOSTNAME,
      periodo: { inicio, fim },
      total_euros: Number(totalEuros.toFixed(2)),
      total_horas: Number(totalHoras.toFixed(2)),
    });
  } catch (err) {
    responderErro(res, err);
  }
};

exports.getSubtotaisPorTipoMotor = async (req, res) => {
  try {
    let { data_inicio, data_fim, tipo } = req.query;
    const inicio = data_inicio ? new Date(`${data_inicio}T00:00:00.000`) : periodoHoje().inicio;
    const fim = data_fim ? new Date(`${data_fim}T23:59:59.999`) : periodoHoje().fim;

    const reabastecimentos = await Reabastecimento.find({
      data_inicio: { $lte: fim },
      data_fim: { $gte: inicio },
    }).populate("taxi", "tipo_motor matricula marca modelo");

    const mapa = { combustao: { total_euros: 0, total_horas: 0 }, eletrico: { total_euros: 0, total_horas: 0 } };

    for (const r of reabastecimentos) {
      if (!r.taxi) continue;
      const tipoMotor = normalizarTipoMotor(r.taxi.tipo_motor);
      if (!mapa[tipoMotor]) {
        mapa[tipoMotor] = { total_euros: 0, total_horas: 0 };
      }
      mapa[tipoMotor].total_euros += Number(r.euros) || 0;
      mapa[tipoMotor].total_horas += (new Date(r.data_fim) - new Date(r.data_inicio)) / (1000 * 60 * 60);
    }

    let resultado = Object.entries(mapa).map(([tipo_motor, valores]) => ({
      tipo_motor,
      total_euros: Number(valores.total_euros.toFixed(2)),
      total_horas: Number(valores.total_horas.toFixed(2)),
    }));

    if (tipo === "horas") resultado.sort((a, b) => b.total_horas - a.total_horas);
    else resultado.sort((a, b) => b.total_euros - a.total_euros);

    res.json({ success: true, servidor: HOSTNAME, periodo: { inicio, fim }, subtotais: resultado });
  } catch (err) {
    responderErro(res, err);
  }
};

exports.getDetalhesPorTipoMotor = async (req, res) => {
  try {
    const { tipo_motor } = req.params;
    let { data_inicio, data_fim, tipo } = req.query;
    const inicio = data_inicio ? new Date(`${data_inicio}T00:00:00.000`) : periodoHoje().inicio;
    const fim = data_fim ? new Date(`${data_fim}T23:59:59.999`) : periodoHoje().fim;

    const tipoPedido = normalizarTipoMotor(tipo_motor);

    const reabastecimentos = await Reabastecimento.find({
      data_inicio: { $lte: fim },
      data_fim: { $gte: inicio },
    }).populate("taxi", "tipo_motor matricula marca modelo");

    const filtrados = reabastecimentos.filter((r) => r.taxi && normalizarTipoMotor(r.taxi.tipo_motor) === tipoPedido);

    const mapaTaxis = {};
    for (const r of filtrados) {
      const id = r.taxi._id.toString();
      if (!mapaTaxis[id]) {
        mapaTaxis[id] = {
          taxi: { _id: id, matricula: r.taxi.matricula, marca: r.taxi.marca, modelo: r.taxi.modelo },
          total_euros: 0,
          total_horas: 0,
        };
      }
      mapaTaxis[id].total_euros += Number(r.euros) || 0;
      mapaTaxis[id].total_horas += (new Date(r.data_fim) - new Date(r.data_inicio)) / (1000 * 60 * 60);
    }

    let resultado = Object.values(mapaTaxis);
    if (tipo === "horas") resultado.sort((a, b) => b.total_horas - a.total_horas);
    else resultado.sort((a, b) => b.total_euros - a.total_euros);

    resultado = resultado.map((r) => ({
      ...r,
      total_euros: Number(r.total_euros.toFixed(2)),
      total_horas: Number(r.total_horas.toFixed(2)),
    }));

    res.json({ success: true, servidor: HOSTNAME, periodo: { inicio, fim }, detalhes: resultado });
  } catch (err) {
    responderErro(res, err);
  }
};
