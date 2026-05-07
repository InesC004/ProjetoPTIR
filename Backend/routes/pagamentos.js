const express = require('express')
const router = express.Router()
const pagamentosController = require('../controllers/pagamentos')

// Rotas Stripe
router.post('/stripe/create-intent', pagamentosController.createPaymentIntent)
router.post('/stripe/confirm', pagamentosController.confirmPayment)

// Rotas CRUD tradicionais
router.post('/', pagamentosController.create)
router.get('/', pagamentosController.getAll)
router.get('/:id', pagamentosController.getById)
router.put('/:id', pagamentosController.update)
router.delete('/:id', pagamentosController.delete)

module.exports = router