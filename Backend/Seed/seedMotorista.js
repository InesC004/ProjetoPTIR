const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Cliente = require("../models/motorista");
require("dotenv").config({ path: "../.env" });

const MONGO_URI = process.env.MONGO_URI;

async function seed() {
  await mongoose.connect(MONGO_URI);

  const faturas = [];
  /* 
 Colocar o esquema e as regras aqui... ter cuidado com as regras do enunciado nao colocar a toa


   */
  await Cliente.insertMany(clientes);

  console.log(`${clientes.length} clientes inseridos!`);

  await mongoose.disconnect();
}

seed().catch(console.error);
