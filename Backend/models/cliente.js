const mongoose = require('mongoose')

const clienteSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  nif: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  genero: { type: String },
  data_nascimento: { type: Date },
  morada: { type: String },
  codigo_postal: { type: String },
  password: { type: String, required: true }
})

module.exports = mongoose.model('cliente', clienteSchema)