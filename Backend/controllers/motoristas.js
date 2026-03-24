const Motorista = require('../models/motorista')

// GET /motoristas
const getMotoristas = async (req, res) => {
  try {
    const motoristas = await Motorista.find()
    res.status(200).json(motoristas)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter motoristas' })
  }
}

// POST /motoristas
const createMotorista = async (req, res) => {
  try {
    const motorista = new Motorista(req.body)
    const saved = await motorista.save()

    res.status(201).json(saved)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar motorista' })
  }
}

// GET /motoristas/:id
const getMotoristaById = async (req, res) => {
  try {
    const motorista = await Motorista.findById(req.params.id)

    if (!motorista) {
      return res.status(404).json({ error: 'Motorista não encontrado' })
    }

    res.status(200).json(motorista)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter motorista' })
  }
}

// PUT /motoristas/:id
const updateMotorista = async (req, res) => {
  try {
    const motorista = await Motorista.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!motorista) {
      return res.status(404).json({ error: 'Motorista não encontrado' })
    }

    res.status(200).json(motorista)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar motorista' })
  }
}

// DELETE /motoristas/:id
const deleteMotorista = async (req, res) => {
  try {
    const motorista = await Motorista.findById(req.params.id)

    if (!motorista) {
      return res.status(404).json({ error: 'Motorista não encontrado' })
    }

    // regra de negócio (simulação do teu diagrama)
    if (motorista.estado && motorista.estado !== 'ativo') {
      return res.status(409).json({
        error: 'Motorista não pode ser removido'
      })
    }

    await Motorista.findByIdAndDelete(req.params.id)

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover motorista' })
  }
}

// POST /motoristas/login
const loginMotorista = async (req, res) => {
  try {
    const { nif, senha_acesso } = req.body

    const motorista = await Motorista.findOne({ nif })

    if (!motorista || motorista.senha_acesso !== senha_acesso) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    res.status(200).json(motorista)
  } catch (error) {
    res.status(500).json({ error: 'Erro no login' })
  }
}

module.exports = {
  getMotoristas,
  createMotorista,
  getMotoristaById,
  updateMotorista,
  deleteMotorista,
  loginMotorista
}