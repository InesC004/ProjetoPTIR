const mongoose = require('mongoose')

const reabastecimentoSchema = new mongoose.Schema({
  taxi_id: { type: mongoose.Schema.Types.ObjectId, ref: 'taxi', required: true },
  data_inicio: { type: Date, required: true },
  data_fim: { type: Date, required: true },
  km: { type: Number },
  euro: { type: Number },
  kwh: { type: Number },
  litro: { type: Number },
})

module.exports = mongoose.model('reabastecimento', reabastecimentoSchema)