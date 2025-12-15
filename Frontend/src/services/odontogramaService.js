import axios from 'axios';

const API_URL = 'http://localhost:5050/odontogramas';

const getAuthHeader = () => {
  const token = sessionStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const odontogramaService = {
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
  getByPaciente: (ci) => 
    axios.get(`${API_URL}/paciente/${ci}`, { headers: getAuthHeader() }),
  
  getCompleto: (id) => 
    axios.get(`${API_URL}/${id}/completo`, { headers: getAuthHeader() })
};