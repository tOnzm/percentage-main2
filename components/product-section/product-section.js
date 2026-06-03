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

        applySelectedScents();
        tryRecompile();
      });

      categoryTabs.appendChild(btn);
    });

    categoryBlock.appendChild(categoryTitle);
    categoryBlock.appendChild(categoryTabs);
    container.appendChild(categoryBlock);
  });
}

/** Update the scent-detail panel to show selected product info. */
function applySelectedScents() {
  const selected = [...selectedProducts].map((id) => products[id]).filter(Boolean);

  if (!selected.length) {
    updateDOMHtml("scent-detail", '<div class="snotes">ยังไม่ได้เลือกสินค้า</div>');
    return;
  }

  const html = selected
    .map((product) => `<div class="snotes">${product.brand} — ${product.name}</div>${product.desc}`)
    .join('<hr style="margin:12px 0;">');

  updateDOMHtml("scent-detail", html);
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

/** Reset selection to first available product tab. */
function resetToDefaultProduct() {
  selectedProducts.clear();
  const firstTab = document.querySelector("#product-tabs-container .stab");
  if (firstTab) firstTab.click();
}

/** Wire up events for custom product inputs and display-mode select. */
function initProductComponentEvents() {
  const fieldIds = ["product-custom-brand", "product-custom-name", "product-custom-label"];

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
          "scent-detail",
          '<div class="snotes">Custom Product Mode</div>กำลังใช้ข้อมูลที่คุณกำหนดเอง...'
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
