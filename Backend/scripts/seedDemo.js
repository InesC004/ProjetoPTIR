const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const Cliente = require("../models/cliente");
const Gestor = require("../models/gestor");
const Motorista = require("../models/motorista");
const ModeloTaxi = require("../models/modeloTaxi");
const Taxi = require("../models/taxi");
const Preco = require("../models/preco");
const Turno = require("../models/turno");
const Reabastecimento = require("../models/reabastecimento");
const Pedido = require("../models/pedido");
const Viagem = require("../models/viagem");
const Pagamento = require("../models/pagamento");
const Fatura = require("../models/fatura");

const MONGO_URI = process.env.MONGO_URI;
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10);
const PASSWORD_DEMO = "Teste1234";

function dataHoje(hora, minuto = 0) {
  const data = new Date();
  data.setHours(hora, minuto, 0, 0);
  return data;
}

function dataAmanha(hora, minuto = 0) {
  const data = dataHoje(hora, minuto);
  data.setDate(data.getDate() + 1);
  return data;
}

async function upsert(Model, filtro, dados) {
  return Model.findOneAndUpdate(
    filtro,
    { $set: dados },
    { new: true, upsert: true, runValidators: true },
  );
}

async function seed() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI nao esta definido no Backend/.env");
  }

  await mongoose.connect(MONGO_URI);

  const password = await bcrypt.hash(PASSWORD_DEMO, SALT_ROUNDS);

  const gestor = await upsert(
    Gestor,
    { nif: "900000001" },
    {
      nome: "Gestor Demo",
      nif: "900000001",
      email: "gestor.demo@takecab.pt",
      password,
    },
  );

  const clientes = await Promise.all([
    upsert(Cliente, { nif: "200000001" }, {
      nome: "Ana Cliente",
      nif: "200000001",
      email: "ana.cliente@takecab.pt",
      genero: "feminino",
      data_nascimento: new Date("1994-04-12"),
      morada: "Avenida da Liberdade, Lisboa",
      codigo_postal: "1250-096",
      password,
    }),
    upsert(Cliente, { nif: "200000002" }, {
      nome: "Bruno Cliente",
      nif: "200000002",
      email: "bruno.cliente@takecab.pt",
      genero: "masculino",
      data_nascimento: new Date("1988-09-22"),
      morada: "Rua de Santa Catarina, Porto",
      codigo_postal: "4000-447",
      password,
    }),
    upsert(Cliente, { nif: "200000003" }, {
      nome: "Carla Cliente",
      nif: "200000003",
      email: "carla.cliente@takecab.pt",
      genero: "feminino",
      data_nascimento: new Date("1991-02-05"),
      morada: "Praca do Comercio, Lisboa",
      codigo_postal: "1100-148",
      password,
    }),
  ]);

  const motoristas = await Promise.all([
    upsert(Motorista, { nif: "300000001" }, {
      nome: "Miguel Motorista",
      nif: "300000001",
      email: "miguel.motorista@takecab.pt",
      password,
      numero_carta: "CARTA-DEMO-001",
      genero: "masculino",
      data_nascimento: new Date("1985-06-10"),
      morada: "Rua do Alecrim, Lisboa",
      codigo_postal: "1200-014",
      avaliacao_media: 4.7,
      total_avaliacoes: 3,
    }),
    upsert(Motorista, { nif: "300000002" }, {
      nome: "Sofia Motorista",
      nif: "300000002",
      email: "sofia.motorista@takecab.pt",
      password,
      numero_carta: "CARTA-DEMO-002",
      genero: "feminino",
      data_nascimento: new Date("1990-11-18"),
      morada: "Avenida dos Aliados, Porto",
      codigo_postal: "4000-064",
      avaliacao_media: 4.9,
      total_avaliacoes: 5,
    }),
    upsert(Motorista, { nif: "300000003" }, {
      nome: "Rui Motorista",
      nif: "300000003",
      email: "rui.motorista@takecab.pt",
      password,
      numero_carta: "CARTA-DEMO-003",
      genero: "masculino",
      data_nascimento: new Date("1982-01-30"),
      morada: "Rua da Boavista, Porto",
      codigo_postal: "4050-102",
      avaliacao_media: 0,
      total_avaliacoes: 0,
    }),
  ]);

  const modelos = await Promise.all([
    upsert(ModeloTaxi, { marca: "Toyota", modelo: "Corolla", ano: 2021 }, {
      marca: "Toyota",
      modelo: "Corolla",
      ano: 2021,
      ano_inicio: 2019,
      ano_fim: 2027,
      tipo_motor: "combustao",
      nivel_conforto: "basico",
    }),
    upsert(ModeloTaxi, { marca: "Mercedes", modelo: "Classe E", ano: 2022 }, {
      marca: "Mercedes",
      modelo: "Classe E",
      ano: 2022,
      ano_inicio: 2020,
      ano_fim: 2030,
      tipo_motor: "combustao",
      nivel_conforto: "luxuoso",
    }),
    upsert(ModeloTaxi, { marca: "Tesla", modelo: "Model 3", ano: 2023 }, {
      marca: "Tesla",
      modelo: "Model 3",
      ano: 2023,
      ano_inicio: 2021,
      ano_fim: 2029,
      tipo_motor: "eletrico",
      nivel_conforto: "luxuoso",
    }),
  ]);

  const taxis = await Promise.all([
    upsert(Taxi, { matricula: "AA-11-AA" }, {
      matricula: "AA-11-AA",
      marca: "Toyota",
      modelo: "Corolla",
      ano_compra: 2021,
      tipo_motor: "combustao",
      nivel_conforto: "basico",
      estado: "livre",
    }),
    upsert(Taxi, { matricula: "BB-22-BB" }, {
      matricula: "BB-22-BB",
      marca: "Mercedes",
      modelo: "Classe E",
      ano_compra: 2022,
      tipo_motor: "combustao",
      nivel_conforto: "luxuoso",
      estado: "livre",
    }),
    upsert(Taxi, { matricula: "CC-33-CC" }, {
      matricula: "CC-33-CC",
      marca: "Tesla",
      modelo: "Model 3",
      ano_compra: 2023,
      tipo_motor: "eletrico",
      nivel_conforto: "luxuoso",
      estado: "livre",
    }),
  ]);

  const precos = await Promise.all([
    upsert(Preco, { nivel_conforto: "basico" }, {
      nivel_conforto: "basico",
      preco_minuto: 0.75,
      acrescimo_noturno: 0.15,
    }),
    upsert(Preco, { nivel_conforto: "luxuoso" }, {
      nivel_conforto: "luxuoso",
      preco_minuto: 1.2,
      acrescimo_noturno: 0.25,
    }),
  ]);

  const turnos = await Promise.all([
    upsert(Turno, {
      motorista: motoristas[0]._id,
      taxi: taxis[0]._id,
      data_inicio: dataHoje(8),
    }, {
      motorista: motoristas[0]._id,
      taxi: taxis[0]._id,
      data_inicio: dataHoje(8),
      data_fim: dataHoje(16),
    }),
    upsert(Turno, {
      motorista: motoristas[1]._id,
      taxi: taxis[2]._id,
      data_inicio: dataHoje(10),
    }, {
      motorista: motoristas[1]._id,
      taxi: taxis[2]._id,
      data_inicio: dataHoje(10),
      data_fim: dataHoje(18),
    }),
    upsert(Turno, {
      motorista: motoristas[2]._id,
      taxi: taxis[1]._id,
      data_inicio: dataAmanha(9),
    }, {
      motorista: motoristas[2]._id,
      taxi: taxis[1]._id,
      data_inicio: dataAmanha(9),
      data_fim: dataAmanha(17),
    }),
  ]);

  const reabastecimentos = await Promise.all([
    upsert(Reabastecimento, {
      taxi: taxis[0]._id,
      data_inicio: dataHoje(12),
    }, {
      turno: turnos[0]._id,
      taxi: taxis[0]._id,
      data_inicio: dataHoje(12),
      data_fim: dataHoje(12, 20),
      quilometros: 245.4,
      euros: 68.5,
      litros: 42.3,
      kwh: undefined,
    }),
    upsert(Reabastecimento, {
      taxi: taxis[2]._id,
      data_inicio: dataHoje(14),
    }, {
      turno: turnos[1]._id,
      taxi: taxis[2]._id,
      data_inicio: dataHoje(14),
      data_fim: dataHoje(15),
      quilometros: 310,
      euros: 31.2,
      litros: undefined,
      kwh: 54.6,
    }),
    upsert(Reabastecimento, {
      taxi: taxis[2]._id,
      data_inicio: dataHoje(16),
    }, {
      turno: turnos[1]._id,
      taxi: taxis[2]._id,
      data_inicio: dataHoje(16),
      data_fim: dataHoje(16, 45),
      quilometros: 120,
      euros: 19.8,
      litros: undefined,
      kwh: 32.1,
    }),
  ]);

  const pedidos = await Promise.all([
    upsert(Pedido, {
      cliente_id: clientes[0]._id,
      origem_morada: "Avenida da Liberdade, Lisboa",
      destino_morada: "Aeroporto Humberto Delgado, Lisboa",
    }, {
      cliente_id: clientes[0]._id,
      motorista_id: motoristas[0]._id,
      origem_morada: "Avenida da Liberdade, Lisboa",
      origem_lat: 38.7201,
      origem_lng: -9.1459,
      destino_morada: "Aeroporto Humberto Delgado, Lisboa",
      destino_lat: 38.7742,
      destino_lng: -9.1342,
      numero_pessoas: 2,
      nivel_conforto: "basico",
      estado: "concluido",
      data_inicio_viagem: dataHoje(9, 10),
      data_fim_viagem: dataHoje(9, 35),
      quilometros_percorridos: 7.8,
      duracao_minutos: 25,
      preco_final: 18.75,
      pagamento_estado: "pago",
    }),
    upsert(Pedido, {
      cliente_id: clientes[1]._id,
      origem_morada: "Marques de Pombal, Lisboa",
      destino_morada: "Parque das Nacoes, Lisboa",
    }, {
      cliente_id: clientes[1]._id,
      motorista_id: motoristas[1]._id,
      origem_morada: "Marques de Pombal, Lisboa",
      origem_lat: 38.7253,
      origem_lng: -9.1502,
      destino_morada: "Parque das Nacoes, Lisboa",
      destino_lat: 38.7676,
      destino_lng: -9.0991,
      numero_pessoas: 1,
      nivel_conforto: "luxuoso",
      estado: "concluido",
      data_inicio_viagem: dataHoje(11, 15),
      data_fim_viagem: dataHoje(11, 52),
      quilometros_percorridos: 10.5,
      duracao_minutos: 37,
      preco_final: 44.4,
      pagamento_estado: "pago",
    }),
    upsert(Pedido, {
      cliente_id: clientes[2]._id,
      origem_morada: "Cais do Sodre, Lisboa",
      destino_morada: "Belem, Lisboa",
    }, {
      cliente_id: clientes[2]._id,
      motorista_id: null,
      origem_morada: "Cais do Sodre, Lisboa",
      origem_lat: 38.706,
      origem_lng: -9.145,
      destino_morada: "Belem, Lisboa",
      destino_lat: 38.6968,
      destino_lng: -9.2065,
      numero_pessoas: 3,
      nivel_conforto: "basico",
      estado: "pendente",
      pagamento_estado: "pendente",
    }),
  ]);

  const viagens = await Promise.all([
    upsert(Viagem, { pedido_id: pedidos[0]._id }, {
      pedido_id: pedidos[0]._id,
      turno_id: turnos[0]._id,
      cliente_id: clientes[0]._id,
      motorista_id: motoristas[0]._id,
      taxi_id: taxis[0]._id,
      origem_morada: pedidos[0].origem_morada,
      origem_lat: pedidos[0].origem_lat,
      origem_lng: pedidos[0].origem_lng,
      destino_morada: pedidos[0].destino_morada,
      destino_lat: pedidos[0].destino_lat,
      destino_lng: pedidos[0].destino_lng,
      numero_pessoas: pedidos[0].numero_pessoas,
      nivel_conforto: pedidos[0].nivel_conforto,
      estado: "concluida",
      pagamento_estado: "pago",
      data_inicio: dataHoje(9, 10),
      data_fim: dataHoje(9, 35),
      km: 7.8,
      preco_total: 18.75,
      avaliacao_motorista: {
        nota: 5,
        comentario: "Motorista pontual e profissional.",
        cliente_id: clientes[0]._id,
        data: dataHoje(10),
      },
    }),
    upsert(Viagem, { pedido_id: pedidos[1]._id }, {
      pedido_id: pedidos[1]._id,
      turno_id: turnos[1]._id,
      cliente_id: clientes[1]._id,
      motorista_id: motoristas[1]._id,
      taxi_id: taxis[2]._id,
      origem_morada: pedidos[1].origem_morada,
      origem_lat: pedidos[1].origem_lat,
      origem_lng: pedidos[1].origem_lng,
      destino_morada: pedidos[1].destino_morada,
      destino_lat: pedidos[1].destino_lat,
      destino_lng: pedidos[1].destino_lng,
      numero_pessoas: pedidos[1].numero_pessoas,
      nivel_conforto: pedidos[1].nivel_conforto,
      estado: "concluida",
      pagamento_estado: "pago",
      data_inicio: dataHoje(11, 15),
      data_fim: dataHoje(11, 52),
      km: 10.5,
      preco_total: 44.4,
      avaliacao_motorista: {
        nota: 5,
        comentario: "Carro limpo e viagem confortavel.",
        cliente_id: clientes[1]._id,
        data: dataHoje(12),
      },
    }),
  ]);

  await Promise.all([
    Pedido.findByIdAndUpdate(pedidos[0]._id, { viagem_id: viagens[0]._id }),
    Pedido.findByIdAndUpdate(pedidos[1]._id, { viagem_id: viagens[1]._id }),
  ]);

  const pagamentos = await Promise.all([
    upsert(Pagamento, { viagem_id: viagens[0]._id }, {
      viagem_id: viagens[0]._id,
      cliente_id: clientes[0]._id,
      metodo: "cartao",
      valor: 18.75,
      data_pagamento: dataHoje(9, 36),
      estado: "confirmado",
      stripe_payment_intent_id: "pi_demo_001",
    }),
    upsert(Pagamento, { viagem_id: viagens[1]._id }, {
      viagem_id: viagens[1]._id,
      cliente_id: clientes[1]._id,
      metodo: "mbway",
      valor: 44.4,
      data_pagamento: dataHoje(11, 53),
      estado: "confirmado",
      stripe_payment_intent_id: "pi_demo_002",
    }),
  ]);

  const ano = new Date().getFullYear();
  const faturas = await Promise.all([
    upsert(Fatura, { numero_sequencial: 9001, ano }, {
      id_fatura: `DEMO-${ano}-9001`,
      numero_sequencial: 9001,
      ano,
      data: dataHoje(9, 37),
      valor: 18.75,
      viagem_id: viagens[0]._id.toString(),
      cliente_nif: clientes[0].nif,
      cliente_nome: clientes[0].nome,
      cliente_genero: "feminino",
      nome_cliente: clientes[0].nome,
      nif_cliente: clientes[0].nif,
      genero_cliente: "feminino",
      valor_total: 18.75,
      data_emissao: dataHoje(9, 37),
      motorista_id: motoristas[0]._id,
    }),
    upsert(Fatura, { numero_sequencial: 9002, ano }, {
      id_fatura: `DEMO-${ano}-9002`,
      numero_sequencial: 9002,
      ano,
      data: dataHoje(11, 54),
      valor: 44.4,
      viagem_id: viagens[1]._id.toString(),
      cliente_nif: clientes[1].nif,
      cliente_nome: clientes[1].nome,
      cliente_genero: "masculino",
      nome_cliente: clientes[1].nome,
      nif_cliente: clientes[1].nif,
      genero_cliente: "masculino",
      valor_total: 44.4,
      data_emissao: dataHoje(11, 54),
      motorista_id: motoristas[1]._id,
    }),
  ]);

  console.log("Seed demo concluido.");
  console.table({
    gestor: 1,
    clientes: clientes.length,
    motoristas: motoristas.length,
    modelos: modelos.length,
    taxis: taxis.length,
    precos: precos.length,
    turnos: turnos.length,
    reabastecimentos: reabastecimentos.length,
    pedidos: pedidos.length,
    viagens: viagens.length,
    pagamentos: pagamentos.length,
    faturas: faturas.length,
  });
  console.log(`Password demo para gestor/clientes/motoristas: ${PASSWORD_DEMO}`);
  console.log(`Gestor demo: NIF ${gestor.nif}`);
}

seed()
  .catch((err) => {
    console.error("Erro ao inserir dados demo:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
