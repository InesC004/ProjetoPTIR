const Viagem = require('../models/viagem')
const os = require('os')

const HOSTNAME = os.hostname()

// criar viagem
exports.create = async (req, res) => {
  try {
    const { turno_id, cliente_id, motorista_id, taxi_id, data_inicio, data_fim, morada_entrada, morada_saida, km, numero_pessoas, preco_total, estado } = req.body

    // validações básicas
    if (!cliente_id || !numero_pessoas) {
      return res.status(400).json({
        success: false,
        message: 'cliente_id e numero_pessoas são obrigatórios.',
        servidor: HOSTNAME
      })
    }

    if (numero_pessoas < 1) {
      return res.status(400).json({
        success: false,
        message: 'numero_pessoas deve ser pelo menos 1.',
        servidor: HOSTNAME
      })
    }

    if (km && km < 0) {
      return res.status(400).json({
        success: false,
        message: 'km não pode ser negativo.',
        servidor: HOSTNAME
      })
    }

    if (preco_total && preco_total < 0) {
      return res.status(400).json({
        success: false,
        message: 'preco_total não pode ser negativo.',
        servidor: HOSTNAME
      })
    }

    const viagem = new Viagem({
      turno_id,
      cliente_id,
      motorista_id,
      taxi_id,
      data_inicio,
      data_fim,
      morada_entrada,
      morada_saida,
      km,
      numero_pessoas,
      preco_total,
      estado
    })

    await viagem.save()

    res.status(201).json({
      success: true,
      message: 'Viagem criada com sucesso.',
      servidor: HOSTNAME,
      viagem
    })
  } catch (err) {
    console.error('Erro ao criar viagem:', err)
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos: ' + err.message,
        servidor: HOSTNAME
      })
    }
    res.status(500).json({
      success: false,
      message: 'Erro no servidor',
      servidor: HOSTNAME
    })
  }
}

// obter todas as viagens
exports.getAll = async (req, res) => {
  try {
    const viagens = await Viagem.find().populate('turno_id cliente_id motorista_id taxi_id')

    res.json({
      success: true,
      servidor: HOSTNAME,
      viagens
    })
  } catch (err) {
    console.error('Erro ao obter viagens:', err)
    res.status(500).json({
      success: false,
      message: 'Erro no servidor',
      servidor: HOSTNAME
    })
  }
}

// obter viagem por id
exports.getById = async (req, res) => {
  try {
    const { id } = req.params
    const viagem = await Viagem.findById(id).populate('turno_id cliente_id motorista_id taxi_id')

    if (!viagem) return res.status(404).json({
      success: false,
      message: 'Viagem não encontrada.',
      servidor: HOSTNAME
    })

    res.json({
      success: true,
      servidor: HOSTNAME,
      viagem
    })
  } catch (err) {
    console.error('Erro ao obter viagem:', err)
    res.status(500).json({
      success: false,
      message: 'Erro no servidor',
      servidor: HOSTNAME
    })
  }
}

// atualizar viagem
exports.update = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    // validações básicas para updates
    if (updates.numero_pessoas && updates.numero_pessoas < 1) {
      return res.status(400).json({
        success: false,
        message: 'numero_pessoas deve ser pelo menos 1.',
        servidor: HOSTNAME
      })
    }

    if (updates.km && updates.km < 0) {
      return res.status(400).json({
        success: false,
        message: 'km não pode ser negativo.',
        servidor: HOSTNAME
      })
    }

    if (updates.preco_total && updates.preco_total < 0) {
      return res.status(400).json({
        success: false,
        message: 'preco_total não pode ser negativo.',
        servidor: HOSTNAME
      })
    }

    const viagem = await Viagem.findByIdAndUpdate(id, updates, { new: true }).populate('turno_id cliente_id motorista_id taxi_id')

    if (!viagem) return res.status(404).json({
      success: false,
      message: 'Viagem não encontrada.',
      servidor: HOSTNAME
    })

    res.json({
      success: true,
      message: 'Viagem atualizada com sucesso.',
      servidor: HOSTNAME,
      viagem
    })
  } catch (err) {
    console.error('Erro ao atualizar viagem:', err)
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos: ' + err.message,
        servidor: HOSTNAME
      })
    }
    res.status(500).json({
      success: false,
      message: 'Erro no servidor',
      servidor: HOSTNAME
    })
  }
}

// apagar viagem
exports.delete = async (req, res) => {
  try {
    const { id } = req.params

    const deleted = await Viagem.findByIdAndDelete(id)

    if (!deleted) return res.status(404).json({
      success: false,
      message: 'Viagem não encontrada.',
      servidor: HOSTNAME
    })

    res.status(200).json({
      success: true,
      message: 'Viagem apagada com sucesso.',
      servidor: HOSTNAME,
      deleted
    })
  } catch (err) {
    console.error('Erro ao apagar viagem:', err)
    res.status(500).json({
      success: false,
      message: 'Erro no servidor',
      servidor: HOSTNAME
    })
  }
}