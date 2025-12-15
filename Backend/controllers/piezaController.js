const Pieza = require('../models/piezaModel');

// Obtener todas las piezas de un odontograma
exports.getByOdontograma = async (req, res) => {
  try {
    const { idOdontograma } = req.params;
    const piezas = await Pieza.getByOdontograma(idOdontograma);
    res.json(piezas);
  } catch (error) {
    console.error('Error al obtener piezas:', error);
    res.status(500).json({ message: 'Error al obtener piezas' });
  }
};

// Obtener una pieza por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const pieza = await Pieza.getById(id);
    
    if (!pieza) {
      return res.status(404).json({ message: 'Pieza no encontrada' });
    }
    
    res.json(pieza);
  } catch (error) {
    console.error('Error al obtener pieza:', error);
    res.status(500).json({ message: 'Error al obtener pieza' });
  }
};

// Obtener pieza completa con caras
exports.getCompleta = async (req, res) => {
  try {
    const { id } = req.params;
    const pieza = await Pieza.getCompleta(id);
    
    if (!pieza) {
      return res.status(404).json({ message: 'Pieza no encontrada' });
    }
    
    res.json(pieza);
  } catch (error) {
    console.error('Error al obtener pieza completa:', error);
    res.status(500).json({ message: 'Error al obtener pieza completa' });
  }
};

// Crear una nueva pieza
exports.create = async (req, res) => {
  try {
    const id = await Pieza.create(req.body);
    const pieza = await Pieza.getById(id);
    res.status(201).json(pieza);
  } catch (error) {
    console.error('Error al crear pieza:', error);
    res.status(500).json({ message: 'Error al crear pieza' });
  }
};

// Actualizar una pieza
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Pieza.update(id, req.body);
    
    if (!updated) {
      return res.status(404).json({ message: 'Pieza no encontrada' });
    }
    
    const pieza = await Pieza.getById(id);
    res.json(pieza);
  } catch (error) {
    console.error('Error al actualizar pieza:', error);
    res.status(500).json({ message: 'Error al actualizar pieza' });
  }
};

// Eliminar una pieza (soft delete)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Pieza.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Pieza no encontrada' });
    }
    
    res.json({ message: 'Pieza eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar pieza:', error);
    res.status(500).json({ message: 'Error al eliminar pieza' });
  }
};

// Calcular precio total de un odontograma
exports.calcularPrecioTotal = async (req, res) => {
  try {
    const { idOdontograma } = req.params;
    const total = await Pieza.calcularPrecioTotal(idOdontograma);
    res.json({ total });
  } catch (error) {
    console.error('Error al calcular precio total:', error);
    res.status(500).json({ message: 'Error al calcular precio total' });
  }
};