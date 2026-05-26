const express = require('express')
const router = express.Router()
const reabastecimentosController = require('../controllers/reabastecimentos')
const checkRole = require('../middleware/checkRole')

// registar reabastecimento — só motoristas
router.post('/create', checkRole('motorista'), reabastecimentosController.create)

// listar reabastecimentos de um táxi — gestores e motoristas
router.get('/taxi/:taxi_id', checkRole('gestor', 'motorista'), reabastecimentosController.getByTaxi)

// listar reabastecimentos de um turno — gestores e motoristas
router.get('/turno/:turno_id', checkRole('gestor', 'motorista'), reabastecimentosController.getByTurno)

module.exports = router