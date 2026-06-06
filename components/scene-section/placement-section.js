/** Initialize Placement component events */
function initPlacementComponentEvents() {
  renderPlacement();
  initPlacementModal();
  updatePlacementDisplay();
}

function renderPlacement() {
  const group = document.getElementById("placement-group");
  if (!group || typeof placementData === "undefined") return;

  group.innerHTML = "";
  placementData.forEach((item, i) => {
    const card = document.createElement("div");
    card.className = "scene-card";
    card.dataset.val = item.val;
    card.tabIndex = 0;

    const hasImage = !!item.image;

    card.innerHTML = `
      <div class="scene-card__image-wrapper" ${!hasImage ? 'style="background-color: #e0e0e0;"' : ""}>
        ${
          hasImage
            ? `<img src="${item.image}" alt="${item.label}" class="scene-card__image" loading="lazy">`
            : `<div class="scene-card__icon-fallback"><i class="ti ti-layout"></i></div>`
        }
      </div>
      <div class="scene-card__content">
        <div class="scene-card__title">${item.label}</div>
      </div>
    `;
    group.appendChild(card);
  });

  group.addEventListener("click", (e) => {
    const card = e.target.closest(".scene-card");
    if (!card) return;
    group
      .querySelectorAll(".scene-card")
      .forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
    updatePlacementDisplay();
    tryRecompile();
  });

  const customInput = document.getElementById("placement-custom");
  if (customInput) {
    customInput.addEventListener("input", () => {
      if (customInput.value.trim()) {
        // ถ้าพิมพ์เอง ให้ล้างการเลือกจาก pill
        group
          .querySelectorAll(".scene-card")
          .forEach((c) => c.classList.remove("selected"));
      }
      tryRecompile();
    });
  }
}

function updatePlacementDisplay() {
  const container = document.getElementById("placement-detail");
  if (!container) return;

  const activeCard = document.querySelector(
    "#placement-group .scene-card.selected",
  );
  const customVal = document.getElementById("placement-custom")?.value.trim();

  let displayLabel = "";
  if (customVal) {
    displayLabel = customVal;
  } else if (activeCard) {
    displayLabel = activeCard.querySelector(".scene-card__title").textContent;
  }

  if (!displayLabel) {
    container.innerHTML = '<div class="snotes">ยังไม่เลือกการจัดวาง</div>';
    return;
  }

  container.innerHTML = "";
  const row = document.createElement("div");
  row.className = "flex-row";
  row.style.gap = "8px";

  const labelEl = document.createElement("span");
  labelEl.className = "sub-label";
  labelEl.style.marginBottom = "0";
  labelEl.textContent = "Placement :";

  const chip = document.createElement("div");
  chip.className = "product-chip";

  const nameSpan = document.createElement("span");
  nameSpan.textContent = displayLabel;

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "chip-remove";
  removeBtn.innerHTML = '<i class="ti ti-x"></i>';

  removeBtn.addEventListener("click", () => {
    if (document.getElementById("placement-custom")) {
      document.getElementById("placement-custom").value = "";
    }
    document
      .querySelectorAll("#placement-group .scene-card")
      .forEach((c) => c.classList.remove("selected"));
    updatePlacementDisplay();
    tryRecompile();
  });

  chip.appendChild(nameSpan);
  chip.appendChild(removeBtn);
  row.appendChild(labelEl);
  row.appendChild(chip);
  container.appendChild(row);
}

/**
 * Initialize the placement modal opening/closing logic.
 */
function initPlacementModal() {
  const modal = document.getElementById("placement-modal");
  const openBtn = document.getElementById("open-placement-modal");
  const closeBtn = document.getElementById("close-placement-modal");
  const overlay = document.getElementById("placement-modal-overlay");
  const confirmBtn = document.getElementById("confirm-placement-selection");
  const clearBtn = document.getElementById("clear-placement-selection");

  if (!modal || !openBtn) return;

  const toggleModal = (show) => {
    modal.classList.toggle("active", show);
    document.body.style.overflow = show ? "hidden" : "";
    if (!show) tryRecompile();
  };

  openBtn.addEventListener("click", () => toggleModal(true));
  closeBtn?.addEventListener("click", () => toggleModal(false));
  overlay?.addEventListener("click", () => toggleModal(false));
  confirmBtn?.addEventListener("click", () => toggleModal(false));

  clearBtn?.addEventListener("click", () => {
    const group = document.getElementById("placement-group");
    const customInput = document.getElementById("placement-custom");
    if (customInput) customInput.value = "";
    if (group) {
      group
        .querySelectorAll(".scene-card")
        .forEach((c) => c.classList.remove("selected"));
    }
    updatePlacementDisplay();
    tryRecompile();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active"))
      toggleModal(false);
  });
}

function _renderPlacementPreviewItem(data, container) {
  const hasImage = !!data.image;
  const wrap = document.createElement("div");
  wrap.className = "selected-item-preview";
  wrap.innerHTML = `
    <div class="preview-box ${!hasImage ? "no-image" : ""}">
      ${hasImage ? `<img src="${data.image}" alt="${data.label}" loading="lazy">` : `<span class="preview-icon">🖼</span>`}
    </div>
    <span class="preview-label">${data.label}</span>
  `;
  container.appendChild(wrap);
}
