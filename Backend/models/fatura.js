const mongoose = require('mongoose')

const faturaSchema = new mongoose.Schema({
  id_fatura: { type: String, required: true },
  numero_sequencial: { type: mongoose.Schema.Types.Int32, required: true },
  ano: { type: Number },
  data: { type: Date, default: Date.now },
  valor: { type: Number, required: true },
  viagem_id: { type: String, required: true },
  cliente_nif: { type: String, required: true },
  cliente_nome: { type: String, required: true },
  cliente_genero: { type: String, enum: ['feminino', 'masculino'], required: true },
  nome_cliente: { type: String },
  nif_cliente: { type: String },
  genero_cliente: { type: String },
  valor_total: { type: Number },
  data_emissao: { type: Date },
  motorista_id: { type: mongoose.Schema.Types.ObjectId, ref: 'motorista', required: true }
}, { timestamps: true })

// número sequencial único por ano (restrição 21)
faturaSchema.index({ numero_sequencial: 1, ano: 1 }, { unique: true })

module.exports = mongoose.model('fatura', faturaSchema)
