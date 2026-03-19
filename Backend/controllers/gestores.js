const Gestor = require('../models/gestor')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS)
const JWT_SECRET = process.env.JWT_SECRET
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION

// criar gestor (só admins)
exports.create = async (req, res) => {
  try {
    const { nome, nif, email, password } = req.body

    const existing = await Gestor.findOne({ $or: [{ nif }, { email }] })
    if (existing) return res.status(409).json({ success: false, message: 'NIF ou email já registado.' })

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    const gestor = new Gestor({ nome, nif, email, password: passwordHash })
    await gestor.save()

    res.status(201).json({ success: true, message: 'Gestor criado com sucesso.', gestor: { _id: gestor._id, nome: gestor.nome, nif: gestor.nif, email: gestor.email } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro no servidor' })
  }
}

// login gestor
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const gestor = await Gestor.findOne({ email })
    if (!gestor) return res.status(401).json({ success: false, message: 'Credenciais inválidas.' })

    const match = await bcrypt.compare(password, gestor.password)
    if (!match) return res.status(401).json({ success: false, message: 'Credenciais inválidas.' })

    const payload = { id: gestor._id, email: gestor.email, role: 'gestor' }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION })

    res.status(200).json({
      success: true,
      message: 'Login bem sucedido.',
      role: 'gestor',
      gestor: { nome: gestor.nome, email: gestor.email },
      token
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro no servidor' })
  }
}

// listar todos os gestores
exports.getTodos = async (req, res) => {
  try {
    const gestores = await Gestor.find().select('-password')
    res.json(gestores)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}