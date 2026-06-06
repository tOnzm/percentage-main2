/** Initialize Angle & Lens component events */
function initAngleLensComponentEvents() {
  _renderAngleLensCards("angle-group", window.cameraAngles);
  _renderAngleLensCards("lens-group", window.lensData);
  initAngleLensModal();
  updateAngleLensDisplay();
}

/** Render cards from data and bind single-select */
function _renderAngleLensCards(groupId, data) {
  const group = document.getElementById(groupId);
  if (!group || !data) return;

  group.innerHTML = "";
  const isArray = Array.isArray(data);
  const categories = isArray ? { Options: data } : data;

  // จัดการ Filter Bar (ปุ่ม All และปุ่มตามหมวดหมู่)
  const filterContainerId =
    groupId === "angle-group"
      ? "angle-filter-container"
      : "lens-filter-container";
  const filterContainer = document.getElementById(filterContainerId);

  if (filterContainer && !isArray) {
    filterContainer.innerHTML = "";
    // สร้างปุ่ม All
    const allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.className = "pill active";
    allBtn.textContent = "All";
    allBtn.dataset.category = "all";
    filterContainer.appendChild(allBtn);

    // สร้างปุ่มตามหมวดหมู่ที่มีในข้อมูล
    Object.keys(categories).forEach((cat) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pill";
      btn.textContent = cat;
      btn.dataset.category = cat;
      filterContainer.appendChild(btn);
    });

    // ผูกเหตุการณ์การกรอง
    filterContainer.addEventListener("click", (e) => {
      const pill = e.target.closest(".pill");
      if (!pill) return;
      filterContainer
        .querySelectorAll(".pill")
        .forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");

      const selectedCat = pill.dataset.category;
      group.querySelectorAll("[data-category-group]").forEach((el) => {
        el.style.display =
          selectedCat === "all" || el.dataset.categoryGroup === selectedCat
            ? ""
            : "none";
      });
    });
  }

  Object.keys(categories).forEach((category) => {
    if (!isArray) {
      const divider = document.createElement("div");
      divider.className = "section-divider";
      divider.textContent = category;
      divider.dataset.categoryGroup = category;
      group.appendChild(divider);
    }

    const grid = document.createElement("div");
    grid.className = "scene-grid mt-2 mb-4";
    grid.dataset.categoryGroup = category;

    categories[category].forEach((item) => {
      const card = document.createElement("div");
      card.className = "scene-card";
      card.dataset.val = item.val;
      card.tabIndex = 0;

      const hasImage = !!item.image;
      const iconClass =
        groupId === "angle-group" ? "ti ti-camera" : "ti ti-focus-2";

      card.innerHTML = `
        <div class="scene-card__image-wrapper" ${!hasImage ? 'style="background-color: #e0e0e0;"' : ""}>
          ${
            hasImage
              ? `<img src="${item.image}" alt="${item.label}" class="scene-card__image" loading="lazy">`
              : `<div class="scene-card__icon-fallback"><i class="${iconClass}"></i></div>`
          }
        </div>
        <div class="scene-card__content">
          <div class="scene-card__title">${item.label}</div>
        </div>
      `;
      grid.appendChild(card);
    });
    group.appendChild(grid);
  });

  _bindAngleLensSelection(groupId);
}

/** Single-select logic */
function _bindAngleLensSelection(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return;

  group.addEventListener("click", (e) => {
    const card = e.target.closest(".scene-card");
    if (!card) return;

    group
      .querySelectorAll(".scene-card")
      .forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
    updateAngleLensDisplay();
    tryRecompile();
  });
}

/**
 * Update the main section to show selected choices as cards
 */
function updateAngleLensDisplay() {
  const container = document.getElementById("angleLens-display");
  if (!container) return;
  container.innerHTML = "";

  const angleCard = document.querySelector("#angle-group .scene-card.selected");
  const lensCard = document.querySelector("#lens-group .scene-card.selected");

  if (!angleCard && !lensCard) {
    container.innerHTML =
      '<div class="snotes">ยังไม่ได้เลือกมุมกล้องและเลนส์</div>';
    return;
  }

  const renderRow = (title, label, type) => {
    const row = document.createElement("div");
    row.className = "flex-row";
    row.style.gap = "8px";
    row.style.marginRight = "12px";

    const labelEl = document.createElement("span");
    labelEl.className = "sub-label";
    labelEl.style.marginBottom = "0";
    labelEl.textContent = `${title} :`;

    const chip = document.createElement("div");
    chip.className = "product-chip";
    chip.innerHTML = `<span>${label}</span>`;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "chip-remove";
    removeBtn.innerHTML =
      '<span class="material-symbols-outlined" style="font-size: 16px;">close</span>';
    removeBtn.addEventListener("click", () => {
      if (type === "angle") {
        document
          .querySelectorAll("#angle-group .scene-card")
          .forEach((c) => c.classList.remove("selected"));
      } else {
        document
          .querySelectorAll("#lens-group .scene-card")
          .forEach((c) => c.classList.remove("selected"));
      }
      updateAngleLensDisplay();
      tryRecompile();
    });

    chip.appendChild(removeBtn);
    row.appendChild(labelEl);
    row.appendChild(chip);
    container.appendChild(row);
  };

  if (angleCard) {
    renderRow(
      "Angle",
      angleCard.querySelector(".scene-card__title").textContent,
      "angle",
    );
  }

  if (lensCard) {
    renderRow(
      "Lens",
      lensCard.querySelector(".scene-card__title").textContent,
      "lens",
    );
  }
}

/**
 * Initialize the Angle & Lens modal opening/closing logic.
 */
function initAngleLensModal() {
  const modal = document.getElementById("angleLens-modal");
  const openBtn = document.getElementById("open-angleLens-modal");
  const closeBtn = document.getElementById("close-angleLens-modal");
  const overlay = document.getElementById("angleLens-modal-overlay");
  const confirmBtn = document.getElementById("confirm-angleLens-selection");
  const clearBtn = document.getElementById("clear-angleLens-selection");

  const navBtns = modal?.querySelectorAll(".modal-nav-btn");
  const sections = modal?.querySelectorAll(".modal-section");

  // Sidebar collapse logic
  const sidebar = modal?.querySelector(".pm-modal-sidebar");
  const sidebarToggle = modal?.querySelector("#angleLens-sidebar-toggle");

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
    });
  }

  if (!modal || !openBtn) return;

  const toggleModal = (show) => {
    modal.classList.toggle("active", show);
    document.body.style.overflow = show ? "hidden" : "";
    if (!show) tryRecompile();
  };

  if (navBtns) {
    navBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.dataset.target;
        navBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        sections.forEach((sec) => {
          sec.style.display = sec.id === targetId ? "block" : "none";
        });
      });
    });
  }

  openBtn.addEventListener("click", () => toggleModal(true));
  closeBtn?.addEventListener("click", () => toggleModal(false));
  overlay?.addEventListener("click", () => toggleModal(false));
  confirmBtn?.addEventListener("click", () => toggleModal(false));

  clearBtn?.addEventListener("click", () => {
    document
      .querySelectorAll("#angleLens-modal .scene-card.selected")
      .forEach((c) => c.classList.remove("selected"));
    updateAngleLensDisplay();
    tryRecompile();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active"))
      toggleModal(false);
  });
}
