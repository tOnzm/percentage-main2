// ── DASHBOARD ────────────────────────────────────────────────────────────

const DASHBOARD_SECTIONS = [
  { id: 'product',     label: 'Product',    icon: 'inventory_2',  file: 'components/product-section/product-section.html',     initFn: 'initProductComponentEvents' },
  { id: 'theme',       label: 'Theme',       icon: 'palette',      file: 'components/scene-section/theme-section.html',       initFn: 'initThemeComponentEvents' },
  { id: 'lighting',    label: 'Lighting',    icon: 'light_mode',   file: 'components/scene-section/lighting-section.html',    initFn: 'initLightingComponentEvents' },
  { id: 'atmosphere',  label: 'Atmosphere',  icon: 'blur_on',      file: 'components/scene-section/atmosphere-section.html',  initFn: 'initAtmosphereComponentEvents' },
  { id: 'colorLock',   label: 'Color Lock',  icon: 'format_paint', file: 'components/scene-section/color-lock-section.html',  initFn: 'initColorLockComponentEvents' },
  { id: 'background',  label: 'Background',  icon: 'image',        file: 'components/background-section/background-section.html', initFn: 'initBackgroundComponentEvents' },
  { id: 'camera',      label: 'Camera',      icon: 'photo_camera', file: 'components/camera-section/angleLens-section.html',  initFn: 'initAngleLensComponentEvents' },
  { id: 'props',       label: 'Props',       icon: 'slide_library',file: 'components/scene-section/props-section.html',       initFn: 'initPropsComponentEvents' },
  { id: 'placement',   label: 'Placement',   icon: 'check_box_outline_blank', file: 'components/scene-section/placement-section.html', initFn: 'initPlacementComponentEvents' },
];

let _currentSectionId = null;

/* ── HTML transform: inline all internal modals ──────────────────────── */

function _inlineModals(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const triggerIds = [
    'open-product-modal', 'open-background-modal',
    'open-props-modal', 'open-placement-modal',
  ];
  triggerIds.forEach((id) => {
    const btn = doc.getElementById(id);
    if (btn) btn.style.display = 'none';
  });

  doc.querySelectorAll('.pm-modal').forEach((modal) => {
    modal.classList.remove('pm-modal');
    modal.classList.add('pm-modal-inline');

    const overlay = modal.querySelector('.pm-modal-overlay');
    if (overlay) overlay.remove();

    const header = modal.querySelector('.pm-modal-header');
    if (header) header.remove();

    const footer = modal.querySelector('.pm-modal-footer');
    if (footer) footer.remove();

    modal.style.position = 'static';
    modal.style.inset = 'auto';
    modal.style.zIndex = 'auto';
    modal.style.pointerEvents = 'auto';
    modal.style.opacity = '1';
    modal.style.display = 'block';
    modal.style.padding = '0';

    const container = modal.querySelector('.pm-modal-container');
    if (container) {
      container.style.transform = 'none';
      container.style.boxShadow = 'none';
      container.style.border = 'none';
      container.style.borderRadius = '0';
      container.style.width = '100%';
      container.style.maxWidth = 'none';
      container.style.margin = '0';
    }
  });

  return doc.body.innerHTML;
}

/* ── Dashboard init ────────────────────────────────────────────────── */

async function initDashboard() {
  await Promise.all(DASHBOARD_SECTIONS.map(async (section) => {
    const container = document.getElementById(`dashboard-section-${section.id}`);
    if (!container) return;
    try {
      const resp = await fetch(section.file);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const html = await resp.text();
      container.innerHTML = _inlineModals(html);
    } catch (err) {
      console.error(`[Dashboard] Failed to load ${section.file}:`, err);
    }
  }));

  if (typeof renderProductTabs === 'function') renderProductTabs();
  if (typeof initProductModal === 'function') initProductModal();

  DASHBOARD_SECTIONS.forEach((section) => {
    if (typeof window[section.initFn] === 'function') {
      try {
        window[section.initFn]();
      } catch (e) {
        console.error(`[Dashboard] Error in ${section.initFn}:`, e);
      }
    }
  });

  _wireKeyboardNav();

  renderDashboardButtons();
  updateAllDashboardButtons();

  showSection(DASHBOARD_SECTIONS[0].id);
}

