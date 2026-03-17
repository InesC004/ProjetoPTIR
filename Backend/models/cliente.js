const mongoose = require('mongoose')

const clienteSchema = new mongoose.Schema({
  auth0id: { type: String, required: true, unique: true },
  nome: { type: String, required: true },
  email: { type: String, required: true },
  morada: { type: String },
})

module.exports = mongoose.model('cliente', clienteSchema)