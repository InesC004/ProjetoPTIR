// controllers/viagens.js

const Viagem = require('../models/viagem')
const Pedido = require('../models/pedido')
const Turno = require('../models/turno')
const Preco = require('../models/preco')

const os = require('os')
const HOSTNAME = os.hostname()

// helper distância
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371

  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// calcular preço
function calcularPreco(dataInicio, dataFim, precoMinuto, acrescimoNoturno) {
  const minutos = (dataFim - dataInicio) / 60000

  let total = minutos * precoMinuto

  const horaInicio = dataInicio.getHours()

  // horário noturno
  if (horaInicio >= 22 || horaInicio < 6) {
    total += total * (acrescimoNoturno / 100)
  }

  return parseFloat(total.toFixed(2))
}

// ══════════════════════════════════════════════
// criar viagem automaticamente a partir do pedido
// ══════════════════════════════════════════════

exports.create = async (req, res) => {
  try {
    const { pedido_id } = req.body

    if (!pedido_id) {
      return res.status(400).json({
        success: false,
        message: 'pedido_id é obrigatório.',
        servidor: HOSTNAME
      })
    }

    // buscar pedido
    const pedido = await Pedido.findById(pedido_id)

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado.',
        servidor: HOSTNAME
      })
    }

    // pedido tem de estar confirmado
    if (pedido.estado !== 'confirmado') {
      return res.status(400).json({
        success: false,
        message: 'Pedido não confirmado.',
        servidor: HOSTNAME
      })
    }

    // impedir viagem duplicada
    const viagemExistente = await Viagem.findOne({
      pedido_id: pedido._id
    })

    if (viagemExistente) {
      return res.status(409).json({
        success: false,
        message: 'Já existe uma viagem para este pedido.',
        servidor: HOSTNAME
      })
    }

    // buscar turno ativo do motorista
    const agora = new Date()

    const turno = await Turno.findOne({
      motorista: pedido.motorista_id,
      data_inicio: { $lte: agora },
      data_fim: { $gte: agora }
    }).populate('taxi')

    if (!turno) {
      return res.status(400).json({
        success: false,
        message: 'Motorista sem turno ativo.',
        servidor: HOSTNAME
      })
    }

    // impedir motorista em duas viagens simultâneas
    const viagemMotorista = await Viagem.findOne({
      motorista_id: pedido.motorista_id,
      estado: 'a_decorrer'
    })

    if (viagemMotorista) {
      return res.status(409).json({
        success: false,
        message: 'Motorista já está numa viagem.',
        servidor: HOSTNAME
      })
    }

    // impedir táxi em duas viagens simultâneas
    const viagemTaxi = await Viagem.findOne({
      taxi_id: turno.taxi._id,
      estado: 'a_decorrer'
    })

    if (viagemTaxi) {
      return res.status(409).json({
        success: false,
        message: 'Táxi já está numa viagem.',
        servidor: HOSTNAME
      })
    }

    // criar viagem
    const viagem = new Viagem({
      pedido_id: pedido._id,

      turno_id: turno._id,

      cliente_id: pedido.cliente_id,

      motorista_id: pedido.motorista_id,

      taxi_id: turno.taxi._id,

      origem_morada: pedido.origem_morada,
      origem_lat: pedido.origem_lat,
      origem_lng: pedido.origem_lng,

      destino_morada: pedido.destino_morada,
      destino_lat: pedido.destino_lat,
      destino_lng: pedido.destino_lng,

      numero_pessoas: pedido.numero_pessoas,

      nivel_conforto: pedido.nivel_conforto,

      estado: 'a_decorrer',

      data_inicio: new Date()
    })

    await viagem.save()

    // atualizar pedido
    pedido.viagem_id = viagem._id
    pedido.estado = 'concluido'

    await pedido.save()

    res.status(201).json({
      success: true,
      message: 'Viagem criada com sucesso.',
      servidor: HOSTNAME,
      viagem
    })

  } catch (err) {
    console.error(err)

    res.status(500).json({
      success: false,
      message: 'Erro no servidor.',
      servidor: HOSTNAME
    })
  }
}

