const Motorista = require('../models/motorista')
const Turno = require('../models/turno')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS)
const JWT_SECRET = process.env.JWT_SECRET
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION

function validarNIF(nif) {
  return /^\d{9}$/.test(nif)
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validarCodigoPostal(cp) {
  return /^\d{4}-\d{3}$/.test(cp)
}

function validarIdade(birth_day, birth_month, birth_year) {
  const nascimento = new Date(birth_year, birth_month - 1, birth_day)
  const hoje = new Date()
  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const m = hoje.getMonth() - nascimento.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--
  return idade >= 18
}

// criar motorista (só gestores)
exports.create = async (req, res) => {
  try {
    const { nome, nif, email, password, numero_carta, genero, birth_day, birth_month, birth_year, morada, codigo_postal } = req.body

    // campos obrigatórios
    if (!nome || !nif || !email || !password || !numero_carta) {
      return res.status(400).json({ success: false, message: 'Nome, NIF, email, password e número de carta são obrigatórios.' })
    }

    // validar NIF
    if (!validarNIF(nif)) {
      return res.status(400).json({ success: false, message: 'NIF inválido. Deve ter 9 dígitos.' })
    }

    // validar email
    if (!validarEmail(email)) {
      return res.status(400).json({ success: false, message: 'Email inválido.' })
    }

    // validar código postal
    if (codigo_postal && !validarCodigoPostal(codigo_postal)) {
      return res.status(400).json({ success: false, message: 'Código postal inválido. Formato: 1000-200.' })
    }

    // validar idade mínima
    if (birth_day && birth_month && birth_year) {
      if (!validarIdade(birth_day, birth_month, birth_year)) {
        return res.status(400).json({ success: false, message: 'O motorista deve ter pelo menos 18 anos.' })
      }
    }

    // validar password
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'A password deve ter pelo menos 8 caracteres.' })
    }

    // verificar duplicados
    const existing = await Motorista.findOne({ $or: [{ nif }, { email }, { numero_carta }] })
    if (existing) return res.status(409).json({ success: false, message: 'NIF, email ou carta já registado.' })

    const data_nascimento = birth_day && birth_month && birth_year
      ? new Date(birth_year, birth_month - 1, birth_day)
      : null

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    const motorista = new Motorista({
      nome, nif, email,
      password: passwordHash,
      numero_carta, genero,
      data_nascimento, morada, codigo_postal
    })

    await motorista.save() 
    res.status(201).json({ success: true, message: 'Motorista criado com sucesso.', motorista: { _id: motorista._id, nome: motorista.nome, nif: motorista.nif, email: motorista.email } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro no servidor' })
  }
}

// login motorista
exports.login = async (req, res) => {
  try {
    const { nif, password } = req.body

    if (!nif || !password) {
      return res.status(400).json({ success: false, message: 'NIF e password são obrigatórios.' })
    }

    const motorista = await Motorista.findOne({ nif })
    if (!motorista) return res.status(401).json({ success: false, message: 'Credenciais inválidas.' })

    const match = await bcrypt.compare(password, motorista.password)
    if (!match) return res.status(401).json({ success: false, message: 'Credenciais inválidas.' })

    const payload = { id: motorista._id, nif: motorista.nif, role: 'motorista' }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION })

    res.status(200).json({
      success: true,
      message: 'Login bem sucedido.',
      role: 'motorista',
      motorista: { nome: motorista.nome, nif: motorista.nif, email: motorista.email, numero_carta: motorista.numero_carta, genero: motorista.genero,  data_nascimento: motorista.data_nascimento, morada: motorista.morada,codigo_postal: motorista.codigo_postal},
      token,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro no servidor' })
  }
}

// listar todos os motoristas
exports.getTodos = async (req, res) => {
  try {
    const motoristas = await Motorista.find().select('-password')
    res.json(motoristas)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// editar motorista
exports.update = async (req, res) => {
  try {
    const { id } = req.params
    const { nome, nif, email, password, numero_carta, genero, birth_day, birth_month, birth_year, morada, codigo_postal } = req.body

    const motorista = await Motorista.findById(id)
    if (!motorista) {
      return res.status(404).json({ success: false, message: 'Motorista não encontrado.' })
    }

    if (nif && !validarNIF(nif)) {
      return res.status(400).json({ success: false, message: 'NIF inválido. Deve ter 9 dígitos.' })
    }

    if (email && !validarEmail(email)) {
      return res.status(400).json({ success: false, message: 'Email inválido.' })
    }

    if (codigo_postal && !validarCodigoPostal(codigo_postal)) {
      return res.status(400).json({ success: false, message: 'Código postal inválido. Formato: 1000-200.' })
    }

    if (password && password.length < 8) {
      return res.status(400).json({ success: false, message: 'A password deve ter pelo menos 8 caracteres.' })
    }

    if (birth_day || birth_month || birth_year) {
      if (!(birth_day && birth_month && birth_year)) {
        return res.status(400).json({ success: false, message: 'Data de nascimento incompleta.' })
      }
      if (!validarIdade(birth_day, birth_month, birth_year)) {
        return res.status(400).json({ success: false, message: 'O motorista deve ter pelo menos 18 anos.' })
      }
      motorista.data_nascimento = new Date(birth_year, birth_month - 1, birth_day)
    }

    const conflict = await Motorista.findOne({
      $or: [
        nif ? { nif } : null,
        email ? { email } : null,
        numero_carta ? { numero_carta } : null
      ].filter(Boolean),
      _id: { $ne: id }
    })

    if (conflict) {
      return res.status(409).json({ success: false, message: 'NIF, email ou carta já registado.' })
    }

    if (nome) motorista.nome = nome
    if (nif) motorista.nif = nif
    if (email) motorista.email = email
    if (numero_carta) motorista.numero_carta = numero_carta
    if (genero) motorista.genero = genero
    if (morada) motorista.morada = morada
    if (codigo_postal) motorista.codigo_postal = codigo_postal

    if (password) {
      motorista.password = await bcrypt.hash(password, SALT_ROUNDS)
    }

    await motorista.save()

    const responseMotorista = motorista.toObject()
    delete responseMotorista.password

    res.status(200).json({ success: true, message: 'Motorista atualizado com sucesso.', motorista: responseMotorista })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro no servidor.' })
  }
}

// apagar motorista
exports.delete = async (req, res) => {
  try {
    const { id } = req.params

    const agora = new Date()

    const turnoAtivoOuFuturo = await Turno.findOne({
      motorista: id,
      data_fim: { $gte: agora }
    })

    if (turnoAtivoOuFuturo) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível apagar o motorista com turnos ativos ou futuros.'
      })
    }

    const deleted = await Motorista.findByIdAndDelete(id)

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Motorista não encontrado.'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Motorista apagado com sucesso.'
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro no servidor.' })
  }
}