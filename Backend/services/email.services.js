const nodemailer = require('nodemailer');
const emailConfig = require('../config/email.config');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: emailConfig.auth,
      tls: emailConfig.tls,
      requireTLS: emailConfig.requireTLS
    });

    this.verificarConexion();
  }

  async verificarConexion() {
    try {
      await this.transporter.verify();
      console.log('Servidor SMTP conectado correctamente');
    } catch (error) {
      console.error('Error de conexión SMTP:', error.message);
      console.error('Verifica tu configuración en .env');
    }
  }

  async enviarEmailConfirmacion(reserva, usuario) {
    const mailOptions = {
      from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
      to: usuario.email,
      subject: 'Reserva Confirmada - Clínica Dental',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
            .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Reserva Confirmada!</h1>
            </div>
            <div class="content">
              <p>Estimado/a <strong>${usuario.nombre || 'Paciente'}</strong>,</p>
              <p>Su reserva ha sido <strong>confirmada exitosamente</strong>.</p>
              
              <div class="info-box">
                <h3>Detalles de la Cita:</h3>
                <p><strong>Servicio:</strong> ${reserva.servicio?.nombre || 'N/A'}</p>
                <p><strong>Sucursal:</strong> ${reserva.sucursal?.nombre || 'N/A'}</p>
                <p><strong>Dirección:</strong> ${reserva.sucursal?.direccion || 'N/A'}</p>
                <p><strong>Fecha:</strong> ${new Date(reserva.fecha_reserva).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Hora:</strong> ${reserva.hora_reserva}</p>
                ${reserva.dependiente ? `<p><strong>Paciente:</strong> ${reserva.dependiente.nombre_completo}</p>` : ''}
              </div>

              <p><strong>Importante:</strong></p>
              <ul>
                <li>Por favor llegue 10 minutos antes de su cita</li>
                <li>Traiga su documento de identidad</li>
                <li>Si necesita cancelar o reprogramar, hágalo con al menos 24 horas de anticipación</li>
              </ul>

              <p>¡Le esperamos!</p>
            </div>
            <div class="footer">
              <p>Este es un correo automático, por favor no responder.</p>
              <p>© ${new Date().getFullYear()} Clínica Dental. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email enviado:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error al enviar email:', error);
      throw error;
    }
  }

  async enviarEmailRechazo(reserva, usuario, motivo) {
    const mailOptions = {
      from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
      to: usuario.email,
      subject: 'Reserva No Confirmada - Clínica Dental',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f44336; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #f44336; }
            .motivo-box { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reserva No Confirmada</h1>
            </div>
            <div class="content">
              <p>Estimado/a <strong>${usuario.nombre || 'Paciente'}</strong>,</p>
              <p>Lamentamos informarle que su reserva <strong>no pudo ser confirmada</strong>.</p>
              
              <div class="info-box">
                <h3>Detalles de la Solicitud:</h3>
                <p><strong>Servicio:</strong> ${reserva.servicio?.nombre || 'N/A'}</p>
                <p><strong>Sucursal:</strong> ${reserva.sucursal?.nombre || 'N/A'}</p>
                <p><strong>Fecha solicitada:</strong> ${new Date(reserva.fecha_reserva).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Hora solicitada:</strong> ${reserva.hora_reserva}</p>
              </div>

              <div class="motivo-box">
                <h3>Motivo:</h3>
                <p>${motivo || 'No se especificó un motivo.'}</p>
              </div>

              <p>Le invitamos a:</p>
              <ul>
                <li>Agendar una nueva cita seleccionando otro horario disponible</li>
                <li>Contactarnos directamente para encontrar una alternativa que se ajuste a sus necesidades</li>
              </ul>

              <p>Disculpe las molestias ocasionadas.</p>
            </div>
            <div class="footer">
              <p>Este es un correo automático, por favor no responder.</p>
              <p>© ${new Date().getFullYear()} Clínica Dental. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email enviado:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error al enviar email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();