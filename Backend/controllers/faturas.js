const Fatura = require('../models/fatura')
const Viagem = require('../models/viagem')
const Pagamento = require('../models/pagamento')
const Cliente = require('../models/cliente')

const os = require('os')
const HOSTNAME = os.hostname()

// validar NIF: 9 dígitos e positivo (restrição 12)
function nifValido(nif) {
  return /^\d{9}$/.test(nif) && parseInt(nif, 10) > 0
}

// emitir fatura 

exports.emitir = async (req, res) => {
  try {
    const { viagem_id } = req.body

    if (!viagem_id) {
      return res.status(400).json({
        success: false,
        message: 'viagem_id é obrigatório.',
        servidor: HOSTNAME
      })
    }

    // verificar que a viagem existe e está concluída
    const viagem = await Viagem.findById(viagem_id).populate('cliente_id')

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

    // garantir que não existe já uma fatura para esta viagem (restrição c)
    const faturaExistente = await Fatura.findOne({ viagem_id })

    if (faturaExistente) {
      return res.status(409).json({
        success: false,
        message: 'Já existe uma fatura para esta viagem.',
        servidor: HOSTNAME
      })
    }

    // verificar que o pagamento foi confirmado (US10a)
    const pagamento = await Pagamento.findOne({
      viagem_id,
      estado: 'confirmado'
    })

    if (!pagamento) {
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
    const valor = viagem.preco_total

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

    // criar fatura sem introdução manual de dados (US10a)
    const fatura = new Fatura({
      numero_sequencial: numeroSequencial,
      ano: anoAtual,
      data: agora,
      nome_cliente: cliente.nome,
      nif_cliente: cliente.nif,
      genero_cliente: cliente.genero,
      valor,
      viagem_id: viagem._id,
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

    res.status(500).json({
      success: false,
      message: 'Erro no servidor.',
      servidor: HOSTNAME
    })
  }
}

// listar faturas do motorista, ordem descendente por data (US10d)

exports.getByMotorista = async (req, res) => {
  try {
    const { motorista_id } = req.params

    const faturas = await Fatura.find({ motorista_id })
      .populate('viagem_id', 'origem_morada destino_morada data_inicio data_fim')
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

// obter fatura por id

exports.getById = async (req, res) => {
  try {
    const fatura = await Fatura.findById(req.params.id)
      .populate('viagem_id')
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
      .populate('viagem_id', 'origem_morada destino_morada data_inicio data_fim')
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
