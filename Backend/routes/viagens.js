// routes/viagens.js

const express = require('express')
const router = express.Router()

const viagensController = require('../controllers/viagens')

// criar viagem
router.post('/', viagensController.create)

// terminar viagem
router.put('/:id/terminar', viagensController.terminar)

// cancelar viagem
router.put('/:id/cancelar', viagensController.cancelar)

// obter todas
router.get('/', viagensController.getAll)

// obter por id
router.get('/:id', viagensController.getById)

module.exports = router