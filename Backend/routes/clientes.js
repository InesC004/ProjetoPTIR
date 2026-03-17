const express = require('express')
const router = express.Router()
const clientesController = require('../controllers/clientes')
const auth = require('../middleware/auth')

// criar cliente (registo)
router.post('/register', clientesController.register)

// obter perfil do cliente (requer autenticação)
router.get('/perfil', auth, clientesController.getPerfil)

router.get('/todos', clientesController.getTodos)

module.exports = router