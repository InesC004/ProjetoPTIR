const express = require("express");
const router = express.Router();
const modelosTaxiController = require("../controllers/modelosTaxi");

router.get("/marcas", modelosTaxiController.getMarcas);
router.get("/modelos/:marca", modelosTaxiController.getModelosPorMarca);

module.exports = router;
