const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// 1. ARRANCAR EL SERVIDOR DE INMEDIATO
// Esto le dice a Render que el bot está activo desde el segundo 1
app.get('/', (req, res) => res.send('Nexstream Bot está vivo 🚀'));
app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor de salud activo en el puerto ${port}`);
});

// 2. CONFIGURACIÓN DEL BOT (Optimizado para 512MB de RAM)
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        handleSIGINT: false,
        executablePath: '/usr/bin/google-chrome-stable', // Ruta necesaria para Docker
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

// 3. GENERACIÓN DEL CÓDIGO DE VINCULACIÓN
client.on('qr', async (qr) => {
    // REEMPLAZA las X por tu número real (Ej: '593987654321')
    // Sin el símbolo +, sin espacios y con código de país.
    const miNumero = '593969720614'; 

    try {
        const pairingCode = await client.requestPairingCode(miNumero);
        console.log('-----------------------------------------');
        console.log('TU CÓDIGO DE VINCULACIÓN ES: ' + pairingCode);
        console.log('-----------------------------------------');
    } catch (err) {
        console.log('Error al solicitar el código:', err);
    }
});

client.on('ready', () => {
    console.log('¡Bot de Nexstream conectado y listo!');
});

// 4. LÓGICA DE RESPUESTA AUTOMÁTICA
client.on('message', async msg => {
    if (msg.body.includes('@nexstream.com')) {
        const correo = msg.body.trim();
        msg.reply('🔍 Buscando tu código en el servidor... espera un momento.');
        
        try {
            const response = await axios.get(`https://bot.nexstream.com/lector.php?correo=${correo}`);
            
            if (response.data.status === 'success') {
                msg.reply(`✅ *INFORMACIÓN ENCONTRADA*\n\n${response.data.mensaje_completo}`);
            } else {
                msg.reply('❌ No encontré mensajes recientes para esta cuenta.');
            }
        } catch (error) {
            msg.reply('⚠️ Error de conexión con el servidor de Nexstream.');
        }
    }
});

client.initialize();
