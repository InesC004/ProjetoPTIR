const Taxi = require('../models/taxi')

// criar taxi (só gestores)
exports.create = async (req, res) => {
  try {
    const { matricula, modelo, marca, ano_compra, tipo_motor, nivel_conforto } = req.body

    // campos obrigatórios
    if (!matricula || !modelo || !marca || !ano_compra || !tipo_motor || !nivel_conforto) {
      return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' })
    }

    // validar matrícula portuguesa (ex: AA-00-AA ou 00-AA-00)
    if (!/^[A-Z]{2}-\d{2}-[A-Z]{2}$|^\d{2}-[A-Z]{2}-\d{2}$|^\d{2}-\d{2}-[A-Z]{2}$/.test(matricula)) {
      return res.status(400).json({ success: false, message: 'Matrícula inválida.' })
    }

    // validar ano
    const anoAtual = new Date().getFullYear()
    if (ano_compra < 1990 || ano_compra > anoAtual) {
      return res.status(400).json({ success: false, message: `Ano inválido. Deve ser entre 1990 e ${anoAtual}.` })
    }

    // verificar matrícula duplicada
    const existing = await Taxi.findOne({ matricula })
    if (existing) return res.status(409).json({ success: false, message: 'Matrícula já registada.' })

    const taxi = new Taxi({ matricula, modelo, marca, ano_compra, tipo_motor, nivel_conforto })
    await taxi.save()

    res.status(201).json({ success: true, message: 'Táxi criado com sucesso.', taxi })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro no servidor.' })
  }
}

// listar todos os taxis
exports.getTodos = async (req, res) => {
  try {
    const taxis = await Taxi.find()
    res.json(taxis)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// apagar taxi
exports.delete = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Taxi.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ success: false, message: 'Táxi não encontrado.' })
    res.status(200).json({ success: true, message: 'Táxi apagado com sucesso.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro no servidor.' })
  }
}


// listar taxis disponíveis (só os livres)
exports.getTaxisDisponiveis = async (req, res) => {
  try {
    const taxis = await Taxi.find({ estado: 'livre' })
    res.json(taxis)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}




// atualizar taxi
exports.update = async (req, res) => {
  try {
    const { id } = req.params
    const { matricula, modelo, marca, ano_compra, tipo_motor, nivel_conforto, estado } = req.body

    // validar matrícula se foi enviada
    if (matricula && !/^[A-Z]{2}-\d{2}-[A-Z]{2}$|^\d{2}-[A-Z]{2}-\d{2}$|^\d{2}-\d{2}-[A-Z]{2}$/.test(matricula)) {
      return res.status(400).json({ success: false, message: 'Matrícula inválida.' })
    }

    // validar ano se foi enviado
    if (ano_compra) {
      const anoAtual = new Date().getFullYear()
      if (ano_compra < 1990 || ano_compra > anoAtual) {
        return res.status(400).json({ success: false, message: `Ano inválido. Deve ser entre 1990 e ${anoAtual}.` })
      }
    }

    // verificar matrícula duplicada (exceto o próprio táxi)
    if (matricula) {
      const existing = await Taxi.findOne({ matricula, _id: { $ne: id } })
      if (existing) return res.status(409).json({ success: false, message: 'Matrícula já registada.' })
    }

    const taxi = await Taxi.findByIdAndUpdate(
      id,
      { matricula, modelo, marca, ano_compra, tipo_motor, nivel_conforto, estado },
      { new: true, runValidators: true }
    )

    if (!taxi) return res.status(404).json({ success: false, message: 'Táxi não encontrado.' })

    res.status(200).json({ success: true, message: 'Táxi atualizado com sucesso.', taxi })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Erro no servidor.' })
  }
}