const express = require("express");
const router = express.Router();
const modelosTaxiController = require("../controllers/modelosTaxi");
const checkRole = require("../middleware/checkRole");

router.get("/", modelosTaxiController.getTodos);
router.get("/marcas", modelosTaxiController.getMarcas);
router.get("/modelos/:marca", modelosTaxiController.getModelosPorMarca);
router.post("/create", checkRole("gestor"), modelosTaxiController.create);

module.exports = router;
