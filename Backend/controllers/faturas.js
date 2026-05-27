const Fatura = require('../models/fatura')
const Viagem = require('../models/viagem')
const Pagamento = require('../models/pagamento')
const Pedido = require('../models/pedido')
const mongoose = require('mongoose')

const os = require('os')
const HOSTNAME = os.hostname()

// validar NIF: 9 dígitos e positivo (restrição 12)
function nifValido(nif) {
  return /^\d{9}$/.test(nif) && parseInt(nif, 10) > 0
}

function idValido(id) {
  return mongoose.Types.ObjectId.isValid(id)
}

function normalizarGenero(genero) {
  const valor = String(genero || '').toLowerCase()
  if (valor.startsWith('f')) return 'feminino'
  return 'masculino'
}

// emitir fatura 

exports.emitir = async (req, res) => {
  try {
    const { viagem_id } = req.body

    if (!viagem_id || !idValido(viagem_id)) {
      return res.status(400).json({
        success: false,
        message: 'viagem_id inválido.',
        servidor: HOSTNAME
      })
    }

    // verificar que a viagem existe e está concluída
    const viagem = await Viagem.findById(viagem_id).populate('cliente_id')
      || await Viagem.findOne({ pedido_id: viagem_id }).populate('cliente_id')

    if (!viagem) {
      return res.status(404).json({
        success: false,
        message: 'Viagem não encontrada.',
        servidor: HOSTNAME
      })
    }

    if (viagem.estado !== 'concluida') {
      return res.status(400).json({
        success: false,
        message: 'Só é possível emitir fatura para viagens concluídas.',
        servidor: HOSTNAME
      })
    }

    const pedido = await Pedido.findById(viagem.pedido_id)

    // garantir que não existe já uma fatura para esta viagem (restrição c)
    const faturaExistente = await Fatura.findOne({
      viagem_id: { $in: [viagem._id, viagem.pedido_id].filter(Boolean) }
    })

    if (faturaExistente) {
      return res.status(409).json({
        success: false,
        message: 'Já existe uma fatura para esta viagem.',
        servidor: HOSTNAME
      })
    }

    // verificar que o pagamento foi confirmado (US10a)
    const pagamento = await Pagamento.findOne({
      viagem_id: { $in: [viagem._id, viagem.pedido_id].filter(Boolean) },
      estado: 'confirmado'
    })

    const pagamentoConfirmado =
      pagamento ||
      viagem.pagamento_estado === 'pago' ||
      pedido?.pagamento_estado === 'pago'

    if (!pagamentoConfirmado) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível emitir fatura sem pagamento confirmado.',
        servidor: HOSTNAME
      })
    }

    // obter dados do cliente a partir da viagem
    const cliente = viagem.cliente_id

    if (!cliente) {
      return res.status(400).json({
        success: false,
        message: 'Dados do cliente não encontrados.',
        servidor: HOSTNAME
      })
    }

    // validar NIF do cliente (restrição 12)
    if (!nifValido(cliente.nif)) {
      return res.status(400).json({
        success: false,
        message: 'NIF do cliente inválido (deve ter 9 dígitos e ser positivo).',
        servidor: HOSTNAME
      })
    }

    // valor da fatura (restrição 20: deve ser positivo)
    const valor = viagem.preco_total || pedido?.preco_final

    if (!valor || valor <= 0) {
      return res.status(400).json({
        success: false,
        message: 'O preço da viagem tem de ser positivo.',
        servidor: HOSTNAME
      })
    }

    // verificar restrição 8: data da fatura posterior ao início da viagem
    const agora = new Date()

    if (agora <= viagem.data_inicio) {
      return res.status(400).json({
        success: false,
        message: 'A data da fatura tem de ser posterior ao início da viagem.',
        servidor: HOSTNAME
      })
    }

    // gerar número sequencial para o ano atual (restrição 21)
    const anoAtual = agora.getFullYear()

    const ultimaFatura = await Fatura.findOne({ ano: anoAtual })
      .sort({ numero_sequencial: -1 })
      .select('numero_sequencial')

    const numeroSequencial = ultimaFatura ? ultimaFatura.numero_sequencial + 1 : 1
    const idFatura = `${anoAtual}/${String(numeroSequencial).padStart(4, '0')}`
    const genero = normalizarGenero(cliente.genero)

    // criar fatura sem introdução manual de dados (US10a)
    const fatura = new Fatura({
      id_fatura: idFatura,
      numero_sequencial: numeroSequencial,
      ano: anoAtual,
      data: agora,
      data_emissao: agora,
      cliente_nome: cliente.nome,
      cliente_nif: cliente.nif,
      cliente_genero: genero,
      nome_cliente: cliente.nome,
      nif_cliente: cliente.nif,
      genero_cliente: genero,
      valor,
      valor_total: valor,
      viagem_id: viagem._id.toString(),
      motorista_id: viagem.motorista_id
    })

    await fatura.save()

    res.status(201).json({
      success: true,
      message: 'Fatura emitida com sucesso.',
      servidor: HOSTNAME,
      fatura
    })

  } catch (err) {
    console.error(err)

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Conflito ao gerar número sequencial. Tente novamente.',
        servidor: HOSTNAME
      })
    }

    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos para emitir fatura: ' + err.message,
        servidor: HOSTNAME
      })
    }

    res.status(500).json({
      success: false,
      message: 'Erro no servidor: ' + err.message,
      servidor: HOSTNAME
    })
  }
}

// listar faturas do motorista, ordem descendente por data (US10d)

exports.getByMotorista = async (req, res) => {
  try {
    const { motorista_id } = req.params

    const faturas = await Fatura.find({ motorista_id })
      .sort({ data: -1 })

    res.json({
      success: true,
      servidor: HOSTNAME,
      total: faturas.length,
      faturas
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

// listar faturas do motorista autenticado

exports.getMinhas = async (req, res) => {
  try {
    const faturas = await Fatura.find({ motorista_id: req.user.id })
      .sort({ data: -1 })

    res.json({
      success: true,
      servidor: HOSTNAME,
      total: faturas.length,
      faturas
    })

  } catch (err) {
    console.error(err)

    res.status(500).json({
      success: false,
      message: 'Erro no servidor: ' + err.message,
      servidor: HOSTNAME
    })
  }
}

// obter fatura por id

exports.getById = async (req, res) => {
  try {
    const fatura = await Fatura.findById(req.params.id)
      .populate('motorista_id', 'nome nif')

    if (!fatura) {
      return res.status(404).json({
        success: false,
        message: 'Fatura não encontrada.',
        servidor: HOSTNAME
      })
    }

    res.json({
      success: true,
      servidor: HOSTNAME,
      fatura
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

// listar todas as faturas

exports.getAll = async (req, res) => {
  try {
    const faturas = await Fatura.find()
      .populate('motorista_id', 'nome nif')
      .sort({ data: -1 })

    res.json({
      success: true,
      servidor: HOSTNAME,
      total: faturas.length,
      faturas
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
