/** Initialize Quality & Format component events */
function initQualityComponentEvents() {
  _renderQualityList(
    "ratio-group",
    window.ratioData || ratioData,
    "ti ti-aspect-ratio",
    true,
  );
  _renderQualityList(
    "quality-group",
    window.qualityData || qualityData,
    "ti ti-settings",
  );
  _renderQualityList(
    "finish-group",
    window.labelTexture || labelTexture,
    "ti ti-palette",
  );

  _bindQualityListSelection("ratio-group");
  _bindQualityListSelection("quality-group");
  _bindQualityListSelection("finish-group");

  initQualityDropdowns();
  updateQualityDisplay();
}

/** Render buttons as a list from data */
function _renderQualityList(groupId, data, iconClass, isRatio = false) {
  const group = document.getElementById(groupId);
  if (!group || !data) return;

  group.innerHTML = "";
  const isArray = Array.isArray(data);
  const categories = isArray ? { Options: data } : data;

  Object.keys(categories).forEach((category) => {
    if (!isArray) {
      const divider = document.createElement("div");
      divider.className = "section-divider";
      divider.textContent = category;
      group.appendChild(divider);
    }

    const container = document.createElement("div");
    container.className = "pill-group vertical-list";
    if (!isRatio) container.classList.add("mt-2", "mb-4");
    container.dataset.categoryGroup = category;

    categories[category].forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pill";
      btn.dataset.val = item.val;

      const icon = item.icon
        ? `<i class="${item.icon}"></i>`
        : iconClass
          ? `<i class="${iconClass}"></i>`
          : "";
      btn.innerHTML = `${icon} <span>${item.label}</span>`;

      if (item.hint) btn.title = item.hint;
      if (isRatio && item.val === "9:16") btn.classList.add("active");

      container.appendChild(btn);
    });
    group.appendChild(container);
  });
}

/** Single-select logic for list items */
function _bindQualityListSelection(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return;

  group.addEventListener("click", (e) => {
    const btn = e.target.closest(".pill");
    if (!btn) return;

    group
      .querySelectorAll(".pill")
      .forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");

    // ปิด dropdown เมื่อเลือกแล้ว
    const overlay = group.closest(".pm-dropdown-overlay");
    if (overlay) overlay.classList.remove("show");

    // อัปเดตข้อความที่ปุ่ม Dropdown ให้แสดงค่าที่เลือก
    const container = group.closest(".pm-dropdown-container");
    const dropdownBtn = container?.querySelector(".pm-dropdown-btn span");
    if (dropdownBtn) {
      const label = btn.querySelector("span")?.textContent || btn.textContent;
      dropdownBtn.innerHTML = dropdownBtn.innerHTML.split(":")[0];
    }

    updateQualityDisplay();
    tryRecompile();
  });
}

/** Initialize dropdown triggers and close-on-outside-click */
function initQualityDropdowns() {
  const containers = document.querySelectorAll(".pm-dropdown-container");

  containers.forEach((container) => {
    const btn = container.querySelector(".pm-dropdown-btn");
    const overlay = container.querySelector(".pm-dropdown-overlay");

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      // ปิด dropdown อื่นๆ ก่อนเปิดตัวนี้
      document.querySelectorAll(".pm-dropdown-overlay").forEach((o) => {
        if (o !== overlay) o.classList.remove("show");
      });
      overlay.classList.toggle("show");
    });
  });

  // ปิดเมื่อคลิกที่อื่นในหน้าจอ
  document.addEventListener("click", () => {
    document.querySelectorAll(".pm-dropdown-overlay").forEach((o) => {
      o.classList.remove("show");
    });
  });
}

/** Update main section with labeled chips */
function updateQualityDisplay() {
  const container = document.getElementById("quality-display");
  if (!container) return;
  container.innerHTML = "";

  // ปรับการแสดงผลกลับเป็นแถว (Row)
  container.style.display = "flex";
  container.style.flexDirection = "row";
  container.style.flexWrap = "wrap";
  container.style.gap = "12px";

  const groups = [
    { id: "ratio-group", label: "Ratio" },
    { id: "quality-group", label: "Quality" },
    { id: "finish-group", label: "Label Texture" },
  ];

  let hasSelection = false;

  groups.forEach((g) => {
    const activeItem = document.querySelector(`#${g.id} .pill.active`);
    if (activeItem) {
      hasSelection = true;
      const valLabel =
        activeItem.querySelector("span")?.textContent || activeItem.textContent;

      const row = document.createElement("div");
      row.className = "flex-row";
      row.style.gap = "8px";
      row.style.marginRight = "4px";

      const labelEl = document.createElement("span");
      labelEl.className = "sub-label";
      labelEl.style.marginBottom = "0";
      labelEl.textContent = `${g.label} :`;

      const chip = document.createElement("div");
      chip.className = "product-chip";
      chip.innerHTML = `<span>${valLabel}</span>`;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "chip-remove";
      removeBtn.innerHTML = '<i class="ti ti-x"></i>';
      removeBtn.onclick = () => {
        activeItem.classList.remove("active");
        updateQualityDisplay();
        tryRecompile();
      };

      chip.appendChild(removeBtn);
      row.appendChild(labelEl);
      row.appendChild(chip);
      container.appendChild(row);
    }
  });

  if (!hasSelection) {
    container.innerHTML =
      '<div class="snotes">ยังไม่เลือกคุณภาพและสัดส่วนภาพ</div>';
  }
}

/** Clear all selections for Quality & Format */
function clearQualitySelection() {
  document
    .querySelectorAll("#quality-section .pill.active")
    .forEach((c) => c.classList.remove("active"));
  // Re-select default ratio if needed, or leave empty
  const defaultRatio = document.querySelector(
    "#ratio-group .pill[data-val='9:16']",
  );
  if (defaultRatio) defaultRatio.classList.add("active");

  updateQualityDisplay();
  tryRecompile();
}
