// routes/contactoRoutes.js
const express = require('express');
const router = express.Router();
const contactoController = require('../controllers/contactoController');

// Ruta pública para enviar contacto
router.post('/', contactoController.enviar);

module.exports = router;