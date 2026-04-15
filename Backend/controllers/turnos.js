const Turno = require('../models/turno')
const Taxi = require('../models/taxi')
const Reabastecimento = require('../models/reabastecimento')

// criar turno
exports.create = async (req, res) => {
  try {
    const { taxi_id, data_inicio, data_fim } = req.body
    const motorista_id = req.user.id

    if (!taxi_id || !data_inicio || !data_fim) {
      return res.status(400).json({ message: 'Campos obrigatórios.' })
    }

    const inicio = new Date(data_inicio)
    const fim = new Date(data_fim)

    if (fim <= inicio) {
      return res.status(400).json({ message: 'Data de início tem de ser anterior à data de fim.' })
    }

    const duracaoHoras = (fim - inicio) / (1000 * 60 * 60)
    if (duracaoHoras > 8) {
      return res.status(400).json({ message: 'Turno não pode exceder 8 horas.' })
    }

    const taxi = await Taxi.findById(taxi_id)
    if (!taxi) return res.status(404).json({ message: 'Taxi não encontrado.' })

    const anoInicio = inicio.getFullYear()
    if (taxi.ano_compra > anoInicio) {
      return res.status(400).json({ message: 'O táxi não estava disponível nessa data.' })
    }

    const conflitoMotorista = await Turno.findOne({
      motorista: motorista_id,
      data_inicio: { $lt: fim },
      data_fim: { $gt: inicio }
    })
    if (conflitoMotorista) {
      return res.status(409).json({ message: 'Já tens um turno nesse período.' })
    }

    const conflitoTaxi = await Turno.findOne({
      taxi: taxi_id,
      data_inicio: { $lt: fim },
      data_fim: { $gt: inicio }
    })
    if (conflitoTaxi) {
      return res.status(409).json({ message: 'Táxi já está ocupado nesse período.' })
    }

    if (taxi.tipo_motor === 'eletrico') {
      const carregamentoDurante = await Reabastecimento.findOne({
        taxi: taxi_id,
        data_inicio: { $lte: inicio },
        data_fim: { $gt: inicio }
      })
      if (carregamentoDurante) {
        return res.status(409).json({ message: 'O táxi elétrico está em carregamento no início do turno.' })
      }
    }

    const turno = new Turno({
      motorista: motorista_id,
      taxi: taxi_id,
      data_inicio: inicio,
      data_fim: fim
    })

    await turno.save()

    const populated = await turno.populate([
      { path: 'taxi', select: 'matricula marca modelo tipo_motor' },
      { path: 'motorista', select: 'nome nif' }
    ])

    res.status(201).json(populated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// cancelar turno antecipadamente
exports.cancelar = async (req, res) => {
  try {
    const turno = await Turno.findById(req.params.id)
    if (!turno) return res.status(404).json({ message: 'Turno não encontrado.' })

    if (turno.motorista.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Não podes cancelar o turno de outro motorista.' })
    }

    const agora = new Date()
    if (agora > turno.data_fim) {
      return res.status(400).json({ message: 'Turno já terminou.' })
    }

    turno.data_fim = agora
    await turno.save()

    res.json({ message: 'Turno cancelado.' })
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// listar todos os turnos
exports.getTodos = async (req, res) => {
  try {
    const turnos = await Turno.find()
      .populate('motorista', 'nome nif')
      .populate('taxi', 'matricula marca modelo')
      .sort({ data_inicio: 1 })
    res.json(turnos)
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// listar turnos do motorista logado
exports.getMeusTurnos = async (req, res) => {
  try {
    const turnos = await Turno.find({ motorista: req.user.id })
      .populate('taxi', 'matricula marca modelo tipo_motor')
      .sort({ data_inicio: 1 })
    res.json(turnos)
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// táxis disponíveis para um período
exports.getTaxisDisponiveis = async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query

    if (!data_inicio || !data_fim) {
      return res.status(400).json({ message: 'data_inicio e data_fim são obrigatórios.' })
    }

    const inicio = new Date(data_inicio)
    const fim = new Date(data_fim)
    const anoInicio = inicio.getFullYear()

    const turnosOcupados = await Turno.find({
      data_inicio: { $lt: fim },
      data_fim: { $gt: inicio }
    }).select('taxi')

    const taxisOcupadosIds = turnosOcupados.map(t => t.taxi)

    let taxis = await Taxi.find({
      _id: { $nin: taxisOcupadosIds },
      ano_compra: { $lte: anoInicio }
    })

    const taxisEletricos = taxis.filter(t => t.tipo_motor === 'eletrico')
    const taxisBloqueados = []

    for (const taxi of taxisEletricos) {
      const carregamentoDurante = await Reabastecimento.findOne({
        taxi: taxi._id,
        data_inicio: { $lte: inicio },
        data_fim: { $gt: inicio }
      })
      if (carregamentoDurante) {
        taxisBloqueados.push(taxi._id.toString())
      }
    }

    taxis = taxis.filter(t => !taxisBloqueados.includes(t._id.toString()))

    res.json(taxis)
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor' })
  }
}