require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const os = require("os");
const HOSTNAME = os.hostname();

// Importar rotas
const clientesRoutes = require("./routes/clientes");
const gestoresRoutes = require("./routes/gestores");
const taxisRoutes = require("./routes/taxis");
const motoristasRoutes = require("./routes/motoristas");
const turnosRoutes = require("./routes/turnos");
const reabastecimentosRoutes = require("./routes/reabastecimentos");
const precosRoutes = require("./routes/precos");
const pedidosRoutes = require("./routes/pedidos");
const viagensRoutes = require("./routes/viagens");
const pagamentosRoutes = require("./routes/pagamentos");
const webhooksRoutes = require("./routes/webhooks");
const relatoriosRoutes = require('./routes/relatorios')
const faturasRoutes = require('./routes/faturas')
const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

// ===========================
// Conectar ao MongoDB
// ===========================
console.log(`[${HOSTNAME}] Tentando conectar a: ${MONGO_URI}`);
mongoose.set("debug", true);
mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() =>
    console.log(`[${HOSTNAME}] MongoDB conectado: ${mongoose.connection.host}`),
  )
  .catch((err) =>
    console.error(`[${HOSTNAME}] Erro ao conectar MongoDB:`, err.message),
  );

// ===========================
// Middlewares globais
// ===========================
app.use(cors());
app.use(express.json());

// ===========================
// Webhooks (comentado por enquanto - usar confirmação manual)
// ===========================
// app.use('/api/webhooks', webhooksRoutes);

// ===========================
// Rotas
// ===========================

// Página HTML
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Projeto PTIR</title>
      </head>
      <body>
        <h1>Projeto PTIR</h1>
        <p>Servidor: ${HOSTNAME}</p>
        <p>Backend Node.js a correr na porta ${PORT}</p>
      </body>
    </html>
  `);
});

// API de teste
app.get("/api", (req, res) => {
  res.json({
    servidor: HOSTNAME,
    msg: "API a funcionar",
  });
});

app.use("/api/clientes", clientesRoutes);
app.use("/api/gestores", gestoresRoutes);
app.use("/api/taxis", taxisRoutes);
app.use("/api/motoristas", motoristasRoutes);
app.use("/api/turnos", turnosRoutes);
app.use("/api/reabastecimentos", reabastecimentosRoutes);
app.use("/api/precos", precosRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/viagens", viagensRoutes);
app.use("/api/pagamentos", pagamentosRoutes);
app.use('/api/relatorios', relatoriosRoutes)
app.use('/api/faturas', faturasRoutes)
// ===========================
// Tratamento de endpoints desconhecidos
// ===========================
app.use((req, res) => {
  res.status(404).json({ servidor: HOSTNAME, msg: "Endpoint não encontrado" });
});

// ===========================
// Error handler
// ===========================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ servidor: HOSTNAME, msg: err.message || "Erro no servidor" });
});

// ===========================
// Iniciar servidor
// ===========================
app.listen(PORT, () => {
  console.log(`Servidor [${HOSTNAME}] a correr na porta ${PORT}`);
});
