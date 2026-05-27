// controllers/faturas.js

const Fatura = require('../models/fatura')
const Viagem = require('../models/viagem')
const Pagamento = require('../models/pagamento')

const os = require('os')
const HOSTNAME = os.hostname()

// ══════════════════════════════════════════════
// emitir fatura (Critério A, B e C)
// ══════════════════════════════════════════════
exports.emitirFatura = async (req, res) => {
  try {
    const { viagem_id } = req.body

    // Validação básica do input
    if (!viagem_id) {
      return res.status(400).json({
        success: false,
        message: 'viagem_id é obrigatório.',
        servidor: HOSTNAME
      })
    }

    // 1. Procurar a viagem e obter os dados do cliente (para o NIF)
    const viagem = await Viagem.findById(viagem_id).populate('cliente_id')
    
    if (!viagem) {
      return res.status(404).json({
        success: false,
        message: 'Viagem não encontrada.',
        servidor: HOSTNAME
      })
    }

    // A viagem tem de estar concluída
    if (viagem.estado !== 'concluida') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível emitir fatura de uma viagem que não foi concluída.',
        servidor: HOSTNAME
      })
    }

    // 2. Verificar se a viagem já foi paga (Critério A)
    const pagamento = await Pagamento.findOne({
      viagem_id: viagem._id,
      estado: 'confirmado'
    })

    if (!pagamento) {
      return res.status(400).json({
        success: false,
        message: 'A viagem ainda não foi paga ou o pagamento não foi confirmado.',
        servidor: HOSTNAME
      })
    }

    // 3. Impedir faturas duplicadas para a mesma viagem (Critério C)
    const faturaExistente = await Fatura.findOne({ viagem_id: viagem._id })

    if (faturaExistente) {
      return res.status(409).json({
        success: false,
        message: 'Já existe uma fatura emitida para esta viagem.',
        servidor: HOSTNAME
      })
    }

    // 4. Gerar número de fatura sequencial e único (Critério B - Restrição 21)
    const totalFaturas = await Fatura.countDocuments()
    const anoAtual = new Date().getFullYear()
    const numeroFatura = `FT-${anoAtual}/${totalFaturas + 1}`

    // 5. Criar e gravar a fatura (Dados automáticos - Critério A e B)
    const fatura = new Fatura({
      numero_fatura: numeroFatura,                         // Restrição 21
      viagem_id: viagem._id,                               // Associação à Viagem
      cliente_id: viagem.cliente_id._id,
      motorista_id: viagem.motorista_id,
      nif_cliente: viagem.cliente_id.nif,                  // Restrição 12 (Automático)
      valor_total: parseFloat(pagamento.valor.toFixed(2)), // Restrição 20 (Automático em Euros)
      data_emissao: new Date()                             // Restrição 8 (Data atual)
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
    res.status(500).json({
      success: false,
      message: 'Erro no servidor ao emitir fatura.',
      servidor: HOSTNAME
    })
  }
}

// ══════════════════════════════════════════════
// obter faturas de um motorista (Critério D)
// ══════════════════════════════════════════════
exports.getFaturasPorMotorista = async (req, res) => {
  try {
    const { motorista_id } = req.params

    // Procura faturas do motorista e ordena de forma DESCENDENTE (-1) pela data (Critério D)
    const faturas = await Fatura.find({ motorista_id: motorista_id })
      .sort({ data_emissao: -1 }) 
      .populate('viagem_id')
      .populate('cliente_id', 'nome nif')

    res.json({
      success: true,
      servidor: HOSTNAME,
      faturas
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({
      success: false,
      message: 'Erro no servidor ao listar faturas.',
      servidor: HOSTNAME
    })
  }
}