const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/pagoModel');
const pool = require('../database');

module.exports = {
  // Crear Payment Intent para pago de pieza
  crearPaymentIntent: async (req, res) => {
    try {
      const { monto, id_pieza } = req.body;
      const user_id = req.decoded.id;

      // Validar monto
      if (!monto || monto <= 0) {
        return res.status(400).json({
          success: 0,
          message: 'Monto inválido'
        });
      }

      // Validar que la pieza existe
      const [pieza] = await pool.query(
        'SELECT * FROM piezas WHERE id = ?',
        [id_pieza]
      );

      if (!pieza || pieza.length === 0) {
        return res.status(404).json({
          success: 0,
          message: 'Pieza no encontrada'
        });
      }

      // Convertir Bs a centavos
      const amount = Math.round(monto * 100);

      // Crear Payment Intent en Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'bob',
        metadata: {
          user_id: user_id,
          id_pieza: id_pieza,
          tipo: 'pago_pieza'
        }
      });

      return res.status(200).json({
        success: 1,
        data: {
          client_secret: paymentIntent.client_secret,
          payment_intent_id: paymentIntent.id
        }
      });
    } catch (error) {
      console.error('Error creando Payment Intent:', error);
      return res.status(500).json({
        success: 0,
        message: 'Error al iniciar el pago'
      });
    }
  },

  // Confirmar pago y crear registro en tabla pagos
  confirmarPago: async (req, res) => {
    try {
      const { payment_intent_id, datosPago } = req.body;
      const user_id = req.decoded.id;

      // Validar datos
      if (!datosPago || !datosPago.id_pieza || !datosPago.monto) {
        return res.status(400).json({
          success: 0,
          message: 'Datos incompletos'
        });
      }

      // Verificar el pago en Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({
          success: 0,
          message: 'El pago no se completó correctamente'
        });
      }

      // Obtener información de la pieza
      const [pieza] = await pool.query(
        'SELECT * FROM piezas WHERE id = ?',
        [datosPago.id_pieza]
      );

      if (!pieza || pieza.length === 0) {
        return res.status(404).json({
          success: 0,
          message: 'Pieza no encontrada'
        });
      }

      const piezaData = pieza[0];
      const precioTotal = piezaData.precio || 0;
      
      // Calcular monto pendiente
      const totalPagadoAnterior = await Payment.getTotalPendientePieza(datosPago.id_pieza);
      const nuevoMontoPendiente = precioTotal - (totalPagadoAnterior + datosPago.monto);

      // Determinar estado del pago
      let estadoPago = 'completado';
      if (nuevoMontoPendiente > 0) {
        estadoPago = 'completado';
      }

      // Crear registro de pago
      const paymentId = await Payment.create({
        id_pieza: datosPago.id_pieza,
        monto: datosPago.monto,
        monto_pendiente: nuevoMontoPendiente > 0 ? nuevoMontoPendiente : 0,
        tipo_pago: 'stripe',
        stripe_payment_intent_id: payment_intent_id,
        estado: estadoPago,
        notas: datosPago.notas || null
      });

      const pagoCreado = await Payment.getById(paymentId);

      return res.status(201).json({
        success: 1,
        data: pagoCreado,
        message: 'Pago registrado exitosamente'
      });
    } catch (error) {
      console.error('Error confirmando pago:', error);
      return res.status(500).json({
        success: 0,
        message: 'Error al confirmar el pago'
      });
    }
  }
};