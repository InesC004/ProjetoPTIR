const express = require('express')
const router = express.Router()

const faturasController = require('../controllers/faturas')

// emitir fatura
router.post('/', faturasController.emitir)

// listar todas
router.get('/', faturasController.getAll)

// listar por motorista (ordem descendente por data)
router.get('/motorista/:motorista_id', faturasController.getByMotorista)

// obter por id
router.get('/:id', faturasController.getById)

module.exports = router
