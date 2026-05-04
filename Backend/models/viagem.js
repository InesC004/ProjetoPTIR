const mongoose = require('mongoose')

const viagemSchema = new mongoose.Schema({
  turno_id: { type: mongoose.Schema.Types.ObjectId, ref: 'turno' },
  cliente_id: { type: mongoose.Schema.Types.ObjectId, ref: 'cliente', required: true },
  motorista_id: { type: mongoose.Schema.Types.ObjectId, ref: 'motorista' },
  taxi_id: { type: mongoose.Schema.Types.ObjectId, ref: 'taxi' },
  data_inicio: { type: Date },
  data_fim: { type: Date },
  morada_entrada: { type: String },
  morada_saida: { type: String },
  km: { type: Number },
  numero_pessoas: { type: Number, required: true },
  preco_total: { type: Number },
})

module.exports = mongoose.model('viagem', viagemSchema)