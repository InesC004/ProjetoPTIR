const mongoose = require("mongoose");

const modeloTaxiSchema = new mongoose.Schema(
  {
    marca: { type: String, required: true },

    modelo: { type: String, required: true },

    ano_inicio: { type: Number, required: true },

    ano_fim: { type: Number },

    tipo_motor: {
      type: String,
      enum: ["eletrico", "combustao"],
      required: true,
    },

    nivel_conforto: {
      type: String,
      enum: ["basico", "luxuoso"],
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.models.modeloTaxi || mongoose.model("modeloTaxi", modeloTaxiSchema);