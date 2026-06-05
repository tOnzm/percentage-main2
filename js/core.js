// ── CORE ──────────────────────────────────────────────────────────────────

// ─ Prompt builder ──────────────────────────────────────────────────────────
/**
 * Build a subject line that Google Banana (img2img) can follow reliably
 * when multiple products need to appear in a single frame.
 *
 * Single product  → normal subject sentence
 * Multi-product   → explicit count + layout instruction so the model
 *                   renders ALL items rather than collapsing to one
 *
 * @param {Object} f
 * @param {string}   f.displayMode   'product' | 'product_box' | 'box_only'
 * @param {string}   f.product       comma-joined product name string
 * @param {number}   f.productCount  how many products are selected
 * @param {string[]} f.productNames  short names for layout hint
 * @param {string}   f.quality
 */
function buildPromptString(f) {
  const count = f.productCount || 1;
  const isMulti = count > 1;

  // 1. คำสั่งควบคุมหลัก (Mandatory) - ให้ AI รู้ว่านี่คือ Source of Truth
  const integrity =
    "Strictly preserve original product/packaging from reference image. Do not change branding, logo, text, or label. Do not redesign packaging. Do not generate new products.";

  // 2. Layout (ลดการเรียกชื่อสินค้า เปลี่ยนเป็นตำแหน่ง)
  const layoutHint = isMulti
    ? (() => {
      const arrangement =
        count <= 3
          ? "side by side in a row"
          : "arranged in a balanced cluster";
      return `Maintain the existence of exactly ${count} products as seen in the reference. Display them ${arrangement}.`;
    })()
    : "Maintain the single product from the reference.";

  // 3. Subject Line (เน้นการแต่งภาพ ไม่ใช่การบอกให้วาดภาพ)
  const subjectLine = `${f.quality} commercial photography, focusing on scene and environment modification while keeping the original product assets unchanged.`;

  const parts = [
    integrity,
    subjectLine,
    layoutHint,
    `Placement: ${f.placement}.`,
    f.props ? `Scene elements: ${f.props}.` : "",
    `Background: ${f.background}.`,
    `Lighting: ${f.light}.`,
    `Camera: ${f.camera}, ${f.lens}.`,
    `Mood: ${f.mood}.`,
    "Shallow depth of field, product labels remain crisp and original.",
    "No text overlays, no people, no watermark.",
  ];

  return parts.filter(Boolean).join(" ");
}

// ─ Background resolver ─────────────────────────────────────────────────────
function getBgValue() {
  const iv = (id) => getInputValueById(id);
  const sel = (css) => {
    const el = document.querySelector(css);
    return el ? el.dataset.val || "" : "";
  };

  switch (currentBgType) {
    case "solid": {
      const custom = iv("solid-custom");
      if (custom) return `${custom} solid background color`;
      const hex = iv("solid-hex");
      if (hex) return `solid background color ${hex}`;
      return (
        sel("#solid-grid .bg-color-swatch.selected") ||
        "deep midnight purple solid background"
      );
    }
    case "gradient": {
      const base =
        sel("#grad-grid .grad-swatch.selected") ||
        "deep purple to violet gradient background";
      const dir = sel("#grad-dir-group .pill.active");
      return dir ? `${base}, gradient direction: ${dir}` : base;
    }
    case "scene":
      return (
        sel("#scene-grid .scene-card.selected") ||
        "softly blurred outdoor evening purple sky, bokeh lights"
      );
    case "custom":
      return iv("bg-custom-text") || "custom background as specified";
    case "studio": {
      const bgHex = iv("studio-bg-hex");
      const bgCustom = iv("studio-bg-custom");
      const backdrop = bgHex
        ? `seamless studio backdrop color ${bgHex}`
        : bgCustom
          ? `${bgCustom} seamless studio backdrop`
          : sel("#studio-bg-grid .bg-color-swatch.selected") ||
          "pure white seamless studio backdrop";

      const floorHex = iv("studio-floor-hex");
      const floorCustom = iv("studio-floor-custom");
      const floor = floorHex
        ? `studio floor color ${floorHex}`
        : floorCustom
          ? `${floorCustom} studio floor`
          : sel("#studio-floor-grid .bg-color-swatch.selected") ||
          "white studio floor";

      const shadow =
        sel("#studio-shadow-group .pill.active") || "soft natural drop shadow";
      const light =
        sel("#studio-light-group .pill.active") ||
        "classic three-point studio lighting";

      return [
        "clean studio product photography setup",
        backdrop,
        floor,
        shadow,
        light,
        "no props, no decorative elements, product only",
      ].join(", ");
    }
    default:
      return "";
  }
}

