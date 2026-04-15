const Reabastecimento = require('../models/reabastecimento')
const Turno = require('../models/turno')
const Taxi = require('../models/taxi')

exports.create = async (req, res) => {
  try {
    const { turno_id, data_inicio, data_fim, quilometros, euros, litros, kwh } = req.body
    const motorista_id = req.user.id

    if (!turno_id || !data_inicio || !data_fim || quilometros == null || euros == null) {
      return res.status(400).json({ message: 'Campos obrigatórios.' })
    }

    const inicio = new Date(data_inicio)
    const fim = new Date(data_fim)

    if (fim <= inicio) {
      return res.status(400).json({ message: 'Data de início tem de ser anterior à data de fim.' })
    }

    if (euros <= 0) return res.status(400).json({ message: 'Euros têm de ser positivos.' })
    if (quilometros <= 0) return res.status(400).json({ message: 'Quilómetros têm de ser positivos.' })

    const turno = await Turno.findById(turno_id).populate('taxi')
    if (!turno) return res.status(404).json({ message: 'Turno não encontrado.' })

    if (turno.motorista.toString() !== motorista_id) {
      return res.status(403).json({ message: 'Turno não é teu.' })
    }

    const taxi = turno.taxi

    const conflitoReabastecimento = await Reabastecimento.findOne({
      taxi: taxi._id,
      data_inicio: { $lt: fim },
      data_fim: { $gt: inicio }
    })

    if (conflitoReabastecimento) {
      return res.status(409).json({ message: 'Táxi já está em reabastecimento nesse período.' })
    }

    if (taxi.tipo_motor === 'combustao') {
      if (!litros || litros <= 0) {
        return res.status(400).json({ message: 'Litros têm de ser positivos.' })
      }

      if (inicio < turno.data_inicio || fim > turno.data_fim) {
        return res.status(400).json({ message: 'Reabastecimento tem de estar dentro do período do turno.' })
      }
    }

    if (taxi.tipo_motor === 'eletrico') {
      if (!kwh || kwh <= 0) {
        return res.status(400).json({ message: 'kWh têm de ser positivos.' })
      }

      if (inicio < turno.data_inicio || inicio > turno.data_fim) {
        return res.status(400).json({ message: 'Início do carregamento tem de estar dentro do período do turno.' })
      }
    }

    const ultimo = await Reabastecimento.findOne({ taxi: taxi._id })
      .sort({ data_inicio: -1 })

    if (ultimo && quilometros <= ultimo.quilometros) {
      return res.status(400).json({ message: 'Quilómetros têm de ser superiores ao último reabastecimento.' })
    }

    const r = new Reabastecimento({
      turno: turno_id,
      taxi: taxi._id,
      data_inicio: inicio,
      data_fim: fim,
      quilometros,
      euros,
      litros: taxi.tipo_motor === 'combustao' ? litros : undefined,
      kwh: taxi.tipo_motor === 'eletrico' ? kwh : undefined
    })

    await r.save()

    const populated = await r.populate([
      { path: 'turno' },
      { path: 'taxi', select: 'matricula marca modelo tipo_motor' }
    ])

    res.status(201).json(populated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// listar reabastecimentos de um táxi ordenados por data descendente
exports.getByTaxi = async (req, res) => {
  try {
    const reabastecimentos = await Reabastecimento.find({ taxi: req.params.taxi_id })
      .populate('turno', 'data_inicio data_fim')
      .sort({ data_inicio: -1 })

    res.json(reabastecimentos)
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor' })
  }
}

// listar reabastecimentos de um turno
exports.getByTurno = async (req, res) => {
  try {
    const reabastecimentos = await Reabastecimento.find({ turno: req.params.turno_id })
      .sort({ data_inicio: -1 })

    res.json(reabastecimentos)
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor' })
  }
}