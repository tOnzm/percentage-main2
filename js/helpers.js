// ── HELPERS ───────────────────────────────────────────────────────────────
// Pure DOM utilities. No side-effects beyond the target element.

/**
 * Get the `data-val` from every active pill inside an element by ID.
 * @param {string} id - Container element ID
 * @returns {string[]}
 */
function getSel(id) {
  const el = document.getElementById(id);
  if (!el) return [];
  return [...el.querySelectorAll(".pill.active")]
    .map((p) => p.dataset.val)
    .filter(Boolean);
}

/** @param {string} id @returns {string} */
function getInputValueById(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

/** @param {string} selector @returns {string} */
function getActiveText(selector) {
  const el = document.querySelector(selector);
  return el ? el.textContent.trim() : "";
}

/** @param {string} id */
function clearInputElement(id) {
  const el = document.getElementById(id);
  if (el) el.value = "";
}

/** @param {string} id @param {string} txt */
function updateDOMText(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}

/** @param {string} id @param {string} val */
function updateDOMValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

/** @param {string} id @param {string} html */
function updateDOMHtml(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

/**
 * Recompile only when the output panel is visible.
 * Avoids wasted work while the panel is hidden.
 */
function tryRecompile() {
  const panel = document.getElementById("out-panel");
  if (panel && panel.classList.contains("show")) recompile();
}

/**
 * Auto-fit textarea heights to their content.
 */
function autoResize() {
  document.querySelectorAll(".out-compiled, .pm-textarea").forEach((el) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  });
}

/**
 * Switch background type tab and section.
 * Defined here as well as main.js to avoid a load-order dependency;
 * main.js re-declares it, but this ensures helpers can call it safely.
 * @param {string} type
 */
function setBgType(type) {
  currentBgType = type;

  document.querySelectorAll(".bg-type-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.type === type);
  });

  document.querySelectorAll(".bg-section").forEach((section) => {
    section.classList.remove("show");
  });

  const target = document.getElementById(`bg-${type}`);
  if (target) target.classList.add("show");

  tryRecompile();
}

/**
 * Handle a hex color text input — update a color preview swatch and
 * optionally deselect swatches in the same group.
 * @param {string} val        Raw input value
 * @param {string} previewId  ID of the preview <div>
 * @param {string} gridSelector CSS selector for sibling swatches to deselect
 * @param {string} customInputId ID of "custom text" input to clear
 */
function handleHexInput(val, previewId, gridSelector, customInputId) {
  const v = val.trim();
  const isValid = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);
  const preview = document.getElementById(previewId);
  if (preview) preview.style.background = isValid ? v : "transparent";
  if (isValid) {
    document
      .querySelectorAll(gridSelector)
      .forEach((x) => x.classList.remove("selected"));
    clearInputElement(customInputId);
    tryRecompile();
    if (typeof tryRecompile === "function") tryRecompile();
  }
}

function applyStudioBgHex(val) {
  handleHexInput(
    val,
    "studio-bg-hex-preview",
    "#studio-bg-grid .bg-color-swatch",
    "studio-bg-custom",
  );
}

function applyStudioFloorHex(val) {
  handleHexInput(
    val,
    "studio-floor-hex-preview",
    "#studio-floor-grid .bg-color-swatch",
    "studio-floor-custom",
  );
}

/**
 * Bind click-to-select behaviour on a group of swatches.
 * @param {string} selector     CSS selector for the swatch elements
 * @param {string=} customId    Optional — text input to clear on selection
 * @param {string=} hexId       Optional — hex input to clear on selection
 * @param {string=} previewId   Optional — preview div to reset on selection
 */
function setupSwatchEvent(selector, customId, hexId, previewId) {
  document.querySelectorAll(selector).forEach((swatch) => {
    swatch.addEventListener("click", () => {
      document
        .querySelectorAll(selector)
        .forEach((x) => x.classList.remove("selected"));
      swatch.classList.add("selected");
      if (customId) clearInputElement(customId);
      if (hexId) clearInputElement(hexId);
      if (previewId) {
        const el = document.getElementById(previewId);
        if (el) el.style.background = "transparent";
      }
      tryRecompile();
    });
  });
}
