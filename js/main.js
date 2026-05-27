// ── MAIN ──────────────────────────────────────────────────────────────────
// Application bootstrap: load HTML components → wire events → reveal UI.

/**
 * Fetch and inject one HTML component into a placeholder element.
 * @param {string} elementId   ID of the target placeholder
 * @param {string} filePath    Path to the component HTML file
 * @returns {Promise<void>}
 */
async function loadComponent(elementId, filePath) {
  const response = await fetch(filePath);
  if (!response.ok) {
    throw new Error(`Failed to load component "${filePath}" (HTTP ${response.status})`);
  }
  const html = await response.text();
  const el = document.getElementById(elementId);
  if (el) el.innerHTML = html;
}

/**
 * Bootstrap the entire application.
 * 1. Fetch all component HTML in parallel
 * 2. Initialise UI logic & event listeners for each component
 * 3. Fade in placeholders via CSS
 */
async function initApplication() {
  const placeholderIds = [
    'product-section-placeholder',
    'scene-section-placeholder',
    'background-section-placeholder',
    'camera-section-placeholder',
    'output-section-placeholder',
  ];

  try {
    // ── Step 1: Load all component HTML ─────────────────────────────────
    await Promise.all([
      loadComponent('product-section-placeholder',    'components/product-section/product-section.html'),
      loadComponent('scene-section-placeholder',      'components/scene-section/scene-section.html'),
      loadComponent('background-section-placeholder', 'components/background-section/background-section.html'),
      loadComponent('camera-section-placeholder',     'components/camera-section/camera-section.html'),
      loadComponent('output-section-placeholder',     'components/output-section/output-section.html'),
    ]);

    // ── Step 2: Wire up component events ────────────────────────────────
    renderProductTabs();
    resetToDefaultProduct();
    initProductComponentEvents();
    initSceneComponentEvents();
    initBackgroundComponentEvents();
    initCameraComponentEvents();

    // ── Step 3: Reveal UI with fade-in ──────────────────────────────────
    placeholderIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.add('loaded');
        el.removeAttribute('aria-busy');
      }
    });

  } catch (err) {
    console.error('[PromptGen] Boot error:', err);

    const container = document.getElementById('app-root');
    if (container) {
      const banner = document.createElement('div');
      banner.className = 'error-banner';
      banner.innerHTML = `
        <strong>เกิดข้อผิดพลาดในการโหลดระบบ</strong>
        ${err.message}<br>
        <small>คำแนะนำ: รันหน้าเว็บผ่าน Live Server (http://...) ไม่ใช่เปิดไฟล์ตรงๆ (file:///...)</small>
      `;
      container.prepend(banner);
    }
  }
}

initApplication();
