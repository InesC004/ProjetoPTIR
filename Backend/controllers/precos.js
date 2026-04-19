const Preco = require('../models/preco')

// GET /precos - listar todos os preços
const listar = async (req, res) => {
  try {
    const precos = await Preco.find()
    res.status(200).json(precos)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter preços' })
  }
}

// GET /precos/:id - obter um preço específico
const obter = async (req, res) => {
  try {
    const { id } = req.params
    const preco = await Preco.findById(id)

    if (!preco) {
      return res.status(404).json({ error: 'Preço não encontrado' })
    }

    res.status(200).json(preco)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter preço' })
  }
}

// POST /precos - criar novo preço
const criar = async (req, res) => {
  try {
    const { nivel_conforto, preco_minuto, acrescimo_noturno } = req.body

    // validar campos obrigatórios
    if (!nivel_conforto || !preco_minuto) {
      return res.status(400).json({ error: 'Campos obrigatórios: nivel_conforto, preco_minuto' })
    }

    // verificar se já existe preço para este nível de conforto
    const existing = await Preco.findOne({ nivel_conforto })
    if (existing) {
      return res.status(409).json({ error: 'Já existe um preço definido para este nível de conforto' })
    }

    const preco = new Preco({
      nivel_conforto,
      preco_minuto,
      acrescimo_noturno: acrescimo_noturno || 0
    })

    const savedPreco = await preco.save()
    res.status(201).json(savedPreco)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar preço' })
  }
}

// PUT /precos/:id - atualizar preço
const atualizar = async (req, res) => {
  try {
    const { id } = req.params
    const { nivel_conforto, preco_minuto, acrescimo_noturno } = req.body

    // verificar se preço existe
    const preco = await Preco.findById(id)
    if (!preco) {
      return res.status(404).json({ error: 'Preço não encontrado' })
    }

    // se está a mudar o nivel_conforto, verificar duplicata
    if (nivel_conforto && nivel_conforto !== preco.nivel_conforto) {
      const existing = await Preco.findOne({ nivel_conforto })
      if (existing) {
        return res.status(409).json({ error: 'Já existe um preço para este nível de conforto' })
      }
    }

    const updatedPreco = await Preco.findByIdAndUpdate(
      id,
      { nivel_conforto, preco_minuto, acrescimo_noturno },
      { new: true, runValidators: true }
    )

    res.status(200).json(updatedPreco)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar preço' })
  }
}

// DELETE /precos/:id - deletar preço
const deletar = async (req, res) => {
  try {
    const { id } = req.params

    const preco = await Preco.findById(id)
    if (!preco) {
      return res.status(404).json({ error: 'Preço não encontrado' })
    }

    await Preco.findByIdAndDelete(id)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover preço' })
  }
}

module.exports = {
  listar,
  obter,
  criar,
  atualizar,
  deletar
}