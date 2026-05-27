const mongoose = require('mongoose');

const faturaSchema = new mongoose.Schema({
  numero_fatura: { type: String, required: true, unique: true }, // Ex: FAT-2026/1
  viagem_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Viagem', required: true, unique: true }, // Critério C: Apenas uma por viagem
  cliente_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  motorista_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Motorista', required: true },
  nif_cliente: { type: String, required: true }, // Restrição 12
  valor_total: { type: Number, required: true }, // Restrição 20
  data_emissao: { type: Date, default: Date.now } // Restrição 8
});

module.exports = mongoose.model('Fatura', faturaSchema);