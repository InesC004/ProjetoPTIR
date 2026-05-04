const Pedido = require('../models/pedido')

// Criar pedido de táxi (cliente autenticado)
exports.create = async (req, res) => {
  try {
    const {
      origem_morada, origem_lat, origem_lng,
      destino_morada, destino_lat, destino_lng,
      numero_pessoas, nivel_conforto
    } = req.body

    // requisitos de validação 
    if (!origem_morada || !origem_lat || !origem_lng) {
      return res.status(400).json({ success: false, message: 'Localização de origem é obrigatória.' })
    }

    if (!destino_morada || !destino_lat || !destino_lng) {
      return res.status(400).json({ success: false, message: 'Localização de destino é obrigatória.' })
    }

    if (!numero_pessoas || numero_pessoas < 1 || numero_pessoas > 4) {
      return res.status(400).json({ success: false, message: 'Número de pessoas deve ser entre 1 e 4.' })
    }

    if (!nivel_conforto || !['basico', 'luxuoso'].includes(nivel_conforto)) {
      return res.status(400).json({ success: false, message: 'Nível de conforto deve ser básico ou luxuoso.' })
    }

    const pedido = new Pedido({
      cliente_id: req.user.id,
      origem_morada, origem_lat, origem_lng,
      destino_morada, destino_lat, destino_lng,
      numero_pessoas,
      nivel_conforto,
      estado: 'pendente'
    })

    await pedido.save()
    res.status(201).json({ success: true, message: 'Pedido criado com sucesso.', pedido })

  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro no servidor.' })
  }
}

// Cliente cancela pedido enquanto aguarda
exports.cancelar = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)

    if (!pedido) {
      return res.status(404).json({ success: false, message: 'Pedido não encontrado.' })
    }

    if (pedido.cliente_id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Sem permissão para cancelar este pedido.' })
    }

    if (!['pendente', 'aceite'].includes(pedido.estado)) {
      return res.status(400).json({ success: false, message: 'Pedido não pode ser cancelado neste estado.' })
    }

    pedido.estado = 'cancelado'
    await pedido.save()

    res.status(200).json({ success: true, message: 'Pedido cancelado com sucesso.', pedido })

  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro no servidor.' })
  }
}

// Cliente confirma ou rejeita o motorista que aceitou
exports.responderMotorista = async (req, res) => {
  try {
    const { resposta } = req.body // 'confirmar' ou 'rejeitar'

    if (!resposta || !['confirmar', 'rejeitar'].includes(resposta)) {
      return res.status(400).json({ success: false, message: 'Resposta deve ser confirmar ou rejeitar.' })
    }

    const pedido = await Pedido.findById(req.params.id)

    if (!pedido) {
      return res.status(404).json({ success: false, message: 'Pedido não encontrado.' })
    }

    if (pedido.cliente_id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Sem permissão.' })
    }

    if (pedido.estado !== 'aceite') {
      return res.status(400).json({ success: false, message: 'Pedido não está em estado aceite.' })
    }

    if (resposta === 'confirmar') {
      pedido.estado = 'confirmado'
    } else {
      // rejeita - volta a pendente para outros motoristas poderem ver
      pedido.estado = 'pendente'
      pedido.motorista_id = null
    }

    await pedido.save()
    res.status(200).json({ success: true, message: `Pedido ${resposta === 'confirmar' ? 'confirmado' : 'rejeitado'} com sucesso.`, pedido })

  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro no servidor.' })
  }
}

// Ver estado atual do pedido (cliente aguarda resposta)
exports.getById = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('motorista_id', 'nome nif')

    if (!pedido) {
      return res.status(404).json({ success: false, message: 'Pedido não encontrado.' })
    }

    if (pedido.cliente_id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Sem permissão.' })
    }

    res.status(200).json({ success: true, pedido })

  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro no servidor.' })
  }
}