// ══════════════════════════════════════════════
// terminar viagem
// ══════════════════════════════════════════════

exports.terminar = async (req, res) => {
  try {
    const { id } = req.params

    const viagem = await Viagem.findById(id)

    if (!viagem) {
      return res.status(404).json({
        success: false,
        message: 'Viagem não encontrada.',
        servidor: HOSTNAME
      })
    }

    if (viagem.estado !== 'a_decorrer') {
      return res.status(400).json({
        success: false,
        message: 'Viagem já terminou.',
        servidor: HOSTNAME
      })
    }

    viagem.data_fim = new Date()

    // calcular km automaticamente
    const distancia = haversine(
      viagem.origem_lat,
      viagem.origem_lng,
      viagem.destino_lat,
      viagem.destino_lng
    )

    viagem.km = parseFloat(distancia.toFixed(2))

    // buscar preço
    const preco = await Preco.findOne({
      nivel_conforto: viagem.nivel_conforto
    })

    if (!preco) {
      return res.status(404).json({
        success: false,
        message: 'Preço não encontrado.',
        servidor: HOSTNAME
      })
    }

    // calcular preço final
    viagem.preco_total = calcularPreco(
      viagem.data_inicio,
      viagem.data_fim,
      preco.preco_minuto,
      preco.acrescimo_noturno
    )

    viagem.estado = 'concluida'

    await viagem.save()

    res.status(200).json({
      success: true,
      message: 'Viagem terminada com sucesso.',
      servidor: HOSTNAME,
      viagem
    })

  } catch (err) {
    console.error(err)

    res.status(500).json({
      success: false,
      message: 'Erro no servidor.',
      servidor: HOSTNAME
    })
  }
}

// ══════════════════════════════════════════════
// obter todas as viagens
// ══════════════════════════════════════════════

exports.getAll = async (req, res) => {
  try {

    const viagens = await Viagem.find()
      .populate('pedido_id')
      .populate('cliente_id', 'nome nif')
      .populate('motorista_id', 'nome nif')
      .populate('taxi_id', 'matricula marca modelo')
      .populate('turno_id')

    res.json({
      success: true,
      servidor: HOSTNAME,
      viagens
    })

  } catch (err) {
    console.error(err)

    res.status(500).json({
      success: false,
      message: 'Erro no servidor.',
      servidor: HOSTNAME
    })
  }
}

// ══════════════════════════════════════════════
// obter viagem por id
// ══════════════════════════════════════════════

exports.getById = async (req, res) => {
  try {

    const viagem = await Viagem.findById(req.params.id)
      .populate('pedido_id')
      .populate('cliente_id', 'nome nif')
      .populate('motorista_id', 'nome nif')
      .populate('taxi_id', 'matricula marca modelo')
      .populate('turno_id')

    if (!viagem) {
      return res.status(404).json({
        success: false,
        message: 'Viagem não encontrada.',
        servidor: HOSTNAME
      })
    }

    res.json({
      success: true,
      servidor: HOSTNAME,
      viagem
    })

  } catch (err) {
    console.error(err)

    res.status(500).json({
      success: false,
      message: 'Erro no servidor.',
      servidor: HOSTNAME
    })
  }
}

// ══════════════════════════════════════════════
// cancelar viagem
// ══════════════════════════════════════════════

exports.cancelar = async (req, res) => {
  try {

    const viagem = await Viagem.findById(req.params.id)

    if (!viagem) {
      return res.status(404).json({
        success: false,
        message: 'Viagem não encontrada.',
        servidor: HOSTNAME
      })
    }

    if (viagem.estado === 'concluida') {
      return res.status(400).json({
        success: false,
        message: 'Não podes cancelar uma viagem concluída.',
        servidor: HOSTNAME
      })
    }

    viagem.estado = 'cancelada'

    await viagem.save()

    res.json({
      success: true,
      message: 'Viagem cancelada com sucesso.',
      servidor: HOSTNAME,
      viagem
    })

  } catch (err) {
    console.error(err)

    res.status(500).json({
      success: false,
      message: 'Erro no servidor.',
      servidor: HOSTNAME
    })
  }
}