// ─ Generate (เรียกจากปุ่ม "สร้าง Prompt") ────────────────────────────────
function generatePrompt() {
  // ── Product ──
  const customBrand = getInputValueById("product-custom-brand");
  const customName = getInputValueById("product-custom-name");
  const customLabel = getInputValueById("product-custom-label");
  const hasCustom = customBrand || customName || customLabel;

  const selectedProductsData =
    typeof getSelectedProducts === "function" ? getSelectedProducts() : [];

  const productCount = hasCustom ? 1 : selectedProductsData.length || 1;
  const productNames = hasCustom
    ? [customName || customLabel || "Product"]
    : selectedProductsData.map((p) => p.name);

  const productStr = hasCustom
    ? `${customBrand || "Percentage"} — ${customLabel || customName || "Product"}`
    : selectedProductsData.length
      ? selectedProductsData.map((p) => `${p.brand} — ${p.name}`).join(", ")
      : "Percentage — Oolong Terrace";

  // ── Display mode (product / product_box / box_only) ──
  const displayMode =
    typeof getDisplayMode === "function" ? getDisplayMode() : "product";

  // ── Placement ──
  const customPlacement = getInputValueById("placement-custom");
  const placementPill = (() => {
    const el = document.querySelector("#placement-group .pill.active");
    return el ? el.dataset.val || "" : "";
  })();
  const placement = customPlacement
    ? `placed on ${customPlacement}`
    : placementPill;

  // ── Props (จาก scene-section.js helper) ──
  const props =
    typeof getSelectedPropsVal === "function"
      ? getSelectedPropsVal()
      : getSel("props-group").join(", ");

  // ── Background ──
  const bg = getBgValue();

  // ── Mood ──
  const customMood = getInputValueById("mood-custom");
  const mood = customMood || getSel("mood-group")[0] || "soft feminine luxury";

  // ── Camera (ID = angle-group) ──
  const cameraVal = getSel("angle-group")[0] || "straight-on front view";

  // ── Lens (ID = lens-group) ──
  const lensVal =
    getSel("lens-group")[0] ||
    "85mm lens, refined proportions, soft creamy bokeh";

  // ── Finish (ID = finish-group) ──
  const finishVal = getSel("finish-group")[0] || "";

  // ── Lighting (ID = light-group) ──
  const lightVal =
    getSel("light-group")[0] ||
    "soft diffused backlight with soft elegant shadows";

  // ── Quality & Extra ──
  const qualityVal =
    getSel("quality-group").join(", ") ||
    "ultra-realistic commercial beauty photography";
  const extraVal = getInputValueById("extra");

  // ── Scent label for output header ──
  const scentLabel = hasCustom
    ? customName || customLabel || "Custom Product"
    : selectedProductsData.length
      ? selectedProductsData.map((p) => p.name).join(", ")
      : "No Product";
  // ── Push into hidden fields ──
  updateDOMText("out-scent-name", scentLabel);
  updateDOMValue("f-product", productStr);
  updateDOMValue("f-display-mode", displayMode);
  updateDOMValue("f-product-count", String(productCount));
  updateDOMValue("f-product-names", productNames.join(","));
  updateDOMValue("f-placement", placement);
  updateDOMValue("f-props", props);
  updateDOMValue("f-bg", bg);
  updateDOMValue("f-color", "");
  updateDOMValue("f-mood", mood);
  updateDOMValue("f-light", lightVal);
  updateDOMValue("f-camera", cameraVal);
  updateDOMValue("f-lens", lensVal);
  updateDOMValue("f-finish", finishVal);
  updateDOMValue("f-quality", qualityVal);
  updateDOMValue("f-extra", extraVal);

  recompile();

  const outPanel = document.getElementById("out-panel");
  if (outPanel) {
    outPanel.classList.add("show");
    outPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  document.querySelector('.workspace-center').scrollIntoView({ 
        behavior: 'smooth', // เลื่อนแบบนุ่มนวล
        block: 'start'      // ให้ขอบบนของพื้นที่มาอยู่ด้านบนของจอ
    });
}

// ─ Recompile (live rebuild while output panel is open) ────────────────────
function recompile() {
  const f = {
    product: getInputValueById("f-product"),
    displayMode: getInputValueById("f-display-mode") || "product",
    productCount: parseInt(getInputValueById("f-product-count") || "1", 10),
    placement: getInputValueById("f-placement"),
    props: getInputValueById("f-props"), // ✅ เพิ่มบรรทัดนี้

    background: getInputValueById("f-bg"),
    mood: getInputValueById("f-mood"),
    light: getInputValueById("f-light"),
    camera: getInputValueById("f-camera"),
    lens: getInputValueById("f-lens"),
    finish: getInputValueById("f-finish"),
    quality: getInputValueById("f-quality"),
    extra: getInputValueById("f-extra"),
  };
  const prompt = [
    "Commercial luxury beauty photography, professional product shoot.",
    "Strictly maintain the reference image product geometry, label, and packaging branding.",
    `Placement: ${f.placement}.`,
    `Background: ${f.background}.`,
    f.props ? `Scene elements: ${f.props}.` : "",
    `Lighting: ${f.light}.`,
    `Composition: ${f.camera}, ${f.lens}.`,
    `Mood: ${f.mood}.`,
    f.finish ? `Product details: ${f.finish}.` : "",
    "Result must look like a high-end studio photograph, seamless and clean.",
    "No text overlays, no people, no watermark, no new products created.",
  ]
    .filter(Boolean)
    .join(" ");

  const ratioEl = document.querySelector("#ratio-group .pill.active");

  // Google Banana compatible JSON (img2img format)
  const json = {
    prompt,
    negative_prompt:
      "generated product, distorted product, altered logo, fake label, extra objects, cluttered background, blurry text, low resolution, unrefined shadows",
    image: null,
    parameters: {
      style: "photorealistic",
      aspect_ratio: "1:1",
      quality: "high",
      // เพิ่มค่าควบคุมความเหมือน เพื่อไม่ให้ AI วาดใหม่
      image_guidance_scale: 4.0, // เพิ่มค่านี้เพื่อให้ยึดติดกับรูปต้นฉบับ
      denoising_strength: 0.35, // ค่านี้น้อยๆ จะเป็นการเปลี่ยนฉากโดยไม่แตะต้องตัวสินค้า
      num_inference_steps: 35,
      seed: null,
    },
    metadata: {
      product: f.product,
      display_mode: f.displayMode,
      placement: f.placement,
      props: f.props,
      environment: f.background,
      lighting: f.light,
      camera_settings: `${f.camera}, ${f.lens}`,
      finish_details: f.finish,
    },
  };

  const compiled = JSON.stringify(json, null, 2);
  updateDOMValue("out-compiled", compiled);
  updateDOMText(
    "char-count",
    `${prompt.length} ตัวอักษร (Prompt) · ${compiled.length} ตัวอักษรทั้งหมด`,
  );
  autoResize();
}

// ─ Auto-resize textarea ───────────────────────────────────────────────────
function autoResize() {
  const el = document.getElementById("out-compiled");
  if (!el) return;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

// ─ Copy helpers ───────────────────────────────────────────────────────────
/* function flashCopyFeedback(btnId, successHtml, delay = 1600) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const orig = btn.innerHTML;
  btn.innerHTML = successHtml;
  setTimeout(() => (btn.innerHTML = orig), delay);
} */
function flashCopyFeedback(btnId, successHtml, delay = 1600) {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  const originalHtml =
    '<i class="ti ti-clipboard" aria-hidden="true"></i> คัดลอกเฉพาะ Prompt'; // กำหนดค่าเริ่มต้นใหม่เป็นภาษาไทย

  btn.innerHTML = successHtml;

  clearTimeout(btn._copyTimer);

  btn._copyTimer = setTimeout(() => {
    const currentBtn = document.getElementById(btnId);
    if (currentBtn) {
      currentBtn.innerHTML = originalHtml;
    }
  }, delay);
}
function copyAsPrompt() {
  const f = {
    product: getInputValueById("f-product"),
    displayMode: getInputValueById("f-display-mode") || "product",
    productCount: parseInt(getInputValueById("f-product-count") || "1", 10),
    productNames: (getInputValueById("f-product-names") || "")
      .split(",")
      .filter(Boolean),
    placement: getInputValueById("f-placement"),
    props: getInputValueById("f-props"),
    background: getInputValueById("f-bg"),
    color: getInputValueById("f-color"),
    mood: getInputValueById("f-mood"),
    light: getInputValueById("f-light"),
    camera: getInputValueById("f-camera"),
    lens: getInputValueById("f-lens"),
    finish: getInputValueById("f-finish"),
    quality: getInputValueById("f-quality"),
    extra: getInputValueById("f-extra"),
  };
  navigator.clipboard.writeText(buildPromptString(f)).then(() => {
    flashCopyFeedback(
      "btn-copy-prompt",
      '<i class="ti ti-check"></i> คัดลอกแล้ว!',
    );
  });
}

function copyPrompt() {
  navigator.clipboard.writeText(getInputValueById("out-compiled")).then(() => {
    flashCopyFeedback("copy-btn", '<i class="ti ti-check"></i> คัดลอกแล้ว!');
  });
}

function sendToChat() {
  if (typeof sendPrompt === "function") {
    sendPrompt(
      "ช่วยปรับปรุง prompt นี้ให้ creative และสวยขึ้น:\n\n" +
      getInputValueById("out-compiled"),
    );
  }
}
