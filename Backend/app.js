require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

// Importar rotas
const clientesRoutes = require('./routes/clientes')
const gestoresRoutes = require('./routes/gestores')

const app = express()
const PORT = process.env.PORT || 8080
const MONGO_URI = process.env.MONGO_URI

// ===========================
// Conectar ao MongoDB
// ===========================
mongoose.connect(MONGO_URI)
  .then(() => console.log(`MongoDB conectado: ${mongoose.connection.host}`))
  .catch(err => console.error('Erro ao conectar MongoDB:', err.message))

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

// Rota de teste
app.get('/', (req, res) => {
  res.send('Servidor a correr e MongoDB conectado!')
})

// ===========================
// Tratamento de endpoints desconhecidos
// ===========================
app.use((req, res) => {
  res.status(404).json({ msg: 'Endpoint não encontrado' })
})

// ===========================
// Error handler
// ===========================
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ msg: err.message || 'Erro no servidor' })
})

// ===========================
// Iniciar servidor
// ===========================
app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`)
})