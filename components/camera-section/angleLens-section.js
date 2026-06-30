// ── CAMERA COMPACT V2 ──────────────────────────────────────────────────

const CAMERA_CATEGORIES = [
  { key: "camerabody", label: "Body",       groupId: "#camerabody-group", data: window.cameraBodyData,     type: "scene" },
  { key: "angle",      label: "Angle",      groupId: "#angle-group",      data: window.cameraAngles,      type: "scene" },
  { key: "lens",       label: "Lens",       groupId: "#lens-group",       data: window.lensData,           type: "scene" },
  { key: "composition",label: "Composition", groupId: "#composition-group", data: window.compositionData,    type: "scene" },
  { key: "effects",    label: "Effects",    groupId: "#effects-group",    data: window.cameraEffectsData,   type: "scene" },
  { key: "ratio",      label: "Ratio",      groupId: "#ratio-group",      data: window.ratioData || ratioData, type: "pill" },
  { key: "quality",    label: "Quality",    groupId: "#quality-group",    data: window.qualityData || qualityData, type: "pill" },
];

/* ── Init ──────────────────────────────────────────────────────── */
function initAngleLensComponentEvents() {
  // Render hidden DOM groups for getSel() compatibility
  CAMERA_CATEGORIES.forEach((cat) => {
    if (cat.type === "scene") {
      _renderHiddenSceneGroup(cat.groupId.replace("#", ""), cat.data);
    } else {
      _renderHiddenPillGroup(cat.groupId.replace("#", ""), cat.data);
    }
  });
  // Auto-select first item
  CAMERA_CATEGORIES.forEach((cat) => {
    const group = document.querySelector(cat.groupId);
    if (!group) return;
    if (cat.type === "scene") {
      if (!group.querySelector(".scene-card.selected")) {
        const first = group.querySelector(".scene-card");
        if (first) first.classList.add("selected");
      }
    } else {
      if (!group.querySelector(".pill.active")) {
        const first = group.querySelector(".pill");
        if (first) first.classList.add("active");
      }
    }
  });
  renderCameraDashboard();
}

/* ── Hidden DOM renderers (keep for getSel) ── */
function _renderHiddenSceneGroup(groupId, data) {
  const group = document.getElementById(groupId);
  if (!group || !data) return;
  group.innerHTML = "";
  const isArray = Array.isArray(data);
  const categories = isArray ? { Options: data } : data;
  Object.keys(categories).forEach((category) => {
    if (!isArray) {
      const div = document.createElement("div");
      div.className = "section-divider";
      div.textContent = category;
      group.appendChild(div);
    }
    categories[category].forEach((item) => {
      const card = document.createElement("div");
      card.className = "scene-card";
      card.dataset.val = item.val;
      card.tabIndex = 0;
      card.innerHTML = `
        <div class="scene-card__image-wrapper" style="background:#2a2a2a">
          <div class="scene-card__icon-fallback" style="font-size:9px;color:#666;padding:4px;text-align:center;word-break:break-word">${item.label}</div>
        </div>
        <div class="scene-card__content">
          <div class="scene-card__title">${item.label}</div>
        </div>
      `;
      group.appendChild(card);
    });
  });
  _bindHiddenSingleSelect(groupId);
}

function _renderHiddenPillGroup(groupId, data) {
  const group = document.getElementById(groupId);
  if (!group || !data) return;
  group.innerHTML = "";
  const isArray = Array.isArray(data);
  const categories = isArray ? { Options: data } : data;
  Object.keys(categories).forEach((category) => {
    if (!isArray) {
      const div = document.createElement("div");
      div.className = "section-divider";
      div.textContent = category;
      group.appendChild(div);
    }
    const container = document.createElement("div");
    container.className = "pill-group";
    categories[category].forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pill";
      btn.dataset.val = item.val;
      btn.textContent = item.label;
      if (item.val === "9:16") btn.classList.add("active");
      container.appendChild(btn);
    });
    group.appendChild(container);
  });
  _bindHiddenSingleSelectPill(groupId);
}

function _bindHiddenSingleSelect(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.addEventListener("click", (e) => {
    const card = e.target.closest(".scene-card");
    if (!card) return;
    group.querySelectorAll(".scene-card").forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
    _syncVisibleCards(groupId);
    tryRecompile();
  });
}

function _bindHiddenSingleSelectPill(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.addEventListener("click", (e) => {
    const btn = e.target.closest(".pill");
    if (!btn) return;
    group.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    _syncVisibleCards(groupId);
    tryRecompile();
  });
}

/* ── SVG preview generator ────────────────────────────────────────── */

