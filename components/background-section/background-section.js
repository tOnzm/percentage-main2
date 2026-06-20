// ── BACKGROUND COMPONENT ──────────────────────────────────────────────────
// Renders all swatches/cards from background_data.js globals,
// then wires all events (selection, hex input, tab switching).

// currentBgType is managed globally in config.js

// ─────────────────────────────────────────────────────────────────────────────
// 1. RENDER HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * สร้าง swatch element สี่เหลี่ยมสีเดียว จาก baseColors / studioColors
 * @param {{ hex:string, val:string, label:string }} item
 * @param {boolean} isFirst - กำหนด selected ให้ตัวแรก
 * @returns {HTMLDivElement}
 */
function createColorSwatch(item, isFirst) {
  const el = document.createElement("div");
  el.className = "bg-color-swatch" + (isFirst ? " selected" : "");
  el.dataset.val = item.val;
  el.title = item.label;
  el.style.background = item.hex;
  // สีขาว/อ่อนมากเพิ่ม border เพื่อมองเห็นขอบ
  const brightness = hexToBrightness(item.hex);
  if (brightness > 230) el.style.boxShadow = "inset 0 0 0 1px #ddd";
  return el;
}

/**
 * สร้าง swatch gradient จาก gradientColors
 * @param {{ css:string, val:string, label:string }} item
 * @param {boolean} isFirst
 * @returns {HTMLDivElement}
 */
function createGradSwatch(item, isFirst) {
  const el = document.createElement("div");
  el.className = "grad-swatch" + (isFirst ? " selected" : "");
  el.dataset.val = item.val;
  el.title = item.label;
  el.style.background = item.css;
  return el;
}

/**
 * สร้าง scene card จาก sceneCards
 * @param {{ icon:string, title:string, desc:string, val:string }} item
 * @param {boolean} isFirst
 * @returns {HTMLDivElement}
 */
function createSceneCard(item, isFirst) {
  const el = document.createElement("div");
  el.className = "scene-card" + (isFirst ? " selected" : "");
  el.dataset.val = item.val;
  el.tabIndex = 0;

  const hasImage = !!item.image;

  el.innerHTML = `
    <div class="scene-card__image-wrapper">
      ${
        hasImage
          ? `<img src="${item.image}" alt="${item.title}" class="scene-card__image" loading="lazy">`
          : `<div class="scene-card__icon-fallback ">${item.icon || "ไม่พบข้อมูล"}</div>`
      }
      <button type="button" class="scene-card__info-trigger" title="คลิกเพื่อดูคำอธิบาย">
        <i class="material-symbols-outlined">info</i>
      </button>
    </div>
    <div class="scene-card__content">
      <div class="scene-card__title">${item.title}</div>
    </div>
  `;

  el.querySelector(".scene-card__info-trigger").addEventListener(
    "click",
    (e) => {
      e.stopPropagation();
      alert(`${item.title}\n\n${item.desc}`);
      updateBackgroundDisplay();
    },
  );

  return el;
}

/**
 * คำนวณความสว่างจาก hex string (#rrggbb)
 * @param {string} hex
 * @returns {number} 0–255
 */
