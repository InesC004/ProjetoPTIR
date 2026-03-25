const express = require('express')
const router = express.Router()
const precosController = require('../controllers/precos')
const checkRole = require('../middleware/checkRole')

// listar todos os preços 
router.get('/', precosController.listar)

// obter um preço específico )
router.get('/:id', precosController.obter)

// criar novo preço (apenas gestores)
router.post('/', checkRole('gestor'), precosController.criar)

// atualizar preço (apenas gestores)
router.put('/:id', checkRole('gestor'), precosController.atualizar)

// deletar preço (apenas gestores)
router.delete('/:id', checkRole('gestor'), precosController.deletar)

module.exports = router
