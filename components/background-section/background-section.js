// ── BACKGROUND COMPONENT ──────────────────────────────────────────────────
// Renders all swatches/cards from background_data.js globals,
// then wires all events (selection, hex input, tab switching).

// ─────────────────────────────────────────────────────────────────────────────
// 1. RENDER HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * สร้าง swatch element สี่เหลี่ยมสีเดียว จาก baseColors / studioColors
 * @param {{ hex:string, val:string, label:string }} item
 * @param {boolean} isFirst - กำหนด selected ให้ตัวแรก
 * @returns {HTMLDivElement}
 */
function createColorSwatch(item, isFirst) {
  const el = document.createElement('div');
  el.className = 'bg-color-swatch' + (isFirst ? ' selected' : '');
  el.dataset.val = item.val;
  el.title = item.label;
  el.style.background = item.hex;
  // สีขาว/อ่อนมากเพิ่ม border เพื่อมองเห็นขอบ
  const brightness = hexToBrightness(item.hex);
  if (brightness > 230) el.style.boxShadow = 'inset 0 0 0 1px #ddd';
  return el;
}

/**
 * สร้าง swatch gradient จาก gradientColors
 * @param {{ css:string, val:string, label:string }} item
 * @param {boolean} isFirst
 * @returns {HTMLDivElement}
 */
function createGradSwatch(item, isFirst) {
  const el = document.createElement('div');
  el.className = 'grad-swatch' + (isFirst ? ' selected' : '');
  el.dataset.val = item.val;
  el.title = item.label;
  el.style.background = item.css;
  return el;
}

/**
 * สร้าง scene card จาก sceneCards
 * @param {{ icon:string, title:string, desc:string, val:string }} item
 * @param {boolean} isFirst
 * @returns {HTMLDivElement}
 */
function createSceneCard(item, isFirst) {
  const el = document.createElement('div');
  el.className = 'scene-card' + (isFirst ? ' selected' : '');
  el.dataset.val = item.val;
  el.tabIndex = 0;
  el.innerHTML = `
    <div class="scene-card__icon">${item.icon}</div>
    <div class="scene-card__title">${item.title}</div>
    <div class="scene-card__desc">${item.desc}</div>
  `;
  return el;
}

/**
 * คำนวณความสว่างจาก hex string (#rrggbb)
 * @param {string} hex
 * @returns {number} 0–255
 */