function _cameraSvg(catKey, item, size) {
  const s = size || 16;
  const sc = 'stroke="currentColor"';
  const fc = 'fill="currentColor"';
  const fn = 'fill="none"';

  if (catKey === 'angle') {
    const l = item.label.toLowerCase();
    if (l.includes('front')) {
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" ${fn}><circle cx="12" cy="12" r="6" ${sc} stroke-width="1.5"/><circle cx="12" cy="12" r="2" ${fc}/></svg>`;
    }
    if (l.includes('3/4') || l.includes('three') || l.includes('editorial')) {
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" ${fn}><ellipse cx="12" cy="12" rx="6" ry="5" ${sc} stroke-width="1.5" transform="rotate(-15 12 12)"/><ellipse cx="12" cy="12" rx="2.5" ry="2" ${fc} opacity="0.5" transform="rotate(-15 12 12)"/></svg>`;
    }
    if (l.includes('low') || l.includes('worm') || l.includes('ground') || l.includes('base')) {
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" ${fn}><path d="M4 18 L12 6 L20 18 Z" ${sc} stroke-width="1.5"/><circle cx="12" cy="14" r="2.5" ${fc}/></svg>`;
    }
    if (l.includes('overhead') || l.includes('top') || l.includes('flat') || l.includes('high angle')) {
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" ${fn}><circle cx="12" cy="12" r="7" ${sc} stroke-width="1.2"/><line x1="12" y1="5" x2="12" y2="19" ${sc} stroke-width="1"/><line x1="5" y1="12" x2="19" y2="12" ${sc} stroke-width="1"/><circle cx="12" cy="12" r="2" ${fc}/></svg>`;
    }
    if (l.includes('macro') || l.includes('close') || l.includes('detail') || l.includes('logo') || l.includes('cap') || l.includes('label') || l.includes('ingredient')) {
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" ${fn}><circle cx="10" cy="10" r="6" ${sc} stroke-width="1.5"/><line x1="14.5" y1="14.5" x2="20" y2="20" ${sc} stroke-width="1.8" stroke-linecap="round"/></svg>`;
    }
    if (l.includes('profile') || l.includes('side') || l.includes('tilted')) {
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" ${fn}><rect x="6" y="5" width="12" height="14" rx="4" ${sc} stroke-width="1.5"/><circle cx="12" cy="10" r="2" ${fc}/></svg>`;
    }
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" ${fn}><path d="M12 5C7 5 2.5 12 2.5 12s4.5 7 9.5 7 9.5-7 9.5-7-4.5-7-9.5-7z" ${sc} stroke-width="1.5"/><circle cx="12" cy="12" r="3.5" ${sc} stroke-width="1.2"/></svg>`;
  }

  switch (catKey) {
    case 'camerabody':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" ${fn}><rect x="2" y="7" width="20" height="12" rx="3" ${sc} stroke-width="1.5"/><rect x="8" y="10" width="8" height="6" rx="3" ${sc} stroke-width="1.2"/><circle cx="5.5" cy="9.5" r="1.2" ${fc}/><rect x="16" y="8" width="3" height="2" rx="0.5" ${sc} stroke-width="0.8"/></svg>`;
    case 'lens':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" ${fn}><circle cx="12" cy="12" r="8" ${sc} stroke-width="1.5"/><circle cx="12" cy="12" r="5" ${sc} stroke-width="1"/><circle cx="12" cy="12" r="2.5" ${fc} opacity="0.4"/><line x1="4" y1="12" x2="20" y2="12" ${sc} stroke-width="0.6"/><line x1="12" y1="4" x2="12" y2="20" ${sc} stroke-width="0.6"/></svg>`;
    case 'composition':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" ${fn}><rect x="3" y="3" width="18" height="18" rx="2" ${sc} stroke-width="1.3"/><line x1="3" y1="12" x2="21" y2="12" ${sc} stroke-width="0.8"/><line x1="12" y1="3" x2="12" y2="21" ${sc} stroke-width="0.8"/></svg>`;
    case 'effects':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" ${fn}><circle cx="8" cy="8" r="2" ${fc} opacity="0.7"/><circle cx="16" cy="7" r="1.5" ${fc} opacity="0.5"/><circle cx="12" cy="16" r="2.5" ${fc} opacity="0.6"/><circle cx="5" cy="17" r="1" ${fc} opacity="0.4"/><circle cx="18" cy="15" r="1" ${fc} opacity="0.4"/></svg>`;
    case 'ratio':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" ${fn}><rect x="4" y="7" width="16" height="10" rx="1.5" ${sc} stroke-width="1.5"/><line x1="12" y1="7" x2="12" y2="17" ${sc} stroke-width="0.6"/></svg>`;
    case 'quality':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" ${fn}><path d="M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 Z" ${sc} stroke-width="1.3"/></svg>`;
    default:
      return '';
  }
}

/* ── Camera Dashboard: sidebar nav + 1:1 card grid ────────────────── */

let _currentCameraCategory = null;

