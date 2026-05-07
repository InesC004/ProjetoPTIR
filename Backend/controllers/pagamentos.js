const Pagamento = require("../models/pagamento");
const os = require("os");
//const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const HOSTNAME = os.hostname();

// criar payment intent (para pagamentos com cartão)
exports.createPaymentIntent = async (req, res) => {
  try {
    const { viagem_id, cliente_id, valor, metodo } = req.body;

    // validações básicas
    if (!viagem_id || !cliente_id || !valor || !metodo) {
      return res.status(400).json({
        success: false,
        message: "viagem_id, cliente_id, valor e metodo são obrigatórios.",
        servidor: HOSTNAME,
      });
    }

    if (valor <= 0) {
      return res.status(400).json({
        success: false,
        message: "valor deve ser maior que 0.",
        servidor: HOSTNAME,
      });
    }

    // Se o método for dinheiro, multibanco ou mbway, não precisa de Payment Intent
    if (metodo !== "cartao") {
      const pagamento = new Pagamento({
        viagem_id,
        cliente_id,
        metodo,
        valor,
        estado: "confirmado",
      });
      await pagamento.save();

      return res.status(201).json({
        success: true,
        message: `Pagamento com ${metodo} registado com sucesso.`,
        servidor: HOSTNAME,
        pagamento,
      });
    }

    // Para pagamentos com cartão, criar Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(valor * 100), // Stripe usa centavos
      currency: "eur",
      metadata: {
        viagem_id: viagem_id.toString(),
        cliente_id: cliente_id.toString(),
      },
    });

    // Guardar o pagamento no banco com o Payment Intent ID
    const pagamento = new Pagamento({
      viagem_id,
      cliente_id,
      metodo: "cartao",
      valor,
      estado: "pendente",
      stripe_payment_intent_id: paymentIntent.id,
    });

    await pagamento.save();

    res.status(201).json({
      success: true,
      message: "Payment Intent criado com sucesso.",
      servidor: HOSTNAME,
      clientSecret: paymentIntent.client_secret,
      pagamento,
    });
  } catch (err) {
    console.error("Erro ao criar payment intent:", err);
    res.status(500).json({
      success: false,
      message: "Erro ao processar pagamento: " + err.message,
      servidor: HOSTNAME,
    });
  }
};

// confirmar pagamento
exports.confirmPayment = async (req, res) => {
  try {
    const { pagamento_id, stripe_payment_intent_id } = req.body;

    if (!pagamento_id || !stripe_payment_intent_id) {
      return res.status(400).json({
        success: false,
        message: "pagamento_id e stripe_payment_intent_id são obrigatórios.",
        servidor: HOSTNAME,
      });
    }

    // Recuperar o Payment Intent do Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(
      stripe_payment_intent_id,
    );

    // Atualizar o pagamento no banco de dados
    const pagamento = await Pagamento.findByIdAndUpdate(
      pagamento_id,
      {
        estado: paymentIntent.status === "succeeded" ? "confirmado" : "falhado",
        stripe_payment_intent_id: paymentIntent.id,
        stripe_charge_id: paymentIntent.latest_charge,
        stripe_error: paymentIntent.last_payment_error?.message || null,
      },
      { new: true },
    );

    if (!pagamento) {
      return res.status(404).json({
        success: false,
        message: "Pagamento não encontrado.",
        servidor: HOSTNAME,
      });
    }

    if (paymentIntent.status === "succeeded") {
      res.json({
        success: true,
        message: "Pagamento confirmado com sucesso!",
        servidor: HOSTNAME,
        pagamento,
      });
    } else {
      res.status(400).json({
        success: false,
        message:
          "Pagamento falhou: " +
          (paymentIntent.last_payment_error?.message || "Erro desconhecido"),
        servidor: HOSTNAME,
        pagamento,
      });
    }
  } catch (err) {
    console.error("Erro ao confirmar pagamento:", err);
    res.status(500).json({
      success: false,
      message: "Erro ao processar confirmação: " + err.message,
      servidor: HOSTNAME,
    });
  }
};

