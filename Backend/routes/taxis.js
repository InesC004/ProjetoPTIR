const express = require('express')
const router = express.Router()
const taxisController = require('../controllers/taxis')
const checkRole = require('../middleware/checkRole')

// criar taxi — só gestores
router.post('/create', checkRole('gestor'), taxisController.create)

// listar todos os taxis — só gestores
router.get('/todos', checkRole('gestor'), taxisController.getTodos)

// listar taxis disponíveis — sem autenticação
router.get('/disponiveis', taxisController.getTaxisDisponiveis)

// atualizar taxi — só gestores
router.put('/:id', checkRole('gestor'), taxisController.update)

// apagar taxi — só gestores
router.delete('/:id', checkRole('gestor'), taxisController.delete)

module.exports = router