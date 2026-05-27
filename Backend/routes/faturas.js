const express = require('express')
const router = express.Router()

const faturasController = require('../controllers/faturas')
const checkRole = require('../middleware/checkRole')

// emitir fatura
router.post('/', checkRole('motorista'), faturasController.emitir)

// listar todas
router.get('/', faturasController.getAll)

// listar do motorista autenticado
router.get('/motorista/me', checkRole('motorista'), faturasController.getMinhas)

// listar por motorista (ordem descendente por data)
router.get('/motorista/:motorista_id', faturasController.getByMotorista)

// obter por id
router.get('/:id', faturasController.getById)

module.exports = router
