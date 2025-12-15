import axios from 'axios';

const API_URL = 'http://localhost:5050/piezas';

const getAuthHeader = () => {
  const token = sessionStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const piezaService = {
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

  // Métodos específicos
  getByOdontograma: (idOdontograma) => 
    axios.get(`${API_URL}/odontograma/${idOdontograma}`, { headers: getAuthHeader() }),
  
  getCompleta: (id) => 
    axios.get(`${API_URL}/${id}/completa`, { headers: getAuthHeader() }),
  
  getPrecioTotal: (idOdontograma) => 
    axios.get(`${API_URL}/odontograma/${idOdontograma}/precio-total`, { headers: getAuthHeader() })
};