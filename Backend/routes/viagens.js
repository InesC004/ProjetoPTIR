const express = require('express')
const router = express.Router()
const viagensController = require('../controllers/viagens')

router.post('/', viagensController.create)
router.get('/', viagensController.getAll)
router.get('/:id', viagensController.getById)
router.put('/:id', viagensController.update)
router.delete('/:id', viagensController.delete)

module.exports = router