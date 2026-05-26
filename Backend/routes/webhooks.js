const express = require('express');
const router = express.Router();
const webhooksController = require('../controllers/webhooks');

// Webhook do Stripe (sem express.json() - usa raw body para verificar assinatura)
router.post('/stripe', express.raw({type: 'application/json'}), webhooksController.stripeWebhook);

module.exports = router;
