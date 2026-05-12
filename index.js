const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        handleSIGINT: false,
        args: [
            '--no-sandbox',
            '--disable-setups-sandbox',
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

// --- SISTEMA DE VINCULACIÓN POR CÓDIGO ---
client.on('qr', async (qr) => {
    // IMPORTANTE: Pon tu número aquí abajo (Ejemplo: '593987654321')
    // Debe ir entre comillas, sin el +, sin espacios y con el código de país.
    const miNumero = '593969720614'; 

    try {
        const pairingCode = await client.requestPairingCode(miNumero);
        console.log('-----------------------------------------');
        console.log('TU CÓDIGO DE VINCULACIÓN ES: ' + pairingCode);
        console.log('-----------------------------------------');
    } catch (err) {
        console.log('Error al solicitar código de vinculación:', err);
    }
});

client.on('ready', () => {
    console.log('¡Bot de Nexstream conectado y listo!');
});

// --- LÓGICA DE MENSAJES DE NEXSTREAM MARKET ---
client.on('message', async msg => {
    if (msg.body.includes('@nexstream.com')) {
        const correo = msg.body.trim();
        msg.reply('🔍 Buscando tu código en el servidor... espera un momento.');

        try {
            const response = await axios.get(`https://bot.nexstream.com/lector.php?correo=${correo}`);
            
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
