const express = require('express');
const router = express.Router();
const reservasController = require("../controllers/reservas");
const auth = require("../auth");

// Todas las rutas requieren autenticación
router.get('/', auth.verificatoken, reservasController.listado);
router.get('/todo', auth.verificatoken, reservasController.listarTodas);
router.get('/proximas', auth.verificatoken, reservasController.proximasReservas);
router.get('/estadisticas', auth.verificatoken, reservasController.estadisticas);
router.get('/horarios-disponibles', auth.verificatoken, reservasController.horariosDisponibles);
router.get('/:id', auth.verificatoken, reservasController.obtenerPorId);

router.post('/', auth.verificatoken, reservasController.crear);
router.put('/:id', auth.verificatoken, reservasController.actualizar);

// Acciones específicas
router.patch('/:id/estado', auth.verificatoken, reservasController.cambiarEstado);
router.patch('/:id/cancelar', auth.verificatoken, reservasController.cancelar);

router.patch('/:id/confirmar', auth.verificatoken, reservasController.confirmar);
router.patch('/:id/rechazar', auth.verificatoken, reservasController.rechazar);

// Soft delete
router.delete('/:id', auth.verificatoken, reservasController.eliminar);

//Hard delete
router.delete('/:id/hard', auth.verificatoken, reservasController.hardDelete);

module.exports = router;
