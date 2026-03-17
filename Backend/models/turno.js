const mongoose = require('mongoose')

const turnoSchema = new mongoose.Schema({
  motorista_id: { type: mongoose.Schema.Types.ObjectId, ref: 'motorista', required: true },
  taxi_id: { type: mongoose.Schema.Types.ObjectId, ref: 'taxi', required: true },
  data_inicio: { type: Date, default: Date.now },
  data_fim: { type: Date },
})

module.exports = mongoose.model('turno', turnoSchema)