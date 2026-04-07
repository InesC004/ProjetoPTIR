const Taxi = require('../models/taxi')
const Turno = require('../models/turno')
const Reabastecimento = require('../models/reabastecimento')

// criar taxi
exports.create = async (req, res) => {
  try {
    const { matricula, modelo, marca, ano_compra, tipo_motor, nivel_conforto } = req.body

    if (!matricula || !modelo || !marca || !ano_compra || !tipo_motor || !nivel_conforto) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' })
    }

    const regexMatricula = /^[A-Z]{2}-\d{2}-[A-Z]{2}$|^\d{2}-\d{2}-[A-Z]{2}$|^\d{2}-[A-Z]{2}-\d{2}$/
    if (!regexMatricula.test(matricula)) {
      return res.status(400).json({ message: 'Matrícula inválida.' })
    }

    const anoAtual = new Date().getFullYear()
    if (ano_compra < 1990 || ano_compra > anoAtual) {
      return res.status(400).json({ message: 'Ano de compra inválido.' })
    }

    const exists = await Taxi.findOne({ matricula })
    if (exists) return res.status(409).json({ message: 'Matrícula já existe.' })

    const taxi = new Taxi({ matricula, modelo, marca, ano_compra, tipo_motor, nivel_conforto })
    await taxi.save()

    res.status(201).json(taxi)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// listar todos
exports.getTodos = async (req, res) => {
  try {
    const taxis = await Taxi.find()
    res.json(taxis)
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// listar disponiveis agora
exports.getDisponiveis = async (req, res) => {
  try {
    const agora = new Date()

    // taxis com turno ativo agora
    const turnosAtivos = await Turno.find({
      data_inicio: { $lte: agora },
      data_fim: { $gte: agora }
    }).select('taxi')

    const taxisEmUso = turnosAtivos.map(t => t.taxi)

    // taxis em reabastecimento agora
    const reabastecimentosAtivos = await Reabastecimento.find({
      data_inicio: { $lte: agora },
      data_fim: { $gte: agora }
    }).select('taxi')

    const taxisEmReabastecimento = reabastecimentosAtivos.map(r => r.taxi)

    const taxisOcupados = [...taxisEmUso, ...taxisEmReabastecimento]

    const taxis = await Taxi.find({ _id: { $nin: taxisOcupados } })
    res.json(taxis)
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// eliminar taxi
exports.delete = async (req, res) => {
  try {
    const taxiId = req.params.id
    const agora = new Date()

    const turnoAtivo = await Turno.findOne({
      taxi: taxiId,
      data_inicio: { $lte: agora },
      data_fim: { $gte: agora }
    })
    if (turnoAtivo) {
      return res.status(400).json({ message: 'Não é possível apagar o táxi enquanto está em uso num turno.' })
    }

    const reabastecimentoAtivo = await Reabastecimento.findOne({
      taxi: taxiId,
      data_inicio: { $lte: agora },
      data_fim: { $gte: agora }
    })
    if (reabastecimentoAtivo) {
      return res.status(400).json({ message: 'Não é possível apagar o táxi enquanto está em reabastecimento.' })
    }

    const taxi = await Taxi.findByIdAndDelete(taxiId)
    if (!taxi) return res.status(404).json({ message: 'Taxi não encontrado.' })

    res.json({ message: 'Taxi apagado com sucesso.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// atualizar taxi
exports.update = async (req, res) => {
  try {
    const { id } = req.params
    const { matricula, modelo, marca, ano_compra, tipo_motor, nivel_conforto } = req.body

    if (matricula) {
      const regexMatricula = /^[A-Z]{2}-\d{2}-[A-Z]{2}$|^\d{2}-\d{2}-[A-Z]{2}$|^\d{2}-[A-Z]{2}-\d{2}$/
      if (!regexMatricula.test(matricula)) {
        return res.status(400).json({ message: 'Matrícula inválida.' })
      }
      const existing = await Taxi.findOne({ matricula, _id: { $ne: id } })
      if (existing) return res.status(409).json({ message: 'Matrícula já registada.' })
    }

    if (ano_compra) {
      const anoAtual = new Date().getFullYear()
      if (ano_compra < 1990 || ano_compra > anoAtual) {
        return res.status(400).json({ message: 'Ano de compra inválido.' })
      }
    }

    const taxi = await Taxi.findByIdAndUpdate(
      id,
      { matricula, modelo, marca, ano_compra, tipo_motor, nivel_conforto },
      { new: true, runValidators: true }
    )

    if (!taxi) return res.status(404).json({ message: 'Táxi não encontrado.' })

    res.status(200).json({ success: true, message: 'Táxi atualizado com sucesso.', taxi })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}