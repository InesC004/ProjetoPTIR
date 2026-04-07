const mongoose = require('mongoose')

const reabastecimentoSchema = new mongoose.Schema({
  turno: { type: mongoose.Schema.Types.ObjectId, ref: 'turno', required: true },
  taxi: { type: mongoose.Schema.Types.ObjectId, ref: 'taxi', required: true },
  data_inicio: { type: Date, required: true },
  data_fim: { type: Date, required: true },
  quilometros: { type: Number, required: true },
  euros: { type: Number, required: true },
  // só um dos dois é preenchido dependendo do tipo de motor
  litros: { type: Number },
  kwh: { type: Number }
},
{ timestamps: true })

module.exports = mongoose.model('reabastecimento', reabastecimentoSchema)