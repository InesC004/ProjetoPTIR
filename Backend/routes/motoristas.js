const express = require('express');
const router = express.Router();
const motoristasController = require('../controllers/motoristas');

// Rotas específicas 
router.get('/', motoristasController.getMotoristas);
router.post('/', motoristasController.createMotorista);
router.post('/login', motoristasController.loginMotorista);

// Rotas dinâmicas 
router.get('/:id', motoristasController.getMotoristaById);  
router.put('/:id', motoristasController.updateMotorista);
router.delete('/:id', motoristasController.deleteMotorista);

module.exports = router;
