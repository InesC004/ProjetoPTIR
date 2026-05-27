const mongoose = require("mongoose");

const viagemSchema = new mongoose.Schema(
  {
    pedido_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pedido",
      required: true,
    },

    turno_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "turno",
    },

    cliente_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cliente",
      required: true,
    },

    motorista_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "motorista",
      required: true,
    },

    taxi_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "taxi",
    },

    origem_morada: {
      type: String,
      required: true,
    },
    origem_lat: Number,
    origem_lng: Number,

    destino_morada: {
      type: String,
      required: true,
    },
    destino_lat: Number,
    destino_lng: Number,

    numero_pessoas: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },

    nivel_conforto: {
      type: String,
      enum: ["basico", "luxuoso"],
      required: true,
    },

    estado: {
      type: String,
      enum: ["a_decorrer", "concluida", "cancelada"],
      default: "a_decorrer",
    },

    pagamento_estado: {
      type: String,
      enum: ["pendente", "pago"],
      default: "pendente",
    },

    data_inicio: {
      type: Date,
      default: Date.now,
    },

    data_fim: Date,

    km: Number,

    preco_total: Number,
  },
  { timestamps: true },
);

module.exports = mongoose.model("viagem", viagemSchema);
