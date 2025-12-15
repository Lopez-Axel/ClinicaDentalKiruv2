// src/services/reservaService.js
import axios from 'axios';

const API_URL = 'http://localhost:5050/reservas';

const getAuthHeader = () => {
  const token = sessionStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const reservaService = {
  // Obtener todas las reservas del usuario autenticado
  getAll: () => axios.get(API_URL, { headers: getAuthHeader() }),
  
  // Obtener todas las reservas (ADMIN)
  getAllAdmin: () => axios.get(`${API_URL}/todo`, { headers: getAuthHeader() }),
  
  // Obtener próximas reservas
  getProximas: (limite = 5) => axios.get(`${API_URL}/proximas?limite=${limite}`, { headers: getAuthHeader() }),
  
  // Obtener estadísticas
  getEstadisticas: () => axios.get(`${API_URL}/estadisticas`, { headers: getAuthHeader() }),
  
  // Obtener horarios disponibles
  getHorariosDisponibles: (sucursalId, fechaReserva) => 
    axios.get(`${API_URL}/horarios-disponibles?sucursal_id=${sucursalId}&fecha_reserva=${fechaReserva}`, 
      { headers: getAuthHeader() }),
  
  // Obtener una reserva específica
  getById: (id) => axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() }),
  
  // Crear nueva reserva
  create: (data) => axios.post(API_URL, data, { headers: getAuthHeader() }),
  
  // Actualizar reserva
  update: (id, data) => axios.put(`${API_URL}/${id}`, data, { headers: getAuthHeader() }),
  
  // Cambiar estado de reserva
  cambiarEstado: (id, estado) => 
    axios.patch(`${API_URL}/${id}/estado`, { estado }, { headers: getAuthHeader() }),
  
  // Cancelar reserva
  cancelar: (id) => axios.patch(`${API_URL}/${id}/cancelar`, {}, { headers: getAuthHeader() }),

  // Confirmar reserva (admin)
  confirmar: (id) => axios.patch(`${API_URL}/${id}/confirmar`, {}, { headers: getAuthHeader() }),
  
  // Rechazar reserva (admin)
  rechazar: (id, motivo) => axios.patch(`${API_URL}/${id}/rechazar`, { motivo }, { headers: getAuthHeader() }),
  
  // Eliminar (soft delete) reserva
  delete: (id) => axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() }),

  hardDelete: (id) => axios.delete(`${API_URL}/${id}/hard`, { headers: getAuthHeader() })
};