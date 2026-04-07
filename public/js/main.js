// Theme toggle
(function () {
  const toggle = document.querySelector("[data-theme-toggle]");
  const html = document.documentElement;
  let theme = matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  html.setAttribute("data-theme", theme);
  toggle?.addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", theme);
  });
})();

const urlInput = document.getElementById("videoUrl");
const infoBtn = document.getElementById("infoBtn");
const downloadBtn = document.getElementById("downloadBtn");
const statusBox = document.getElementById("statusBox");
const videoPreview = document.getElementById("videoPreview");
const resultCard = document.getElementById("resultCard");
const downloadLink = document.getElementById("downloadLink");

function showStatus(msg, type = "loading") {
  statusBox.className = `status-box ${type}`;
  statusBox.innerHTML =
    type === "loading" ? `<span class="spinner"></span>${msg}` : msg;
  statusBox.classList.remove("hidden");
}

function setLoading(btn, state) {
  btn.disabled = state;
  btn.style.opacity = state ? "0.6" : "1";
}

infoBtn.addEventListener("click", async () => {
  const url = urlInput.value.trim();
  if (!url) return showStatus("Ingresa una URL primero.", "error");
  videoPreview.classList.add("hidden");
  resultCard.classList.add("hidden");
  showStatus("Obteniendo información del video...");
  setLoading(infoBtn, true);
  try {
    const res = await fetch("/api/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    document.getElementById("previewThumb").src = data.thumbnail || "";
    document.getElementById("previewTitle").textContent = data.title;
    document.getElementById("previewMeta").textContent =
      `${data.platform} · ${data.uploader} · ${data.duration ? Math.round(data.duration) + "s" : ""}`;
    videoPreview.classList.remove("hidden");
    statusBox.classList.add("hidden");
  } catch (err) {
    showStatus(`❌ ${err.message}`, "error");
  } finally {
    setLoading(infoBtn, false);
  }
});

downloadBtn.addEventListener("click", async () => {
  const url = urlInput.value.trim();
  if (!url) return showStatus("Ingresa una URL primero.", "error");
  resultCard.classList.add("hidden");
  showStatus("Descargando video... esto puede tomar unos segundos ⏳");
  setLoading(downloadBtn, true);
  try {
    const res = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    downloadLink.href = data.downloadUrl;
    downloadLink.download = data.filename;
    resultCard.classList.remove("hidden");
    showStatus("✅ Video descargado correctamente.", "success");
  } catch (err) {
    showStatus(`❌ ${err.message}`, "error");
  } finally {
    setLoading(downloadBtn, false);
  }
});

urlInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") downloadBtn.click();
});