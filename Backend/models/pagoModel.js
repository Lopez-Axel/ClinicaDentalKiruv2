const db = require('../database');

class Payment {
  // Obtener todos los pagos de una pieza
  static async getByPieza(idPieza) {
    const [rows] = await db.query(
      'SELECT * FROM pagos WHERE id_pieza = ? AND estado_registro = 1 ORDER BY created_at DESC',
      [idPieza]
    );
    return rows;
  }

  // Obtener un pago por ID
  static async getById(id) {
    const [rows] = await db.query(
      'SELECT * FROM pagos WHERE id = ? AND estado_registro = 1',
      [id]
    );
    return rows[0];
  }

  // Obtener pagos por odontograma
  static async getByOdontograma(idOdontograma) {
    const [rows] = await db.query(
      `SELECT p.*, pi.numero as numero_pieza, pi.diagnostico 
       FROM pagos p
       INNER JOIN piezas pi ON p.id_pieza = pi.id
       WHERE pi.id_odontograma = ? AND p.estado_registro = 1
       ORDER BY p.created_at DESC`,
      [idOdontograma]
    );
    return rows;
  }

  // Obtener pagos por paciente CI
  static async getByPaciente(ci) {
    const [rows] = await db.query(
      `SELECT p.*, pi.numero as numero_pieza, pi.diagnostico, o.paciente_ci
       FROM pagos p
       INNER JOIN piezas pi ON p.id_pieza = pi.id
       INNER JOIN odontogramas o ON pi.id_odontograma = o.id
       WHERE o.paciente_ci = ? AND p.estado_registro = 1
       ORDER BY p.created_at DESC`,
      [ci]
    );
    return rows;
  }

  // Crear un nuevo pago
  static async create(data) {
    const {
      id_pieza,
      monto,
      monto_pendiente,
      tipo_pago,
      stripe_payment_intent_id,
      estado,
      notas
    } = data;
    
    const [result] = await db.query(
      `INSERT INTO pagos 
       (id_pieza, monto, monto_pendiente, tipo_pago, stripe_payment_intent_id, estado, notas) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_pieza, monto, monto_pendiente, tipo_pago, stripe_payment_intent_id, estado, notas]
    );
    
    return result.insertId;
  }

  // Actualizar un pago
  static async update(id, data) {
    const {
      monto,
      monto_pendiente,
      tipo_pago,
      stripe_payment_intent_id,
      estado,
      notas
    } = data;
    
    const [result] = await db.query(
      `UPDATE pagos 
       SET monto = ?, monto_pendiente = ?, tipo_pago = ?, 
           stripe_payment_intent_id = ?, estado = ?, notas = ?
       WHERE id = ? AND estado_registro = 1`,
      [monto, monto_pendiente, tipo_pago, stripe_payment_intent_id, estado, notas, id]
    );
    
    return result.affectedRows > 0;
  }

  // Actualizar estado del pago
  static async updateEstado(id, estado) {
    const [result] = await db.query(
      'UPDATE pagos SET estado = ? WHERE id = ? AND estado_registro = 1',
      [estado, id]
    );
    return result.affectedRows > 0;
  }

  // Actualizar monto pendiente
  static async updateMontoPendiente(id, montoPendiente) {
    const [result] = await db.query(
      'UPDATE pagos SET monto_pendiente = ? WHERE id = ? AND estado_registro = 1',
      [montoPendiente, id]
    );
    return result.affectedRows > 0;
  }

  // Soft delete
  static async delete(id) {
    const [result] = await db.query(
      'UPDATE pagos SET estado_registro = 0 WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Calcular total pagado de una pieza
  static async getTotalPagadoPieza(idPieza) {
    const [result] = await db.query(
      `SELECT SUM(monto) as total_pagado 
       FROM pagos 
       WHERE id_pieza = ? AND estado = 'completado' AND estado_registro = 1`,
      [idPieza]
    );
    return result[0].total_pagado || 0;
  }

  // Calcular total pendiente de una pieza
  static async getTotalPendientePieza(idPieza) {
    const [result] = await db.query(
      `SELECT SUM(monto_pendiente) as total_pendiente 
       FROM pagos 
       WHERE id_pieza = ? AND estado_registro = 1`,
      [idPieza]
    );
    return result[0].total_pendiente || 0;
  }

  // Obtener resumen de pagos por odontograma
  static async getResumenByOdontograma(idOdontograma) {
    const [result] = await db.query(
      `SELECT 
         COUNT(DISTINCT p.id_pieza) as piezas_con_pagos,
         SUM(CASE WHEN p.estado = 'completado' THEN p.monto ELSE 0 END) as total_pagado,
         SUM(p.monto_pendiente) as total_pendiente,
         SUM(CASE WHEN p.tipo_pago = 'efectivo' THEN p.monto ELSE 0 END) as total_efectivo,
         SUM(CASE WHEN p.tipo_pago = 'stripe' THEN p.monto ELSE 0 END) as total_stripe
       FROM pagos p
       INNER JOIN piezas pi ON p.id_pieza = pi.id
       WHERE pi.id_odontograma = ? AND p.estado_registro = 1`,
      [idOdontograma]
    );
    return result[0];
  }

  // Obtener resumen de pagos por paciente
  static async getResumenByPaciente(ci) {
    const [result] = await db.query(
      `SELECT 
         COUNT(DISTINCT p.id) as total_pagos,
         SUM(CASE WHEN p.estado = 'completado' THEN p.monto ELSE 0 END) as total_pagado,
         SUM(p.monto_pendiente) as total_pendiente,
         SUM(CASE WHEN p.tipo_pago = 'efectivo' THEN p.monto ELSE 0 END) as total_efectivo,
         SUM(CASE WHEN p.tipo_pago = 'stripe' THEN p.monto ELSE 0 END) as total_stripe
       FROM pagos p
       INNER JOIN piezas pi ON p.id_pieza = pi.id
       INNER JOIN odontogramas o ON pi.id_odontograma = o.id
       WHERE o.paciente_ci = ? AND p.estado_registro = 1`,
      [ci]
    );
    return result[0];
  }
}

module.exports = Payment;