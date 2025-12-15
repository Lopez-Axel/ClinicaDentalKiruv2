const express = require('express');
const router = express.Router();
const pagoPiezaStripeController = require('../controllers/pagoPiezaStripeController');
const auth = require('../auth');

router.post('/create-payment-intent', auth.verificatoken, pagoPiezaStripeController.crearPaymentIntent);
router.post('/confirm', auth.verificatoken, pagoPiezaStripeController.confirmarPago);

module.exports = router;