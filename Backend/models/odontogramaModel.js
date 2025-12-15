const db = require('../database');

class Odontograma {
  // Obtener todos los odontogramas de un paciente
  static async getByPacienteCI(ci) {
    const [rows] = await db.query(
      'SELECT * FROM odontogramas WHERE paciente_ci = ? AND estado = 1 ORDER BY fecha_creacion DESC',
      [ci]
    );
    return rows;
  }

  // Obtener un odontograma por ID
  static async getById(id) {
    const [rows] = await db.query(
      'SELECT * FROM odontogramas WHERE id = ? AND estado = 1',
      [id]
    );
    return rows[0];
  }

  // Crear un nuevo odontograma
  static async create(data) {
    const { paciente_ci, tipo_denticion, diagnostico_general, plan_tratamiento, notas } = data;
    
    const [result] = await db.query(
      `INSERT INTO odontogramas 
       (paciente_ci, tipo_denticion, diagnostico_general, plan_tratamiento, notas) 
       VALUES (?, ?, ?, ?, ?)`,
      [paciente_ci, tipo_denticion, diagnostico_general, plan_tratamiento, notas]
    );
    
    return result.insertId;
  }

  // Actualizar un odontograma
  static async update(id, data) {
    const { tipo_denticion, diagnostico_general, plan_tratamiento, notas } = data;
    
    const [result] = await db.query(
      `UPDATE odontogramas 
       SET tipo_denticion = ?, diagnostico_general = ?, plan_tratamiento = ?, notas = ?
       WHERE id = ? AND estado = 1`,
      [tipo_denticion, diagnostico_general, plan_tratamiento, notas, id]
    );
    
    return result.affectedRows > 0;
  }

  // Soft delete
  static async delete(id) {
    const [result] = await db.query(
      'UPDATE odontogramas SET estado = 0 WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Obtener odontograma completo con piezas y caras
  static async getCompleto(id) {
    const odontograma = await this.getById(id);
    if (!odontograma) return null;

    const [piezas] = await db.query(
      'SELECT * FROM piezas WHERE id_odontograma = ? AND estado = 1',
      [id]
    );

    for (let pieza of piezas) {
      const [caras] = await db.query(
        'SELECT * FROM caras WHERE id_pieza = ? AND estado = 1',
        [pieza.id]
      );
      pieza.caras = caras;
    }

    odontograma.piezas = piezas;
    return odontograma;
  }
}

module.exports = Odontograma;