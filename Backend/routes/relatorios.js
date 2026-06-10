const express = require('express')
const router = express.Router()
const relatoriosController = require('../controllers/relatorios')
const checkRole = require('../middleware/checkRole')

// Motorista — relatório próprio
router.get('/motorista/me', checkRole('motorista'), relatoriosController.getRelatorioMotoristaAutenticado)

// US14 — táxis e motoristas
router.get('/viagens/totais', checkRole('gestor'), relatoriosController.getTotaisViagens)
router.get('/viagens/por-motorista', checkRole('gestor'), relatoriosController.getSubtotaisPorMotorista)
router.get('/viagens/por-taxi', checkRole('gestor'), relatoriosController.getSubtotaisPorTaxi)
router.get('/viagens/detalhe/:viagem_id', checkRole('gestor'), relatoriosController.getDetalhesViagem)
router.get('/viagens/motorista/:motorista_id', checkRole('gestor'), relatoriosController.getDetalhesMotorista)
router.get('/viagens/taxi/:taxi_id', checkRole('gestor'), relatoriosController.getDetalhesTaxi)

// US15 — clientes e faturação
router.get('/faturacao/totais', checkRole('gestor'), relatoriosController.getTotalEurosViagens)
router.get('/faturacao/por-cliente', checkRole('gestor'), relatoriosController.getSubtotaisPorCliente)
router.get('/faturacao/cliente/:cliente_id', checkRole('gestor'), relatoriosController.getDetalhesCliente)

// US16 — reabastecimentos
router.get('/reabastecimentos/totais', checkRole('gestor'), relatoriosController.getTotaisReabastecimentos)
router.get('/reabastecimentos/por-tipo-motor', checkRole('gestor'), relatoriosController.getSubtotaisPorTipoMotor)
router.get('/reabastecimentos/:tipo_motor', checkRole('gestor'), relatoriosController.getDetalhesPorTipoMotor)

module.exports = router
