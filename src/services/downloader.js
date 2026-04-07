const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const DOWNLOADS_PATH = path.resolve(
  process.env.DOWNLOADS_PATH || "./downloads",
);

if (!fs.existsSync(DOWNLOADS_PATH)) {
  fs.mkdirSync(DOWNLOADS_PATH, { recursive: true });
}

const SUPPORTED_PLATFORMS = {
  instagram: /instagram\.com/i,
  youtube: /youtube\.com|youtu\.be/i,
  tiktok: /tiktok\.com/i,
  facebook: /facebook\.com|fb\.watch/i,
  linkedin: /linkedin\.com/i,
};

function detectPlatform(url) {
  for (const [platform, regex] of Object.entries(SUPPORTED_PLATFORMS)) {
    if (regex.test(url)) return platform;
  }
  return null;
}

function validateUrl(url) {
  try {
    new URL(url);
  } catch {
    throw new Error("URL inválida. Verifica el formato.");
  }
  const platform = detectPlatform(url);
  if (!platform) {
    throw new Error(
      "Plataforma no soportada. Usa: Instagram, YouTube, TikTok, Facebook o LinkedIn.",
    );
  }
  return platform;
}

function getVideoInfo(url) {
  return new Promise((resolve, reject) => {
    const cmd = `yt-dlp --dump-json --no-playlist "${url}"`;
    exec(cmd, { timeout: 30000 }, (error, stdout) => {
      if (error)
        return reject(new Error("No se pudo obtener información del video."));
      try {
        const info = JSON.parse(stdout);
        resolve({
          title: info.title || "Sin título",
          duration: info.duration || 0,
          thumbnail: info.thumbnail || null,
          platform: info.extractor_key || "Unknown",
          uploader: info.uploader || "Desconocido",
        });
      } catch {
        reject(new Error("Error al procesar la información del video."));
      }
    });
  });
}

function downloadVideo(url) {
  return new Promise((resolve, reject) => {
    const fileId = uuidv4();
    const output = path.join(DOWNLOADS_PATH, `${fileId}.%(ext)s`);
    const cmd = [
      "yt-dlp",
      "--no-playlist",
      '--format "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best"',
      "--merge-output-format mp4",
      `--output "${output}"`,
      `"${url}"`,
    ].join(" ");

    console.log(`[DOWNLOAD] Iniciando: ${url}`);
    exec(cmd, { timeout: 120000 }, (error, _stdout, stderr) => {
      if (error) {
        console.error("[DOWNLOAD ERROR]", stderr);
        return reject(
          new Error("Error al descargar el video. Intenta de nuevo."),
        );
      }
      const files = fs
        .readdirSync(DOWNLOADS_PATH)
        .filter((f) => f.startsWith(fileId));
      if (!files.length)
        return reject(new Error("No se encontró el archivo descargado."));
      const filename = files[0];
      console.log(`[DOWNLOAD] Completado: ${filename}`);
      resolve({ filename, filepath: path.join(DOWNLOADS_PATH, filename) });
    });
  });
}

function cleanOldFiles(maxAgeMinutes = 30) {
  const maxAgeMs = maxAgeMinutes * 60 * 1000;
  const now = Date.now();
  fs.readdirSync(DOWNLOADS_PATH).forEach((file) => {
    const filepath = path.join(DOWNLOADS_PATH, file);
    const stat = fs.statSync(filepath);
    if (now - stat.mtimeMs > maxAgeMs) {
      fs.unlinkSync(filepath);
      console.log(`[CLEANUP] Eliminado: ${file}`);
    }
  });
}

setInterval(
  () => cleanOldFiles(Number(process.env.MAX_FILE_AGE_MINUTES) || 30),
  30 * 60 * 1000,
);

module.exports = { detectPlatform, validateUrl, getVideoInfo, downloadVideo };