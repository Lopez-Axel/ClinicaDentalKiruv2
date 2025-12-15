const db = require('../database');

class Pieza {
  // Obtener todas las piezas de un odontograma
  static async getByOdontograma(idOdontograma) {
    const [rows] = await db.query(
      'SELECT * FROM piezas WHERE id_odontograma = ? AND estado = 1 ORDER BY numero',
      [idOdontograma]
    );
    return rows;
  }

  // Obtener una pieza por ID
  static async getById(id) {
    const [rows] = await db.query(
      'SELECT * FROM piezas WHERE id = ? AND estado = 1',
      [id]
    );
    return rows[0];
  }

  // Crear una nueva pieza
  static async create(data) {
    const {
      id_odontograma,
      numero,
      denticion,
      estado_general,
      precio,
      diagnostico,
      image_tooth,
      simbolo,
      notas_simbolo
    } = data;
    
    const [result] = await db.query(
      `INSERT INTO piezas 
       (id_odontograma, numero, denticion, estado_general, precio, 
        diagnostico, image_tooth, simbolo, notas_simbolo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_odontograma, numero, denticion, estado_general, precio, 
       diagnostico, image_tooth, simbolo, notas_simbolo]
    );
    
    return result.insertId;
  }

  // Actualizar una pieza
  static async update(id, data) {
    const {
      numero,
      denticion,
      estado_general,
      precio,
      diagnostico,
      image_tooth,
      simbolo,
      notas_simbolo
    } = data;
    
    const [result] = await db.query(
      `UPDATE piezas 
       SET numero = ?, denticion = ?, estado_general = ?, 
           precio = ?, diagnostico = ?, image_tooth = ?, simbolo = ?, notas_simbolo = ?
       WHERE id = ? AND estado = 1`,
      [numero, denticion, estado_general, precio, 
       diagnostico, image_tooth, simbolo, notas_simbolo, id]
    );
    
    return result.affectedRows > 0;
  }

  // Soft delete
  static async delete(id) {
    const [result] = await db.query(
      'UPDATE piezas SET estado = 0 WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Obtener pieza completa con caras
  static async getCompleta(id) {
    const pieza = await this.getById(id);
    if (!pieza) return null;

    const [caras] = await db.query(
      'SELECT * FROM caras WHERE id_pieza = ? AND estado = 1',
      [id]
    );

    pieza.caras = caras;
    return pieza;
  }

  // Calcular precio total de un odontograma
  static async calcularPrecioTotal(idOdontograma) {
    const [result] = await db.query(
      'SELECT SUM(precio) as total FROM piezas WHERE id_odontograma = ? AND estado = 1',
      [idOdontograma]
    );
    return result[0].total || 0;
  }
}

module.exports = Pieza;