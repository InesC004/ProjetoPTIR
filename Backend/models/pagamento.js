const mongoose = require('mongoose')

const pagamentoSchema = new mongoose.Schema({
  viagem_id: { type: mongoose.Schema.Types.ObjectId, ref: 'viagem', required: true },
  cliente_id: { type: mongoose.Schema.Types.ObjectId, ref: 'cliente', required: true },
  metodo: { type: String, enum: ['dinheiro','cartao','multibanco','mbway'], required: true },
  valor: { type: Number, required: true },
  data_pagamento: { type: Date, default: Date.now },
  estado: { type: String, enum: ['pendente', 'confirmado', 'falhado'], default: 'pendente' },
  stripe_payment_intent_id: { type: String },
  stripe_charge_id: { type: String },
  stripe_error: { type: String }
}, { timestamps: true })

module.exports = mongoose.model('pagamento', pagamentoSchema)