/* ── Buttons ────────────────────────────────────────────────────────── */

function renderDashboardButtons() {
  const list = document.getElementById('dashboard-btn-list');
  if (!list) return;

  list.innerHTML = DASHBOARD_SECTIONS.map((s) => `
    <button type="button" class="dashboard-btn" id="dash-btn-${s.id}" data-section="${s.id}">
      <span class="dashboard-btn-icon">
        <span class="material-symbols-outlined">${s.icon}</span>
      </span>
      <span class="dashboard-btn-body">
        <span class="dashboard-btn-label">${s.label}</span>
        <span class="dashboard-btn-value" id="dash-val-${s.id}"></span>
      </span>
      <span class="dashboard-btn-indicator" id="dash-ind-${s.id}"></span>
    </button>
  `).join('');

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.dashboard-btn');
    if (!btn) return;
    const sectionId = btn.dataset.section;
    if (sectionId) showSection(sectionId);
  });
}

function updateDashboardButtonValue(sectionId) {
  const valEl = document.getElementById(`dash-val-${sectionId}`);
  const indEl = document.getElementById(`dash-ind-${sectionId}`);
  const btnEl = document.getElementById(`dash-btn-${sectionId}`);
  if (!valEl) return;

  const val = _getSectionValue(sectionId);
  valEl.textContent = val;

  if (btnEl) btnEl.classList.toggle('has-value', !!val);
  if (indEl) indEl.style.display = val ? '' : 'none';
}

function updateAllDashboardButtons() {
  DASHBOARD_SECTIONS.forEach((s) => updateDashboardButtonValue(s.id));
}

function _getSectionValue(sectionId) {
  switch (sectionId) {
    case 'product': {
      const prods = typeof getSelectedProducts === 'function' ? getSelectedProducts() : [];
      return prods[0]?.name || '';
    }
    case 'theme': {
      const sel = document.querySelector('#theme-group .scene-card.selected');
      if (sel) return sel.querySelector('.scene-card__title')?.textContent || '';
      return '';
    }
    case 'lighting': {
      const count = document.querySelectorAll('[id^="lighting-pills-"] .pill.active').length;
      return count > 0 ? `${count} settings` : '';
    }
    case 'atmosphere': {
      const actives = document.querySelectorAll('#atmosphere-group .pill.active');
      return Array.from(actives).map((b) => b.textContent.trim()).join(', ');
    }
    case 'colorLock': {
      const hex = typeof getColorLockHex === 'function' ? getColorLockHex() : '';
      return hex || 'Off';
    }
    case 'background': {
      const detail = document.getElementById('background-detail');
      if (!detail) return '';
      const labelEl = detail.querySelector('.snotes');
      if (labelEl && labelEl.textContent.includes('ยังไม่เลือก')) return '';
      const chip = detail.querySelector('.product-chip span');
      return chip ? chip.textContent.trim() : '';
    }
    case 'camera': {
      const body = document.querySelector('#camerabody-group .scene-card.selected .scene-card__title');
      const angle = document.querySelector('#angle-group .scene-card.selected .scene-card__title');
      const lens = document.querySelector('#lens-group .scene-card.selected .scene-card__title');
      const parts = [];
      if (body) parts.push(body.textContent.trim());
      if (angle) parts.push(angle.textContent.trim());
      if (lens) parts.push(lens.textContent.trim());
      return parts.join(' / ');
    }
    case 'props': {
      const count = document.querySelectorAll('#props-modal-main .props-card.active').length;
      if (count > 0) return `${count} items`;
      return '';
    }
    case 'placement': {
      const detail = document.getElementById('placement-detail');
      if (!detail) return '';
      const labelEl = detail.querySelector('.snotes');
      if (labelEl && labelEl.textContent.includes('ยังไม่เลือก')) return '';
      const chip = detail.querySelector('.product-chip span');
      return chip ? chip.textContent.trim() : '';
    }
    default:
      return '';
  }
}

