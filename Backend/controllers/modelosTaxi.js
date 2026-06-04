const ModeloTaxi = require("../models/modeloTaxi");

exports.getMarcas = async (req, res) => {
  try {
    const marcas = await ModeloTaxi.distinct("marca");
    res.json(marcas.sort());
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor" });
  }
};

exports.getModelosPorMarca = async (req, res) => {
  try {
    const { marca } = req.params;

    const modelos = await ModeloTaxi.find({ marca }).sort({ modelo: 1 });

    res.json(modelos);
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor" });
  }
};
