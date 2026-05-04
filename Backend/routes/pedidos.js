const express = require("express");
const router = express.Router();
const pedidosController = require("../controllers/pedidos");
const checkRole = require("../middleware/checkRole");

//  listar pedidos disponíveis — só para motoristas
router.get(
  "/disponiveis",
  checkRole("motorista"),
  pedidosController.listarDisponiveis,
);

// criar pedido — para clientes
router.post("/create", checkRole("cliente"), pedidosController.create);

// ver pedido ativo — para clientes
router.get("/ativo", checkRole("cliente"), pedidosController.getAtivoCliente);

// ver estado do pedido — para clientes
router.get("/:id", checkRole("cliente"), pedidosController.getById);

// cancelar pedido — só para clientes
router.put("/:id/cancelar", checkRole("cliente"), pedidosController.cancelar);

// confirmar ou rejeitar motorista — só para clientes
router.put(
  "/:id/responder",
  checkRole("cliente"),
  pedidosController.responderMotorista,
);

// aceitar pedido — só para motoristas
router.put("/:id/aceitar", checkRole("motorista"), pedidosController.aceitar);

// cancelar aceitação — só para motoristas
router.put(
  "/:id/cancelar-aceitacao",
  checkRole("motorista"),
  pedidosController.cancelarAceitacao,
);

module.exports = router;
