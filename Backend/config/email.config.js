require('dotenv').config();

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  from: {
    email: process.env.SMTP_FROM,
    name: process.env.SMTP_FROM_NAME || 'Clínica Dental'
  },
  tls: {
    rejectUnauthorized: !isDevelopment,
    minVersion: 'TLSv1.2'
  },
  // Configuración adicional para Gmail
  requireTLS: true
};