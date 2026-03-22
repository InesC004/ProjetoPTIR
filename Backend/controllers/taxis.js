const Taxi = require('../models/taxi')

// GET /taxis
const getTaxis = async (req, res) => {
  try {
    const taxis = await Taxi.find() // vai buscar todos da base de dados
    res.status(200).json(taxis)     // devolve os dados
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter táxis' })
  }
}
const createTaxi = async (req, res) => {
  try {
    const taxi = new Taxi(req.body)   // cria objeto
    const savedTaxi = await taxi.save() // guarda na DB

    res.status(201).json(savedTaxi)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar táxi' })
  }
}



//deleteTaxi 
const deleteTaxi = async (req, res) => {
  try {
    const { id } = req.params

    const taxi = await Taxi.findById(id)

    // não existe
    if (!taxi) {
      return res.status(404).json({ error: 'Táxi não encontrado' })
    }

    // regra  (409)
    if (taxi.estado !== 'livre') {
      return res.status(409).json({
        error: 'Não pode remover táxi em uso ou reabastecimento'
      })
    }

    await Taxi.findByIdAndDelete(id)

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover táxi' })
  }
}

// updateTaxi
const updateTaxi = async (req, res) => {
  try {
    const { id } = req.params

    const updatedTaxi = await Taxi.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true } 
    )

    // não existe
    if (!updatedTaxi) {
      return res.status(404).json({ error: 'Táxi não encontrado' })
    }

    res.status(200).json(updatedTaxi)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar táxi' })
  }
}

module.exports = {
  getTaxis,
  createTaxi,
  deleteTaxi,   
  updateTaxi
}

