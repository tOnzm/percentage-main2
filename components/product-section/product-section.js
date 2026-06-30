// ── PRODUCT COMPONENT (Single-select + Count + Arrangement) ────────────

let _selectedProductId = null;
let _customMode = false;
let _productCurrentCategory = null;

function clearCustomProductInputs() {
  clearInputElement("product-custom-brand");
  clearInputElement("product-custom-name");
  clearInputElement("product-custom-label");
}

function filterProductTabs(query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll("#product-tabs-container .product-category").forEach((block) => {
    const stabs = block.querySelectorAll(".stab");
    let anyVisible = false;
    stabs.forEach((btn) => {
      const text = btn.textContent.toLowerCase();
      const match = !q || text.includes(q);
      btn.style.display = match ? "" : "none";
      if (match) anyVisible = true;
    });
    block.style.display = anyVisible ? "" : "none";
  });
}

function renderProductCategorySidebar() {
  const sidebar = document.getElementById("product-category-sidebar");
  if (!sidebar) return;

  const grouped = {};
  Object.entries(products).forEach(([key, item]) => {
    const category = item.category || "อื่นๆ";
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push({ id: key, ...item });
  });

  const categories = Object.keys(grouped).sort();
  sidebar.innerHTML = categories.map((cat) => `
    <button type="button" class="modal-nav-btn" data-category="${cat}">
      <span class="material-symbols-outlined">fiber_manual_record</span> ${cat}
    </button>
  `).join("");

  // Set active category
  const firstBtn = sidebar.querySelector(".modal-nav-btn");
  if (firstBtn) {
    _productCurrentCategory = firstBtn.dataset.category;
    firstBtn.classList.add("active");
  }

  // Wire clicks
  sidebar.addEventListener("click", (e) => {
    const btn = e.target.closest(".modal-nav-btn");
    if (!btn) return;
    sidebar.querySelectorAll(".modal-nav-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    _productCurrentCategory = btn.dataset.category;
    const searchInput = document.getElementById("modal-product-search");
    if (searchInput) {
      searchInput.value = "";
      filterProductTabs("");
    }
    _renderProductContent();
  });
}

function _renderProductContent() {
  const container = document.getElementById("product-tabs-container");
  if (!container) return;

  container.innerHTML = "";

  const grouped = {};
  Object.entries(products).forEach(([key, item]) => {
    const category = item.category || "อื่นๆ";
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push({ id: key, ...item });
  });

  const targetCategory = _productCurrentCategory || Object.keys(grouped).sort()[0];
  const items = grouped[targetCategory] || [];
  if (!items.length) return;

  const categoryBlock = document.createElement("div");
  categoryBlock.className = "product-category";

  const categoryTitle = document.createElement("div");
  categoryTitle.className = "product-category-title";
  categoryTitle.textContent = targetCategory;
  categoryBlock.appendChild(categoryTitle);

  const categoryTabs = document.createElement("div");
  categoryTabs.className = "scent-tabs";

  items.forEach((item) => {
    const btn = document.createElement("button");
    btn.className = "stab";
    btn.dataset.id = item.id;
    btn.dataset.activeBg = item.color || "#2b221a";
    btn.dataset.activeText = item.textColor || "#ffffff";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", "false");
    btn.type = "button";

    const dot = document.createElement("span");
    dot.className = "stab-color-dot";
    dot.style.backgroundColor = item.color || "#999";
    btn.appendChild(dot);

    btn.appendChild(document.createTextNode(item.name));

    if (String(_selectedProductId) === String(item.id) && !_customMode) {
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      btn.style.backgroundColor = btn.dataset.activeBg;
      btn.style.color = btn.dataset.activeText;
      btn.style.border = "1px solid transparent";
    }

    btn.addEventListener("click", () => {
      clearCustomProductInputs();
      _customMode = false;

      const id = String(item.id);

      if (_selectedProductId === id) {
        _selectedProductId = null;
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
        btn.style.backgroundColor = "";
        btn.style.color = "";
        btn.style.border = "";
      } else {
        document.querySelectorAll("#product-tabs-container .stab.active").forEach((b) => {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
          b.style.backgroundColor = "";
          b.style.color = "";
          b.style.border = "";
        });
        _selectedProductId = id;
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
        btn.style.backgroundColor = btn.dataset.activeBg;
        btn.style.color = btn.dataset.activeText;
        btn.style.border = "1px solid transparent";
      }

      applySelectedProducts();
      tryRecompile();
    });

    categoryTabs.appendChild(btn);
  });

  categoryBlock.appendChild(categoryTabs);
  container.appendChild(categoryBlock);
}

function renderProductTabs() {
  renderProductCategorySidebar();
  _renderProductContent();
}

function applySelectedProducts() {
  const container = document.getElementById("product-detail");
  if (!container) return;

  if (_customMode) {
    updateDOMHtml("product-detail",
      '<div class="snotes">ระบุสินค้าเอง</div>กำลังใช้ข้อมูลที่คุณกำหนดเอง...'
    );
    updateSelectionCountBadge();
    return;
  }

  if (!_selectedProductId) {
    updateDOMHtml("product-detail", '<div class="snotes">ยังไม่เลือกสินค้าใดๆ</div>');
    updateSelectionCountBadge();
    return;
  }

  const product = products[_selectedProductId];
  if (!product) return;

  container.innerHTML = "";
  const row = document.createElement("div");
  row.className = "flex-row";
  row.style.gap = "8px";
  row.style.flexWrap = "wrap";
  row.style.alignItems = "center";

  const chip = document.createElement("div");
  chip.className = "product-chip";

  const dot = document.createElement("span");
  dot.className = "chip-color-dot";
  dot.style.backgroundColor = product.color || "#999";
  chip.appendChild(dot);

  const nameSpan = document.createElement("span");
  nameSpan.textContent = product.name;
  nameSpan.style.fontWeight = "500";
  chip.appendChild(nameSpan);

  if (product.brand) {
    const brandSpan = document.createElement("span");
    brandSpan.textContent = product.brand;
    brandSpan.style.fontSize = "10px";
    brandSpan.style.color = "var(--text-tertiary)";
    brandSpan.style.marginLeft = "2px";
    chip.appendChild(brandSpan);
  }

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "chip-remove";
  removeBtn.innerHTML = '<span class="material-symbols-outlined">close</span>';
  removeBtn.addEventListener("click", () => {
    _selectedProductId = null;
    renderProductTabs();
    applySelectedProducts();
    tryRecompile();
  });
  chip.appendChild(removeBtn);

  row.appendChild(chip);
  container.appendChild(row);

  updateSelectionCountBadge();
}

function updateSelectionCountBadge() {
  const btn = document.getElementById("open-product-modal");
  if (!btn) return;
  const old = btn.querySelector(".product-selection-count");
  if (old) old.remove();
  if (_selectedProductId || _customMode) {
    const badge = document.createElement("span");
    badge.className = "product-selection-count";
    badge.textContent = "1";
    btn.appendChild(badge);
  }
}

function getSelectedProducts() {
  if (_customMode) {
    const brand = getInputValueById("product-custom-brand");
    const name = getInputValueById("product-custom-name");
    const label = getInputValueById("product-custom-label");
    if (name || label || brand) {
      return [{ brand: brand || "Percentage", name: name || label || "Product" }];
    }
    return [];
  }
  if (_selectedProductId && products[_selectedProductId]) {
    return [products[_selectedProductId]];
  }
  return [];
}

function getDisplayMode() {
  const el = document.getElementById("product-display-mode");
  return el ? el.value : "product";
}

function getProductCount() {
  const active = document.querySelector("#product-count-group .pill.active");
  if (!active) return 1;
  const v = active.dataset.val;
  if (v === "multiple") return 3;
  return parseInt(v, 10) || 1;
}

function getProductArrangement() {
  const active = document.querySelector("#product-arrangement-group .pill.active");
  return active ? active.dataset.val : "single hero";
}

function resetToDefaultProduct() {
  _selectedProductId = null;
  _customMode = false;
  clearCustomProductInputs();
  renderProductTabs();
  applySelectedProducts();
  tryRecompile();
}

function initProductModal() {
  const modal = document.getElementById("product-modal");
  const openBtn = document.getElementById("open-product-modal");
  const closeBtn = document.getElementById("close-product-modal");
  const overlay = document.getElementById("product-modal-overlay");
  const confirmBtn = document.getElementById("confirm-product-selection");
  const clearBtn = document.getElementById("clear-product-selection");

  if (!modal || !openBtn) return;

  const toggleModal = (show) => {
    modal.classList.toggle("active", show);
    document.body.style.overflow = show ? "hidden" : "";
    if (show) {
      const searchInput = document.getElementById("modal-product-search");
      if (searchInput) {
        searchInput.value = "";
        filterProductTabs("");
      }
    }
    if (!show) tryRecompile();
  };

  openBtn.addEventListener("click", () => toggleModal(true));
  closeBtn?.addEventListener("click", () => toggleModal(false));
  overlay?.addEventListener("click", () => toggleModal(false));
  confirmBtn?.addEventListener("click", () => toggleModal(false));
  clearBtn?.addEventListener("click", () => resetToDefaultProduct());

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active"))
      toggleModal(false);
  });
}