// criar pagamento (legado - sem Stripe)
exports.create = async (req, res) => {
  try {
    const { viagem_id, cliente_id, metodo, valor } = req.body;

    if (!viagem_id || !cliente_id || !metodo || !valor) {
      return res.status(400).json({
        success: false,
        message: "viagem_id, cliente_id, metodo e valor são obrigatórios.",
        servidor: HOSTNAME,
      });
    }

    if (valor <= 0) {
      return res.status(400).json({
        success: false,
        message: "valor deve ser maior que 0.",
        servidor: HOSTNAME,
      });
    }

    const pagamento = new Pagamento({
      viagem_id,
      cliente_id,
      metodo,
      valor,
      estado: "confirmado",
    });

    await pagamento.save();

    res.status(201).json({
      success: true,
      message: "Pagamento criado com sucesso.",
      servidor: HOSTNAME,
      pagamento,
    });
  } catch (err) {
    console.error("Erro ao criar pagamento:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos: " + err.message,
        servidor: HOSTNAME,
      });
    }
    res.status(500).json({
      success: false,
      message: "Erro no servidor",
      servidor: HOSTNAME,
    });
  }
};

// obter todos os pagamentos
exports.getAll = async (req, res) => {
  try {
    const pagamentos = await Pagamento.find().populate("viagem_id cliente_id");

    res.json({
      success: true,
      servidor: HOSTNAME,
      pagamentos,
    });
  } catch (err) {
    console.error("Erro ao obter pagamentos:", err);
    res.status(500).json({
      success: false,
      message: "Erro no servidor",
      servidor: HOSTNAME,
    });
  }
};

// obter pagamento por id
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const pagamento = await Pagamento.findById(id).populate(
      "viagem_id cliente_id",
    );

    if (!pagamento)
      return res.status(404).json({
        success: false,
        message: "Pagamento não encontrado.",
        servidor: HOSTNAME,
      });

    res.json({
      success: true,
      servidor: HOSTNAME,
      pagamento,
    });
  } catch (err) {
    console.error("Erro ao obter pagamento:", err);
    res.status(500).json({
      success: false,
      message: "Erro no servidor",
      servidor: HOSTNAME,
    });
  }
};

// atualizar pagamento
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.valor && updates.valor <= 0) {
      return res.status(400).json({
        success: false,
        message: "valor deve ser maior que 0.",
        servidor: HOSTNAME,
      });
    }

    const pagamento = await Pagamento.findByIdAndUpdate(id, updates, {
      new: true,
    }).populate("viagem_id cliente_id");

    if (!pagamento)
      return res.status(404).json({
        success: false,
        message: "Pagamento não encontrado.",
        servidor: HOSTNAME,
      });

    res.json({
      success: true,
      message: "Pagamento atualizado com sucesso.",
      servidor: HOSTNAME,
      pagamento,
    });
  } catch (err) {
    console.error("Erro ao atualizar pagamento:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos: " + err.message,
        servidor: HOSTNAME,
      });
    }
    res.status(500).json({
      success: false,
      message: "Erro no servidor",
      servidor: HOSTNAME,
    });
  }
};

// apagar pagamento
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Pagamento.findByIdAndDelete(id);

    if (!deleted)
      return res.status(404).json({
        success: false,
        message: "Pagamento não encontrado.",
        servidor: HOSTNAME,
      });

    res.status(200).json({
      success: true,
      message: "Pagamento apagado com sucesso.",
      servidor: HOSTNAME,
      deleted,
    });
  } catch (err) {
    console.error("Erro ao apagar pagamento:", err);
    res.status(500).json({
      success: false,
      message: "Erro no servidor",
      servidor: HOSTNAME,
    });
  }
};
