const mongoose = require('mongoose')

const clienteSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  nif: { type: String, required: true, unique: true },
  genero: { type: String },
  data_nascimento: { type: Date },
  morada: { type: String },
  codigo_postal: { type: String }
})

module.exports = mongoose.model('cliente', clienteSchema)