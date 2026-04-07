# 🎬 VideoGrab — Descargador de Videos para Redes Sociales

Aplicación web construida con **Node.js + Express** que permite descargar videos de Instagram, YouTube, TikTok, Facebook y LinkedIn. Incluye tres variantes de Dockerfile para el laboratorio de Contenedores (S04).

---

## 📋 Requisitos previos

Antes de levantar el proyecto, asegúrate de tener instalado lo siguiente en tu máquina:

| Herramienta | Versión recomendada | Verificar con |
|---|---|---|
| Node.js | 20.x LTS o superior | `node -v` |
| npm | 9.x o superior | `npm -v` |
| yt-dlp | Última versión | `yt-dlp --version` |
| ffmpeg | 6.x o superior | `ffmpeg -version` |
| Docker | 24.x o superior | `docker --version` |

### Instalar yt-dlp (Windows)

```cmd
winget install yt-dlp
```

> Si no tienes `winget`, descarga el ejecutable directamente desde:
> https://github.com/yt-dlp/yt-dlp/releases/latest → `yt-dlp.exe`
> y colócalo en una carpeta que esté en tu variable de entorno `PATH`.

### Instalar ffmpeg (Windows)

```cmd
winget install ffmpeg
```

> Alternativa: https://ffmpeg.org/download.html → descarga la build para Windows y agrega la carpeta `bin/` a tu `PATH`.

---

## 📁 Estructura del proyecto

```
video-downloader/
├── src/
│   ├── app.js                  ← Punto de entrada del servidor Express
│   ├── routes/
│   │   └── download.js         ← Endpoints: /api/info y /api/download
│   └── services/
│       └── downloader.js       ← Lógica de yt-dlp, validación y limpieza
├── public/
│   ├── index.html              ← Interfaz de usuario
│   ├── css/
│   │   └── style.css           ← Estilos con design tokens (light/dark mode)
│   └── js/
│       └── main.js             ← Lógica del frontend (fetch, preview, descarga)
├── downloads/                  ← Carpeta temporal de archivos descargados
├── .env                        ← Variables de entorno (no se sube a Git)
├── .gitignore
├── .dockerignore
├── package.json
├── Dockerfile                  ← Imagen base (node:20)
├── Dockerfile.optimizado       ← Imagen Alpine con usuario no-root y healthcheck
└── Dockerfile.multistage       ← Build en dos etapas (deps + runner)
```

---

## ⚙️ Variables de entorno

El archivo `.env` en la raíz del proyecto contiene la configuración:

```env
PORT=3000
DOWNLOADS_PATH=./downloads
MAX_FILE_AGE_MINUTES=30
```

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto en el que corre el servidor | `3000` |
| `DOWNLOADS_PATH` | Ruta donde se guardan los videos descargados | `./downloads` |
| `MAX_FILE_AGE_MINUTES` | Minutos antes de que un archivo sea eliminado automáticamente | `30` |

> ⚠️ **Nota:** Si el puerto `3000` ya está en uso, cambia el valor a `3001` o cualquier puerto libre.

---

## 🚀 Levantar el proyecto localmente

### Paso 1 — Clonar o ubicarse en el proyecto

```bash
cd video-downloader
```

### Paso 2 — Instalar dependencias

```bash
npm install
```

### Paso 3 — Crear la carpeta de descargas (si no existe)

```bash
mkdir downloads
```

### Paso 4 — Iniciar el servidor

**Modo desarrollo** (con reinicio automático al guardar cambios):

```bash
npm run dev
```

**Modo producción:**

```bash
npm start
```

### Paso 5 — Abrir en el navegador

```
http://localhost:3000
```

---

