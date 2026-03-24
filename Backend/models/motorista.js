const mongoose = require('mongoose')

const motoristaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  nif: { type: String, required: true, unique: true },
  genero: { type: String, enum: ['m', 'f', 'other'] },
  ano_nascimento: { type: Date },
  email: { type: String, required: true, unique: true },  
  morada: { type: String },
  senha_acesso: { type: String, required: true },

  // baseado na diagrama de pgp
  numero_carta_conducao: { type: String, required: true }
})

module.exports = mongoose.model('motorista', motoristaSchema)