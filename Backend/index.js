const express = require("express"); // cria servidor web APIs
const mongoose = require("mongoose"); // cria ligação a base de dados
const cors = require("cors"); // Middleware para permitir comunicação entre o frontend (React) e este backend (Node.js)
require("dotenv").config(); // Carrega as variáveis do ficheiro process.env

const app = express();

// Middlewares
app.use(cors()); // Permite que o frontend (React) comunique com este backend
app.use(express.json()); // Permite que o servidor perceba dados enviados em formato JSON

// Ligação à Base de Dados MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Ligado ao MongoDB Atlas com sucesso!");
  })
  .catch((erro) => {
    console.log(" Erro ao ligar à base de dados:", erro.message);
  });

// Teste simples
app.get("/", (req, res) => {
  res.send("O servidor Backend PTIR está a funcionar!");
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Servidor a correr na porta ${PORT}`);
});
