const Viagem = require('../models/viagem')
const Reabastecimento = require('../models/reabastecimento')

// helper para obter início e fim do dia de hoje
function periodoHoje() {
  const inicio = new Date()
  inicio.setHours(0, 0, 0, 0)
  const fim = new Date()
  fim.setHours(23, 59, 59, 999)
  return { inicio, fim }
}

// ══════════════════════════════════════════════
// US14 — Relatório de táxis e motoristas
// ══════════════════════════════════════════════

// totais gerais — viagens, horas, quilómetros
exports.getTotaisViagens = async (req, res) => {
  try {
    let { data_inicio, data_fim } = req.query
    const inicio = data_inicio ? new Date(data_inicio) : periodoHoje().inicio
    const fim = data_fim ? new Date(data_fim) : periodoHoje().fim

    const viagens = await Viagem.find({
      data_inicio: { $gte: inicio },
      data_fim: { $lte: fim }
    })

    const totalViagens = viagens.length
    const totalKm = viagens.reduce((acc, v) => acc + (v.km || 0), 0)
    const totalHoras = viagens.reduce((acc, v) => {
      if (v.data_inicio && v.data_fim) {
        return acc + (new Date(v.data_fim) - new Date(v.data_inicio)) / (1000 * 60 * 60)
      }
      return acc
    }, 0)

    res.json({
      periodo: { inicio, fim },
      total_viagens: totalViagens,
      total_km: parseFloat(totalKm.toFixed(2)),
      total_horas: parseFloat(totalHoras.toFixed(2))
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// subtotais por motorista
exports.getSubtotaisPorMotorista = async (req, res) => {
  try {
    let { data_inicio, data_fim, tipo } = req.query
    const inicio = data_inicio ? new Date(data_inicio) : periodoHoje().inicio
    const fim = data_fim ? new Date(data_fim) : periodoHoje().fim

    const viagens = await Viagem.find({
      data_inicio: { $gte: inicio },
      data_fim: { $lte: fim },
      motorista_id: { $exists: true, $ne: null }
    }).populate('motorista_id', 'nome nif')

    const mapaMotoristas = {}
    for (const v of viagens) {
      if (!v.motorista_id) continue
      const id = v.motorista_id._id.toString()
      if (!mapaMotoristas[id]) {
        mapaMotoristas[id] = {
          motorista: { _id: id, nome: v.motorista_id.nome, nif: v.motorista_id.nif },
          total_viagens: 0,
          total_km: 0,
          total_horas: 0
        }
      }
      mapaMotoristas[id].total_viagens++
      mapaMotoristas[id].total_km += v.km || 0
      if (v.data_inicio && v.data_fim) {
        mapaMotoristas[id].total_horas += (new Date(v.data_fim) - new Date(v.data_inicio)) / (1000 * 60 * 60)
      }
    }

    let resultado = Object.values(mapaMotoristas)
    if (tipo === 'viagens') resultado.sort((a, b) => b.total_viagens - a.total_viagens)
    else if (tipo === 'km') resultado.sort((a, b) => b.total_km - a.total_km)
    else resultado.sort((a, b) => b.total_horas - a.total_horas)

    resultado = resultado.map(r => ({
      ...r,
      total_km: parseFloat(r.total_km.toFixed(2)),
      total_horas: parseFloat(r.total_horas.toFixed(2))
    }))

    res.json({ periodo: { inicio, fim }, subtotais: resultado })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// subtotais por táxi
exports.getSubtotaisPorTaxi = async (req, res) => {
  try {
    let { data_inicio, data_fim, tipo } = req.query
    const inicio = data_inicio ? new Date(data_inicio) : periodoHoje().inicio
    const fim = data_fim ? new Date(data_fim) : periodoHoje().fim

    const viagens = await Viagem.find({
      data_inicio: { $gte: inicio },
      data_fim: { $lte: fim },
      taxi_id: { $exists: true, $ne: null }
    }).populate('taxi_id', 'matricula marca modelo')

    const mapaTaxis = {}
    for (const v of viagens) {
      if (!v.taxi_id) continue
      const id = v.taxi_id._id.toString()
      if (!mapaTaxis[id]) {
        mapaTaxis[id] = {
          taxi: { _id: id, matricula: v.taxi_id.matricula, marca: v.taxi_id.marca, modelo: v.taxi_id.modelo },
          total_viagens: 0,
          total_km: 0,
          total_horas: 0
        }
      }
      mapaTaxis[id].total_viagens++
      mapaTaxis[id].total_km += v.km || 0
      if (v.data_inicio && v.data_fim) {
        mapaTaxis[id].total_horas += (new Date(v.data_fim) - new Date(v.data_inicio)) / (1000 * 60 * 60)
      }
    }

    let resultado = Object.values(mapaTaxis)
    if (tipo === 'viagens') resultado.sort((a, b) => b.total_viagens - a.total_viagens)
    else if (tipo === 'km') resultado.sort((a, b) => b.total_km - a.total_km)
    else resultado.sort((a, b) => b.total_horas - a.total_horas)

    resultado = resultado.map(r => ({
      ...r,
      total_km: parseFloat(r.total_km.toFixed(2)),
      total_horas: parseFloat(r.total_horas.toFixed(2))
    }))

    res.json({ periodo: { inicio, fim }, subtotais: resultado })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// detalhes de viagens de um motorista específico
exports.getDetalhesMotorista = async (req, res) => {
  try {
    const { motorista_id } = req.params
    let { data_inicio, data_fim } = req.query
    const inicio = data_inicio ? new Date(data_inicio) : periodoHoje().inicio
    const fim = data_fim ? new Date(data_fim) : periodoHoje().fim

    const viagens = await Viagem.find({
      motorista_id,
      data_inicio: { $gte: inicio },
      data_fim: { $lte: fim }
    })
    .populate('taxi_id', 'matricula marca modelo')
    .populate('cliente_id', 'nome nif')
    .sort({ data_inicio: -1 })

    const resultado = viagens.map(v => ({
      _id: v._id,
      data_inicio: v.data_inicio,
      data_fim: v.data_fim,
      km: v.km,
      horas: v.data_inicio && v.data_fim
        ? parseFloat(((new Date(v.data_fim) - new Date(v.data_inicio)) / (1000 * 60 * 60)).toFixed(2))
        : 0,
      taxi: v.taxi_id,
      cliente: v.cliente_id
    }))

    res.json({ periodo: { inicio, fim }, viagens: resultado })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// detalhes de viagens de um táxi específico
exports.getDetalhesTaxi = async (req, res) => {
  try {
    const { taxi_id } = req.params
    let { data_inicio, data_fim } = req.query
    const inicio = data_inicio ? new Date(data_inicio) : periodoHoje().inicio
    const fim = data_fim ? new Date(data_fim) : periodoHoje().fim

    const viagens = await Viagem.find({
      taxi_id,
      data_inicio: { $gte: inicio },
      data_fim: { $lte: fim }
    })
    .populate('motorista_id', 'nome nif')
    .populate('cliente_id', 'nome nif')
    .sort({ data_inicio: -1 })

    const resultado = viagens.map(v => ({
      _id: v._id,
      data_inicio: v.data_inicio,
      data_fim: v.data_fim,
      km: v.km,
      horas: v.data_inicio && v.data_fim
        ? parseFloat(((new Date(v.data_fim) - new Date(v.data_inicio)) / (1000 * 60 * 60)).toFixed(2))
        : 0,
      motorista: v.motorista_id,
      cliente: v.cliente_id
    }))

    res.json({ periodo: { inicio, fim }, viagens: resultado })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// detalhes de uma viagem específica
exports.getDetalhesViagem = async (req, res) => {
  try {
    const { viagem_id } = req.params

    const viagem = await Viagem.findById(viagem_id)
      .populate('cliente_id', 'nome nif email')
      .populate('motorista_id', 'nome nif')
      .populate('taxi_id', 'matricula marca modelo tipo_motor')
      .populate('turno_id', 'data_inicio data_fim')

    if (!viagem) return res.status(404).json({ message: 'Viagem não encontrada.' })

    res.json(viagem)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// ══════════════════════════════════════════════
// US15 — Relatório de clientes e faturação
// ══════════════════════════════════════════════

// total de euros cobrados
exports.getTotalEurosViagens = async (req, res) => {
  try {
    let { data_inicio, data_fim } = req.query
    const inicio = data_inicio ? new Date(data_inicio) : periodoHoje().inicio
    const fim = data_fim ? new Date(data_fim) : periodoHoje().fim

    const viagens = await Viagem.find({
      data_inicio: { $gte: inicio },
      data_fim: { $lte: fim },
      preco_total: { $exists: true, $ne: null }
    })

    const totalEuros = viagens.reduce((acc, v) => acc + (v.preco_total || 0), 0)

    res.json({
      periodo: { inicio, fim },
      total_euros: parseFloat(totalEuros.toFixed(2))
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// subtotais por cliente
exports.getSubtotaisPorCliente = async (req, res) => {
  try {
    let { data_inicio, data_fim } = req.query
    const inicio = data_inicio ? new Date(data_inicio) : periodoHoje().inicio
    const fim = data_fim ? new Date(data_fim) : periodoHoje().fim

    const viagens = await Viagem.find({
      data_inicio: { $gte: inicio },
      data_fim: { $lte: fim },
      cliente_id: { $exists: true, $ne: null }
    }).populate('cliente_id', 'nome nif email')

    const mapaClientes = {}
    for (const v of viagens) {
      if (!v.cliente_id) continue
      const id = v.cliente_id._id.toString()
      if (!mapaClientes[id]) {
        mapaClientes[id] = {
          cliente: { _id: id, nome: v.cliente_id.nome, nif: v.cliente_id.nif, email: v.cliente_id.email },
          total_euros: 0,
          total_viagens: 0
        }
      }
      mapaClientes[id].total_euros += v.preco_total || 0
      mapaClientes[id].total_viagens++
    }

    let resultado = Object.values(mapaClientes)
    resultado.sort((a, b) => b.total_euros - a.total_euros)
    resultado = resultado.map(r => ({ ...r, total_euros: parseFloat(r.total_euros.toFixed(2)) }))

    res.json({ periodo: { inicio, fim }, subtotais: resultado })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// detalhes de viagens de um cliente específico
exports.getDetalhesCliente = async (req, res) => {
  try {
    const { cliente_id } = req.params
    let { data_inicio, data_fim } = req.query
    const inicio = data_inicio ? new Date(data_inicio) : periodoHoje().inicio
    const fim = data_fim ? new Date(data_fim) : periodoHoje().fim

    const viagens = await Viagem.find({
      cliente_id,
      data_inicio: { $gte: inicio },
      data_fim: { $lte: fim }
    })
    .populate('taxi_id', 'matricula marca modelo')
    .populate('motorista_id', 'nome nif')
    .sort({ preco_total: -1 })

    const resultado = viagens.map(v => ({
      _id: v._id,
      data_inicio: v.data_inicio,
      data_fim: v.data_fim,
      preco_total: v.preco_total,
      km: v.km,
      taxi: v.taxi_id,
      motorista: v.motorista_id
    }))

    res.json({ periodo: { inicio, fim }, viagens: resultado })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// ══════════════════════════════════════════════
// US16 — Relatório de reabastecimentos
// ══════════════════════════════════════════════

// totais de euros e horas em reabastecimentos
exports.getTotaisReabastecimentos = async (req, res) => {
  try {
    let { data_inicio, data_fim } = req.query
    const inicio = data_inicio ? new Date(data_inicio) : periodoHoje().inicio
    const fim = data_fim ? new Date(data_fim) : periodoHoje().fim

    const reabastecimentos = await Reabastecimento.find({
      data_inicio: { $gte: inicio },
      data_fim: { $lte: fim }
    })

    const totalEuros = reabastecimentos.reduce((acc, r) => acc + (r.euros || 0), 0)
    const totalHoras = reabastecimentos.reduce((acc, r) => {
      return acc + (new Date(r.data_fim) - new Date(r.data_inicio)) / (1000 * 60 * 60)
    }, 0)

    res.json({
      periodo: { inicio, fim },
      total_euros: parseFloat(totalEuros.toFixed(2)),
      total_horas: parseFloat(totalHoras.toFixed(2))
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// subtotais por tipo de motor
exports.getSubtotaisPorTipoMotor = async (req, res) => {
  try {
    let { data_inicio, data_fim, tipo } = req.query
    const inicio = data_inicio ? new Date(data_inicio) : periodoHoje().inicio
    const fim = data_fim ? new Date(data_fim) : periodoHoje().fim

    const reabastecimentos = await Reabastecimento.find({
      data_inicio: { $gte: inicio },
      data_fim: { $lte: fim }
    }).populate('taxi', 'tipo_motor matricula marca modelo')

    const mapa = {
      combustao: { total_euros: 0, total_horas: 0 },
      eletrico: { total_euros: 0, total_horas: 0 }
    }

    for (const r of reabastecimentos) {
      if (!r.taxi) continue
      const tipo_motor = r.taxi.tipo_motor
      mapa[tipo_motor].total_euros += r.euros || 0
      mapa[tipo_motor].total_horas += (new Date(r.data_fim) - new Date(r.data_inicio)) / (1000 * 60 * 60)
    }

    let resultado = [
      { tipo_motor: 'combustao', ...mapa.combustao },
      { tipo_motor: 'eletrico', ...mapa.eletrico }
    ]

    if (tipo === 'horas') resultado.sort((a, b) => b.total_horas - a.total_horas)
    else resultado.sort((a, b) => b.total_euros - a.total_euros)

    resultado = resultado.map(r => ({
      ...r,
      total_euros: parseFloat(r.total_euros.toFixed(2)),
      total_horas: parseFloat(r.total_horas.toFixed(2))
    }))

    res.json({ periodo: { inicio, fim }, subtotais: resultado })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// detalhes de reabastecimentos por tipo de motor
exports.getDetalhesPorTipoMotor = async (req, res) => {
  try {
    const { tipo_motor } = req.params
    let { data_inicio, data_fim, tipo } = req.query
    const inicio = data_inicio ? new Date(data_inicio) : periodoHoje().inicio
    const fim = data_fim ? new Date(data_fim) : periodoHoje().fim

    const reabastecimentos = await Reabastecimento.find({
      data_inicio: { $gte: inicio },
      data_fim: { $lte: fim }
    }).populate('taxi', 'tipo_motor matricula marca modelo')

    const filtrados = reabastecimentos.filter(r => r.taxi && r.taxi.tipo_motor === tipo_motor)

    const mapaTaxis = {}
    for (const r of filtrados) {
      const id = r.taxi._id.toString()
      if (!mapaTaxis[id]) {
        mapaTaxis[id] = {
          taxi: { _id: id, matricula: r.taxi.matricula, marca: r.taxi.marca, modelo: r.taxi.modelo },
          total_euros: 0,
          total_horas: 0
        }
      }
      mapaTaxis[id].total_euros += r.euros || 0
      mapaTaxis[id].total_horas += (new Date(r.data_fim) - new Date(r.data_inicio)) / (1000 * 60 * 60)
    }

    let resultado = Object.values(mapaTaxis)
    if (tipo === 'horas') resultado.sort((a, b) => b.total_horas - a.total_horas)
    else resultado.sort((a, b) => b.total_euros - a.total_euros)

    resultado = resultado.map(r => ({
      ...r,
      total_euros: parseFloat(r.total_euros.toFixed(2)),
      total_horas: parseFloat(r.total_horas.toFixed(2))
    }))

    res.json({ periodo: { inicio, fim }, detalhes: resultado })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}