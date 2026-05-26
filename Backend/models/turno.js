const mongoose = require('mongoose')

const turnoSchema = new mongoose.Schema({
  motorista: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'motorista',
    required: true
  },

  taxi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'taxi',
    required: true
  },

  data_inicio: {
    type: Date,
    required: true
  },

  data_fim: {
    type: Date,
    required: true
  }
}, { timestamps: true })

module.exports = mongoose.model('turno', turnoSchema)