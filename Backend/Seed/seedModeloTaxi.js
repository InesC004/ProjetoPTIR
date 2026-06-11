const mongoose = require("mongoose");
require("dotenv").config();

const ModeloTaxi = require("../models/modeloTaxi");

const dados = [
  {
    marca: "Mercedes",
    modelo: "Classe A",
    ano: 2018,
    tipo_motor: "combustao",
    nivel_conforto: "basico",
  },
  {
    marca: "Mercedes",
    modelo: "Classe E",
    ano: 2016,
    tipo_motor: "combustao",
    nivel_conforto: "luxuoso",
  },
  {
    marca: "BMW",
    modelo: "Serie 3",
    ano: 2017,
    tipo_motor: "combustao",
    nivel_conforto: "luxuoso",
  },
  {
    marca: "Tesla",
    modelo: "Model 3",
    ano: 2019,
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
