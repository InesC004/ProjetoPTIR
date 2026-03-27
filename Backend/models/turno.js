const mongoose = require('mongoose')

const turnoSchema = new mongoose.Schema({

  id_turno: { type: String, required: true, unique: true },
  motorista_nif: { type: String, required: true },
  taxi_matricula: { type: String ,  required: true },
  data_inicio: { type: Date, default: Date.now },
  data_fim: { type: Date },
})

module.exports = mongoose.model('turno', turnoSchema)
