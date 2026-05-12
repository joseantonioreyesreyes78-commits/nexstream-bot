FROM ghcr.io/puppeteer/puppeteer:22.6.0

USER root

# Instalar herramientas de audio por si las necesitas luego
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar tu código
COPY . .

# Comando para arrancar
CMD ["node", "index.js"]
