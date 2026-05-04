const express = require('express')
const router = express.Router()
const pagamentosController = require('../controllers/pagamentos')

router.post('/', pagamentosController.create)
router.get('/', pagamentosController.getAll)
router.get('/:id', pagamentosController.getById)
router.put('/:id', pagamentosController.update)
router.delete('/:id', pagamentosController.delete)

module.exports = router