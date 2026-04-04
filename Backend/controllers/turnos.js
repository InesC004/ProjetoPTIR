const Turno = require('../models/turno')
const Motorista = require('../models/motorista')
const Taxi = require('../models/taxi')

// calcula o estado do turno com base na hora atual
function calcularEstado(data_inicio, data_fim) {
  const agora = new Date()
  if (agora < new Date(data_inicio)) return 'agendado'
  if (agora >= new Date(data_inicio) && agora <= new Date(data_fim)) return 'ativo'
  return 'terminado'
}

// criar turno
exports.create = async (req, res) => {
  try {
    const { taxi_id, data_inicio, data_fim } = req.body
    const motorista_id = req.user.id

    if (!taxi_id || !data_inicio || !data_fim) {
      return res.status(400).json({ success: false, message: 'Táxi, data de início e data de fim são obrigatórios.' })
    }

    const inicio = new Date(data_inicio)
    const fim = new Date(data_fim)

    if (fim <= inicio) {
      return res.status(400).json({ success: false, message: 'Data de fim tem de ser depois da data de início.' })
    }

    // duração de exatamente 8 horas
    const duracaoHoras = (fim - inicio) / (1000 * 60 * 60)
    if (duracaoHoras !== 8) {
      return res.status(400).json({ success: false, message: 'A duração do turno tem de ser exatamente 8 horas.' })
    }

    const motorista = await Motorista.findById(motorista_id)
    if (!motorista) return res.status(404).json({ success: false, message: 'Motorista não encontrado.' })

    const taxi = await Taxi.findById(taxi_id)
    if (!taxi) return res.status(404).json({ success: false, message: 'Táxi não encontrado.' })

    // verificar interseção com outros turnos do mesmo motorista
    const turnoIntersecao = await Turno.findOne({
      motorista: motorista_id,
      estado: { $in: ['agendado', 'ativo'] },
      $or: [
        { data_inicio: { $lt: fim }, data_fim: { $gt: inicio } }
      ]
    })
    if (turnoIntersecao) {
      return res.status(409).json({ success: false, message: 'Este turno interseta outro turno já existente.' })
    }

    const estado = calcularEstado(inicio, fim)

    const turno = new Turno({ motorista: motorista_id, taxi: taxi_id, data_inicio: inicio, data_fim: fim, estado })
    await turno.save()

    // só muda o taxi para em_uso se o turno já estiver ativo
    if (estado === 'ativo') {
      await Taxi.findByIdAndUpdate(taxi_id, { estado: 'em_uso' })
    }

    res.status(201).json({ success: true, message: 'Turno criado com sucesso.', turno })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro no servidor.' })
  }
}

// terminar turno
exports.terminar = async (req, res) => {
  try {
    const { id } = req.params
    const motorista_id = req.user.id

    const turno = await Turno.findById(id)
    if (!turno) return res.status(404).json({ success: false, message: 'Turno não encontrado.' })

    if (turno.motorista.toString() !== motorista_id) {
      return res.status(403).json({ success: false, message: 'Não podes terminar o turno de outro motorista.' })
    }

    if (turno.estado === 'terminado') {
      return res.status(409).json({ success: false, message: 'Turno já terminado.' })
    }

    turno.estado = 'terminado'
    await turno.save()

    await Taxi.findByIdAndUpdate(turno.taxi, { estado: 'livre' })

    res.status(200).json({ success: true, message: 'Turno terminado com sucesso.', turno })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro no servidor.' })
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
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// listar turnos ativos
exports.getAtivos = async (req, res) => {
  try {
    const turnos = await Turno.find({ estado: 'ativo' })
      .populate('motorista', 'nome nif')
      .populate('taxi', 'matricula marca modelo')
    res.json(turnos)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// listar turno ativo do motorista logado
exports.getMeuTurno = async (req, res) => {
  try {
    const motorista_id = req.user.id

    const turno = await Turno.findOne({ motorista: motorista_id, estado: 'ativo' })
      .populate('taxi', 'matricula marca modelo')

    if (!turno) return res.status(404).json({ success: false, message: 'Não tens turno ativo.' })

    res.json(turno)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// listar todos os turnos do motorista logado ordenados por data_inicio
exports.getMeusTurnos = async (req, res) => {
  try {
    const motorista_id = req.user.id

    const turnos = await Turno.find({ motorista: motorista_id })
      .populate('taxi', 'matricula marca modelo')
      .sort({ data_inicio: 1 })

    res.json(turnos)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// listar taxis disponiveis para um periodo
exports.getTaxisDisponiveis = async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query

    if (!data_inicio || !data_fim) {
      return res.status(400).json({ success: false, message: 'data_inicio e data_fim são obrigatórios.' })
    }

    const inicio = new Date(data_inicio)
    const fim = new Date(data_fim)

    // taxis que têm turno agendado ou ativo que interseta o período
    const turnosOcupados = await Turno.find({
      estado: { $in: ['agendado', 'ativo'] },
      $or: [
        { data_inicio: { $lt: fim }, data_fim: { $gt: inicio } }
      ]
    }).select('taxi')

    const taxisOcupadosIds = turnosOcupados.map(t => t.taxi)

    const taxis = await Taxi.find({ _id: { $nin: taxisOcupadosIds } })

    res.json(taxis)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}