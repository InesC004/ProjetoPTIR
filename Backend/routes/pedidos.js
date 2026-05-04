const express = require('express')
const router = express.Router()
const pedidosController = require('../controllers/pedidos')
const checkRole = require('../middleware/checkRole')

// criar pedido — só clientes
router.post('/create', checkRole('cliente'), pedidosController.create)

// ver estado do pedido — só clientes
router.get('/:id', checkRole('cliente'), pedidosController.getById)

// cancelar pedido — só clientes
router.put('/:id/cancelar', checkRole('cliente'), pedidosController.cancelar)

// confirmar ou rejeitar motorista — só clientes
router.put('/:id/responder', checkRole('cliente'), pedidosController.responderMotorista)

module.exports = router
