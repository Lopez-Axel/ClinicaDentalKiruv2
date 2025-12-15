const pool = require('../database');

module.exports = {
  // Listar todas las citas activas
  listado: async () => {
    const [rows] = await pool.query('SELECT * FROM citas WHERE state = 1');
    return rows;
  },

  // Listar citas por paciente
  listarPorPaciente: async (pacienteId) => {
    const [rows] = await pool.query(
      'SELECT * FROM citas WHERE paciente_id = ? AND state = 1 ORDER BY fecha DESC, hora DESC',
      [pacienteId]
    );
    return rows;
  },

  // Listar citas por dentista
  listarPorDentista: async (dentistaId) => {
    const [rows] = await pool.query(
      'SELECT * FROM citas WHERE dentista_id = ? AND state = 1 ORDER BY fecha DESC, hora DESC',
      [dentistaId]
    );
    return rows;
  },

  // Obtener próximas citas
  obtenerProximasCitas: async (dentistaId, limite = 5) => {
    const [rows] = await pool.query(
      `SELECT * FROM citas 
       WHERE dentista_id = ? AND state = 1 
       AND CONCAT(fecha, ' ', hora) >= NOW()
       ORDER BY fecha ASC, hora ASC
       LIMIT ?`,
      [dentistaId, limite]
    );
    return rows;
  },

  // Obtener cita por ID
  obtenerPorId: async (id) => {
    const [rows] = await pool.query(
      'SELECT * FROM citas WHERE id = ? AND state = 1',
      [id]
    );
    return rows[0];
  },

  // Verificar disponibilidad considerando RESERVAS Y CITAS
  verificarDisponibilidad: async (sucursalId, fecha, hora, dentistaId = null, excluirCitaId = null) => {
    // Verificar en RESERVAS
    let sqlReservas = `
      SELECT COUNT(*) as count 
      FROM reservas 
      WHERE sucursal_id = ? 
      AND fecha_reserva = ? 
      AND hora_reserva = ?
      AND estado IN ('pendiente', 'confirmada')
      AND state = 1
    `;
    const paramsReservas = [sucursalId, fecha, hora];
    
    if (excluirCitaId) {
      sqlReservas += ' AND id != ?';
      paramsReservas.push(excluirCitaId);
    }

    const [reservas] = await pool.query(sqlReservas, paramsReservas);

    // Verificar en CITAS
    let sqlCitas = `
      SELECT COUNT(*) as count 
      FROM citas 
      WHERE sucursal_id = ? 
      AND fecha = ? 
      AND hora = ?
      AND estado IN ('confirmada', 'programada')
      AND state = 1
    `;
    const paramsCitas = [sucursalId, fecha, hora];
    
    if (dentistaId) {
      sqlCitas += ' AND dentista_id = ?';
      paramsCitas.push(dentistaId);
    }
    
    if (excluirCitaId) {
      sqlCitas += ' AND id != ?';
      paramsCitas.push(excluirCitaId);
    }

    const [citas] = await pool.query(sqlCitas, paramsCitas);

    // Disponible si NO hay reservas NI citas en ese horario
    return reservas[0].count === 0 && citas[0].count === 0;
  },

  // Obtener horarios ocupados (RESERVAS + CITAS)
  obtenerHorariosOcupados: async (sucursalId, fecha, dentistaId = null) => {
    // Horarios de reservas
    const [reservas] = await pool.query(
      `SELECT DISTINCT TIME_FORMAT(hora_reserva, '%H:%i') as hora 
      FROM reservas 
      WHERE sucursal_id = ? 
      AND fecha_reserva = ?
      AND estado IN ('pendiente', 'confirmada')
      AND state = 'active'`,
      [sucursalId, fecha]
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
    const paramsCitas = [sucursalId, fecha];
    
    if (dentistaId) {
      sqlCitas += ' AND dentista_id = ?';
      paramsCitas.push(dentistaId);
    }

    const [citas] = await pool.query(sqlCitas, paramsCitas);

    // Combinar ambos arrays y eliminar duplicados
    const horariosReservas = reservas.map(r => r.hora);
    const horariosCitas = citas.map(c => c.hora);
    const todosHorarios = [...new Set([...horariosReservas, ...horariosCitas])];

    return todosHorarios;
  },

  // Crear nueva cita
  crear: async (cita) => {
    const {
      paciente_id,
      dentista_id,
      sucursal_id,
      asunto,
      fecha,
      hora,
      tipo_cita,
      notas,
      estado
    } = cita;

    const [result] = await pool.query(
      `INSERT INTO citas (
        paciente_id, dentista_id, sucursal_id, asunto, 
        fecha, hora, tipo_cita, notas, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        paciente_id,
        dentista_id,
        sucursal_id || null,
        asunto,
        fecha,
        hora,
        tipo_cita || 'consulta',
        notas || null,
        estado || 'programada'
      ]
    );
    return result.insertId;
  },

  // Actualizar cita
  actualizar: async (id, cita) => {
    const campos = [];
    const valores = [];

    if (cita.paciente_id !== undefined) {
      campos.push('paciente_id = ?');
      valores.push(cita.paciente_id);
    }
    if (cita.dentista_id !== undefined) {
      campos.push('dentista_id = ?');
      valores.push(cita.dentista_id);
    }
    if (cita.sucursal_id !== undefined) {
      campos.push('sucursal_id = ?');
      valores.push(cita.sucursal_id);
    }
    if (cita.asunto !== undefined) {
      campos.push('asunto = ?');
      valores.push(cita.asunto);
    }
    if (cita.fecha !== undefined) {
      campos.push('fecha = ?');
      valores.push(cita.fecha);
    }
    if (cita.hora !== undefined) {
      campos.push('hora = ?');
      valores.push(cita.hora);
    }
    if (cita.tipo_cita !== undefined) {
      campos.push('tipo_cita = ?');
      valores.push(cita.tipo_cita);
    }
    if (cita.notas !== undefined) {
      campos.push('notas = ?');
      valores.push(cita.notas);
    }
    if (cita.estado !== undefined) {
      campos.push('estado = ?');
      valores.push(cita.estado);
    }

    if (campos.length === 0) {
      return 0;
    }

    valores.push(id);
    const [result] = await pool.query(
      `UPDATE citas SET ${campos.join(', ')} WHERE id = ? AND state = 1`,
      valores
    );
    return result.affectedRows;
  },

  // Cambiar estado
  cambiarEstado: async (id, estado) => {
    const [result] = await pool.query(
      'UPDATE citas SET estado = ? WHERE id = ? AND state = 1',
      [estado, id]
    );
    return result.affectedRows;
  },

  // Soft delete
  eliminar: async (id) => {
    const [result] = await pool.query(
      'UPDATE citas SET state = 0 WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  },

  // Verificar si pertenece a un dentista
  perteneceADentista: async (citaId, dentistaId) => {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM citas WHERE id = ? AND dentista_id = ? AND state = 1',
      [citaId, dentistaId]
    );
    return rows[0].count > 0;
  },

  // Verificar si pertenece a un paciente
  perteneceAPaciente: async (citaId, pacienteId) => {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM citas WHERE id = ? AND paciente_id = ? AND state = 1',
      [citaId, pacienteId]
    );
    return rows[0].count > 0;
  },

  // Obtener estadísticas por dentista
  obtenerEstadisticas: async (dentistaId) => {
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'confirmada' THEN 1 ELSE 0 END) as confirmadas,
        SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas,
        SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
        SUM(CASE WHEN estado = 'programada' THEN 1 ELSE 0 END) as programadas
       FROM citas 
       WHERE dentista_id = ? AND state = 1`,
      [dentistaId]
    );
    return stats[0];
  }
};