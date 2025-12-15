// services/telegramService.js
const { Telegraf } = require('telegraf');

class TelegramService {
  constructor() {
    this.bot = null;
    this.chatId = process.env.TELEGRAM_CHAT_ID;
    this.initBot();
  }

  initBot() {
    try {
      if (!process.env.TELEGRAM_BOT_TOKEN) {
        console.warn('⚠️ TELEGRAM_BOT_TOKEN no configurado');
        return;
      }

      // Inicializar Telegraf sin polling (solo para enviar mensajes)
      this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
      
      console.log('✓ Telegram Bot (Telegraf) inicializado correctamente');
    } catch (error) {
      console.error('✗ Error inicializando Telegram Bot:', error.message);
    }
  }

  async enviarMensajeContacto(contacto) {
    try {
      if (!this.bot || !this.chatId) {
        console.warn('⚠️ Telegram no configurado, mensaje no enviado');
        return {
          success: false,
          message: 'Telegram no configurado'
        };
      }

      const mensaje = this.formatearMensaje(contacto);
      
      // Telegraf usa telegram.sendMessage en lugar de sendMessage directo
      await this.bot.telegram.sendMessage(this.chatId, mensaje, {
        parse_mode: 'HTML'
      });

      return {
        success: true,
        message: 'Mensaje enviado a Telegram correctamente'
      };
    } catch (error) {
      console.error('✗ Error enviando mensaje a Telegram:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  formatearMensaje(contacto) {
    const fecha = new Date().toLocaleString('es-BO', {
      timeZone: 'America/La_Paz',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    return `
<b>NUEVO MENSAJE DE CONTACTO</b>

<b>Nombre:</b> ${contacto.nombre}
<b>Teléfono:</b> ${contacto.telefono}
<b>Email:</b> ${contacto.email}
<b>Asunto:</b> ${contacto.asunto}

<b>Mensaje:</b>
${contacto.mensaje}

<b>Fecha:</b> ${fecha}

━━━━━━━━━━━━━━━━━━━━
<i>Clínica Dental Kiru</i>
    `.trim();
  }
}

module.exports = new TelegramService();