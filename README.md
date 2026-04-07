# 🎬 VideoGrab — Descargador de Videos para Redes Sociales

Aplicación web con **Node.js + Express** para descargar videos de Instagram, YouTube, TikTok, Facebook y LinkedIn. Todo corre dentro del contenedor, por lo que solo es necesario tener Docker instalado. [code_file:11]

---

## ✅ Requisito único

| Herramienta | Versión | Verificar |
|---|---|---|
| Docker | 24.x o superior | `docker --version` [code_file:11] |

> Node.js, yt-dlp y ffmpeg se instalan automáticamente dentro del contenedor. [code_file:11]

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
├── downloads/                  ← Videos descargados temporalmente
├── .env                        ← Variables para desarrollo local
├── .dockerignore
├── .gitignore
├── package.json
├── Dockerfile                  ← Imagen base
├── Dockerfile.optimizado       ← Imagen optimizada
└── Dockerfile.multistage       ← Imagen multi-stage
```

---

## 🐳 Dockerfile base

El archivo `Dockerfile` crea una imagen funcional basada en `node:20`, instala dependencias, copia la aplicación completa y expone el puerto 3000. [code_file:11]

### Construir imagen base

```bash
docker build -t video-downloader:v1.0 .
```

### Ejecutar contenedor base

```bash
docker run -d -p 3000:3000 --name videograb video-downloader:v1.0
```

### Acceder a la app

```text
http://localhost:3000
```

---

## 🐳 Dockerfile.optimizado

El archivo `Dockerfile.optimizado` usa `node:20-alpine`, instala solo lo necesario, corre con usuario no-root y agrega `HEALTHCHECK`, por lo que mejora seguridad y reduce tamaño respecto al Dockerfile base. [code_file:11]

### Construir imagen optimizada

```bash
docker build -f Dockerfile.optimizado -t video-downloader:v1.1-alpine .
```

### Ejecutar contenedor optimizado

```bash
docker run -d -p 3000:3000 --name videograb-alpine video-downloader:v1.1-alpine
```

### Acceder a la app

```text
http://localhost:3000
```

---

## 🐳 Dockerfile.multistage

El archivo `Dockerfile.multistage` utiliza una construcción en dos etapas: una para instalar dependencias y otra para ejecutar solo lo necesario, logrando una imagen final más limpia y ligera. [code_file:11]

### Construir imagen multistage

```bash
docker build -f Dockerfile.multistage -t video-downloader:v1.2-multistage .
```

### Ejecutar contenedor multistage

```bash
docker run -d -p 3000:3000 --name videograb-multistage video-downloader:v1.2-multistage
```

### Acceder a la app

```text
http://localhost:3000
```

---

## 📊 Comparación de imágenes

Las tres imágenes cumplen la misma función, pero fueron construidas con enfoques diferentes para comparar tamaño, seguridad y optimización. [file:1][code_file:11]

| Archivo | Características |
|---|---|
| `Dockerfile` | Imagen base, más simple de entender y construir. [code_file:11] |
| `Dockerfile.optimizado` | Usa Alpine, usuario no-root y healthcheck. [code_file:11] |
| `Dockerfile.multistage` | Usa varias etapas para reducir tamaño final. [code_file:11] |

### Ver tamaños

```bash
docker images | grep video-downloader
```

---

## ⚙️ Variables de entorno

Las variables de entorno para Docker están definidas con `ENV` dentro de los Dockerfiles, por lo que el contenedor funciona sin depender del archivo `.env` al ejecutarse. [code_file:11]

| Variable | Valor | Descripción |
|---|---|---|
| `PORT` | `3000` | Puerto del servidor. [code_file:11] |
| `DOWNLOADS_PATH` | `/app/downloads` | Ruta donde se guardan los videos. [code_file:11] |
| `MAX_FILE_AGE_MINUTES` | `30` | Tiempo de vida de archivos descargados. [code_file:11] |

### Verificarlas dentro del contenedor

```bash
docker exec videograb printenv | grep -E "PORT|DOWNLOADS|MAX_FILE"
```

---

## 📋 Comandos útiles

```bash
# Ver contenedores en ejecución
docker ps

# Ver logs
docker logs -f videograb

# Ver archivos descargados
docker exec videograb ls /app/downloads

# Detener contenedor
docker stop videograb

# Eliminar contenedor
docker rm videograb
```

---

## 🔄 Reconstrucción

Si haces cambios en el proyecto, debes detener el contenedor anterior, reconstruir la imagen y volver a ejecutar. [code_file:11]

```bash
docker stop videograb
docker rm videograb
docker build -t video-downloader:v1.0 .
docker run -d -p 3000:3000 --name videograb video-downloader:v1.0
```

---

## 🌍 Plataformas soportadas

La aplicación fue diseñada para descargar videos desde Instagram, YouTube, TikTok, Facebook y LinkedIn, tal como solicita la práctica calificada. [file:1][code_file:11]

| Plataforma | Ejemplo de URL |
|---|---|
| Instagram | `https://www.instagram.com/reel/XXXXX/` [code_file:11] |
---

## 🔧 Solución de problemas

Si el puerto 3000 ya está en uso, puedes cerrar el proceso o usar otro puerto, por ejemplo `3001:3000`. [code_file:11]

```bash
# Ver qué usa el puerto 3000
netstat -ano | findstr :3000

# Matar proceso
taskkill /f /pid <PID>

# O correr en otro puerto
docker run -d -p 3001:3000 --name videograb video-downloader:v1.0
```

Para revisar errores del contenedor, usa los logs. [code_file:11]

```bash
docker logs videograb
```

---

## 👤 Autor

**Rodrigo Salva**  
Curso: Desarrollo de Soluciones en la Nube — Contenedores  
Institución: TECSUP · Ciclo 2026-I