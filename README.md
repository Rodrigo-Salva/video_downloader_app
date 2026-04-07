# 🎬 VideoGrab — Descargador de Videos para Redes Sociales

Aplicación web con **Node.js + Express** para descargar videos de Instagram, YouTube, TikTok, Facebook y LinkedIn. Todo corre dentro del contenedor — no necesitas instalar nada más que Docker. [code_file:11]

---

## ✅ Requisito único

| Herramienta | Versión | Verificar |
|---|---|---|
| Docker | 24.x o superior | `docker --version` [code_file:11] |

> Node.js, yt-dlp y ffmpeg se instalan automáticamente dentro del contenedor. [code_file:11]

---

## 🚀 Levantar el proyecto

### Paso 1 — Construir la imagen

```bash
docker build -t video-downloader:v1.0 .
```

### Paso 2 — Correr el contenedor

```bash
docker run -d -p 3000:3000 --name videograb video-downloader:v1.0
```

> Si el puerto 3000 está ocupado usa `-p 3001:3000` y abre `http://localhost:3001` [code_file:11]

### Paso 3 — Abrir en el navegador

```text
http://localhost:3000
```

**¡Listo! La app está funcionando.** [code_file:11]

---

## ⚙️ Variables de entorno

Las variables están definidas directamente en el `Dockerfile` con `ENV`, por lo que funcionan automáticamente al levantar el contenedor. [code_file:11]

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `PORT` | `3000` | Puerto en el que corre el servidor [code_file:11] |
| `DOWNLOADS_PATH` | `/app/downloads` | Ruta donde se guardan los videos descargados [code_file:11] |
| `MAX_FILE_AGE_MINUTES` | `30` | Minutos antes de que los archivos se eliminen automáticamente [code_file:11] |

Verificar que están activas dentro del contenedor:

```bash
docker exec videograb printenv | grep -E "PORT|DOWNLOADS|MAX_FILE"
```

---

## 🛑 Detener y eliminar el contenedor

```bash
docker stop videograb
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

## 📋 Comandos útiles

```bash
# Ver que el contenedor está corriendo
docker ps

# Ver logs en tiempo real
docker logs -f videograb

# Ver variables de entorno activas
docker exec videograb printenv

# Ver archivos en la carpeta de descargas
docker exec videograb ls /app/downloads

# Ver tamaño de la imagen
docker images | grep video-downloader
```

---

## 🐳 Tres variantes de Dockerfile

```bash
# Imagen base (node:20 Debian)
docker build -t video-downloader:v1.0 .

# Imagen optimizada (Alpine + usuario no-root + healthcheck)
docker build -f Dockerfile.optimizado -t video-downloader:v1.1-alpine .

# Imagen multistage (build en dos etapas, imagen final más ligera)
docker build -f Dockerfile.multistage -t video-downloader:v1.2-multistage .

# Comparar tamaños
docker images | grep video-downloader
```

Resultado esperado:

```text
video-downloader   v1.0               ~900MB   (node:20 Debian)
video-downloader   v1.1-alpine        ~180MB   (node:20-alpine)
video-downloader   v1.2-multistage    ~150MB   (node:20-alpine optimizado)
```

---

## 🌍 Plataformas soportadas

| Plataforma | Ejemplo de URL |
|---|---|
| Instagram | `https://www.instagram.com/reel/XXXXX/` [code_file:11] |
---

## 🔧 Solución de problemas

### Puerto 3000 en uso

```bash
# Opción 1 — encontrar y matar el proceso
netstat -ano | findstr :3000
taskkill /f /pid <PID>

# Opción 2 — usar otro puerto (recomendado)
docker run -d -p 3001:3000 --name videograb video-downloader:v1.0
# Luego abrir: http://localhost:3001
```

### Ver por qué falló el contenedor

```bash
docker logs videograb
```

### El contenedor se detiene solo

```bash
# Ver logs para identificar el error
docker logs videograb

# Correr en modo interactivo para ver el error en tiempo real
docker run -it -p 3000:3000 --name videograb video-downloader:v1.0
```

---

## 📁 Estructura del proyecto

```text
video-downloader/
├── src/
│   ├── app.js                  ← Servidor Express
│   ├── routes/download.js      ← Endpoints de la API
│   └── services/downloader.js  ← Lógica de yt-dlp
├── public/
│   ├── index.html              ← Interfaz de usuario
│   ├── css/style.css
│   └── js/main.js
├── downloads/                  ← Videos descargados (temporal)
├── .env                        ← Variables de entorno (desarrollo local)
├── .dockerignore
├── .gitignore
├── package.json
├── Dockerfile                  ← Imagen base node:20
├── Dockerfile.optimizado       ← Alpine + no-root + healthcheck
└── Dockerfile.multistage       ← Build en dos etapas
```

---

## 👤 Autor

**Rodrigo Salva**  
Curso: Desarrollo de Soluciones en la Nube — Contenedores  
Institución: TECSUP · Ciclo 2026-I [code_file:11]