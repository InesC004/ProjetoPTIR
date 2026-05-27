const Pagamento = require("../models/pagamento");
const os = require("os");

let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

const HOSTNAME = os.hostname();

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.error(`[${HOSTNAME}] STRIPE_WEBHOOK_SECRET não configurado`);
    return res.status(400).json({
      success: false,
      message: "Webhook não configurado",
      servidor: HOSTNAME,
    });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`[${HOSTNAME}] Erro ao verificar assinatura webhook:`, err.message);
    return res.status(400).json({
      success: false,
      message: `Erro ao verificar assinatura: ${err.message}`,
      servidor: HOSTNAME,
    });
  }

  console.log(`[${HOSTNAME}] Webhook recebido - Tipo: ${event.type}, ID: ${event.id}`);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      default:
        console.log(`[${HOSTNAME}] Evento ignorado: ${event.type}`);
    }

    res.json({ success: true, received: true, servidor: HOSTNAME });
  } catch (err) {
    console.error(`[${HOSTNAME}] Erro ao processar webhook:`, err);
    res.status(500).json({
      success: false,
      message: "Erro ao processar webhook",
      servidor: HOSTNAME,
    });
  }
};

async function handlePaymentIntentSucceeded(paymentIntent) {
  const { id: stripe_payment_intent_id, metadata, latest_charge } = paymentIntent;

  console.log(`[${HOSTNAME}] Processando pagamento bem-sucedido: ${stripe_payment_intent_id}`);

  try {
    const pagamento = await Pagamento.findOne({ stripe_payment_intent_id });

    if (!pagamento) {
      console.warn(`[${HOSTNAME}] Pagamento não encontrado para Payment Intent: ${stripe_payment_intent_id}`);
      return;
    }

    if (pagamento.estado === 'confirmado') {
      console.log(`[${HOSTNAME}] Pagamento já está confirmado (idempotente): ${stripe_payment_intent_id}`);
      return;
    }

    pagamento.estado = 'confirmado';
    pagamento.stripe_charge_id = latest_charge;
    pagamento.stripe_error = null;
    await pagamento.save();

    console.log(`[${HOSTNAME}] Pagamento confirmado com sucesso: ${pagamento._id}`);
  } catch (err) {
    console.error(`[${HOSTNAME}] Erro ao confirmar pagamento:`, err.message);
  }
}

async function handlePaymentIntentFailed(paymentIntent) {
  const { id: stripe_payment_intent_id, last_payment_error } = paymentIntent;

  console.log(`[${HOSTNAME}] Processando pagamento falhado: ${stripe_payment_intent_id}`);

  try {
    const pagamento = await Pagamento.findOne({ stripe_payment_intent_id });

    if (!pagamento) {
      console.warn(`[${HOSTNAME}] Pagamento não encontrado para Payment Intent: ${stripe_payment_intent_id}`);
      return;
    }

    if (pagamento.estado === 'falhado') {
      console.log(`[${HOSTNAME}] Pagamento já está falhado (idempotente): ${stripe_payment_intent_id}`);
      return;
    }

    pagamento.estado = 'falhado';
    pagamento.stripe_error = last_payment_error?.message || 'Erro desconhecido';
    await pagamento.save();

    console.log(`[${HOSTNAME}] Pagamento marcado como falhado: ${pagamento._id} - Erro: ${pagamento.stripe_error}`);
  } catch (err) {
    console.error(`[${HOSTNAME}] Erro ao falhar pagamento:`, err.message);
  }
}
