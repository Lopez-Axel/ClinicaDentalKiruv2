const Odontograma = require('../models/odontogramaModel');

// Obtener todos los odontogramas de un paciente
exports.getByPaciente = async (req, res) => {
  try {
    const { ci } = req.params;
    const odontogramas = await Odontograma.getByPacienteCI(ci);
    res.json(odontogramas);
  } catch (error) {
    console.error('Error al obtener odontogramas:', error);
    res.status(500).json({ message: 'Error al obtener odontogramas' });
  }
};

// Obtener un odontograma por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const odontograma = await Odontograma.getById(id);
    
    if (!odontograma) {
      return res.status(404).json({ message: 'Odontograma no encontrado' });
    }
    
    res.json(odontograma);
  } catch (error) {
    console.error('Error al obtener odontograma:', error);
    res.status(500).json({ message: 'Error al obtener odontograma' });
  }
};

// Obtener odontograma completo con piezas y caras
exports.getCompleto = async (req, res) => {
  try {
    const { id } = req.params;
    const odontograma = await Odontograma.getCompleto(id);
    
    if (!odontograma) {
      return res.status(404).json({ message: 'Odontograma no encontrado' });
    }
    
    res.json(odontograma);
  } catch (error) {
    console.error('Error al obtener odontograma completo:', error);
    res.status(500).json({ message: 'Error al obtener odontograma completo' });
  }
};

// Crear un nuevo odontograma
exports.create = async (req, res) => {
  try {
    const id = await Odontograma.create(req.body);
    const odontograma = await Odontograma.getById(id);
    res.status(201).json(odontograma);
  } catch (error) {
    console.error('Error al crear odontograma:', error);
    res.status(500).json({ message: 'Error al crear odontograma' });
  }
};

// Actualizar un odontograma
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Odontograma.update(id, req.body);
    
    if (!updated) {
      return res.status(404).json({ message: 'Odontograma no encontrado' });
    }
    
    const odontograma = await Odontograma.getById(id);
    res.json(odontograma);
  } catch (error) {
    console.error('Error al actualizar odontograma:', error);
    res.status(500).json({ message: 'Error al actualizar odontograma' });
  }
};

// Eliminar un odontograma (soft delete)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Odontograma.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Odontograma no encontrado' });
    }
    
    res.json({ message: 'Odontograma eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar odontograma:', error);
    res.status(500).json({ message: 'Error al eliminar odontograma' });
  }
};