const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Cliente = require("../models/cliente");
require("dotenv").config({ path: "../.env" });

const MONGO_URI = process.env.MONGO_URI;

async function seed() {
  await mongoose.connect(MONGO_URI);

  const clientes = [];

  for (let i = 0; i < 10; i++) {
    clientes.push({
      nome: faker.person.fullName(),
      nif: String(100000000 + i),
      email: `cliente${i}@email.com`,
      genero: faker.helpers.arrayElement(["Masculino", "Feminino"]),
      data_nascimento: faker.date.birthdate(),
      morada: faker.location.streetAddress() + ", Lisboa",
      codigo_postal: `${faker.number.int({ min: 1000, max: 9999 })}-${faker.number.int({ min: 100, max: 999 })}`,
      password: "$2b$10$R6Oo1zpXUPo2EEkq0/tIPeHGRzcgVmZiawraF/1nCgnU9kFNaeop.",
    });
  }

  await Cliente.insertMany(clientes);

  console.log(`${clientes.length} clientes inseridos!`);

  await mongoose.disconnect();
}

seed().catch(console.error);
