/** Initialize Lighting & Mood component events */
function initLightingComponentEvents() {
  _renderLightingCards("light-group", window.lightingData);
  _renderLightingCards("mood-group", window.moodData);
  initLightingModal();
  updateLightingDisplay();

  const moodCustom = document.getElementById("mood-custom");
  if (moodCustom) {
    moodCustom.addEventListener("input", () => {
      if (moodCustom.value.trim()) {
        document
          .querySelectorAll("#mood-group .scene-card")
          .forEach((c) => c.classList.remove("selected"));
      }
      updateLightingDisplay();
      tryRecompile();
    });
  }

  const extra = document.getElementById("extra");
  if (extra) extra.addEventListener("input", () => tryRecompile());
}

/** Render cards from data and bind single-select */
function _renderLightingCards(groupId, data) {
  const group = document.getElementById(groupId);
  if (!group || !data) return;

  group.innerHTML = "";
  const isArray = Array.isArray(data);
  const categories = isArray ? { Options: data } : data;

  const filterContainerId =
    groupId === "light-group"
      ? "lighting-filter-container"
      : "mood-filter-container";
  const filterContainer = document.getElementById(filterContainerId);

  if (filterContainer && !isArray) {
    filterContainer.innerHTML = "";
    const allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.className = "pill active";
    allBtn.textContent = "All";
    allBtn.dataset.category = "all";
    filterContainer.appendChild(allBtn);

    Object.keys(categories).forEach((cat) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pill";
      btn.textContent = cat;
      btn.dataset.category = cat;
      filterContainer.appendChild(btn);
    });

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
        groupId === "light-group" ? "ti ti-brightness" : "ti ti-palette";

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

  _bindLightingSelection(groupId);
}

/** Single-select logic */
function _bindLightingSelection(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return;

  group.addEventListener("click", (e) => {
    const card = e.target.closest(".scene-card");
    if (!card) return;

    if (groupId === "mood-group") {
      const custom = document.getElementById("mood-custom");
      if (custom) custom.value = "";
    }

    group
      .querySelectorAll(".scene-card")
      .forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
    updateLightingDisplay();
    tryRecompile();
  });
}

/** Update main section with chips */
function updateLightingDisplay() {
  const container = document.getElementById("lighting-display");
  if (!container) return;
  container.innerHTML = "";

  const lightCard = document.querySelector("#light-group .scene-card.selected");
  const moodCard = document.querySelector("#mood-group .scene-card.selected");
  const moodCustom = document.getElementById("mood-custom")?.value.trim();

  if (!lightCard && !moodCard && !moodCustom) {
    container.innerHTML =
      '<div class="snotes">ยังไม่เลือกการจัดแสงและอารมณ์ภาพ</div>';
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
    removeBtn.innerHTML = '<i class="ti ti-x"></i>';
    removeBtn.addEventListener("click", () => {
      if (type === "light") {
        document
          .querySelectorAll("#light-group .scene-card")
          .forEach((c) => c.classList.remove("selected"));
      } else {
        const custom = document.getElementById("mood-custom");
        if (custom) custom.value = "";
        document
          .querySelectorAll("#mood-group .scene-card")
          .forEach((c) => c.classList.remove("selected"));
      }
      updateLightingDisplay();
      tryRecompile();
    });

    chip.appendChild(removeBtn);
    row.appendChild(labelEl);
    row.appendChild(chip);
    container.appendChild(row);
  };

  if (lightCard) {
    renderRow(
      "Light",
      lightCard.querySelector(".scene-card__title").textContent,
      "light",
    );
  }

  const moodLabel =
    moodCustom ||
    (moodCard
      ? moodCard.querySelector(".scene-card__title").textContent
      : null);
  if (moodLabel) {
    renderRow("Mood", moodLabel, "mood");
  }
}

/** Modal & Sidebar logic */
function initLightingModal() {
  const modal = document.getElementById("lighting-modal");
  const openBtn = document.getElementById("open-lighting-modal");
  const closeBtn = document.getElementById("close-lighting-modal");
  const overlay = document.getElementById("lighting-modal-overlay");
  const confirmBtn = document.getElementById("confirm-lighting-selection");
  const clearBtn = document.getElementById("clear-lighting-selection");

  const navBtns = modal?.querySelectorAll(".modal-nav-btn");
  const sections = modal?.querySelectorAll(".modal-section");
  const sidebar = modal?.querySelector(".pm-modal-sidebar");
  const sidebarToggle = modal?.querySelector("#lighting-sidebar-toggle");

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () =>
      sidebar.classList.toggle("collapsed"),
    );
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
        sections.forEach(
          (sec) => (sec.style.display = sec.id === targetId ? "block" : "none"),
        );
      });
    });
  }

  openBtn.addEventListener("click", () => toggleModal(true));
  closeBtn?.addEventListener("click", () => toggleModal(false));
  overlay?.addEventListener("click", () => toggleModal(false));
  confirmBtn?.addEventListener("click", () => toggleModal(false));

  clearBtn?.addEventListener("click", () => {
    document
      .querySelectorAll("#lighting-modal .scene-card.selected")
      .forEach((c) => c.classList.remove("selected"));
    const custom = document.getElementById("mood-custom");
    if (custom) custom.value = "";
    updateLightingDisplay();
    tryRecompile();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active"))
      toggleModal(false);
  });
}
