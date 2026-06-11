const mongoose = require("mongoose");

const motoristaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  nif: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  numero_carta: { type: String, required: true, unique: true },
  genero: { type: String },
  data_nascimento: { type: Date },
  morada: { type: String },
  codigo_postal: { type: String },
  avaliacao_media: { type: Number, default: 0 },
  total_avaliacoes: { type: Number, default: 0 },
  //coordenadas
  //ligações schemas,modelo de morada
});

module.exports = mongoose.model("motorista", motoristaSchema);
