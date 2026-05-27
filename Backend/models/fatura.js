const mongoose = require('mongoose')

const faturaSchema = new mongoose.Schema({
  numero_sequencial: { type: Number, required: true },
  ano: { type: Number, required: true },
  data: { type: Date, default: Date.now },
  nome_cliente: { type: String, required: true },
  nif_cliente: { type: String, required: true },
  genero_cliente: { type: String, required: true },
  valor: { type: Number, required: true },
  viagem_id: { type: mongoose.Schema.Types.ObjectId, ref: 'viagem', required: true },
  motorista_id: { type: mongoose.Schema.Types.ObjectId, ref: 'motorista', required: true }
}, { timestamps: true })

// número sequencial único por ano (restrição 21)
faturaSchema.index({ numero_sequencial: 1, ano: 1 }, { unique: true })

module.exports = mongoose.model('fatura', faturaSchema)
