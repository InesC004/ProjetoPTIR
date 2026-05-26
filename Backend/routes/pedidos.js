// routes/pedidos.js

const express = require("express");

const router = express.Router();

const pedidosController = require("../controllers/pedidos");

const checkRole = require("../middleware/checkRole");

// listar pedidos disponíveis
router.get(
  "/disponiveis",
  checkRole("motorista"),
  pedidosController.listarDisponiveis,
);

// criar pedido
router.post(
  "/create",
  checkRole("cliente"),
  pedidosController.create,
);

// pedido ativo cliente
router.get(
  "/ativo",
  checkRole("cliente"),
  pedidosController.getAtivoCliente,
);

// obter pedido
router.get(
  "/:id",
  checkRole("cliente", "motorista"),
  pedidosController.getById,
);

// aceitar pedido
router.put(
  "/:id/aceitar",
  checkRole("motorista"),
  pedidosController.aceitar,
);

// cancelar aceitação
router.put(
  "/:id/cancelar-aceitacao",
  checkRole("motorista"),
  pedidosController.cancelarAceitacao,
);

// responder motorista
router.put(
  "/:id/responder",
  checkRole("cliente"),
  pedidosController.responderMotorista,
);

// cancelar pedido
router.put(
  "/:id/cancelar",
  checkRole("cliente"),
  pedidosController.cancelar,
);

module.exports = router;