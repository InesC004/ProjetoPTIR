const Cliente = require("../models/cliente");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION;

// registar cliente
exports.register = async (req, res) => {
  try {
    const {
      name,
      nif,
      email,
      gender,
      birth_day,
      birth_month,
      birth_year,
      address,
      postal_code,
      access_password,
    } = req.body;

    const existing = await Cliente.findOne({ $or: [{ nif }, { email }] });
    if (existing)
      return res
        .status(409)
        .json({ success: false, message: "NIF ou email já registado." });

    const data_nascimento =
      birth_day && birth_month && birth_year
        ? new Date(birth_year, birth_month - 1, birth_day)
        : null;

    const passwordHash = await bcrypt.hash(access_password, SALT_ROUNDS);

    const cliente = new Cliente({
      nome: name,
      nif,
      email,
      genero: gender,
      data_nascimento,
      morada: address,
      codigo_postal: postal_code,
      password: passwordHash,
    });

    await cliente.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Cliente registado com sucesso.",
        cliente,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro no servidor" });
  }
};

// login cliente
exports.login = async (req, res) => {
  try {
    const { nif, access_password } = req.body;

    const cliente = await Cliente.findOne({ nif });
    if (!cliente) {
      return res
        .status(401)
        .json({ success: false, message: "Credenciais inválidas." });
    }

    const match = await bcrypt.compare(access_password, cliente.password);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Credenciais inválidas." });
    }

    const payload = {
      id: cliente._id,
      nif: cliente.nif,
      role: "cliente",
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION,
    });

    res.status(200).json({
      success: true,
      message: "Login bem sucedido.",
      role: "cliente",
      cliente: { nome: cliente.nome, nif: cliente.nif, email: cliente.email },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro no servidor" });
  }
};

// obter perfil do cliente
exports.getPerfil = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Necessário login." });

    const payload = jwt.verify(token, JWT_SECRET);
    const cliente = await Cliente.findById(payload.id).select("-password");
    if (!cliente)
      return res.status(404).json({ message: "Cliente não encontrado" });

    res.json(cliente);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no servidor" });
  }
};

// atualizar perfil do cliente
exports.updatePerfil = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Necessário login." });

    const payload = jwt.verify(token, JWT_SECRET);

    // Campos que o cliente pode alterar (NIF e data_nascimento ficam bloqueados)
    const { nome, email, genero, morada, codigo_postal } = req.body;

    // Se o email mudou, verifica se já existe outro cliente com esse email
    if (email) {
      const existente = await Cliente.findOne({
        email,
        _id: { $ne: payload.id },
      });
      if (existente) {
        return res
          .status(409)
          .json({ success: false, message: "Este email já está em uso." });
      }
    }

    const cliente = await Cliente.findByIdAndUpdate(
      payload.id,
      { nome, email, genero, morada, codigo_postal },
      { new: true, runValidators: true },
    ).select("-password");

    if (!cliente)
      return res
        .status(404)
        .json({ success: false, message: "Cliente não encontrado." });

    res.json({
      success: true,
      message: "Perfil atualizado com sucesso.",
      cliente,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro no servidor." });
  }
};

// apagar cliente
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Necessário login." });

    const payload = jwt.verify(token, JWT_SECRET);
    if (id !== payload.id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Não podes apagar outro cliente." });
    }

    const deleted = await Cliente.findByIdAndDelete(id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Cliente não encontrado." });

    res
      .status(200)
      .json({
        success: true,
        message: "Cliente apagado com sucesso.",
        deleted,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro no servidor." });
  }
};

// listar todos os clientes
exports.getTodos = async (req, res) => {
  try {
    const clientes = await Cliente.find().select("-password");
    res.json(clientes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no servidor" });
  }
};
