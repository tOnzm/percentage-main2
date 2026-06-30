// ── COLOR LOCK COMPONENT ───────────────────────────────────────────────

const _COLOR_LOCK_SWATCHES = [
  "#1A1A18", "#3D3A36", "#5C5852", "#7A756D", "#9C978E",
  "#BFB9AE", "#D6D0C4", "#E8E2D6", "#F0EBE0", "#FAF8F2",
  "#9C7A4D", "#7E6038", "#B0895C", "#C4A67A", "#D4BF9E",
  "#2A1040", "#4A3060", "#6B4FA0", "#8B6FC0", "#A88BE0",
  "#B3432B", "#D46040", "#E08060", "#400020", "#600030",
  "#4A90E2", "#2ECC71", "#E74C3C", "#F39C12", "#1ABC9C",
];

let _colorLockEnabled = true;

function initColorLockComponentEvents() {
  const toggle = document.getElementById("color-lock-toggle");
  const hexInput = document.getElementById("color-lock-hex");

  // Render swatches
  _renderColorLockSwatches();

  // Toggle switch
  if (toggle) {
    toggle.addEventListener("click", () => {
      toggle.classList.toggle("active");
      _colorLockEnabled = toggle.classList.contains("active");
      updateColorLockPreview();
      _syncColorLock();
      tryRecompile();
    });
  }

  // Hex input
  if (hexInput) {
    hexInput.addEventListener("input", () => {
      const v = hexInput.value.trim();
      if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
        document.querySelectorAll("#color-lock-swatches .color-lock-swatch").forEach((s) => {
          s.classList.toggle("selected", s.dataset.hex === v);
        });
      }
      updateColorLockPreview();
      _syncColorLock();
      tryRecompile();
    });
  }

  updateColorLockPreview();
}

function _renderColorLockSwatches() {
  const grid = document.getElementById("color-lock-swatches");
  if (!grid) return;

  grid.innerHTML = _COLOR_LOCK_SWATCHES.map((hex) => `
    <div class="color-lock-swatch${hex === getColorLockHex() ? " selected" : ""}"
         style="background:${hex}"
         data-hex="${hex}"
         title="${hex}"></div>
  `).join("");

  grid.addEventListener("click", (e) => {
    const swatch = e.target.closest(".color-lock-swatch");
    if (!swatch) return;

    grid.querySelectorAll(".color-lock-swatch").forEach((s) => s.classList.remove("selected"));
    swatch.classList.add("selected");
    const hex = swatch.dataset.hex;
    const hexInput = document.getElementById("color-lock-hex");
    if (hexInput) hexInput.value = hex;

    // Enable toggle if disabled
    const toggle = document.getElementById("color-lock-toggle");
    if (toggle && !toggle.classList.contains("active")) {
      toggle.classList.add("active");
      _colorLockEnabled = true;
    }

    updateColorLockPreview();
    _syncColorLock();
    tryRecompile();
  });
}

function _syncColorLock() {
  const hex = getColorLockHex();
  if (typeof updateDOMValue === "function") {
    updateDOMValue("f-color", hex);
  }
}

function getColorLockHex() {
  if (!_colorLockEnabled) return "";
  const hexInput = document.getElementById("color-lock-hex");
  const v = hexInput ? hexInput.value.trim() : "";
  return v || "";
}

function updateColorLockPreview() {
  const preview = document.getElementById("color-lock-preview");
  if (!preview) return;
  const hex = getColorLockHex();
  if (!hex) {
    preview.innerHTML = '<span class="color-lock-preview-text">Color Lock disabled</span>';
    return;
  }
  preview.innerHTML = `
    <div class="color-lock-preview">
      <span class="color-lock-preview-swatch" style="background:${hex}"></span>
      <span class="color-lock-preview-text">Maintain accent ${hex} for scene accents and background</span>
    </div>
  `;
}
