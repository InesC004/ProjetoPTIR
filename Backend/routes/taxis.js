const express = require('express')
const router = express.Router()

const { getTaxis, createTaxi,deleteTaxi, updateTaxi } = require('../controllers/taxis')

// GET /taxis
router.get('/', getTaxis)
router.post('/', createTaxi)
router.delete('/:id', deleteTaxi)
router.put('/:id', updateTaxi)

module.exports = router