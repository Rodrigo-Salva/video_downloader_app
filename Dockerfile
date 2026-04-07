FROM node:20

# Instala ffmpeg y yt-dlp directo en el contenedor
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    python3 \
    --no-install-recommends && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN mkdir -p downloads

# Variables de entorno
ENV PORT=3000
ENV DOWNLOADS_PATH=/app/downloads
ENV MAX_FILE_AGE_MINUTES=30

EXPOSE 3000

CMD ["node", "src/app.js"]