function hexToBrightness(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. RENDER ALL SECTIONS FROM DATA
// ─────────────────────────────────────────────────────────────────────────────

function renderBgSolid() {
  const grid = document.getElementById('solid-grid');
  if (!grid || !Array.isArray(baseColors)) return;
  grid.innerHTML = '';
  baseColors.forEach((item, i) => {
    grid.appendChild(createColorSwatch(item, i === 0));
  });
}

function renderBgGradient() {
  const grid = document.getElementById('grad-grid');
  if (!grid || !Array.isArray(gradientColors)) return;
  grid.innerHTML = '';
  gradientColors.forEach((item, i) => {
    grid.appendChild(createGradSwatch(item, i === 0));
  });

  const dirGroup = document.getElementById('grad-dir-group');
  if (!dirGroup || !Array.isArray(gradientDirections)) return;
  dirGroup.innerHTML = '';
  gradientDirections.forEach((item, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pill' + (i === 0 ? ' active' : '');
    btn.dataset.val = item.val;
    btn.textContent = item.label;
    dirGroup.appendChild(btn);
  });
}

function renderBgStudio() {
  ['studio-bg-grid', 'studio-floor-grid'].forEach(gridId => {
    const grid = document.getElementById(gridId);
    if (!grid || !Array.isArray(studioColors)) return;
    grid.innerHTML = '';
    studioColors.forEach((item, i) => {
      const el = createColorSwatch(item, i === 0);
      // ปรับ val ให้บอก backdrop หรือ floor
      el.dataset.val = gridId === 'studio-bg-grid'
        ? `${item.val} seamless studio backdrop`
        : `${item.val} studio floor`;
      grid.appendChild(el);
    });
  });
}

function renderBgScene() {
  const grid = document.getElementById('scene-grid');
  if (!grid || !Array.isArray(sceneCards)) return;
  grid.innerHTML = '';
  sceneCards.forEach((item, i) => {
    grid.appendChild(createSceneCard(item, i === 0));
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. HEX INPUT HANDLER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * จัดการ input hex ทั่วไป — อัปเดตพรีวิว ล้าง swatch selection
 * @param {string}  rawVal       ค่าจาก input.value
 * @param {string}  previewId    id ของ .hex-preview-box
 * @param {string}  swatchSel    CSS selector ของ swatches ในกลุ่มเดียวกัน
 * @param {string}  customInputId id ของ free-text input
 */
function handleHexChange(rawVal, previewId, swatchSel, customInputId) {
  const v = rawVal.trim();
  const isValid = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);
  const preview = document.getElementById(previewId);
  if (preview) preview.style.background = isValid ? v : 'transparent';
  if (isValid) {
    document.querySelectorAll(swatchSel).forEach(x => x.classList.remove('selected'));
    clearInputElement(customInputId);
    tryRecompile();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. EVENT WIRING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ผูก click → single-select ให้ swatch group
 * @param {string}   selector     CSS selector
 * @param {string=}  clearInputId  ล้าง text input นี้เมื่อเลือก swatch
 * @param {string=}  clearHexId    ล้าง hex input นี้เมื่อเลือก swatch
 * @param {string=}  clearPreviewId reset preview box นี้เมื่อเลือก swatch
 */
function bindSwatchGroup(selector, clearInputId, clearHexId, clearPreviewId) {
  const swatches = document.querySelectorAll(selector);
  swatches.forEach(sw => {
    sw.addEventListener('click', () => {
      swatches.forEach(x => x.classList.remove('selected'));
      sw.classList.add('selected');
      if (clearInputId) clearInputElement(clearInputId);
      if (clearHexId)   clearInputElement(clearHexId);
      if (clearPreviewId) {
        const el = document.getElementById(clearPreviewId);
        if (el) el.style.background = 'transparent';
      }
      tryRecompile();
    });
  });
}

/**
 * ผูก click → single-select ให้ pill group
 * @param {string} groupId
 */
function bindSingleSelectPills(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      group.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      tryRecompile();
    });
  });
}

function initBackgroundComponentEvents() {
  // ── Render all sections from data ──────────────────────────────────────
  renderBgSolid();
  renderBgGradient();
  renderBgStudio();
  renderBgScene();

  // ── Swatch single-select groups ────────────────────────────────────────
  bindSwatchGroup('#solid-grid .bg-color-swatch',
    'solid-custom', 'solid-hex', 'solid-hex-preview');

  bindSwatchGroup('#grad-grid .grad-swatch');

  bindSwatchGroup('#studio-bg-grid .bg-color-swatch',
    'studio-bg-custom', 'studio-bg-hex', 'studio-bg-hex-preview');

  bindSwatchGroup('#studio-floor-grid .bg-color-swatch',
    'studio-floor-custom', 'studio-floor-hex', 'studio-floor-hex-preview');

  bindSwatchGroup('#scene-grid .scene-card');

  // ── Scene card: keyboard access ────────────────────────────────────────
  document.querySelectorAll('#scene-grid .scene-card').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });

  // ── Pill single-select groups ──────────────────────────────────────────
  ['grad-dir-group', 'studio-light-group', 'studio-shadow-group'].forEach(bindSingleSelectPills);

  // ── Hex inputs → preview + deselect swatch ────────────────────────────
  const solidHexEl = document.getElementById('solid-hex');
  if (solidHexEl) {
    solidHexEl.addEventListener('input', () => {
      handleHexChange(
        solidHexEl.value,
        'solid-hex-preview',
        '#solid-grid .bg-color-swatch',
        'solid-custom'
      );
    });
  }

  const studioBgHexEl = document.getElementById('studio-bg-hex');
  if (studioBgHexEl) {
    studioBgHexEl.addEventListener('input', () => {
      handleHexChange(
        studioBgHexEl.value,
        'studio-bg-hex-preview',
        '#studio-bg-grid .bg-color-swatch',
        'studio-bg-custom'
      );
    });
  }

  const studioFloorHexEl = document.getElementById('studio-floor-hex');
  if (studioFloorHexEl) {
    studioFloorHexEl.addEventListener('input', () => {
      handleHexChange(
        studioFloorHexEl.value,
        'studio-floor-hex-preview',
        '#studio-floor-grid .bg-color-swatch',
        'studio-floor-custom'
      );
    });
  }

  // ── Free-text inputs → live recompile ─────────────────────────────────
  ['solid-custom', 'bg-custom-text', 'studio-bg-custom', 'studio-floor-custom'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        // ถ้ามีค่าในช่อง text ให้ล้าง swatch selection
        if (id === 'solid-custom' && el.value.trim()) {
          document.querySelectorAll('#solid-grid .bg-color-swatch').forEach(x => x.classList.remove('selected'));
          clearInputElement('solid-hex');
          const prev = document.getElementById('solid-hex-preview');
          if (prev) prev.style.background = 'transparent';
        }
        tryRecompile();
      });
    }
  });

  // ── Tab bar: sync aria-selected ────────────────────────────────────────
  document.querySelectorAll('.bg-type-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.bg-type-tab').forEach(t => t.setAttribute('aria-selected', 'false'));
      tab.setAttribute('aria-selected', 'true');
    });
  });
}
