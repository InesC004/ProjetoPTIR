// models/pedido.js

const mongoose = require("mongoose");

const pedidoSchema = new mongoose.Schema(
  {
    cliente_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cliente",
      required: true,
    },

    motorista_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "motorista",
      default: null,
    },

    origem_morada: {
      type: String,
      required: true,
    },

    origem_lat: {
      type: Number,
      required: true,
    },

    origem_lng: {
      type: Number,
      required: true,
    },

    destino_morada: {
      type: String,
      required: true,
    },

    destino_lat: {
      type: Number,
      required: true,
    },

    destino_lng: {
      type: Number,
      required: true,
    },

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
      enum: [
        "pendente",
        "aceite",
        "confirmado",
        "em_viagem",
        "concluido",
        "cancelado",
      ],
      default: "pendente",
    },

    viagem_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "viagem",
      default: null,
    },
    data_inicio_viagem: {
  type: Date,
  
    },

    data_fim_viagem: {
      type: Date,
    },

    morada_fim: {
      type: String,
    },

    quilometros_percorridos: {
      type: Number,
    },

    duracao_minutos: {
      type: Number,
    },

    preco_final: {
      type: Number,
    },

    pagamento_estado: {
      type: String,
      enum: ["pendente", "pago"],
      default: "pendente",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("pedido", pedidoSchema);
