const express = require('express');
const router = express.Router();
const piezaController = require('../controllers/piezaController');
const auth = require("../auth");
// Rutas de piezas
router.get('/odontograma/:idOdontograma', auth.verificatoken, piezaController.getByOdontograma);
router.get('/odontograma/:idOdontograma/precio-total', auth.verificatoken, piezaController.calcularPrecioTotal);
router.get('/:id', auth.verificatoken, piezaController.getById);
router.get('/:id/completa', auth.verificatoken, piezaController.getCompleta);
router.post('/', auth.verificatoken, piezaController.create);
router.put('/:id', auth.verificatoken, piezaController.update);
router.delete('/:id', auth.verificatoken, piezaController.delete);

module.exports = router;