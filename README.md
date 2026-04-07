# 🎬 VideoGrab — Descargador de Videos para Redes Sociales

Aplicación web con **Node.js + Express** para descargar videos de Instagram, YouTube, TikTok, Facebook y LinkedIn. Todo corre dentro del contenedor, por lo que solo es necesario tener Docker instalado.

---

## ✅ Requisito único

| Herramienta | Versión | Verificar |
|---|---|---|
| Docker | 24.x o superior | `docker --version` |

> Node.js, yt-dlp y ffmpeg se instalan automáticamente dentro del contenedor.

---

## 📁 Estructura del proyecto

```
video-downloader/
├── src/
│   ├── app.js                  ← Servidor Express
│   ├── routes/download.js      ← Endpoints de la API
│   └── services/downloader.js  ← Lógica de yt-dlp
├── public/
│   ├── index.html              ← Interfaz de usuario
│   ├── css/style.css
│   └── js/main.js
├── downloads/                  ← Videos descargados temporalmente
├── .env                        ← Variables para desarrollo local
├── .dockerignore
├── .gitignore
├── package.json
├── Dockerfile                  ← Imagen base node:20
├── Dockerfile.optimizado       ← Alpine + usuario no-root + healthcheck
└── Dockerfile.multistage       ← Build en dos etapas (deps + runner)
```

---

## 🚀 Instalación y uso

### Paso 1 — Clonar el repositorio

```bash
git clone https://github.com/Rodrigo-Salva/video_downloader_app.git
cd video_downloader_app
```

### Paso 2 — Construir la imagen Docker

```bash
docker build -t video-downloader:v1.0 .
```

### Paso 3 — Correr el contenedor

```bash
docker run -d -p 3000:3000 --name videograb video-downloader:v1.0
```

### Paso 4 — Abrir en el navegador

```
http://localhost:3000
```

**¡Listo! La app está funcionando.** 🎉

---

## 🐳 Dockerfile base

El archivo `Dockerfile` crea una imagen funcional basada en `node:20` (Debian). Instala automáticamente `ffmpeg` y `yt-dlp`, copia la aplicación y expone el puerto 3000.

```bash
# Construir
docker build -t video-downloader:v1.0 .

# Ejecutar
docker run -d -p 3000:3000 --name videograb video-downloader:v1.0
```

---

## 🐳 Dockerfile.optimizado

El archivo `Dockerfile.optimizado` usa `node:20-alpine`. Mejora seguridad y reduce tamaño respecto al base al incluir usuario no-root y `HEALTHCHECK`.

**Mejoras:**
- Imagen Alpine (menor tamaño)
- Usuario no-root `appuser`
- `HEALTHCHECK` cada 30 segundos
- Solo dependencias de producción (`npm ci --only=production`)

```bash
# Construir
docker build -f Dockerfile.optimizado -t video-downloader:v1.1-alpine .

# Ejecutar
docker run -d -p 3000:3000 --name videograb-alpine video-downloader:v1.1-alpine
```

---

## 🐳 Dockerfile.multistage

El archivo `Dockerfile.multistage` usa una construcción en dos etapas: la primera instala dependencias (`deps`) y la segunda solo copia lo necesario para ejecutar (`runner`), logrando la imagen más pequeña y limpia.

**Etapas:**
- `deps` — instala dependencias de Node.js
- `runner` — imagen final sin herramientas de build

```bash
# Construir
docker build -f Dockerfile.multistage -t video-downloader:v1.2-multistage .

# Ejecutar
docker run -d -p 3000:3000 --name videograb-multistage video-downloader:v1.2-multistage
```

---

## 📊 Comparación de imágenes

| Archivo | Base | No-root | Healthcheck | Multi-stage |
|---|---|---|---|---|
| `Dockerfile` | `node:20` | ❌ | ❌ | ❌ |
| `Dockerfile.optimizado` | `node:20-alpine` | ✅ | ✅ | ❌ |
| `Dockerfile.multistage` | `node:20-alpine` | ✅ | ✅ | ✅ |

### Comparar tamaños

```bash
docker images | grep video-downloader
```

Resultado esperado:

```
video-downloader   v1.0               ~900MB   node:20 Debian
video-downloader   v1.1-alpine        ~180MB   node:20-alpine
video-downloader   v1.2-multistage    ~150MB   node:20-alpine optimizado
```

---

## ⚙️ Variables de entorno

Definidas con `ENV` en cada Dockerfile. El contenedor funciona sin depender del archivo `.env`.

| Variable | Valor | Descripción |
|---|---|---|
| `PORT` | `3000` | Puerto del servidor |
| `DOWNLOADS_PATH` | `/app/downloads` | Ruta donde se guardan los videos |
| `MAX_FILE_AGE_MINUTES` | `30` | Minutos antes de limpiar archivos descargados |

Verificar dentro del contenedor:

```bash
docker exec videograb printenv | grep -E "PORT|DOWNLOADS|MAX_FILE"
```

> El archivo `.env` se usa únicamente para desarrollo local con `npm run dev`.

---

## 📋 Comandos útiles

```bash
# Ver contenedores en ejecución
docker ps

# Ver logs en tiempo real
docker logs -f videograb

# Ver archivos descargados dentro del contenedor
docker exec videograb ls /app/downloads

# Detener contenedor
docker stop videograb

# Eliminar contenedor
docker rm videograb
```

---

## 🔄 Reconstruir después de cambios

```bash
docker stop videograb && docker rm videograb
docker build -t video-downloader:v1.0 .
docker run -d -p 3000:3000 --name videograb video-downloader:v1.0
```

---

## 🌍 Plataformas soportadas

| Plataforma | Ejemplo de URL |
|---|---|
| Instagram | `https://www.instagram.com/reel/XXXXX/` |
---

## 🔧 Solución de problemas

### Puerto 3000 en uso

```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :3000

# Matar el proceso
taskkill /f /pid <PID>

# O usar otro puerto directamente
docker run -d -p 3001:3000 --name videograb video-downloader:v1.0
# Abrir: http://localhost:3001
```

### Ver errores del contenedor

```bash
docker logs videograb
```

### Correr en modo interactivo para debug

```bash
docker run -it -p 3000:3000 --name videograb video-downloader:v1.0
```

---

## 👤 Autor

**Rodrigo Salva**
Curso: Desarrollo de Soluciones en la Nube — Contenedores
Institución: TECSUP · Ciclo 2026-I