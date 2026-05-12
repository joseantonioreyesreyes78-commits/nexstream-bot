const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const pino = require("pino");
const axios = require("axios");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// Servidor para que Render no lo apague
app.get("/", (req, res) => res.send("Bot Nexstrean Activo 🚀"));
app.listen(port, () => console.log(`Servidor en puerto ${port}`));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        auth: state,
        browser: ["Nexstrean Bot", "MacOS", "1.0.0"],
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) console.log("ESCANEA EL QR EN LOS LOGS O ESPERA EL CÓDIGO");
        if (connection === "close") startBot(); // Reinicio automático si se cae
        if (connection === "open") console.log("¡BOT CONECTADO Y ESTABLE!");
    });

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const from = msg.key.remoteJid;

        if (text.includes("@nexstrean.com")) {
            const correo = text.trim();
            await sock.sendMessage(from, { text: "🔍 Buscando en el servidor de Nexstrean..." });

            try {
                const response = await axios.get(`https://bot.nexstrean.com/lector.php?correo=${correo}`);
                if (response.data.status === "success") {
                    await sock.sendMessage(from, { text: `✅ *DATOS ENCONTRADOS*\n\n${response.data.mensaje_completo}` });
                } else {
                    await sock.sendMessage(from, { text: "❌ No hay datos recientes." });
                }
            } catch (e) {
                await sock.sendMessage(from, { text: "⚠️ Error de conexión." });
            }
        }
    });
}

startBot();