/* ── Content Panel ──────────────────────────────────────────────────── */

function showSection(sectionId) {
  if (sectionId === _currentSectionId) return;

  const section = DASHBOARD_SECTIONS.find((s) => s.id === sectionId);
  if (!section) return;

  const container = document.getElementById(`dashboard-section-${sectionId}`);
  const contentPanel = document.getElementById('dashboard-content');
  if (!container || !contentPanel) return;

  const prevSectionId = _currentSectionId;

  // Move previous section content back to hidden container
  if (prevSectionId) {
    const prevContainer = document.getElementById(`dashboard-section-${prevSectionId}`);
    const bodyEl = document.getElementById('dash-content-body');
    if (prevContainer && bodyEl) {
      while (bodyEl.firstChild) {
        prevContainer.appendChild(bodyEl.firstChild);
      }
    }
  }

  // Ensure header + body structure
  let headerEl = document.getElementById('dash-content-header');
  if (!headerEl) {
    contentPanel.innerHTML = '';
    const template = document.getElementById('dash-section-header-template');
    if (template) {
      contentPanel.appendChild(template.content.cloneNode(true));
    }
    const body = document.createElement('div');
    body.id = 'dash-content-body';
    body.className = 'dash-content-body';
    contentPanel.appendChild(body);
  }

  // Set title
  const titleEl = document.getElementById('dash-content-title');
  if (titleEl) {
    titleEl.innerHTML = `<span class="material-symbols-outlined">${section.icon}</span> ${section.label}`;
  }

  _currentSectionId = sectionId;
  _updateSectionNav();
  _updateActiveButton(sectionId);

  // Move section content into body
  const bodyEl = document.getElementById('dash-content-body');
  if (bodyEl && container.children.length > 0) {
    while (container.firstChild) {
      bodyEl.appendChild(container.firstChild);
    }
  }

  updateDashboardButtonValue(sectionId);
  tryRecompile();
}

function _updateActiveButton(sectionId) {
  document.querySelectorAll('.dashboard-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.section === sectionId);
  });
}

function _navigateSection(dir) {
  const idx = DASHBOARD_SECTIONS.findIndex((s) => s.id === _currentSectionId);
  if (idx === -1) return;
  const next = idx + dir;
  if (next < 0 || next >= DASHBOARD_SECTIONS.length) return;
  showSection(DASHBOARD_SECTIONS[next].id);
}

function _updateSectionNav() {
  const idx = DASHBOARD_SECTIONS.findIndex((s) => s.id === _currentSectionId);
  const prevBtn = document.getElementById('dash-prev-btn');
  const nextBtn = document.getElementById('dash-next-btn');
  if (prevBtn) prevBtn.style.opacity = idx <= 0 ? '0.2' : '1';
  if (nextBtn) nextBtn.style.opacity = idx >= DASHBOARD_SECTIONS.length - 1 ? '0.2' : '1';
}

function _wireKeyboardNav() {
  document.addEventListener('keydown', (e) => {
    if (!_currentSectionId) return;
    if (e.key === 'ArrowLeft') _navigateSection(-1);
    if (e.key === 'ArrowRight') _navigateSection(1);
  });

  document.addEventListener('click', (e) => {
    const prevBtn = e.target.closest('#dash-prev-btn');
    const nextBtn = e.target.closest('#dash-next-btn');
    if (prevBtn) _navigateSection(-1);
    if (nextBtn) _navigateSection(1);
  });
}
