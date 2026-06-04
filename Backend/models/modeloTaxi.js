const mongoose = require("mongoose");

const modeloTaxiSchema = new mongoose.Schema(
  {
    marca: { type: String, required: true },
    modelo: { type: String, required: true },
    ano_inicio: { type: Number, required: true },
    ano_fim: { type: Number },
  },
  { timestamps: true },
);

module.exports = mongoose.model("modeloTaxi", modeloTaxiSchema);