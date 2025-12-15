import axios from 'axios';

const API_URL = 'http://localhost:5050/pagos';

const getAuthHeader = () => {
  const token = sessionStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const pagoService = {
  // CRUD básico
  getAll: () => 
    axios.get(API_URL, { headers: getAuthHeader() }),
  
  getById: (id) => 
    axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() }),
  
  create: (data) => 
    axios.post(API_URL, data, { headers: getAuthHeader() }),
  
  update: (id, data) => 
    axios.put(`${API_URL}/${id}`, data, { headers: getAuthHeader() }),
  
  delete: (id) => 
    axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() }),

  // Métodos específicos por pieza
  getByPieza: (idPieza) => 
    axios.get(`${API_URL}/pieza/${idPieza}`, { headers: getAuthHeader() }),
  
  getTotalPagado: (idPieza) => 
    axios.get(`${API_URL}/pieza/${idPieza}/total-pagado`, { headers: getAuthHeader() }),
  
  getTotalPendiente: (idPieza) => 
    axios.get(`${API_URL}/pieza/${idPieza}/total-pendiente`, { headers: getAuthHeader() }),

  // Métodos específicos por odontograma
  getByOdontograma: (idOdontograma) => 
    axios.get(`${API_URL}/odontograma/${idOdontograma}`, { headers: getAuthHeader() }),
  
  getResumenOdontograma: (idOdontograma) => 
    axios.get(`${API_URL}/odontograma/${idOdontograma}/resumen`, { headers: getAuthHeader() }),

  // Métodos específicos por paciente
  getByPaciente: (ci) => 
    axios.get(`${API_URL}/paciente/${ci}`, { headers: getAuthHeader() }),
  
  getResumenPaciente: (ci) => 
    axios.get(`${API_URL}/paciente/${ci}/resumen`, { headers: getAuthHeader() }),

  // Cambios de estado
  updateEstado: (id, estado) => 
    axios.put(`${API_URL}/${id}/estado`, { estado }, { headers: getAuthHeader() })
};