## 🌐 Endpoints de la API

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/health` | Health check del servidor |
| `POST` | `/api/info` | Obtiene información del video sin descargarlo |
| `POST` | `/api/download` | Descarga el video y retorna el enlace |
| `DELETE` | `/api/file/:filename` | Elimina un archivo descargado manualmente |

### Ejemplo de uso con `curl`

**Vista previa del video:**
```bash
curl -X POST http://localhost:3000/api/info \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.instagram.com/reel/XXXXX"}'
```

**Descargar video:**
```bash
curl -X POST http://localhost:3000/api/download \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=XXXXX"}'
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "filename": "uuid-generado.mp4",
  "downloadUrl": "/downloads/uuid-generado.mp4"
}
```

---

## 🐳 Docker — Tres variantes de Dockerfile

### Dockerfile (base)

Imagen estándar basada en `node:20`. La más sencilla, ideal para entender la estructura.

```bash
docker build -t video-downloader:v1.0 .
```

### Dockerfile.optimizado

Imagen basada en `node:20-alpine`. Incluye:
- Imagen Alpine (más liviana)
- Instalación de `yt-dlp` y `ffmpeg` dentro del contenedor
- Usuario no-root (`appuser`) por seguridad
- `HEALTHCHECK` integrado

```bash
docker build -f Dockerfile.optimizado -t video-downloader:v1.1-alpine .
```

### Dockerfile.multistage

Build en **dos etapas** separadas:
- **Etapa 1 (`deps`):** instala solo las dependencias de Node.js
- **Etapa 2 (`runner`):** copia solo lo necesario para ejecutar, sin herramientas de build

```bash
docker build -f Dockerfile.multistage -t video-downloader:v1.2-multistage .
```

### Comparar tamaños de imágenes

```bash
docker images | grep video-downloader
```

Resultado esperado:

```
video-downloader   v1.0              ~900MB   (node:20 Debian)
video-downloader   v1.1-alpine       ~180MB   (node:20-alpine)
video-downloader   v1.2-multistage   ~150MB   (node:20-alpine optimizado)
```

### Correr el contenedor

```bash
# Con cualquiera de las tres imágenes
docker run -d \
  -p 3000:3000 \
  --name videograb \
  video-downloader:v1.2-multistage
```

**Ver logs:**
```bash
docker logs videograb
```

**Detener y eliminar el contenedor:**
```bash
docker stop videograb
docker rm videograb
```

---

## 🔧 Solución de problemas comunes

### Error: `EADDRINUSE` — Puerto 3000 en uso

```bash
# Opción 1: Encontrar y matar el proceso
netstat -ano | findstr :3000
taskkill /f /pid <PID>

# Opción 2: Matar el puerto automáticamente
npx kill-port 3000

# Opción 3: Cambiar el puerto en .env
PORT=3001
```

### Error: `yt-dlp: command not found`

Verifica que `yt-dlp` esté instalado y en el `PATH`:

```bash
yt-dlp --version
```

Si no está en el PATH, agrega la carpeta donde se encuentra a las variables de entorno del sistema (Windows → *Variables de entorno del sistema → Path*).

### Error al descargar video de Instagram

Instagram requiere autenticación para algunos videos. Puedes pasar cookies con:

```bash
yt-dlp --cookies-from-browser chrome "URL_DEL_VIDEO"
```

Para integrarlo en la app, agrega `--cookies-from-browser chrome` al comando en `downloader.js`.

### La carpeta `downloads/` no existe

```bash
mkdir downloads
```

El servicio también la crea automáticamente al iniciar, pero si hubo algún problema de permisos, créala manualmente.

---

## 🧹 Scripts disponibles

| Script | Comando | Descripción |
|---|---|---|
| Producción | `npm start` | Inicia el servidor con `node` |
| Desarrollo | `npm run dev` | Inicia con `nodemon` (reinicio automático) |

---

## 🌍 Plataformas soportadas

| Plataforma | URL de ejemplo |
|---|---|
| Instagram | `https://www.instagram.com/reel/XXXXX/` |
| YouTube | `https://www.youtube.com/watch?v=XXXXX` |
| TikTok | `https://www.tiktok.com/@user/video/XXXXX` |
| Facebook | `https://www.facebook.com/watch?v=XXXXX` |
| LinkedIn | `https://www.linkedin.com/posts/XXXXX` |

---

## 👤 Autor

**Rodrigo Salva**  
Curso: Desarrollo de Soluciones en la Nube — Contenedores  
Institución: TECSUP · Ciclo 2026-I