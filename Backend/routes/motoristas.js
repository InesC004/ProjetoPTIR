const express = require('express')
const router = express.Router()
const motoristasController = require('../controllers/motoristas')
const checkRole = require('../middleware/checkRole')

// criar motorista — só gestores
router.post('/create', checkRole('gestor'), motoristasController.create)

// login motorista
router.post('/login', motoristasController.login)

// listar todos os motoristas
router.get('/todos', checkRole('gestor'), motoristasController.getTodos)

// obter avaliações de um motorista (público - sem autenticação necessária)
router.get('/:id/avaliacoes', motoristasController.getAvaliacoes)

// obter motorista por ID
router.get('/:id', motoristasController.getById)

// editar motorista — só gestores
router.put('/:id', checkRole('gestor'), motoristasController.update)

// apagar motorista — só gestores
router.delete('/:id', checkRole('gestor'), motoristasController.delete)

module.exports = router