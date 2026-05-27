// ── PRODUCT COMPONENT ─────────────────────────────────────────────────────

/** Clear all three custom product text inputs. */
function clearCustomProductInputs() {
  clearInputElement('product-custom-brand');
  clearInputElement('product-custom-name');
  clearInputElement('product-custom-label');
}

/**
 * Render one tab button per product from the global `products` data object.
 * Tabs are inserted into #product-tabs-container.
 */
/* function renderProductTabs() {
  const container = document.getElementById('product-tabs-container');
  if (!container) return;

  container.innerHTML = '';

  Object.keys(products).forEach(key => {
    const item = products[key];
    const btn = document.createElement('button');
    btn.className = 'stab';
    btn.textContent = item.name;
    btn.dataset.id = key;

   
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', 'false');
    btn.type = 'button';  

    btn.addEventListener('click', () => {
      container.querySelectorAll('.stab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      clearCustomProductInputs();
      applyScent(Number(key));
      tryRecompile();
    });

    container.appendChild(btn);
  });
} */

function renderProductTabs() {
  const container = document.getElementById('product-tabs-container');
  if (!container) return;

  container.innerHTML = '';

  Object.keys(products).forEach(key => {
    const item = products[key];
    const btn = document.createElement('button');
    btn.className = 'stab';
    btn.textContent = item.name;
    btn.dataset.id = key;

    // บันทึกค่าสีลงใน dataset (ถ้าไม่มีให้ใช้ค่าเริ่มต้น)
    btn.dataset.activeBg = item.color || '#2b221a';
    btn.dataset.activeText = item.textColor || '#ffffff';

    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', 'false');
    btn.type = 'button';

    btn.addEventListener('click', () => {
      // 1. Reset ปุ่มทั้งหมด
      container.querySelectorAll('.stab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
        // รีเซ็ตสี (ลบ inline style)
        t.style.backgroundColor = '';
        t.style.color = '';
        t.style.border = ''; // <--- เพิ่มตรงนี้เพื่อล้างขอบปุ่มอื่นออก
      });

      // 2. Active ปุ่มที่เลือก
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // ใส่สีเฉพาะปุ่มที่ active
      btn.style.backgroundColor = btn.dataset.activeBg;
      btn.style.color = btn.dataset.activeText;
      btn.style.border = '1px solid transparent'; // <--- กำหนดให้ปุ่มที่เลือกไม่มีขอบ

      clearCustomProductInputs();
      applyScent(Number(key));
      tryRecompile();
    });

    container.appendChild(btn);
  });
}

/**
 * Highlight a product tab and show its description.
 * @param {number} n - Product key (1-based)
 */
function applyScent(n) {
  const product = products[n];
  if (!product) return;

  // Re-select the correct tab (called externally too, so ensure sync)
  const container = document.getElementById('product-tabs-container');
  if (container) {
    container.querySelectorAll('.stab').forEach((t, i) => {
      const isTarget = (i + 1) === n;
      t.classList.toggle('active', isTarget);
      t.setAttribute('aria-selected', String(isTarget));
    });
  }

  updateDOMHtml(
    'scent-detail',
    `<div class="snotes">${product.brand} — ${product.name}</div>${product.desc}`
  );
}

/** Simulate a click on the first product tab. */
function resetToDefaultProduct() {
  const firstTab = document.querySelector('#product-tabs-container .stab');
  if (firstTab) firstTab.click();
}

/** Attach input listeners to the custom product fields. */
function initProductComponentEvents() {
  const fieldIds = ['product-custom-brand', 'product-custom-name', 'product-custom-label'];

  fieldIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('input', () => {
      const hasValue = fieldIds.some(fId => getInputValueById(fId) !== '');

      if (hasValue) {
        // Deactivate product tabs — custom mode takes over
        const container = document.getElementById('product-tabs-container');
        if (container) {
          container.querySelectorAll('.stab').forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
          });
        }
        updateDOMHtml('scent-detail', '<div class="snotes">Custom Product Mode</div>กำลังใช้ข้อมูลที่คุณกำหนดเอง...');
      } else {
        // All custom fields cleared — revert to default tab
        resetToDefaultProduct();
      }

      tryRecompile();
    });
  });
}
