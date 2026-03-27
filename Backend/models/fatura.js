const mongoose = require('mongoose')

const faturaSchema = new mongoose.Schema({
  numero_sequencial: { type: Number, required: true, unique: true },
  data: { type: Date, default: Date.now },
  nome: { type: String },
  nif: { type: String },
  genero: { type: String, enum: ['m','f'] },
  id_viagem: { type: mongoose.Schema.Types.ObjectId, ref: 'viagem', required: true }
})

module.exports = mongoose.model('fatura', faturaSchema)