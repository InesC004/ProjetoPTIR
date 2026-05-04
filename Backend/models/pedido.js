const mongoose = require('mongoose')

const pedidoSchema = new mongoose.Schema({
  cliente_id: { type: mongoose.Schema.Types.ObjectId, ref: 'cliente', required: true },
  motorista_id: { type: mongoose.Schema.Types.ObjectId, ref: 'motorista', default: null },
  
  origem_morada: { type: String, required: true },
  origem_lat: { type: Number },
  origem_lng: { type: Number },

  destino_morada: { type: String },
  destino_lat: { type: Number },
  destino_lng: { type: Number },

  numero_pessoas: { type: Number, required: true, min: 1, max: 4 },
  nivel_conforto: { type: String, enum: ['basico', 'luxuoso'], required: true },

  estado: { 
    type: String, 
    enum: ['pendente', 'aceite', 'confirmado', 'rejeitado', 'cancelado', 'concluido'], 
    default: 'pendente'
  },
}, { timestamps: true })

module.exports = mongoose.model('pedido', pedidoSchema)
