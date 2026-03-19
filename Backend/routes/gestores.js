const express = require('express')
const router = express.Router()
const gestoresController = require('../controllers/gestores')
const checkRole = require('../middleware/checkRole')

// criar gestor — protegido, só admins
router.post('/create', gestoresController.create)

// login gestor
router.post('/login', gestoresController.login)

// listar todos os gestores
router.get('/todos', gestoresController.getTodos)

module.exports = router