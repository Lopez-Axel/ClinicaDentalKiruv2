const Payment = require('../models/pagoModel');

// Obtener todos los pagos de una pieza
exports.getByPieza = async (req, res) => {
  try {
    const { idPieza } = req.params;
    const payments = await Payment.getByPieza(idPieza);
    res.json(payments);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ message: 'Error al obtener pagos' });
  }
};

// Obtener un pago por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.getById(id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }
    
    res.json(payment);
  } catch (error) {
    console.error('Error al obtener pago:', error);
    res.status(500).json({ message: 'Error al obtener pago' });
  }
};

// Obtener pagos por odontograma
exports.getByOdontograma = async (req, res) => {
  try {
    const { idOdontograma } = req.params;
    const payments = await Payment.getByOdontograma(idOdontograma);
    res.json(payments);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ message: 'Error al obtener pagos' });
  }
};

// Obtener pagos por paciente CI
exports.getByPaciente = async (req, res) => {
  try {
    const { ci } = req.params;
    const payments = await Payment.getByPaciente(ci);
    res.json(payments);
  } catch (error) {
    console.error('Error al obtener pagos del paciente:', error);
    res.status(500).json({ message: 'Error al obtener pagos del paciente' });
  }
};

// Crear un nuevo pago
exports.create = async (req, res) => {
  try {
    const id = await Payment.create(req.body);
    const payment = await Payment.getById(id);
    res.status(201).json(payment);
  } catch (error) {
    console.error('Error al crear pago:', error);
    res.status(500).json({ message: 'Error al crear pago' });
  }
};

// Actualizar un pago
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Payment.update(id, req.body);
    
    if (!updated) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }
    
    const payment = await Payment.getById(id);
    res.json(payment);
  } catch (error) {
    console.error('Error al actualizar pago:', error);
    res.status(500).json({ message: 'Error al actualizar pago' });
  }
};

// Actualizar estado del pago
exports.updateEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const updated = await Payment.updateEstado(id, estado);
    
    if (!updated) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }
    
    const payment = await Payment.getById(id);
    res.json(payment);
  } catch (error) {
    console.error('Error al actualizar estado del pago:', error);
    res.status(500).json({ message: 'Error al actualizar estado del pago' });
  }
};

// Eliminar un pago (soft delete)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Payment.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }
    
    res.json({ message: 'Pago eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar pago:', error);
    res.status(500).json({ message: 'Error al eliminar pago' });
  }
};

// Obtener total pagado de una pieza
exports.getTotalPagado = async (req, res) => {
  try {
    const { idPieza } = req.params;
    const total = await Payment.getTotalPagadoPieza(idPieza);
    res.json({ total_pagado: total });
  } catch (error) {
    console.error('Error al calcular total pagado:', error);
    res.status(500).json({ message: 'Error al calcular total pagado' });
  }
};

// Obtener total pendiente de una pieza
exports.getTotalPendiente = async (req, res) => {
  try {
    const { idPieza } = req.params;
    const total = await Payment.getTotalPendientePieza(idPieza);
    res.json({ total_pendiente: total });
  } catch (error) {
    console.error('Error al calcular total pendiente:', error);
    res.status(500).json({ message: 'Error al calcular total pendiente' });
  }
};

// Obtener resumen de pagos por odontograma
exports.getResumenOdontograma = async (req, res) => {
  try {
    const { idOdontograma } = req.params;
    const resumen = await Payment.getResumenByOdontograma(idOdontograma);
    res.json(resumen);
  } catch (error) {
    console.error('Error al obtener resumen:', error);
    res.status(500).json({ message: 'Error al obtener resumen' });
  }
};

// Obtener resumen de pagos por paciente
exports.getResumenPaciente = async (req, res) => {
  try {
    const { ci } = req.params;
    const resumen = await Payment.getResumenByPaciente(ci);
    res.json(resumen);
  } catch (error) {
    console.error('Error al obtener resumen del paciente:', error);
    res.status(500).json({ message: 'Error al obtener resumen del paciente' });
  }
};