const express = require('express');
const router = express.Router();
const odontogramaController = require('../controllers/odontogramaController');
const auth = require("../auth");

// Rutas de odontogramas
router.get('/paciente/:ci', auth.verificatoken, odontogramaController.getByPaciente);
router.get('/:id', auth.verificatoken, odontogramaController.getById);
router.get('/:id/completo', auth.verificatoken, odontogramaController.getCompleto);
router.post('/', auth.verificatoken, odontogramaController.create);
router.put('/:id', auth.verificatoken, odontogramaController.update);
router.delete('/:id', auth.verificatoken, odontogramaController.delete);

module.exports = router;