function hexToBrightness(hex) {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. RENDER ALL SECTIONS FROM DATA
// ─────────────────────────────────────────────────────────────────────────────

function renderBgSolid() {
  const grid = document.getElementById("solid-grid");
  if (!grid || !Array.isArray(baseColors)) return;
  grid.innerHTML = "";
  baseColors.forEach((item, i) => {
    grid.appendChild(createColorSwatch(item, false));
  });
}

function renderBgGradient() {
  const grid = document.getElementById("grad-grid");
  if (!grid || !Array.isArray(gradientColors)) return;
  grid.innerHTML = "";
  gradientColors.forEach((item, i) => {
    grid.appendChild(createGradSwatch(item, false));
  });

  const dirGroup = document.getElementById("grad-dir-group");
  if (!dirGroup || !Array.isArray(gradientDirections)) return;
  dirGroup.innerHTML = "";
  gradientDirections.forEach((item, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pill";
    btn.dataset.val = item.val;
    btn.textContent = item.label;
    dirGroup.appendChild(btn);
  });
}

function renderBgStudio() {
  ["studio-bg-grid", "studio-floor-grid"].forEach((gridId) => {
    const grid = document.getElementById(gridId);
    if (!grid || !Array.isArray(studioColors)) return;
    grid.innerHTML = "";
    studioColors.forEach((item, i) => {
      const el = createColorSwatch(item, false);
      // ปรับ val ให้บอก backdrop หรือ floor
      el.dataset.val =
        gridId === "studio-bg-grid"
          ? `${item.val} seamless studio backdrop`
          : `${item.val} studio floor`;
      grid.appendChild(el);
    });
  });

  // Setup static pill groups
  const lightGroup = document.getElementById("studio-light-group");
  if (lightGroup && lightGroup.children.length === 0) {
    const lights = [
      { label: "3-point", val: "classic three-point studio lighting" },
      {
        label: "High-contrast",
        val: "dramatic high-contrast chiaroscuro lighting",
      },
      { label: "Bright", val: "bright soft high-key commercial lighting" },
    ];
    lightGroup.innerHTML = lights
      .map(
        (l) =>
          `<button type="button" class="pill" data-val="${l.val}">${l.label}</button>`,
      )
      .join("");
  }

  const shadowGroup = document.getElementById("studio-shadow-group");
  if (shadowGroup && shadowGroup.children.length === 0) {
    const shadows = [
      { label: "Soft", val: "soft natural drop shadow" },
      { label: "Sharp", val: "sharp precise geometric shadow" },
      { label: "Window", val: "elegant blurred window pane shadow projection" },
    ];
    shadowGroup.innerHTML = shadows
      .map(
        (s) =>
          `<button type="button" class="pill" data-val="${s.val}">${s.label}</button>`,
      )
      .join("");
  }
}

function renderBgScene() {
  const grid = document.getElementById("scene-grid");
  if (!grid || !Array.isArray(sceneCards)) return;
  grid.innerHTML = "";
  sceneCards.forEach((item, i) => {
    grid.appendChild(createSceneCard(item, false));
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. RENDER TAB BAR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * สร้าง tab bar สำหรับเลือกประเภทพื้นหลัง
 * แสดงเฉพาะ solid | gradient | scene | custom
 */
function renderBgTabBar() {
  // Moved to sidebar in modal
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. HEX INPUT HANDLER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * จัดการ input hex ทั่วไป — อัปเดตพรีวิว ล้าง swatch selection
 * @param {string}  rawVal       ค่าจาก input.value
 * @param {string}  previewId    id ของ .hex-preview-box
 * @param {string}  swatchSel    CSS selector ของ swatches ในกลุ่มเดียวกัน
 * @param {string}  customInputId id ของ free-text input
 */
function handleHexChange(rawVal, previewId, swatchSel, customInputId) {
  const v = rawVal.trim();
  const isValid = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);
  const preview = document.getElementById(previewId);
  if (preview) preview.style.background = isValid ? v : "transparent";
  if (isValid) {
    document
      .querySelectorAll(swatchSel)
      .forEach((x) => x.classList.remove("selected"));
    clearInputElement(customInputId);
    updateBackgroundDisplay();
    tryRecompile();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. EVENT WIRING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ผูก click → single-select ให้ swatch group
 * @param {string}   selector     CSS selector
 * @param {string=}  clearInputId  ล้าง text input นี้เมื่อเลือก swatch
 * @param {string=}  clearHexId    ล้าง hex input นี้เมื่อเลือก swatch
 * @param {string=}  clearPreviewId reset preview box นี้เมื่อเลือก swatch
 */
function bindSwatchGroup(selector, clearInputId, clearHexId, clearPreviewId) {
  const swatches = document.querySelectorAll(selector);
  swatches.forEach((sw) => {
    sw.addEventListener("click", () => {
      swatches.forEach((x) => x.classList.remove("selected"));
      sw.classList.add("selected");
      if (clearInputId) clearInputElement(clearInputId);
      if (clearHexId) clearInputElement(clearHexId);
      if (clearPreviewId) {
        const el = document.getElementById(clearPreviewId);
        if (el) el.style.background = "transparent";
      }
      updateBackgroundDisplay();
      tryRecompile();
    });
  });
}

/**
 * ผูก click → single-select ให้ pill group
 * @param {string} groupId
 */
function bindSingleSelectPills(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll(".pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      group
        .querySelectorAll(".pill")
        .forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      updateBackgroundDisplay();
      tryRecompile();
    });
  });
}

/** Update main section with labeled chip */
function updateBackgroundDisplay() {
  const container = document.getElementById("background-detail");
  if (!container) return;
  container.innerHTML = "";

  let displayLabel = "";

  if (currentBgType === "solid") {
    const active = document.querySelector(
      "#solid-grid .bg-color-swatch.selected",
    );
    const custom = document.getElementById("solid-custom")?.value.trim();
    const hex = document.getElementById("solid-hex")?.value.trim();
    if (custom) displayLabel = custom;
    else if (hex && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex))
      displayLabel = `Color: ${hex}`;
    else if (active) displayLabel = active.title;
  } else if (currentBgType === "gradient") {
    const active = document.querySelector("#grad-grid .grad-swatch.selected");
    if (active) displayLabel = active.title;
  } else if (currentBgType === "studio") {
    const bg =
      document.querySelector("#studio-bg-grid .bg-color-swatch.selected")
        ?.title ||
      document.getElementById("studio-bg-custom")?.value ||
      document.getElementById("studio-bg-hex")?.value;
    const floor =
      document.querySelector("#studio-floor-grid .bg-color-swatch.selected")
        ?.title ||
      document.getElementById("studio-floor-custom")?.value ||
      document.getElementById("studio-floor-hex")?.value;
    if (bg || floor)
      displayLabel = `Studio (${bg || "Default"} / ${floor || "Default"})`;
  } else if (currentBgType === "scene") {
    const active = document.querySelector("#scene-grid .scene-card.selected");
    if (active)
      displayLabel = active.querySelector(".scene-card__title").textContent;
  } else if (currentBgType === "custom") {
    const val = document.getElementById("bg-custom-text")?.value.trim();
    if (val)
      displayLabel = val.length > 20 ? val.substring(0, 20) + "..." : val;
  }

  if (!displayLabel) {
    container.innerHTML = '<div class="snotes">ยังไม่เลือกพื้นหลัง</div>';
    return;
  }

  const row = document.createElement("div");
  row.className = "flex-row";
  row.style.gap = "8px";

  const labelEl = document.createElement("span");
  labelEl.className = "sub-label";
  labelEl.style.marginBottom = "0";
  labelEl.textContent = "Background :";

  const chip = document.createElement("div");
  chip.className = "product-chip";
  chip.innerHTML = `<span>${displayLabel}</span>`;

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "chip-remove";
  removeBtn.innerHTML = '<i class="ti ti-x"></i>';
  removeBtn.onclick = () => {
    document
      .querySelectorAll("#background-modal .selected")
      .forEach((el) => el.classList.remove("selected"));
    document
      .querySelectorAll("#background-modal .pill.active")
      .forEach((el) => el.classList.remove("active"));
    const inputs = [
      "solid-hex",
      "solid-custom",
      "studio-bg-hex",
      "studio-bg-custom",
      "studio-floor-hex",
      "studio-floor-custom",
      "bg-custom-text",
    ];
    inputs.forEach((id) => {
      if (document.getElementById(id)) document.getElementById(id).value = "";
    });
    updateBackgroundDisplay();
    tryRecompile();
  };

  chip.appendChild(removeBtn);
  row.appendChild(labelEl);
  row.appendChild(chip);
  container.appendChild(row);
}

/** Modal & Sidebar logic */
function initBackgroundModal() {
  const modal = document.getElementById("background-modal");
  const openBtn = document.getElementById("open-background-modal");
  const closeBtn = document.getElementById("close-background-modal");
  const overlay = document.getElementById("background-modal-overlay");
  const confirmBtn = document.getElementById("confirm-background-selection");
  const clearBtn = document.getElementById("clear-background-selection");

  const sidebar = modal?.querySelector(".pm-modal-sidebar");
  const sidebarToggle = modal?.querySelector("#background-sidebar-toggle");
  const navBtns = modal?.querySelectorAll(".modal-nav-btn");
  const sections = modal?.querySelectorAll(".modal-section");
  
  const sceneCustomSidebar = document.getElementById("background-scene-custom-sidebar");
  const sceneCustomToggle = document.getElementById("background-scene-custom-toggle");
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () =>
      sidebar.classList.toggle("collapsed"),
    );
  }

  if (!modal || !openBtn) return;

  // Right sidebar toggle logic
  if (sceneCustomToggle && sceneCustomSidebar) {
    sceneCustomToggle.addEventListener("click", () => {
      sceneCustomSidebar.classList.toggle("collapsed");
    });
  }

  const toggleModal = (show) => {
    modal.classList.toggle("active", show);
    if (show) {
      // Ensure currentBgType is correctly set when modal opens based on the active tab
      const activeNavBtn = modal?.querySelector(".modal-nav-btn.active");
      if (activeNavBtn) {
        const targetId = activeNavBtn.dataset.target;
        if (targetId.includes("solid")) currentBgType = "solid";
        else if (targetId.includes("gradient")) currentBgType = "gradient";
        else if (targetId.includes("studio")) currentBgType = "studio";
        else if (targetId.includes("scene")) currentBgType = "scene";
        else if (targetId.includes("custom")) currentBgType = "custom";
      }
    }
    sceneCustomSidebar?.classList.toggle("active", show && currentBgType === "scene"); // Re-evaluate after currentBgType is set
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

        if (targetId.includes("solid")) currentBgType = "solid";
        else if (targetId.includes("gradient")) currentBgType = "gradient";
        else if (targetId.includes("studio")) currentBgType = "studio";
        else if (targetId.includes("scene")) currentBgType = "scene";
        else if (targetId.includes("custom")) currentBgType = "custom";

        // ควบคุมการแสดงผล Sidebar ขวาตามประเภทพื้นหลัง
        sceneCustomSidebar?.classList.toggle("active", currentBgType === "scene");
        // รีเซ็ตการพับเก็บให้กางออกเสมอเมื่อสลับมาที่ Scene
        sceneCustomSidebar?.classList.remove("collapsed");

        updateBackgroundDisplay();
      });
    });
  }

  openBtn.addEventListener("click", () => toggleModal(true));
  closeBtn?.addEventListener("click", () => toggleModal(false));
  overlay?.addEventListener("click", () => toggleModal(false));
  confirmBtn?.addEventListener("click", () => toggleModal(false));

  clearBtn?.addEventListener("click", () => {
    document
      .querySelectorAll("#background-modal .selected")
      .forEach((el) => el.classList.remove("selected"));
    document
      .querySelectorAll("#background-modal .pill.active")
      .forEach((el) => el.classList.remove("active"));
    const inputs = [
      "solid-hex",
      "solid-custom",
      "studio-bg-hex",
      "studio-bg-custom",
      "studio-floor-hex",
      "studio-floor-custom",
      "bg-custom-text",
      "scene-platform-tone",
      "scene-plant-tone",
      "scene-sky-tone",
    ];
    inputs.forEach((id) => {
      if (document.getElementById(id)) document.getElementById(id).value = "";
    });
    const previews = [
      "solid-hex-preview",
      "studio-bg-hex-preview",
      "studio-floor-hex-preview",
    ];
    previews.forEach((id) => {
      if (document.getElementById(id))
        document.getElementById(id).style.background = "transparent";
    });
    updateBackgroundDisplay();
    tryRecompile();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active"))
      toggleModal(false);
  });
}

