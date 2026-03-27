const mongoose = require('mongoose')

const taxiSchema = new mongoose.Schema({
  matricula: { type: String, required: true, unique: true },
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  ano_compra: { type: Number, required: true },
  tipo_motor: { type: String, enum: ['eletrico', 'combustao'], required: true },
  nivel_conforto: { type: String, enum: ['basico', 'luxuoso'], required: true },
  estado: { type: String, enum: ['livre', 'em_uso', 'em_reabastecimento'], default: 'livre' }
},
{ timestamps: true }) 

module.exports = mongoose.model('taxi', taxiSchema)