const pool = require("../database");

module.exports = {
  // Listar todas las reservas activas
  listado: async () => {
    const [rows] = await pool.query(
      `SELECT 
        r.*,
        u.username as titular_nombre,
        u.email as titular_email,
        d.nombre_completo as dependiente_nombre,
        d.parentesco,
        s.titulo as servicio_nombre,   
        su.nombre as sucursal_nombre,
        su.direccion as sucursal_direccion
      FROM reservas r
      INNER JOIN users u ON r.user_id = u.id
      INNER JOIN servicios s ON r.servicio_id = s.id
      INNER JOIN sucursales su ON r.sucursal_id = su.id
      LEFT JOIN dependientes d ON r.dependiente_id = d.id
      WHERE r.state = ?
      ORDER BY r.fecha_reserva DESC, r.hora_reserva DESC`,
      ['active']
    );
    return rows;
  },

  // Listar reservas de un usuario específico (incluye sus dependientes)
  listarPorUsuario: async (userId) => {
    const [rows] = await pool.query(
      `SELECT 
        r.*,
        u.username as titular_nombre,
        u.email as titular_email,
        d.nombre_completo as dependiente_nombre,
        d.parentesco,
        s.titulo as servicio_nombre,   
        su.nombre as sucursal_nombre,
        su.direccion as sucursal_direccion
      FROM reservas r
      INNER JOIN users u ON r.user_id = u.id
      INNER JOIN servicios s ON r.servicio_id = s.id
      INNER JOIN sucursales su ON r.sucursal_id = su.id
      LEFT JOIN dependientes d ON r.dependiente_id = d.id
      WHERE r.user_id = ? AND r.state = ?
      ORDER BY r.fecha_reserva DESC, r.hora_reserva DESC`,
      [userId, 'active']
    );
    return rows;
  },

  // Obtener reserva por ID con toda la información relacionada
  obtenerPorId: async (id) => {
    const [rows] = await pool.query(
      `SELECT 
        r.*,
        u.username as titular_nombre,
        u.email as titular_email,
        d.nombre_completo as dependiente_nombre,
        d.parentesco,
        d.telefono as dependiente_telefono,
        s.titulo as servicio_nombre,
        s.descripcion as servicio_descripcion,
        su.nombre as sucursal_nombre,
        su.direccion as sucursal_direccion,
        su.direccion as sucursal_telefono
      FROM reservas r
      INNER JOIN users u ON r.user_id = u.id
      INNER JOIN servicios s ON r.servicio_id = s.id
      INNER JOIN sucursales su ON r.sucursal_id = su.id
      LEFT JOIN dependientes d ON r.dependiente_id = d.id
      WHERE r.id = ? AND r.state = ?`,
      [id, 'active']
    );
    return rows[0];
  },

  // Crear nueva reserva
  crear: async (reserva) => {
    const { 
      user_id, 
      dependiente_id, 
      servicio_id, 
      sucursal_id, 
      fecha_reserva, 
      hora_reserva,
      notas 
    } = reserva;
    
    const [result] = await pool.query(
      `INSERT INTO reservas 
       (user_id, dependiente_id, servicio_id, sucursal_id, fecha_reserva, hora_reserva, notas, estado, state) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, dependiente_id, servicio_id, sucursal_id, fecha_reserva, hora_reserva, notas, 'pendiente', 'active']
    );
    
    return result.insertId;
  },

  // Actualizar reserva
  actualizar: async (id, reserva) => {
    const campos = [];
    const valores = [];

    if (reserva.dependiente_id !== undefined) {
      campos.push('dependiente_id = ?');
      valores.push(reserva.dependiente_id);
    }
    if (reserva.servicio_id !== undefined) {
      campos.push('servicio_id = ?');
      valores.push(reserva.servicio_id);
    }
    if (reserva.sucursal_id !== undefined) {
      campos.push('sucursal_id = ?');
      valores.push(reserva.sucursal_id);
    }
    if (reserva.fecha_reserva !== undefined) {
      campos.push('fecha_reserva = ?');
      valores.push(reserva.fecha_reserva);
    }
    if (reserva.hora_reserva !== undefined) {
      campos.push('hora_reserva = ?');
      valores.push(reserva.hora_reserva);
    }
    if (reserva.estado !== undefined) {
      campos.push('estado = ?');
      valores.push(reserva.estado);
    }
    if (reserva.notas !== undefined) {
      campos.push('notas = ?');
      valores.push(reserva.notas);
    }

    if (campos.length === 0) {
      return 0;
    }

    valores.push(id);
    const [result] = await pool.query(
      `UPDATE reservas SET ${campos.join(', ')} WHERE id = ? AND state = ?`,
      [...valores, 'active']
    );
    
    return result.affectedRows;
  },

  // Cambiar estado de la reserva (pendiente, confirmada, cancelada, completada)
  cambiarEstado: async (id, estado) => {
    const [result] = await pool.query(
      'UPDATE reservas SET estado = ? WHERE id = ? AND state = ?',
      [estado, id, 'active']
    );
    return result.affectedRows;
  },

  // Soft delete - marcar como inactivo
  eliminar: async (id) => {
    const [result] = await pool.query(
      'UPDATE reservas SET state = ? WHERE id = ?',
      ['inactive', id]
    );
    return result.affectedRows;
  },

  // Restaurar reserva eliminada
  restaurar: async (id) => {
    const [result] = await pool.query(
      'UPDATE reservas SET state = ? WHERE id = ?',
      ['active', id]
    );
    return result.affectedRows;
  },

  // Verificar disponibilidad de horario
  verificarDisponibilidad: async (sucursalId, fechaReserva, horaReserva, excludeId = null) => {
    let query = `
      SELECT id FROM reservas 
      WHERE sucursal_id = ? 
        AND fecha_reserva = ? 
        AND hora_reserva = ? 
        AND state = ?
        AND estado != ?
    `;
    const params = [sucursalId, fechaReserva, horaReserva, 'active', 'cancelada'];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const [rows] = await pool.query(query, params);
    return rows.length === 0; // true si está disponible
  },

  // Obtener horarios ocupados de una fecha y sucursal
  obtenerHorariosOcupados: async (sucursalId, fechaReserva) => {
    // Horarios de reservas
    const [reservas] = await pool.query(
      `SELECT DISTINCT TIME_FORMAT(hora_reserva, '%H:%i') as hora 
      FROM reservas 
      WHERE sucursal_id = ? 
      AND fecha_reserva = ?
      AND estado IN ('pendiente', 'confirmada')
      AND state = 'active'`,
      [sucursalId, fechaReserva]
    );

    // Horarios de citas
    let sqlCitas = `
      SELECT DISTINCT TIME_FORMAT(hora, '%H:%i') as hora 
      FROM citas 
      WHERE sucursal_id = ? 
      AND fecha = ?
      AND estado IN ('confirmada', 'programada')
      AND state = 1
    `;
    const paramsCitas = [sucursalId, fechaReserva];
    const [citas] = await pool.query(sqlCitas, paramsCitas);

    // Combinar ambos arrays y eliminar duplicados
    const horariosReservas = reservas.map(r => r.hora);
    const horariosCitas = citas.map(c => c.hora);
    const todosHorarios = [...new Set([...horariosReservas, ...horariosCitas])];

    return todosHorarios;
  },

  // Verificar si una reserva pertenece a un usuario
  perteneceAUsuario: async (reservaId, userId) => {
    const [rows] = await pool.query(
      'SELECT id FROM reservas WHERE id = ? AND user_id = ? AND state = ?',
      [reservaId, userId, 'active']
    );
    return rows.length > 0;
  },

  // Obtener próximas reservas de un usuario
  obtenerProximasReservas: async (userId, limite = 5) => {
    const [rows] = await pool.query(
      `SELECT 
        r.*,
        s.titulo as servicio_nombre,
        su.nombre as sucursal_nombre,
        d.nombre_completo as dependiente_nombre
      FROM reservas r
      INNER JOIN servicios s ON r.servicio_id = s.id
      INNER JOIN sucursales su ON r.sucursal_id = su.id
      LEFT JOIN dependientes d ON r.dependiente_id = d.id
      WHERE r.user_id = ? 
        AND r.state = ?
        AND r.estado IN ('pendiente', 'confirmada')
        AND CONCAT(r.fecha_reserva, ' ', r.hora_reserva) >= NOW()
      ORDER BY r.fecha_reserva ASC, r.hora_reserva ASC
      LIMIT ?`,
      [userId, 'active', limite]
    );
    return rows;
  },

  // Estadísticas de reservas por estado
  obtenerEstadisticas: async (userId = null) => {
    let query = `
      SELECT 
        estado,
        COUNT(*) as total
      FROM reservas
      WHERE state = ?
    `;
    const params = ['active'];
    
    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }
    
    query += ' GROUP BY estado';
    
    const [rows] = await pool.query(query, params);
    return rows;
  },

  obtenerReservaCompleta: async (id) => {
    const query = `
      SELECT 
        r.*,
        u.email as user_email,
        u.username as user_nombre,
        s.titulo as servicio_nombre,
        suc.nombre as sucursal_nombre,
        suc.direccion as sucursal_direccion,
        d.nombre_completo as dependiente_nombre
      FROM reservas r
      INNER JOIN users u ON r.user_id = u.id
      LEFT JOIN servicios s ON r.servicio_id = s.id
      LEFT JOIN sucursales suc ON r.sucursal_id = suc.id
      LEFT JOIN dependientes d ON r.dependiente_id = d.id
      WHERE r.id = ? AND r.state = 'active'
    `;
    
    const [rows] = await pool.query(query, [id]);
    return rows[0] || null;
  },

  // Actualizar solo las notas
  actualizarNotas: async (id, notas) => {
    const query = 'UPDATE reservas SET notas = ?, updated_at = NOW() WHERE id = ?';
    await pool.query(query, [notas, id]);
  },

  harddelete: async (id) => {
    const [result] = await pool.query(
      'DELETE FROM reservas WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
};
