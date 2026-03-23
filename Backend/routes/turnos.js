const express = require('express')
const router = express.Router()
const turnosController = require('../controllers/turnos')

const jwtCheck = require('../middleware/auth'); 
const verificarAdmin = require('../middleware/verificarAdmin');

// GET /turnos

//router.post('/', jwtCheck, verificarAdmin, turnosController.iniciarTurno)
router.post('/', turnosController.iniciarTurno);

module.exports = router;
