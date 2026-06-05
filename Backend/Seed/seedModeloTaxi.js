const mongoose = require("mongoose");
require("dotenv").config();

const ModeloTaxi = require("../models/modeloTaxi");

const dados = [
  {
    marca: "Mercedes",
    modelo: "Classe A",
    ano_inicio: 2018,
    ano_fim: 2026,
    tipo_motor: "combustao",
    nivel_conforto: "basico",
  },
  {
    marca: "Mercedes",
    modelo: "Classe E",
    ano_inicio: 2016,
    ano_fim: 2026,
    tipo_motor: "combustao",
    nivel_conforto: "luxuoso",
  },
  {
    marca: "BMW",
    modelo: "Série 3",
    ano_inicio: 2017,
    ano_fim: 2026,
    tipo_motor: "combustao",
    nivel_conforto: "luxuoso",
  },
  {
    marca: "Tesla",
    modelo: "Model 3",
    ano_inicio: 2019,
    ano_fim: 2026,
    tipo_motor: "eletrico",
    nivel_conforto: "luxuoso",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await ModeloTaxi.deleteMany({});
    const resultado = await ModeloTaxi.insertMany(dados);

    console.log(`${resultado.length} modelos inseridos com sucesso`);
  } catch (err) {
    console.error("Erro:", err);
  } finally {
    await mongoose.connection.close();
  }
}

seed();
