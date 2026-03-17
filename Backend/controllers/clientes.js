const Cliente = require('../models/cliente')

// registar cliente
exports.register = async (req, res) => {
  try {
    const { name, nif, gender, birth_day, birth_month, birth_year, address, postal_code } = req.body

    const existing = await Cliente.findOne({ nif })
    if (existing) return res.status(409).json({ msg: 'Cliente já registado' })

    const data_nascimento = birth_day && birth_month && birth_year
      ? new Date(birth_year, birth_month - 1, birth_day)
      : null

    const cliente = new Cliente({
      nome: name,
      nif,
      genero: gender,
      data_nascimento,
      morada: address,
      codigo_postal: postal_code
    })

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
    const cliente = await Cliente.findById(req.user.sub)
    if (!cliente) return res.status(404).json({ msg: 'Cliente não encontrado' })

    res.json(cliente)
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: 'Erro no servidor' })
  }
}

// listar todos os clientes (teste)
exports.getTodos = async (req, res) => {
  try {
    const clientes = await Cliente.find()
    res.json(clientes)
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: 'Erro no servidor' })
  }
}