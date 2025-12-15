const Cara = require('../models/caraModel');

// Obtener todas las caras de una pieza
exports.getByPieza = async (req, res) => {
  try {
    const { idPieza } = req.params;
    const caras = await Cara.getByPieza(idPieza);
    res.json(caras);
  } catch (error) {
    console.error('Error al obtener caras:', error);
    res.status(500).json({ message: 'Error al obtener caras' });
  }
};

// Obtener una cara por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const cara = await Cara.getById(id);
    
    if (!cara) {
      return res.status(404).json({ message: 'Cara no encontrada' });
    }
    
    res.json(cara);
  } catch (error) {
    console.error('Error al obtener cara:', error);
    res.status(500).json({ message: 'Error al obtener cara' });
  }
};

// Crear una nueva cara
exports.create = async (req, res) => {
  try {
    const id = await Cara.create(req.body);
    const cara = await Cara.getById(id);
    res.status(201).json(cara);
  } catch (error) {
    console.error('Error al crear cara:', error);
    res.status(500).json({ message: 'Error al crear cara' });
  }
};

// Actualizar una cara
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Cara.update(id, req.body);
    
    if (!updated) {
      return res.status(404).json({ message: 'Cara no encontrada' });
    }
    
    const cara = await Cara.getById(id);
    res.json(cara);
  } catch (error) {
    console.error('Error al actualizar cara:', error);
    res.status(500).json({ message: 'Error al actualizar cara' });
  }
};

// Eliminar una cara (soft delete)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Cara.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Cara no encontrada' });
    }
    
    res.json({ message: 'Cara eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar cara:', error);
    res.status(500).json({ message: 'Error al eliminar cara' });
  }
};