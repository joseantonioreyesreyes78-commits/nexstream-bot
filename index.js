const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');
const express = require('express'); // Añadimos esto
const app = express();
const port = process.env.PORT || 3000;

// Esto engaña a Render para que crea que el bot es una página web
app.get('/', (req, res) => res.send('Nexstream Bot está vivo 🚀'));
app.listen(port, () => console.log(`Servidor de salud activo en puerto ${port}`));

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        handleSIGINT: false,
        args: [
            '--no-sandbox',
            '--disable-setups-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

client.on('qr', async (qr) => {
    // REEMPLAZA CON TU NÚMERO (Ej: '5939XXXXXXXX')
    const miNumero = '5939XXXXXXXX'; 
    try {
        const pairingCode = await client.requestPairingCode(miNumero);
        console.log('-----------------------------------------');
        console.log('NUEVO CÓDIGO DE VINCULACIÓN: ' + pairingCode);
        console.log('-----------------------------------------');
    } catch (err) {
        console.log('Error al pedir código:', err);
    }
});

client.on('ready', () => {
    console.log('¡Bot de Nexstream conectado y listo!');
});

client.on('message', async msg => {
    if (msg.body.includes('@nexstream.com')) {
        const correo = msg.body.trim();
        msg.reply('🔍 Buscando tu código en el servidor... espera un momento.');
        try {
            const response = await axios.get(`https://bot.nexstream.com/lector.php?correo=${correo}`);
            if (response.data.status === 'success') {
                msg.reply(`✅ *INFORMACIÓN ENCONTRADA*\n\n${response.data.mensaje_completo}`);
            } else {
                msg.reply('❌ No encontré mensajes recientes.');
            }
        } catch (error) {
            msg.reply('⚠️ Error de conexión.');
        }
    }
});

client.initialize();
