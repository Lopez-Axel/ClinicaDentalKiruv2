// controllers/contactoController.js
const telegramService = require('../services/telegram.services');

const contactoController = {
  enviar: async (req, res) => {
    try {
      const { nombre, telefono, email, asunto, mensaje } = req.body;

      // Validación básica
      if (!nombre || !telefono || !email || !asunto || !mensaje) {
        return res.status(400).json({ 
          success: false,
          message: 'Todos los campos son requeridos' 
        });
      }

      // Enviar a Telegram
      const resultado = await telegramService.enviarMensajeContacto({
        nombre,
        telefono,
        email,
        asunto,
        mensaje
      });

      if (resultado.success) {
        return res.status(200).json({
          success: true,
          message: 'Mensaje enviado correctamente'
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Error al enviar mensaje'
        });
      }

    } catch (error) {
      console.error('Error en contacto:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

module.exports = contactoController;