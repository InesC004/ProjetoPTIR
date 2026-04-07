const express = require('express')
const router = express.Router()
const turnosController = require('../controllers/turnos')
const checkRole = require('../middleware/checkRole')

router.post('/create', checkRole('motorista'), turnosController.create)
router.put('/cancelar/:id', checkRole('motorista'), turnosController.cancelar)
router.get('/meus', checkRole('motorista'), turnosController.getMeusTurnos)
router.get('/taxis-disponiveis', checkRole('motorista'), turnosController.getTaxisDisponiveis)
router.get('/todos', checkRole('gestor'), turnosController.getTodos)

module.exports = router