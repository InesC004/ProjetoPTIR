const express = require('express')
const router = express.Router()
const turnosController = require('../controllers/turnos')
const checkRole = require('../middleware/checkRole')

// criar turno — só motoristas
router.post('/create', checkRole('motorista'), turnosController.create)

// terminar turno — só motoristas
router.put('/terminar/:id', checkRole('motorista'), turnosController.terminar)

// ver o meu turno ativo — só motoristas
router.get('/meu', checkRole('motorista'), turnosController.getMeuTurno)

// listar todos os meus turnos ordenados — só motoristas
router.get('/meus', checkRole('motorista'), turnosController.getMeusTurnos)

// taxis disponiveis para um periodo — só motoristas
router.get('/taxis-disponiveis', checkRole('motorista'), turnosController.getTaxisDisponiveis)

// listar todos os turnos — só gestores
router.get('/todos', checkRole('gestor'), turnosController.getTodos)

// listar turnos ativos — gestores e motoristas
router.get('/ativos', checkRole('gestor', 'motorista'), turnosController.getAtivos)

module.exports = router