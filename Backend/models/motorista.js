const mongoose = require('mongoose')

const motoristaSchema = new mongoose.Schema({
  auth0id: { type: String, required: true, unique: true },
  nif: { type: String, required: true },
  nome: { type: String, required: true },
  genero: { type: String, enum: ['m', 'f'] },
  ano_nascimento: { type: Number },
  morada: { type: String },
  numero_carta_conducao: { type: String },
})

module.exports = mongoose.model('motorista', motoristaSchema)