// ── CAMERA COMPONENT ──────────────────────────────────────────────────────

function initCameraComponentEvents() {
  _renderSingleSelectGroup("angle-group", window.cameraAngles);
  _renderSingleSelectGroup("light-group", window.lightingData);
  _renderSingleSelectGroup("mood-group", window.moodData);
  _renderSingleSelectGroup("quality-group", window.qualityData);
  _renderSingleSelectGroup("lens-group", window.lensData);
  _renderSingleSelectGroup("finish-group", window.finishData);
  _bindSingleSelect("ratio-group");
  /*   _bindMultiSelect('quality-group'); */
  /*  _bindSingleSelect('mood-group'); */

  // mood custom input — deactivates pills while typing
  const moodCustom = document.getElementById("mood-custom");
  if (moodCustom) {
    moodCustom.addEventListener("input", () => {
      if (moodCustom.value.trim()) {
        document
          .querySelectorAll("#mood-group .pill")
          .forEach((p) => p.classList.remove("active"));
      }
      tryRecompile();
    });
  }

  // extra textarea
  const extra = document.getElementById("extra");
  if (extra) extra.addEventListener("input", () => tryRecompile());
}

// ─── Render pills จาก array data แล้ว bind single-select ─────────────────
function _renderSingleSelectGroup(groupId, data) {
  const group = document.getElementById(groupId);
  if (!group || !data) return;

  group.innerHTML = "";
  const isArray = Array.isArray(data);
  const categories = isArray ? { Options: data } : data;

  Object.keys(categories).forEach((category) => {
    // 1. ถ้ามีหลายกลุ่ม ให้สร้างหัวข้อ แต่ถ้ากลุ่มเดียว ไม่ต้องสร้างหัวข้อ (ใช้ CSS เดิม)
    if (!isArray) {
      const title = document.createElement("div");
      title.className = "category-title"; // เพิ่ม Class นี้ใน CSS ของคุณ
      title.textContent = category;
      title.style.cssText =
        "width: 100%; margin: 10px 0 5px 0; font-weight: bold; color: #555; font-size: 0.85em; text-transform: uppercase;";
      group.appendChild(title);
    }

    // 2. ใช้ .pill-group เดิมวนลูปสร้างปุ่ม
    categories[category].forEach((item) => {
      console.log(item);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pill"; // ใช้ Class เดิม
      btn.dataset.val = item.val;

      btn.textContent = item.label;
      btn.title = item.hint || item.label;
      group.appendChild(btn);
    });
  });

  _bindSingleSelect(groupId);
}

// ─── Single-select: คลิกเลือกได้ 1 อัน ──────────────────────────────────
function _bindSingleSelect(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return;

  group.addEventListener("click", (e) => {
    const pill = e.target.closest(".pill");
    if (!pill) return;

    // ลบ active จากทุกปุ่มในทุกหมวดหมู่ของกลุ่มนี้
    group
      .querySelectorAll(".pill")
      .forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    tryRecompile();
  });
}

// ─── Multi-select: toggle ─────────────────────────────────────────────────
function _bindMultiSelect(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.addEventListener("click", (e) => {
    const pill = e.target.closest(".pill");
    if (!pill) return;
    pill.classList.toggle("active");
    tryRecompile();
  });
}
