// test-telegram.js
// Script para probar que Telegraf está funcionando correctamente
// Ejecutar con: node test-telegram.js

require('dotenv').config();
const { Telegraf } = require('telegraf');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

async function testTelegramBot() {
  console.log(`\n${colors.blue}${colors.bold}🧪 PRUEBA DE TELEGRAM BOT (TELEGRAF)${colors.reset}\n`);

  // Verificar variables de entorno
  console.log('📋 Verificando configuración...\n');

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error(`${colors.red}✗ TELEGRAM_BOT_TOKEN no está configurado en .env${colors.reset}`);
    console.log(`${colors.yellow}  Agrega: TELEGRAM_BOT_TOKEN=tu_token${colors.reset}\n`);
    process.exit(1);
  }

  if (!process.env.TELEGRAM_CHAT_ID) {
    console.error(`${colors.red}✗ TELEGRAM_CHAT_ID no está configurado en .env${colors.reset}`);
    console.log(`${colors.yellow}  Agrega: TELEGRAM_CHAT_ID=tu_chat_id${colors.reset}\n`);
    process.exit(1);
  }

  console.log(`${colors.green}✓ TELEGRAM_BOT_TOKEN configurado${colors.reset}`);
  console.log(`${colors.green}✓ TELEGRAM_CHAT_ID configurado${colors.reset}\n`);

  // Inicializar bot
  console.log('🤖 Inicializando Telegraf...\n');
  
  const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // Enviar mensaje de prueba
  console.log('📤 Enviando mensaje de prueba...\n');

  try {
    const mensaje = `
🧪 <b>PRUEBA DE BOT - TELEGRAF</b>

✅ El bot está funcionando correctamente
📅 <b>Fecha:</b> ${new Date().toLocaleString('es-BO', {
      timeZone: 'America/La_Paz',
      dateStyle: 'full',
      timeStyle: 'short'
    })}

━━━━━━━━━━━━━━━━━━━━
🏥 <i>Sistema de Contacto</i>
💻 <i>Clínica Dental Kiru</i>

<code>Powered by Telegraf</code>
    `.trim();

    await bot.telegram.sendMessage(chatId, mensaje, {
      parse_mode: 'HTML'
    });

    console.log(`${colors.green}${colors.bold}✓ ¡ÉXITO!${colors.reset}`);
    console.log(`${colors.green}✓ Mensaje enviado correctamente a Telegram${colors.reset}`);
    console.log(`${colors.green}✓ Verifica tu aplicación de Telegram${colors.reset}\n`);

    // Información adicional
    console.log(`${colors.blue}${colors.bold}ℹ️  INFORMACIÓN${colors.reset}`);
    console.log(`   Chat ID: ${chatId}`);
    console.log(`   Token: ${process.env.TELEGRAM_BOT_TOKEN.substring(0, 20)}...`);
    console.log(`   Librería: Telegraf\n`);

    process.exit(0);

  } catch (error) {
    console.error(`${colors.red}${colors.bold}✗ ERROR${colors.reset}`);
    console.error(`${colors.red}✗ No se pudo enviar el mensaje${colors.reset}\n`);

    // Diagnosticar error
    if (error.response?.error_code === 400) {
      console.log(`${colors.yellow}Posible causa: Chat ID inválido${colors.reset}`);
      console.log(`${colors.yellow}Solución: Verifica tu TELEGRAM_CHAT_ID${colors.reset}`);
    } else if (error.response?.error_code === 401) {
      console.log(`${colors.yellow}Posible causa: Token inválido${colors.reset}`);
      console.log(`${colors.yellow}Solución: Verifica tu TELEGRAM_BOT_TOKEN${colors.reset}`);
    } else if (error.response?.error_code === 403) {
      console.log(`${colors.yellow}Posible causa: No has iniciado conversación con el bot${colors.reset}`);
      console.log(`${colors.yellow}Solución: Busca tu bot en Telegram y presiona "Start"${colors.reset}`);
    } else {
      console.log(`${colors.yellow}Error: ${error.message}${colors.reset}`);
    }

    console.log(`\n${colors.blue}Detalles del error:${colors.reset}`);
    console.log(error);
    console.log('');

    process.exit(1);
  }
}

// Ejecutar prueba
testTelegramBot();