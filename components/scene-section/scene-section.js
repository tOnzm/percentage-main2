// ── SCENE COMPONENT ───────────────────────────────────────────────────────

function initSceneComponentEvents() {
  _renderPlacement();
  _renderProps();
  updateSelectedItemsDisplay();
}

// ─── Render placement pills จาก placementData ────────────────────────────
function _renderPlacement() {
  const group = document.getElementById('placement-group');
  if (!group || typeof placementData === 'undefined') return;

  group.innerHTML = '';
  placementData.forEach((item, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pill' + (i === 0 ? ' active' : '');
    btn.dataset.val = item.val;
    btn.textContent = item.label;
    group.appendChild(btn);
  });

  group.addEventListener('click', e => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    group.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    updateSelectedItemsDisplay();
    tryRecompile();
  });

  // custom placement input
  const customInput = document.getElementById('placement-custom');
  if (customInput) {
    customInput.addEventListener('input', () => {
      if (customInput.value.trim()) {
        group.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      }
      tryRecompile();
    });
  }
}

// ─── Render props แยก category จาก propsData ─────────────────────────────
function _renderProps() {
  const container = document.getElementById('props-categories-container');
  if (!container || !window.propsData || !window.propsData.length) return;

  container.innerHTML = '';
  const categories = [...new Set(window.propsData.map(d => d.category))];

  categories.forEach(catName => {
    const items = window.propsData.filter(d => d.category === catName);
    const catId = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const section = document.createElement('div');
    section.className = 'props-cat-section';
    section.innerHTML = `
      <div class="section-divider">${catName}</div>
      <div class="pill-group" id="props-cat-${catId}">
        ${items.map(p => `
          <button type="button" class="pill" data-val="${p.val}" data-cat="${catName}">
            ${p.icon ? `<span aria-hidden="true">${p.icon}</span> ` : ''}${p.label}
          </button>`).join('')}
      </div>
      <div id="display-props-${catId}" class="grid-preview-container"></div>
    `;
    container.appendChild(section);

    // multi-select toggle
    section.querySelectorAll('.pill').forEach(pill => {
      pill.addEventListener('click', () => {
        pill.classList.toggle('active');
        updateSelectedItemsDisplay();
        tryRecompile();
      });
    });
  });
}

// ─── อัปเดตพรีวิวทั้ง placement และ props ────────────────────────────────
function updateSelectedItemsDisplay() {
  // placement preview
  const placementArea = document.getElementById('display-selected-placement');
  if (placementArea && typeof placementData !== 'undefined') {
    placementArea.innerHTML = '';
    const active = document.querySelector('#placement-group .pill.active');
    if (active && active.dataset.val) {
      const data = placementData.find(p => p.val === active.dataset.val);
      if (data) _renderPreviewItem(data, placementArea);
    }
  }

  // props preview — แยกตาม category
  if (window.propsData && window.propsData.length) {
    const categories = [...new Set(window.propsData.map(d => d.category))];
    categories.forEach(catName => {
      const catId = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const area = document.getElementById(`display-props-${catId}`);
      if (!area) return;
      area.innerHTML = '';
      document.querySelectorAll(`#props-cat-${catId} .pill.active`).forEach(pill => {
        const data = window.propsData.find(p => p.val === pill.dataset.val);
        if (data) _renderPreviewItem(data, area);
      });
    });
  }
}

// ─── สร้าง preview item element ───────────────────────────────────────────
/* function _renderPreviewItem(data, container) {
  const hasImage = !!data.image;
  const wrap = document.createElement('div');
  wrap.className = 'selected-item-preview' + (hasImage ? ' clickable' : '');
  wrap.innerHTML = `
    <div class="preview-box${!hasImage ? ' no-image' : ''}">
      ${hasImage
        ? `<img src="${data.image}" alt="${data.label}" loading="lazy" onerror="this.parentElement.classList.add('no-image');this.remove()">`
        : `<span class="preview-icon" aria-hidden="true">${data.icon || '🖼'}</span>`}
    </div>
    <span class="preview-label">${data.label}</span>
  `;

  if (hasImage) {
    wrap.querySelector('.preview-box').addEventListener('click', () => {
      const lb = document.getElementById('lightbox');
      if (!lb) return;
      lb.querySelector('img').src = data.image;
      lb.style.display = 'flex';
    });
  }
  container.appendChild(wrap);
} */

  function _renderPreviewItem(data, container) {
  const hasImage = !!data.image;
  const wrap = document.createElement('div');
  wrap.className = 'selected-item-preview';
  
  // เพิ่ม class no-image หากไม่มีรูป
  wrap.innerHTML = `
    <div class="preview-box ${!hasImage ? 'no-image' : ''}">
      ${hasImage
        ? `<img src="${data.image}" alt="${data.label}" loading="lazy" onerror="this.classList.add('hide'); this.parentElement.classList.add('no-image');">`
        : `<span class="preview-icon" aria-hidden="true">${data.icon || '🖼'}</span>`}
    </div>
    <span class="preview-label">${data.label}</span>
  `;

  // คลิกเพื่อดูรูปใหญ่ (เฉพาะกรณีที่มีรูป)
  if (hasImage) {
    wrap.querySelector('.preview-box').addEventListener('click', () => {
      const lb = document.getElementById('lightbox');
      if (!lb) return;
      lb.querySelector('img').src = data.image;
      lb.style.display = 'flex';
    });
  }
  container.appendChild(wrap);
}

// ─── helper: อ่าน props ที่ active ทั้งหมดเป็น string ───────────────────
function getSelectedPropsVal() {
  return [...document.querySelectorAll('#props-categories-container .pill.active')]
    .map(p => p.dataset.val)
    .filter(Boolean)
    .join(', ');
}
