const Pagamento = require('../models/pagamento')
const os = require('os')

const HOSTNAME = os.hostname()

// criar pagamento
exports.create = async (req, res) => {
  try {
    const { viagem_id, metodo, valor, data_pagamento } = req.body

    // validações básicas
    if (!viagem_id || !metodo || !valor) {
      return res.status(400).json({
        success: false,
        message: 'viagem_id, metodo e valor são obrigatórios.',
        servidor: HOSTNAME
      })
    }

    if (valor <= 0) {
      return res.status(400).json({
        success: false,
        message: 'valor deve ser maior que 0.',
        servidor: HOSTNAME
      })
    }

    const pagamento = new Pagamento({
      viagem_id,
      metodo,
      valor,
      data_pagamento
    })

    await pagamento.save()

    res.status(201).json({
      success: true,
      message: 'Pagamento criado com sucesso.',
      servidor: HOSTNAME,
      pagamento
    })
  } catch (err) {
    console.error('Erro ao criar pagamento:', err)
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

// obter todos os pagamentos
exports.getAll = async (req, res) => {
  try {
    const pagamentos = await Pagamento.find().populate('viagem_id')

    res.json({
      success: true,
      servidor: HOSTNAME,
      pagamentos
    })
  } catch (err) {
    console.error('Erro ao obter pagamentos:', err)
    res.status(500).json({
      success: false,
      message: 'Erro no servidor',
      servidor: HOSTNAME
    })
  }
}

// obter pagamento por id
exports.getById = async (req, res) => {
  try {
    const { id } = req.params
    const pagamento = await Pagamento.findById(id).populate('viagem_id')

    if (!pagamento) return res.status(404).json({
      success: false,
      message: 'Pagamento não encontrado.',
      servidor: HOSTNAME
    })

    res.json({
      success: true,
      servidor: HOSTNAME,
      pagamento
    })
  } catch (err) {
    console.error('Erro ao obter pagamento:', err)
    res.status(500).json({
      success: false,
      message: 'Erro no servidor',
      servidor: HOSTNAME
    })
  }
}

// atualizar pagamento
exports.update = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    // validações básicas para updates
    if (updates.valor && updates.valor <= 0) {
      return res.status(400).json({
        success: false,
        message: 'valor deve ser maior que 0.',
        servidor: HOSTNAME
      })
    }

    const pagamento = await Pagamento.findByIdAndUpdate(id, updates, { new: true }).populate('viagem_id')

    if (!pagamento) return res.status(404).json({
      success: false,
      message: 'Pagamento não encontrado.',
      servidor: HOSTNAME
    })

    res.json({
      success: true,
      message: 'Pagamento atualizado com sucesso.',
      servidor: HOSTNAME,
      pagamento
    })
  } catch (err) {
    console.error('Erro ao atualizar pagamento:', err)
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

// apagar pagamento
exports.delete = async (req, res) => {
  try {
    const { id } = req.params

    const deleted = await Pagamento.findByIdAndDelete(id)

    if (!deleted) return res.status(404).json({
      success: false,
      message: 'Pagamento não encontrado.',
      servidor: HOSTNAME
    })

    res.status(200).json({
      success: true,
      message: 'Pagamento apagado com sucesso.',
      servidor: HOSTNAME,
      deleted
    })
  } catch (err) {
    console.error('Erro ao apagar pagamento:', err)
    res.status(500).json({
      success: false,
      message: 'Erro no servidor',
      servidor: HOSTNAME
    })
  }
}