function renderCameraDashboard() {
  const container = document.getElementById("camera-rows");
  if (!container) return;
  container.innerHTML = "";

  // Layout wrapper
  const layout = document.createElement("div");
  layout.className = "camera-dashboard";

  // ── Sidebar nav ──
  const sidebar = document.createElement("nav");
  sidebar.className = "camera-nav";

  CAMERA_CATEGORIES.forEach((cat, idx) => {
    if (!cat.data) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "camera-nav-btn" + (idx === 0 ? " active" : "");
    btn.dataset.catKey = cat.key;
    btn.textContent = cat.label;
    btn.addEventListener("click", () => _switchCameraCategory(cat.key));
    sidebar.appendChild(btn);
  });

  layout.appendChild(sidebar);

  // ── Card grid area ──
  const main = document.createElement("div");
  main.className = "camera-grid-area";
  const grid = document.createElement("div");
  grid.className = "camera-card-grid";
  grid.id = "camera-card-grid";
  main.appendChild(grid);
  layout.appendChild(main);

  container.appendChild(layout);

  // Show first category
  const first = CAMERA_CATEGORIES.find((cat) => cat.data);
  if (first) _switchCameraCategory(first.key);
}

function _switchCameraCategory(catKey) {
  _currentCameraCategory = catKey;
  const cat = CAMERA_CATEGORIES.find((c) => c.key === catKey);
  if (!cat || !cat.data) return;

  // Update nav active state
  document.querySelectorAll(".camera-nav-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.catKey === catKey);
  });

  // Flatten items from all subcategories
  const isArray = Array.isArray(cat.data);
  const categories = isArray ? { Options: cat.data } : cat.data;
  const allItems = [];
  Object.keys(categories).forEach((catName) => {
    categories[catName].forEach((item) => allItems.push(item));
  });

  // Render cards
  const grid = document.getElementById("camera-card-grid");
  if (!grid) return;
  grid.innerHTML = "";

  allItems.forEach((item) => {
    const isSelected = _isSelectedInHidden(cat.groupId, item.val);
    const card = document.createElement("button");
    card.type = "button";
    card.className = "camera-card" + (isSelected ? " active" : "");
    card.dataset.val = item.val;

    const svg = _cameraSvg(cat.key, item, 36);
    card.innerHTML = `
      <span class="camera-card-image">${svg || ""}</span>
      <span class="camera-card-label">${item.label}</span>
    `;

    card.addEventListener("click", () => _onCameraCardClick(cat, item));
    grid.appendChild(card);
  });
}

function _isSelectedInHidden(groupId, val) {
  const el = document.querySelector(`${groupId} .scene-card.selected, ${groupId} .pill.active`);
  return el && el.dataset.val === val;
}

function _onCameraCardClick(cat, item) {
  const grid = document.getElementById("camera-card-grid");
  if (!grid) return;

  // Update visible cards
  grid.querySelectorAll(".camera-card").forEach((c) => c.classList.remove("active"));
  const target = grid.querySelector(`.camera-card[data-val="${item.val.replace(/"/g, "&quot;")}"]`);
  if (target) target.classList.add("active");

  // Sync to hidden DOM
  const group = document.querySelector(cat.groupId);
  if (group) {
    if (cat.type === "scene") {
      group.querySelectorAll(".scene-card").forEach((c) => c.classList.remove("selected"));
      const h = group.querySelector(`.scene-card[data-val="${item.val.replace(/"/g, "&quot;")}"]`);
      if (h) h.classList.add("selected");
    } else {
      group.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
      const h = group.querySelector(`.pill[data-val="${item.val.replace(/"/g, "&quot;")}"]`);
      if (h) h.classList.add("active");
    }
  }

  // Sync hidden input for live compile
  if (typeof updateDOMValue === "function") {
    switch (cat.key) {
      case "camerabody": updateDOMValue("f-camerabody", item.val); break;
      case "angle":      updateDOMValue("f-camera", item.val); break;
      case "lens":       updateDOMValue("f-lens", item.val); break;
      case "composition":updateDOMValue("f-composition", item.val); break;
      case "effects":    updateDOMValue("f-effects", item.val); break;
      case "ratio":      updateDOMValue("f-ratio", item.val); break;
      case "quality":    updateDOMValue("f-quality", item.val); break;
    }
  }

  tryRecompile();
}

function _syncVisibleCards(groupId) {
  const cat = CAMERA_CATEGORIES.find((c) => c.groupId === groupId);
  if (!cat || cat.key !== _currentCameraCategory) return;
  const sel = document.querySelector(`${groupId} .scene-card.selected, ${groupId} .pill.active`);
  if (!sel) return;
  const val = sel.dataset.val;
  document.querySelectorAll("#camera-card-grid .camera-card").forEach((c) => {
    c.classList.toggle("active", c.dataset.val === val);
  });
}
