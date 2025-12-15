import axios from 'axios';

const API_URL = 'http://localhost:5050/pago-pieza-stripe';

const getAuthHeader = () => {
  const token = sessionStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const pagoPiezaStripeService = {
  createPaymentIntent: (data) =>
    axios.post(`${API_URL}/create-payment-intent`, data, { headers: getAuthHeader() }),

  confirmarPago: (data) =>
    axios.post(`${API_URL}/confirm`, data, { headers: getAuthHeader() })
};