function initBackgroundComponentEvents() {
  // ── Render all sections from data ──────────────────────────────────────
  renderBgSolid();
  renderBgGradient();
  renderBgStudio();
  renderBgScene();
  initBackgroundModal();
  updateBackgroundDisplay();

  // ── Swatch single-select groups ────────────────────────────────────────
  bindSwatchGroup(
    "#solid-grid .bg-color-swatch",
    "solid-custom",
    "solid-hex",
    "solid-hex-preview",
  );

  bindSwatchGroup("#grad-grid .grad-swatch");

  bindSwatchGroup(
    "#studio-bg-grid .bg-color-swatch",
    "studio-bg-custom",
    "studio-bg-hex",
    "studio-bg-hex-preview",
  );

  bindSwatchGroup(
    "#studio-floor-grid .bg-color-swatch",
    "studio-floor-custom",
    "studio-floor-hex",
    "studio-floor-hex-preview",
  );

  bindSwatchGroup("#scene-grid .scene-card");

  // ── Scene card: keyboard access ────────────────────────────────────────
  document.querySelectorAll("#scene-grid .scene-card").forEach((card) => {
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
  });

  // ── Pill single-select groups ──────────────────────────────────────────
  ["grad-dir-group", "studio-light-group", "studio-shadow-group"].forEach(
    bindSingleSelectPills,
  );

  // ── Hex inputs → preview + deselect swatch ────────────────────────────
  const solidHexEl = document.getElementById("solid-hex");
  if (solidHexEl) {
    solidHexEl.addEventListener("input", () => {
      handleHexChange(
        solidHexEl.value,
        "solid-hex-preview",
        "#solid-grid .bg-color-swatch",
        "solid-custom",
      );
    });
  }

  const studioBgHexEl = document.getElementById("studio-bg-hex");
  if (studioBgHexEl) {
    studioBgHexEl.addEventListener("input", () => {
      handleHexChange(
        studioBgHexEl.value,
        "studio-bg-hex-preview",
        "#studio-bg-grid .bg-color-swatch",
        "studio-bg-custom",
      );
    });
  }

  const studioFloorHexEl = document.getElementById("studio-floor-hex");
  if (studioFloorHexEl) {
    studioFloorHexEl.addEventListener("input", () => {
      handleHexChange(
        studioFloorHexEl.value,
        "studio-floor-hex-preview",
        "#studio-floor-grid .bg-color-swatch",
        "studio-floor-custom",
      );
    });
  }

  // ── Free-text inputs → live recompile ─────────────────────────────────
  [
    "solid-custom",
    "bg-custom-text",
    "studio-bg-custom",
    "studio-floor-custom",
    "scene-platform-tone",
    "scene-plant-tone",
    "scene-sky-tone"
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => {
        // ถ้ามีค่าในช่อง text ให้ล้าง swatch selection
        if (id === "solid-custom" && el.value.trim()) {
          document
            .querySelectorAll("#solid-grid .bg-color-swatch")
            .forEach((x) => x.classList.remove("selected"));
          clearInputElement("solid-hex");
          const prev = document.getElementById("solid-hex-preview");
          if (prev) prev.style.background = "transparent";
        }
        tryRecompile();
      });
    }
  });
}
