const db = require('../database');

class Cara {
  // Obtener todas las caras de una pieza
  static async getByPieza(idPieza) {
    const [rows] = await db.query(
      'SELECT * FROM caras WHERE id_pieza = ? AND estado = 1',
      [idPieza]
    );
    return rows;
  }

  // Obtener una cara por ID
  static async getById(id) {
    const [rows] = await db.query(
      'SELECT * FROM caras WHERE id = ? AND estado = 1',
      [id]
    );
    return rows[0];
  }

  // Crear una nueva cara
  static async create(data) {
    const {
      id_pieza,
      cara,
      color,
      tipo_simbologia,
      valor_simbologia,
      estado_cara,
      material,
      notas
    } = data;
    
    const [result] = await db.query(
      `INSERT INTO caras 
       (id_pieza, cara, color, tipo_simbologia, valor_simbologia, estado_cara, material, notas) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_pieza, cara, color, tipo_simbologia, valor_simbologia, estado_cara, material, notas]
    );
    
    return result.insertId;
  }

  // Actualizar una cara
  static async update(id, data) {
    const {
      cara,
      color,
      tipo_simbologia,
      valor_simbologia,
      estado_cara,
      material,
      notas
    } = data;
    
    const [result] = await db.query(
      `UPDATE caras 
       SET cara = ?, color = ?, tipo_simbologia = ?, valor_simbologia = ?, 
           estado_cara = ?, material = ?, notas = ?
       WHERE id = ? AND estado = 1`,
      [cara, color, tipo_simbologia, valor_simbologia, estado_cara, material, notas, id]
    );
    
    return result.affectedRows > 0;
  }

  // Soft delete
  static async delete(id) {
    const [result] = await db.query(
      'UPDATE caras SET estado = 0 WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Eliminar todas las caras de una pieza
  static async deleteByPieza(idPieza) {
    const [result] = await db.query(
      'UPDATE caras SET estado = 0 WHERE id_pieza = ?',
      [idPieza]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Cara;