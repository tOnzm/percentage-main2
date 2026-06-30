/** Initialize Placement component events */
function initPlacementComponentEvents() {
  renderPlacement();
  initPlacementModal();
  updatePlacementDisplay();
  initPlacementSearch();
}

/** Filter placement cards by search query */
function filterPlacementCards(query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll("#placement-group .scene-card").forEach((card) => {
    const text = card.textContent.toLowerCase();
    card.style.display = !q || text.includes(q) ? "" : "none";
  });
}

function initPlacementSearch() {
  const input = document.getElementById("placement-search");
  if (!input) return;
  input.addEventListener("input", () => filterPlacementCards(input.value));
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
            : `<div class="scene-card__icon-fallback"><span class="material-symbols-outlined" style="font-size:24px;">category</span></div>`
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
    const customTextarea = document.getElementById("placement-custom-textarea");
    if (customTextarea) customTextarea.value = "";
    updatePlacementDisplay();
    tryRecompile();
  });
}

function updatePlacementDisplay() {
  const container = document.getElementById("placement-detail");
  if (!container) return;

  const activeCard = document.querySelector(
    "#placement-group .scene-card.selected",
  );
  const customTextarea = document.getElementById("placement-custom-textarea");
  const customVal = customTextarea ? customTextarea.value.trim() : "";

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
  row.style.alignItems = "center";

  const labelEl = document.createElement("span");
  labelEl.className = "sub-label";
  labelEl.style.marginBottom = "0";
  labelEl.textContent = "การจัดวาง :";

  const chip = document.createElement("div");
  chip.className = "product-chip";

  const iconSpan = document.createElement("span");
  iconSpan.className = "material-symbols-outlined";
  iconSpan.style.fontSize = "14px";
  iconSpan.style.color = "var(--text-tertiary)";
  iconSpan.textContent = "check_box_outline_blank";
  chip.appendChild(iconSpan);

  const nameSpan = document.createElement("span");
  nameSpan.textContent = displayLabel;
  nameSpan.style.fontWeight = "500";
  chip.appendChild(nameSpan);

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "chip-remove";
  removeBtn.innerHTML = '<span class="material-symbols-outlined">close</span>';

  removeBtn.addEventListener("click", () => {
    const textarea = document.getElementById("placement-custom-textarea");
    if (textarea) textarea.value = "";
    document
      .querySelectorAll("#placement-group .scene-card")
      .forEach((c) => c.classList.remove("selected"));
    updatePlacementDisplay();
    tryRecompile();
  });

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

  // Wire sidebar nav
  const navBtns = modal?.querySelectorAll("#placement-sidebar-nav .modal-nav-btn");
  const sections = modal?.querySelectorAll("#placement-modal-main .modal-section");
  if (navBtns) {
    navBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.dataset.target;
        navBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        sections.forEach((sec) => {
          sec.style.display = sec.id === targetId ? "block" : "none";
        });

        // If switching to list pane, refresh display
        if (targetId === "placement-list-pane") {
          updatePlacementDisplay();
        }
      });
    });
  }

  const toggleModal = (show) => {
    modal.classList.toggle("active", show);
    document.body.style.overflow = show ? "hidden" : "";
    if (show) {
      const searchInput = document.getElementById("placement-search");
      if (searchInput) {
        searchInput.value = "";
        filterPlacementCards("");
      }
      // Ensure the active nav state is preserved
    }
    if (!show) tryRecompile();
  };

  openBtn.addEventListener("click", () => toggleModal(true));
  closeBtn?.addEventListener("click", () => toggleModal(false));
  overlay?.addEventListener("click", () => toggleModal(false));
  confirmBtn?.addEventListener("click", () => toggleModal(false));

  clearBtn?.addEventListener("click", () => {
    const group = document.getElementById("placement-group");
    const textarea = document.getElementById("placement-custom-textarea");
    if (textarea) textarea.value = "";
    if (group) {
      group
        .querySelectorAll(".scene-card")
        .forEach((c) => c.classList.remove("selected"));
    }
    updatePlacementDisplay();
    tryRecompile();
  });

  // Wire custom textarea
  const customTextarea = document.getElementById("placement-custom-textarea");
  if (customTextarea) {
    customTextarea.addEventListener("input", () => {
      if (customTextarea.value.trim()) {
        document
          .querySelectorAll("#placement-group .scene-card")
          .forEach((c) => c.classList.remove("selected"));
      }
      updatePlacementDisplay();
      tryRecompile();
    });
  }

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
