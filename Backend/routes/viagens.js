// routes/viagens.js

const express = require('express')
const router = express.Router()

const viagensController = require('../controllers/viagens')
const authCheck = require('../middleware/authWithFallback')

// criar viagem
router.post('/', viagensController.create)

// terminar viagem
router.put('/:id/terminar', viagensController.terminar)

// cancelar viagem
router.put('/:id/cancelar', viagensController.cancelar)

// avaliar motorista após viagem concluída (protegido - apenas cliente autenticado)
router.put('/:id/avaliar', authCheck, viagensController.avaliarMotorista)

// obter todas
router.get('/', viagensController.getAll)

// obter por id
router.get('/:id', viagensController.getById)

module.exports = router