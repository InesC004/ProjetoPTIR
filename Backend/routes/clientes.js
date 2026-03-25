const express = require("express");
const router = express.Router();
const clientesController = require("../controllers/clientes");

router.post("/register", clientesController.register);
router.post("/login", clientesController.login);
router.get("/perfil", clientesController.getPerfil);
router.put("/perfil", clientesController.updatePerfil);
router.delete("/:id", clientesController.delete);
router.get("/todos", clientesController.getTodos);

module.exports = router;
