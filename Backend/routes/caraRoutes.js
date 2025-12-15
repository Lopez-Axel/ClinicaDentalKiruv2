const express = require('express');
const router = express.Router();
const caraController = require('../controllers/caraController');
const auth = require("../auth");

// Rutas de caras
router.get('/pieza/:idPieza', auth.verificatoken, caraController.getByPieza);
router.get('/:id', auth.verificatoken, caraController.getById);
router.post('/', auth.verificatoken, caraController.create);
router.put('/:id', auth.verificatoken, caraController.update);
router.delete('/:id', auth.verificatoken, caraController.delete);

module.exports = router;