const mongoose = require('mongoose')

const gestorSchema = new mongoose.Schema({
  auth0id: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  nome: { type: String },
})

module.exports = mongoose.model('gestor', gestorSchema)