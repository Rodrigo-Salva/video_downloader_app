const express = require("express");
const path = require("path");
const fs = require("fs");
const {
  validateUrl,
  getVideoInfo,
  downloadVideo,
} = require("../services/downloader");

const router = express.Router();

// GET info del video
router.post("/info", async (req, res) => {
  const { url } = req.body;
  if (!url)
    return res.status(400).json({ success: false, error: "URL requerida." });
  try {
    const platform = validateUrl(url);
    const info = await getVideoInfo(url);
    res.json({ success: true, platform, ...info });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST descargar video
router.post("/download", async (req, res) => {
  const { url } = req.body;
  if (!url)
    return res.status(400).json({ success: false, error: "URL requerida." });
  try {
    validateUrl(url);
    const { filename } = await downloadVideo(url);
    res.json({
      success: true,
      filename,
      downloadUrl: `/downloads/${filename}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE archivo descargado
router.delete("/file/:filename", (req, res) => {
  const { filename } = req.params;
  if (filename.includes("..") || filename.includes("/")) {
    return res
      .status(400)
      .json({ success: false, error: "Nombre de archivo inválido." });
  }
  const filepath = path.join(__dirname, "../../downloads", filename);
  if (!fs.existsSync(filepath)) {
    return res
      .status(404)
      .json({ success: false, error: "Archivo no encontrado." });
  }
  fs.unlinkSync(filepath);
  res.json({ success: true, message: "Archivo eliminado." });
});

module.exports = router;