function initProductComponentEvents() {
  const fieldIds = [
    "product-custom-brand",
    "product-custom-name",
    "product-custom-label",
  ];

  fieldIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("input", () => {
      const hasValue = fieldIds.some((fId) => getInputValueById(fId) !== "");

      if (hasValue) {
        _selectedProductId = null;
        _customMode = true;
        document.querySelectorAll("#product-tabs-container .stab").forEach((t) => {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
          t.style.backgroundColor = "";
          t.style.color = "";
          t.style.border = "";
        });
        updateDOMHtml("product-detail",
          '<div class="snotes">ระบุสินค้าเอง</div>กำลังใช้ข้อมูลที่คุณกำหนดเอง...'
        );
      } else {
        _customMode = false;
        if (!_selectedProductId) {
          resetToDefaultProduct();
        } else {
          applySelectedProducts();
        }
      }

      tryRecompile();
    });
  });

  const displayModeEl = document.getElementById("product-display-mode");
  if (displayModeEl) displayModeEl.addEventListener("change", tryRecompile);

  // Display mode pills
  document.querySelectorAll("#product-display-mode-group .pill").forEach((p) => {
    p.addEventListener("click", () => {
      document.querySelectorAll("#product-display-mode-group .pill").forEach((b) => b.classList.remove("active"));
      p.classList.add("active");
      const input = document.getElementById("product-display-mode");
      if (input) input.value = p.dataset.value;
      tryRecompile();
    });
  });

  // Count pills
  document.querySelectorAll("#product-count-group .pill").forEach((p) => {
    p.addEventListener("click", () => {
      document.querySelectorAll("#product-count-group .pill").forEach((b) => b.classList.remove("active"));
      p.classList.add("active");
      tryRecompile();
    });
  });

  // Arrangement pills
  document.querySelectorAll("#product-arrangement-group .pill").forEach((p) => {
    p.addEventListener("click", () => {
      document.querySelectorAll("#product-arrangement-group .pill").forEach((b) => b.classList.remove("active"));
      p.classList.add("active");
      tryRecompile();
    });
  });

  const modalSearch = document.getElementById("modal-product-search");
  if (modalSearch) {
    modalSearch.addEventListener("input", () => filterProductTabs(modalSearch.value));
  }
}

function checkLocalStorageProduct() {
  const storedId = localStorage.getItem("selectedProductId");
  if (storedId) {
    _selectedProductId = String(storedId);
    _customMode = false;
    if (products && products[_selectedProductId]) {
      applySelectedProducts();
      renderProductTabs();
      tryRecompile();
    }
    localStorage.removeItem("selectedProductId");
  }
}
