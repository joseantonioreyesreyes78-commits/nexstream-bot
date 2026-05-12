const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
    console.log('--- ESCANEA ESTO CON TU WHATSAPP ---');
});

client.on('ready', () => {
    console.log('¡Bot de Nexstream conectado y listo!');
});

client.on('message', async msg => {
    // El bot reacciona si el mensaje tiene tu dominio
    if (msg.body.includes('@nexstrean.com')) {
        const correo = msg.body.trim();
        msg.reply('🔍 Buscando tu código en el servidor... espera un momento.');

        try {
            // Llama a tu archivo PHP en el hosting
            const response = await axios.get(`https://bot.nexstrean.com/lector.php?correo=${correo}`);
            
            if (response.data.status === 'success') {
                msg.reply(`✅ *INFORMACIÓN ENCONTRADA*\n\n${response.data.mensaje_completo}`);
            } else {
                msg.reply('❌ No encontré mensajes recientes para esta cuenta. Asegúrate de haber solicitado el código hace menos de 5 minutos.');
            }
        } catch (error) {
            msg.reply('⚠️ Error de conexión con el servidor de correos.');
        }
    }
});

client.initialize();
