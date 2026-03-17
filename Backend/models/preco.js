const mongoose = require('mongoose')

const precoSchema = new mongoose.Schema({
  nivel_conforto: { type: String, enum: ['basico','luxuoso'], required: true },
  preco_minuto: { type: Number, required: true },
  acrescimo_noturno: { type: Number, default: 0 } 
})

module.exports = mongoose.model('preco', precoSchema)