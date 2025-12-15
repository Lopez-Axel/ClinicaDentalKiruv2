const citaModel = require('../models/citaModel');
const pacienteModel = require('../models/pacienteModel');
const dentistaModel = require('../models/dentistaModel');

const normalizeDate = (input) => {
  if (!input) return input

  const d = new Date(input)
  if (isNaN(d)) return null

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

module.exports = {
  // Listar todas las citas
  listado: async (req, res) => {
    try {
      const results = await citaModel.listado();
      return res.status(200).json({
        success: 1,
        data: results
      });
    } catch (err) {
      console.error('Error en listado:', err);
      return res.status(500).json({
        success: 0,
        message: 'Error al obtener citas'
      });
    }
  },

  // Listar citas por paciente
  listarPorPaciente: async (req, res) => {
    try {
      const { pacienteId } = req.params;
      const results = await citaModel.listarPorPaciente(pacienteId);
      
      return res.status(200).json({
        success: 1,
        data: results
      });
    } catch (err) {
      console.error('Error en listarPorPaciente:', err);
      return res.status(500).json({
        success: 0,
        message: 'Error al obtener citas del paciente'
      });
    }
  },

  // Listar citas por dentista
  listarPorDentista: async (req, res) => {
    try {
      const { dentistaId } = req.params;
      const results = await citaModel.listarPorDentista(dentistaId);
      
      return res.status(200).json({
        success: 1,
        data: results
      });
    } catch (err) {
      console.error('Error en listarPorDentista:', err);
      return res.status(500).json({
        success: 0,
        message: 'Error al obtener citas del dentista'
      });
    }
  },

  // Obtener próximas citas
  proximasCitas: async (req, res) => {
    try {
      const { dentistaId } = req.params;
      const limite = parseInt(req.query.limite) || 5;
      
      const results = await citaModel.obtenerProximasCitas(dentistaId, limite);
      
      return res.status(200).json({
        success: 1,
        data: results
      });
    } catch (err) {
      console.error('Error en proximasCitas:', err);
      return res.status(500).json({
        success: 0,
        message: 'Error al obtener próximas citas'
      });
    }
  },

  // Obtener cita por ID
  obtenerPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const cita = await citaModel.obtenerPorId(id);
      
      if (!cita) {
        return res.status(404).json({
          success: 0,
          message: 'Cita no encontrada'
        });
      }

      return res.status(200).json({
        success: 1,
        data: cita
      });
    } catch (err) {
      console.error('Error en obtenerPorId:', err);
      return res.status(500).json({
        success: 0,
        message: 'Error al obtener la cita'
      });
    }
  },

  // Crear nueva cita
  crear: async (req, res) => {
    try {
      const { 
        paciente_id, 
        dentista_id,
        sucursal_id,
        asunto, 
        fecha,
        estado, 
        hora,
        tipo_cita,
        notas
      } = req.body;

      const fechaNormalizada = normalizeDate(fecha)
      if (!fechaNormalizada) {
        return res.status(400).json({
          success: 0,
          message: 'Formato de fecha inválido'
        })
      }
      // Validaciones básicas
      if (!paciente_id || !dentista_id || !asunto || !fecha || !hora) {
        return res.status(400).json({
          success: 0,
          message: 'Paciente, dentista, asunto, fecha y hora son requeridos'
        });
      }

      // Verificar que el paciente existe
      const paciente = await pacienteModel.obtenerPorId(paciente_id);
      if (!paciente) {
        return res.status(404).json({
          success: 0,
          message: 'Paciente no encontrado'
        });
      }

      // Verificar que el dentista existe
      const dentista = await dentistaModel.obtenerPorId(dentista_id);
      if (!dentista) {
        return res.status(404).json({
          success: 0,
          message: 'Dentista no encontrado'
        });
      }

      // Verificar disponibilidad (consulta RESERVAS y CITAS)
      const disponible = await citaModel.verificarDisponibilidad(
        sucursal_id,
        fecha,
        hora,
        dentista_id
      );

      if (!disponible) {
        return res.status(409).json({
          success: 0,
          message: 'El horario seleccionado ya está ocupado'
        });
      }

      // Validar que la fecha no sea en el pasado
      const fechaHoraCita = new Date(`${fecha} ${hora}`);
      if (fechaHoraCita < new Date()) {
        return res.status(400).json({
          success: 0,
          message: 'No se pueden crear citas en fechas pasadas'
        });
      }

      const citaData = {
        paciente_id,
        dentista_id,
        sucursal_id: sucursal_id || null,
        asunto,
        fecha: fechaNormalizada,
        hora,
        tipo_cita: tipo_cita || 'consulta',
        notas: notas || null,
        estado: 'programada' // Citas se crean confirmadas
      };

      const citaId = await citaModel.crear(citaData);
      const citaCreada = await citaModel.obtenerPorId(citaId);

      return res.status(201).json({
        success: 1,
        data: citaCreada
      });
    } catch (err) {
      console.error('Error en crear:', err);
      return res.status(500).json({
        success: 0,
        message: 'Error al crear la cita'
      });
    }
  },

  // Actualizar cita
  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        paciente_id,
        dentista_id,
        sucursal_id,
        asunto,
        fecha,
        hora,
        tipo_cita,
        notas
      } = req.body;

      let fechaNormalizada = fecha

      if (fecha) {
        fechaNormalizada = normalizeDate(fecha)
        if (!fechaNormalizada) {
          return res.status(400).json({
            success: 0,
            message: 'Formato de fecha inválido'
          })
        }
      }

      // Verificar que la cita existe
      const citaActual = await citaModel.obtenerPorId(id);
      if (!citaActual) {
        return res.status(404).json({
          success: 0,
          message: 'Cita no encontrada'
        });
      }

      // Si cambia fecha/hora/sucursal/dentista, verificar disponibilidad
      if (fecha || hora || sucursal_id || dentista_id) {
        const nuevaSucursal = sucursal_id !== undefined ? sucursal_id : citaActual.sucursal_id;
        const nuevaFecha = fechaNormalizada || citaActual.fecha
        const nuevaHora = hora || citaActual.hora;
        const nuevoDentista = dentista_id || citaActual.dentista_id;

        const disponible = await citaModel.verificarDisponibilidad(
          nuevaSucursal,
          nuevaFecha,
          nuevaHora,
          nuevoDentista,
          id // Excluir esta cita de la verificación
        );

        if (!disponible) {
          return res.status(409).json({
            success: 0,
            message: 'El nuevo horario ya está ocupado'
          });
        }
      }

      // Si cambia paciente, verificar que existe
      if (paciente_id) {
        const paciente = await pacienteModel.obtenerPorId(paciente_id);
        if (!paciente) {
          return res.status(404).json({
            success: 0,
            message: 'Paciente no encontrado'
          });
        }
      }

      // Si cambia dentista, verificar que existe
      if (dentista_id) {
        const dentista = await dentistaModel.obtenerPorId(dentista_id);
        if (!dentista) {
          return res.status(404).json({
            success: 0,
            message: 'Dentista no encontrado'
          });
        }
      }

      const dataActualizada = {
        paciente_id,
        dentista_id,
        sucursal_id,
        asunto,
        fecha: fechaNormalizada,
        hora,
        tipo_cita,
        notas
      }

      await citaModel.actualizar(id, dataActualizada);
      const citaActualizada = await citaModel.obtenerPorId(id);

      return res.status(200).json({
        success: 1,
        data: citaActualizada
      });
    } catch (err) {
      console.error('Error en actualizar:', err);
      return res.status(500).json({
        success: 0,
        message: 'Error al actualizar la cita'
      });
    }
  },

  // Cambiar estado de la cita
  cambiarEstado: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      // Validar estado
      const estadosValidos = ['confirmada', 'programada', 'completada', 'cancelada'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          success: 0,
          message: 'Estado inválido. Use: confirmada, programada, completada, cancelada'
        });
      }

      const cita = await citaModel.obtenerPorId(id);
      if (!cita) {
        return res.status(404).json({
          success: 0,
          message: 'Cita no encontrada'
        });
      }

      await citaModel.cambiarEstado(id, estado);
      const citaActualizada = await citaModel.obtenerPorId(id);

      return res.status(200).json({
        success: 1,
        data: citaActualizada
      });
    } catch (err) {
      console.error('Error en cambiarEstado:', err);
      return res.status(500).json({
        success: 0,
        message: 'Error al cambiar estado de la cita'
      });
    }
  },

  // Completar cita
  completar: async (req, res) => {
    try {
      const { id } = req.params;

      const cita = await citaModel.obtenerPorId(id);
      if (!cita) {
        return res.status(404).json({
          success: 0,
          message: 'Cita no encontrada'
        });
      }

      await citaModel.cambiarEstado(id, 'completada');
      const citaActualizada = await citaModel.obtenerPorId(id);

      return res.status(200).json({
        success: 1,
        data: citaActualizada,
        message: 'Cita completada correctamente'
      });
    } catch (err) {
      console.error('Error en completar:', err);
      return res.status(500).json({
        success: 0,
        message: 'Error al completar la cita'
      });
    }
  },

  // Cancelar cita
  cancelar: async (req, res) => {
    try {
      const { id } = req.params;

      const cita = await citaModel.obtenerPorId(id);
      if (!cita) {
        return res.status(404).json({
          success: 0,
          message: 'Cita no encontrada'
        });
      }

      await citaModel.cambiarEstado(id, 'cancelada');
      const citaActualizada = await citaModel.obtenerPorId(id);

      return res.status(200).json({
        success: 1,
        data: citaActualizada,
        message: 'Cita cancelada correctamente'
      });
    } catch (err) {
      console.error('Error en cancelar:', err);
      return res.status(500).json({
        success: 0,
        message: 'Error al cancelar la cita'
      });
    }
  },

  // Soft delete
  eliminar: async (req, res) => {
    try {
      const { id } = req.params;

      const cita = await citaModel.obtenerPorId(id);
      if (!cita) {
        return res.status(404).json({
          success: 0,
          message: 'Cita no encontrada'
        });
      }

      await citaModel.eliminar(id);

      return res.status(200).json({
        success: 1,
        message: 'Cita eliminada correctamente'
      });
    } catch (err) {
      console.error('Error en eliminar:', err);
      return res.status(500).json({
        success: 0,
        message: 'Error al eliminar la cita'
      });
    }
  },

  // Obtener horarios disponibles (incluye verificación de RESERVAS y CITAS)
  horariosDisponibles: async (req, res) => {
    try {
      const { sucursal_id, fecha, dentista_id } = req.query;

      if (!sucursal_id || !fecha) {
        return res.status(400).json({
          success: 0,
          message: 'Sucursal y fecha son requeridas'
        });
      }

      const horariosOcupados = await citaModel.obtenerHorariosOcupados(
        sucursal_id,
        fecha,
        dentista_id || null
      );

      // NORMALIZAR: Convertir HH:MM:SS a HH:MM
      const horariosOcupadosNormalizados = horariosOcupados.map(hora => {
        if (typeof hora === 'string') {
          return hora.substring(0, 5); // De "08:00:00" a "08:00"
        }
        return hora;
      });

      // Generar todos los horarios posibles (8:00 a 17:00, excluyendo 12:00 y 13:00)
      const todosLosHorarios = [];
      for (let hora = 8; hora < 18; hora++) {
        if (hora === 12 || hora === 13) continue; // Excluir horario de almuerzo
        todosLosHorarios.push(`${hora.toString().padStart(2, '0')}:00`);
      }

      // Filtrar horarios disponibles
      const horariosDisponibles = todosLosHorarios.filter(
        horario => !horariosOcupadosNormalizados.includes(horario)
      );

      return res.status(200).json({
        success: 1,
        data: {
          fecha,
          sucursal_id: parseInt(sucursal_id),
          dentista_id: dentista_id ? parseInt(dentista_id) : null,
          horarios_disponibles: horariosDisponibles,
          horarios_ocupados: horariosOcupadosNormalizados
        }
      });
    } catch (err) {
      console.error('Error en horariosDisponibles:', err);
      return res.status(500).json({
        success: 0,
        message: 'Error al obtener horarios disponibles'
      });
    }
  },

  // Obtener estadísticas
  estadisticas: async (req, res) => {
    try {
      const { dentistaId } = req.params;
      const stats = await citaModel.obtenerEstadisticas(dentistaId);
      
      return res.status(200).json({
        success: 1,
        data: stats
      });
    } catch (err) {
      console.error('Error en estadisticas:', err);
      return res.status(500).json({
        success: 0,
        message: 'Error al obtener estadísticas'
      });
    }
  }
};