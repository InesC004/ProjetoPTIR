const express = require('express')
const router = express.Router()
const taxisController = require('../controllers/taxis')
const checkRole = require('../middleware/checkRole')

// criar taxi — só gestores
router.post('/create', checkRole('gestor'), taxisController.create)

// listar todos os taxis — gestores e clientes
router.get('/todos', checkRole('gestor', 'cliente'), taxisController.getTodos)

// listar taxis livres — só clientes
router.get('/disponiveis', taxisController.getTaxisDisponiveis)

// apagar taxi — só gestores
router.delete('/:id', checkRole('gestor'), taxisController.delete)

// atualizar taxi — só gestores
router.put('/:id', checkRole('gestor'), taxisController.update)

module.exports = router