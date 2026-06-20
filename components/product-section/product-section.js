// ── PRODUCT COMPONENT ─────────────────────────────────────────────────────

const selectedProducts = new Set();

/** Clear all three custom product text inputs. */
function clearCustomProductInputs() {
  clearInputElement("product-custom-brand");
  clearInputElement("product-custom-name");
  clearInputElement("product-custom-label");
}

/**
 * Render product tabs grouped by category.
 * Each tab supports multi-select; clicking a selected tab deselects it.
 */
function renderProductTabs() {
  const container = document.getElementById("product-tabs-container");
  if (!container) return;

  container.innerHTML = "";

  const grouped = {};
  Object.entries(products).forEach(([key, item]) => {
    const category = item.category || "อื่นๆ";
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push({ id: key, ...item });
  });

  Object.entries(grouped).forEach(([category, items]) => {
    const categoryBlock = document.createElement("div");
    categoryBlock.className = "product-category";

    const categoryTitle = document.createElement("div");
    categoryTitle.className = "product-category-title";
    categoryTitle.textContent = category;

    const categoryTabs = document.createElement("div");
    categoryTabs.className = "scent-tabs";

    items.forEach((item) => {
      const btn = document.createElement("button");
      btn.className = "stab";
      btn.textContent = item.name;
      btn.dataset.id = item.id;
      btn.dataset.activeBg = item.color || "#2b221a";
      btn.dataset.activeText = item.textColor || "#ffffff";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", "false");
      btn.type = "button";

      // ตรวจสอบสถานะการเลือกปัจจุบัน
      if (selectedProducts.has(Number(item.id))) {
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
        btn.style.backgroundColor = btn.dataset.activeBg;
        btn.style.color = btn.dataset.activeText;
        btn.style.border = "1px solid transparent";
      }

      btn.addEventListener("click", () => {
        const id = Number(item.id);
        clearCustomProductInputs();

        if (selectedProducts.has(id)) {
          selectedProducts.delete(id);
          btn.classList.remove("active");
          btn.setAttribute("aria-selected", "false");
          btn.style.backgroundColor = "";
          btn.style.color = "";
          btn.style.border = "";
        } else {
          selectedProducts.add(id);
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

    categoryBlock.appendChild(categoryTitle);
    categoryBlock.appendChild(categoryTabs);
    container.appendChild(categoryBlock);
  });
}

/** Update the product-detail panel to show selected product chips. */
function applySelectedProducts() {
  const container = document.getElementById("product-detail");
  if (!container) return;

  if (selectedProducts.size === 0) {
    updateDOMHtml(
      "product-detail",
      '<div class="snotes">ยังไม่เลือกสินค้าใดๆ</div>',
    );
    return;
  }

  container.innerHTML = "";
  const row = document.createElement("div");
  row.className = "flex-row";
  row.style.gap = "8px";
  row.style.flexWrap = "wrap";

  const labelEl = document.createElement("span");
  labelEl.className = "sub-label";
  labelEl.style.marginBottom = "0";
  labelEl.textContent = "Product :";
  row.appendChild(labelEl);

  selectedProducts.forEach((id) => {
    const product = products[id];
    if (!product) return;

    const chip = document.createElement("div");
    chip.className = "product-chip";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = product.name;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "chip-remove";
    removeBtn.innerHTML =
      '<span class="material-symbols-outlined">close</span>';

    removeBtn.addEventListener("click", () => {
      selectedProducts.delete(id);
      renderProductTabs(); // ซิงค์สถานะใน Modal
      applySelectedProducts();
      tryRecompile();
    });

    chip.appendChild(nameSpan);
    chip.appendChild(removeBtn);
    row.appendChild(chip);
  });

  container.appendChild(row);
}

/** Return array of selected product data objects. */
function getSelectedProducts() {
  return [...selectedProducts].map((id) => products[id]).filter(Boolean);
}

/**
 * Get display mode: 'product' | 'product_box' | 'box_only'
 * @returns {string}
 */
function getDisplayMode() {
  const el = document.getElementById("product-display-mode");
  return el ? el.value : "product";
}

/** Reset selection and custom inputs. */
function resetToDefaultProduct() {
  selectedProducts.clear();
  clearCustomProductInputs();
  renderProductTabs(); // Refresh UI in modal
  applySelectedProducts();
  tryRecompile();
}

/**
 * Initialize the modal opening/closing logic.
 */
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
    if (!show) tryRecompile(); // Re-sync prompt when closing
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

/** Wire up events for custom product inputs and display-mode select. */
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
        selectedProducts.clear();
        const container = document.getElementById("product-tabs-container");
        if (container) {
          container.querySelectorAll(".stab").forEach((t) => {
            t.classList.remove("active");
            t.setAttribute("aria-selected", "false");
            t.style.backgroundColor = "";
            t.style.color = "";
            t.style.border = "";
          });
        }
        updateDOMHtml(
          "product-detail",
          '<div class="snotes">ระบุสินค้าเอง</div>กำลังใช้ข้อมูลที่คุณกำหนดเอง...',
        );
      } else {
        resetToDefaultProduct();
      }

      tryRecompile();
    });
  });

  const displayModeEl = document.getElementById("product-display-mode");
  if (displayModeEl) displayModeEl.addEventListener("change", tryRecompile);
}

/**
 * Check if a product ID has been passed via localStorage (e.g. from the product catalog page),
 * select it, and clear it from localStorage.
 */
function checkLocalStorageProduct() {
  const storedId = localStorage.getItem("selectedProductId");
  if (storedId) {
    const id = Number(storedId);
    if (products && products[id]) {
      selectedProducts.clear();
      selectedProducts.add(id);
      applySelectedProducts();
      renderProductTabs();
      tryRecompile();
    }
    localStorage.removeItem("selectedProductId");
  }
}
