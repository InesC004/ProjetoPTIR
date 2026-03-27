const mongoose = require('mongoose')

const pagamentoSchema = new mongoose.Schema({
  viagem_id: { type: mongoose.Schema.Types.ObjectId, ref: 'viagem', required: true },
  metodo: { type: String, enum: ['dinheiro','cartao','multibanco','mbway'], required: true },
  valor: { type: Number, required: true },
  data_pagamento: { type: Date, default: Date.now }
})

module.exports = mongoose.model('pagamento', pagamentoSchema)