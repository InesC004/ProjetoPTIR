const Cliente = require('../models/cliente')

// registar cliente
exports.register = async (req, res) => {
  try {
    const { auth0id, nome, email, morada } = req.body

    // verificar se já existe
    const existing = await Cliente.findOne({ auth0id })
    if (existing) return res.status(409).json({ msg: 'Cliente já registado' })

    const cliente = new Cliente({ auth0id, nome, email, morada })
    await cliente.save()

    res.status(201).json(cliente)
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: 'Erro no servidor' })
  }
}

// obter perfil do cliente
exports.getPerfil = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.user.sub) // Auth0 sub
    if (!cliente) return res.status(404).json({ msg: 'Cliente não encontrado' })

    res.json(cliente)
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: 'Erro no servidor' })
  }
}