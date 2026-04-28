require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const os = require('os')
const HOSTNAME = os.hostname()

// Importar rotas
const clientesRoutes = require('./routes/clientes')
const gestoresRoutes = require('./routes/gestores')
const taxisRoutes = require('./routes/taxis')
const motoristasRoutes = require('./routes/motoristas')
const turnosRoutes = require('./routes/turnos')
const reabastecimentosRoutes = require('./routes/reabastecimentos')
const precosRoutes = require('./routes/precos')

const app = express()
const PORT = process.env.PORT || 8080
const MONGO_URI = process.env.MONGO_URI

// ===========================
// Conectar ao MongoDB
// ===========================
console.log(`[${HOSTNAME}] Tentando conectar a: ${MONGO_URI}`)
mongoose.set('debug', true)
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => console.log(`[${HOSTNAME}] MongoDB conectado: ${mongoose.connection.host}`))
  .catch(err => console.error(`[${HOSTNAME}] Erro ao conectar MongoDB:`, err.message))

// ===========================
// Middlewares globais
// ===========================
app.use(cors())
app.use(express.json())

// ===========================
// Rotas
// ===========================
app.use('/api/clientes', clientesRoutes)
app.use('/api/gestores', gestoresRoutes)
app.use('/api/taxis', taxisRoutes)
app.use('/api/motoristas', motoristasRoutes)
app.use('/api/turnos', turnosRoutes)
app.use('/api/reabastecimentos', reabastecimentosRoutes)
app.use('/api/precos', precosRoutes)

// Rota de teste
app.get('/', (req, res) => {
  res.json({ servidor: HOSTNAME, msg: 'Servidor a correr e MongoDB conectado!' })
})

// ===========================
// Tratamento de endpoints desconhecidos
// ===========================
app.use((req, res) => {
  res.status(404).json({ servidor: HOSTNAME, msg: 'Endpoint não encontrado' })
})

// ===========================
// Error handler
// ===========================
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ servidor: HOSTNAME, msg: err.message || 'Erro no servidor' })
})

// ===========================
// Iniciar servidor
// ===========================
app.listen(PORT, () => {
  console.log(`Servidor [${HOSTNAME}] a correr na porta ${PORT}`)
})
