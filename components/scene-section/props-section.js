/** Initialize Props component events */
function initPropsComponentEvents() {
  renderProps();
  initPropsModal();
  updatePropsDisplay();
  initPropsSearch();
}

function renderProps() {
  const sidebarNav = document.getElementById("props-sidebar-nav");
  const modalMain = document.getElementById("props-modal-main");
  if (!sidebarNav || !modalMain || !window.propsData) return;

  sidebarNav.innerHTML = "";
  modalMain.innerHTML = "";

  const categories = [...new Set(window.propsData.map((d) => d.category))];

  categories.forEach((catName, index) => {
    const items = window.propsData.filter((d) => d.category === catName);
    const catId = catName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // 1. สร้างปุ่มใน Sidebar
    const navBtn = document.createElement("button");
    navBtn.type = "button";
    navBtn.className = "modal-nav-btn" + (index === 0 ? " active" : "");
    navBtn.dataset.target = `props-section-${catId}`;
    navBtn.innerHTML = `<i class="ti ti-category"></i> <span>${catName}</span>`;
    sidebarNav.appendChild(navBtn);

    // 2. สร้าง Section เนื้อหาหลัก
    const section = document.createElement("div");
    section.id = `props-section-${catId}`;
    section.className = "modal-section";
    section.style.display = index === 0 ? "block" : "none";
    section.innerHTML = `
      <div class="pm-label">${catName}</div>
      <div class="pill-group" id="props-cat-${catId}">
        ${items.map((p) => `<button type="button" class="pill" data-val="${p.val}">${p.icon ? p.icon + " " : ""}${p.label}</button>`).join("")}
      </div>
    `;
    modalMain.appendChild(section);

    section.querySelectorAll(".pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        pill.classList.toggle("active");
        updatePropsDisplay();
        tryRecompile();
      });
    });
  });
}

function updatePropsDisplay() {
  const container = document.getElementById("props-detail");
  if (!container) return;

  const activePills = document.querySelectorAll(
    "#props-modal-main .pill.active",
  );

  if (activePills.length === 0) {
    container.innerHTML = '<div class="snotes">ยังไม่เลือกพร็อพ</div>';
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
  labelEl.textContent = "วัตถุประกอบฉาก :";
  row.appendChild(labelEl);

  activePills.forEach((pill) => {
    const chip = document.createElement("div");
    chip.className = "product-chip";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = pill.textContent;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "chip-remove";
    removeBtn.innerHTML = '<i class="ti ti-x"></i>';

    removeBtn.addEventListener("click", () => {
      pill.classList.remove("active");
      updatePropsDisplay();
      tryRecompile();
    });

    chip.appendChild(nameSpan);
    chip.appendChild(removeBtn);
    row.appendChild(chip);
  });

  container.appendChild(row);
}

/**
 * Initialize the props modal opening/closing logic.
 */
function initPropsModal() {
  const modal = document.getElementById("props-modal");
  const openBtn = document.getElementById("open-props-modal");
  const closeBtn = document.getElementById("close-props-modal");
  const overlay = document.getElementById("props-modal-overlay");
  const confirmBtn = document.getElementById("confirm-props-selection");
  const clearBtn = document.getElementById("clear-props-selection");

  const sidebar = modal?.querySelector(".pm-modal-sidebar");
  const sidebarToggle = modal?.querySelector("#props-sidebar-toggle");
  const navBtns = modal?.querySelectorAll(".modal-nav-btn");
  const sections = modal?.querySelectorAll(".modal-section");

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
        // ล้างค่าการค้นหาเมื่อมีการคลิกเปลี่ยนหมวดหมู่ด้วยตนเอง
        const searchInput = document.getElementById("props-search-input");
        if (searchInput && searchInput.value) {
          searchInput.value = "";
          navBtns.forEach((b) => (b.style.display = ""));
          sections.forEach((sec) =>
            sec.querySelectorAll(".pill").forEach((p) => (p.style.display = ""))
          );
        }

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
      .querySelectorAll("#props-modal-main .pill.active")
      .forEach((p) => p.classList.remove("active"));
    updatePropsDisplay();

    const searchInput = document.getElementById("props-search-input");
    if (searchInput) {
      searchInput.value = "";
      searchInput.dispatchEvent(new Event("input"));
    }
    tryRecompile();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active"))
      toggleModal(false);
  });
}

/**
 * Initialize prop search logic.
 */
function initPropsSearch() {
  const searchInput = document.getElementById("props-search-input");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase().trim();
    const sections = document.querySelectorAll("#props-modal-main .modal-section");
    const navBtns = document.querySelectorAll("#props-sidebar-nav .modal-nav-btn");

    if (!term) {
      // กรณีช่องค้นหาว่าง: แสดงผลตามหมวดหมู่ที่เลือกไว้ (Active)
      navBtns.forEach((btn) => (btn.style.display = ""));
      const activeNav = document.querySelector("#props-sidebar-nav .modal-nav-btn.active");
      const targetId = activeNav?.dataset.target;

      sections.forEach((sec) => {
        sec.style.display = sec.id === targetId ? "block" : "none";
        sec.querySelectorAll(".pill").forEach((p) => (p.style.display = ""));
      });
      return;
    }

    // กรณีมีการพิมพ์ค้นหา: กรองข้อมูลทุกหมวดหมู่ (Global Search)
    sections.forEach((section) => {
      const pills = section.querySelectorAll(".pill");
      let hasMatch = false;

      pills.forEach((pill) => {
        const isMatch = pill.textContent.toLowerCase().includes(term);
        pill.style.display = isMatch ? "" : "none";
        if (isMatch) hasMatch = true;
      });

      // แสดง Section ถ้ามีผลลัพธ์ที่ตรงกัน
      section.style.display = hasMatch ? "block" : "none";
      // แสดง/ซ่อนปุ่มนำทางใน Sidebar ตามผลการค้นหา
      const navBtn = document.querySelector(`#props-sidebar-nav .modal-nav-btn[data-target="${section.id}"]`);
      if (navBtn) navBtn.style.display = hasMatch ? "" : "none";
    });
  });
}

function _renderPropsPreviewItem(data, container) {
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

function getSelectedPropsVal() {
  return [...document.querySelectorAll("#props-modal-main .pill.active")]
    .map((p) => p.dataset.val)
    .join(", ");
}
