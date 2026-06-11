const ModeloTaxi = require("../models/modeloTaxi");

function normalizarModelo(modelo) {
  const dados = modelo.toObject();
  return {
    ...dados,
    ano: dados.ano || dados.ano_inicio,
  };
}

exports.getTodos = async (req, res) => {
  try {
    const modelos = await ModeloTaxi.find().sort({
      marca: 1,
      modelo: 1,
      ano: -1,
    });

    res.json(modelos.map(normalizarModelo));
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor" });
  }
};

exports.getMarcas = async (req, res) => {
  try {
    const marcas = await ModeloTaxi.distinct("marca");
    res.json(marcas.sort());
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor" });
  }
};

exports.create = async (req, res) => {
  try {
    const { marca, modelo, ano, tipo_motor, nivel_conforto } = req.body;

    if (!marca || !modelo || !ano || !tipo_motor || !nivel_conforto) {
      return res.status(400).json({
        message: "Todos os campos obrigatorios devem ser preenchidos.",
      });
    }

    const anoModelo = Number(ano);
    const anoAtual = new Date().getFullYear();

    if (
      !Number.isInteger(anoModelo) ||
      anoModelo < 1990 ||
      anoModelo > anoAtual
    ) {
      return res.status(400).json({ message: "Ano invalido." });
    }

    const existe = await ModeloTaxi.findOne({
      marca: marca.trim(),
      modelo: modelo.trim(),
      $or: [{ ano: anoModelo }, { ano_inicio: anoModelo }],
    });

    if (existe) {
      return res.status(409).json({
        message: "Este modelo ja esta registado para esse ano.",
      });
    }

    const novoModelo = new ModeloTaxi({
      marca: marca.trim(),
      modelo: modelo.trim(),
      ano: anoModelo,
      tipo_motor,
      nivel_conforto,
    });

    await novoModelo.save();
    res.status(201).json(novoModelo);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Dados do modelo invalidos." });
    }

    res.status(500).json({ message: "Erro no servidor" });
  }
};

exports.getModelosPorMarca = async (req, res) => {
  try {
    const { marca } = req.params;

    const modelos = await ModeloTaxi.find({ marca })
      .sort({ modelo: 1, ano: -1 })
      .select("marca modelo ano ano_inicio tipo_motor nivel_conforto");

    res.json(modelos.map(normalizarModelo));
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor" });
  }
};
