const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/pagoController');
const auth = require("../auth");

// Rutas de pagos
router.get('/pieza/:idPieza', auth.verificatoken, paymentController.getByPieza);
router.get('/pieza/:idPieza/total-pagado', auth.verificatoken, paymentController.getTotalPagado);
router.get('/pieza/:idPieza/total-pendiente', auth.verificatoken, paymentController.getTotalPendiente);

router.get('/odontograma/:idOdontograma', auth.verificatoken, paymentController.getByOdontograma);
router.get('/odontograma/:idOdontograma/resumen', auth.verificatoken, paymentController.getResumenOdontograma);

router.get('/paciente/:ci', auth.verificatoken, paymentController.getByPaciente);
router.get('/paciente/:ci/resumen', auth.verificatoken, paymentController.getResumenPaciente);

router.get('/:id', auth.verificatoken, paymentController.getById);
router.post('/', auth.verificatoken, paymentController.create);
router.put('/:id', auth.verificatoken, paymentController.update);
router.put('/:id/estado', auth.verificatoken, paymentController.updateEstado);
router.delete('/:id', auth.verificatoken, paymentController.delete);

module.exports = router;