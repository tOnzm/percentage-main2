// ── LIGHTING COMPONENT (Sub-controls) ───────────────────────────────────

const LIGHTING_SUB_KEYS = [
  { id: "key",        label: "Key Light",     dataKey: "keyLight" },
  { id: "fill",       label: "Fill Light",    dataKey: "fillLight" },
  { id: "rim",        label: "Rim Light",     dataKey: "rimLight" },
  { id: "shadow",     label: "Shadow",        dataKey: "shadowType" },
  { id: "reflection", label: "Reflection",    dataKey: "reflection" },
];

function initLightingComponentEvents() {
  renderLightingSubControls();
}

function renderLightingSubControls() {
  const data = window.lightingData;
  if (!data) {
    console.warn("[Lighting] window.lightingData not found");
    return;
  }

  LIGHTING_SUB_KEYS.forEach((sub) => {
    const container = document.getElementById(`lighting-${sub.id}-group`);
    if (!container) {
      console.warn(`[Lighting] container #lighting-${sub.id}-group not found`);
      return;
    }

    const items = data[sub.dataKey];
    if (!items) {
      console.warn(`[Lighting] no items for dataKey "${sub.dataKey}"`);
      return;
    }

    container.innerHTML = [
      `<div class="pm-label">${sub.label}</div>`,
      `<div class="pill-group" id="lighting-pills-${sub.id}" role="group">`,
      items.map((item, i) =>
        `<button type="button" class="pill${i === 0 ? " active" : ""}" data-val="${item.val}" data-sub="${sub.id}">${item.label}</button>`
      ).join(""),
      `</div>`,
    ].join("");
  });

  document.querySelectorAll("[id^='lighting-pills-']").forEach((group) => {
    group.addEventListener("click", (e) => {
      const btn = e.target.closest(".pill");
      if (!btn) return;
      const sub = btn.dataset.sub;
      group.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      if (typeof updateDOMValue === "function") {
        updateDOMValue("f-lighting", getLightingVal());
      }
      tryRecompile();
    });
  });
}

function getLightingVal() {
  const parts = [];
  LIGHTING_SUB_KEYS.forEach((sub) => {
    const active = document.querySelector(`#lighting-pills-${sub.id} .pill.active`);
    if (active && active.dataset.val) parts.push(active.dataset.val);
  });
  return parts.join(". ");
}

function getLightingLabel() {
  const parts = [];
  LIGHTING_SUB_KEYS.forEach((sub) => {
    const active = document.querySelector(`#lighting-pills-${sub.id} .pill.active`);
    if (active) parts.push(active.textContent.trim());
  });
  return parts.join(" | ");
}
