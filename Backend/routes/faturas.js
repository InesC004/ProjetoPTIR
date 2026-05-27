// routes/faturas.js
const express = require('express')
const router = express.Router()
const faturaController = require('../controllers/faturas')

// Se usares middlewares de autenticação (ex: para garantir que é um motorista), 
// podes importá-lo e colocá-lo aqui. Ex: const { verificarMotorista } = require('../middlewares/auth')

// ══════════════════════════════════════════════
// Rotas de Faturas
// ══════════════════════════════════════════════

// Rota para emitir a fatura (Critério A, B, C)
// POST /api/faturas/emitir
router.post('/emitir', faturaController.emitirFatura)

// Rota para listar faturas de um motorista específico ordenadas por data (Critério D)
// GET /api/faturas/motorista/:motorista_id
router.get('/motorista/:motorista_id', faturaController.getFaturasPorMotorista)

module.exports = router