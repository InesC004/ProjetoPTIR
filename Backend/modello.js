const mongoose = require("mongoose");
const ModeloTaxi = require("./models/modeloTaxi");

mongoose.connect("mongodb://localhost:27017/NOME_DA_TUA_BD");

const dados = [
  { marca: "Mercedes", modelo: "Classe A", ano_inicio: 2018, ano_fim: 2026 },
  { marca: "Mercedes", modelo: "Classe E", ano_inicio: 2016, ano_fim: 2026 },
  { marca: "BMW", modelo: "Série 3", ano_inicio: 2017, ano_fim: 2026 },
  { marca: "Tesla", modelo: "Model 3", ano_inicio: 2019, ano_fim: 2026 },
];

async function seed() {
  await ModeloTaxi.deleteMany();
  await ModeloTaxi.insertMany(dados);
  console.log("Modelos inseridos com sucesso");
  mongoose.connection.close();
}

seed();
