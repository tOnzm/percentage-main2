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

  // 1.1 การแสดงผลสินค้า (Display Mode Instruction)
  const displayInstr = (() => {
    switch (f.displayMode) {
      case "product_box":
        return "Show both the main product container and its matching retail packaging box together in the frame.";
      case "box_only":
        return "Focus exclusively on the outer packaging box.";
      case "product":
      default:
        return "Focus exclusively on the primary product container or bottle.";
    }
  })();

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
    displayInstr,
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

/**
 * Helper to replace placeholders with user-defined tones
 */
function applyCustomTones(baseString) {
  if (!baseString) return "";
  const platTone = getInputValueById("scene-platform-tone") || "neutral colored";
  const plantTone = getInputValueById("scene-plant-tone") || "natural green";
  const skyTone = getInputValueById("scene-sky-tone") || "clear";

  return baseString
    .replace(/\[PLATFORM\]/g, platTone)
    .replace(/\[PLANTS\]/g, plantTone)
    .replace(/\[SKY\]/g, skyTone);
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
    case "scene": {
      let base = sel("#scene-grid .scene-card.selected") || "a minimalist platform in a clean environment";
      return applyCustomTones(base);
    }
    case "custom": {
      let customText = iv("bg-custom-text") || "custom background as specified";
      return applyCustomTones(customText);
    }
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
    const el = document.querySelector("#placement-group .scene-card.selected");
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
  const finishVal = getSel("finish-group")[0] || "matte label texture";

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
      : "";
  // ── Push into hidden fields ──
  updateDOMText("out-scent-name", scentLabel);
  updateDOMValue("f-product", productStr || "");
  updateDOMValue("f-display-mode", displayMode);
  updateDOMValue("f-product-count", String(productCount));
  updateDOMValue("f-product-names", productNames.join(","));
  updateDOMValue("f-placement", placement || "");
  updateDOMValue("f-props", props || "");
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

  // เลื่อนหน้าจอ และ Panel ทั้งหมดกลับไปด้านบนสุด
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelectorAll(".workspace-panel").forEach((panel) => {
    panel.scrollTo({ top: 0, behavior: "smooth" });
  });

  const outPanel = document.getElementById("out-panel");
  if (outPanel) {
    outPanel.classList.add("show");
  }
}

// ─ Recompile (live rebuild while output panel is open) ────────────────────
function recompile() {
  const qVal = getSel("quality-group").join(", ");
  const fVal = getSel("finish-group")[0];

  const f = {
    product: getInputValueById("f-product"),
    displayMode: getInputValueById("f-display-mode") || "product",
    productCount: parseInt(getInputValueById("f-product-count") || "1", 10),
    placement: getInputValueById("f-placement"),
    props: getInputValueById("f-props"),
    background: getInputValueById("f-bg"),
    mood: getInputValueById("f-mood"),
    light: getInputValueById("f-light"),
    camera: getInputValueById("f-camera"),
    lens: getInputValueById("f-lens"),
    finish: fVal || getInputValueById("f-finish"),
    quality: qVal || getInputValueById("f-quality"),
    extra: getInputValueById("f-extra"),
  };
  const prompt = [
    "A high-end commercial luxury beauty photography. The subject is the exact product from the reference image.",
    "Strictly maintain the original geometry, label, and branding of the reference packaging without any alterations.",
    f.productCount > 1
      ? `Ensure all ${f.productCount} products are clearly visible and unchanged in their original positions.`
      : "The single product must remain perfectly unchanged.",
    
    // Display Mode Logic for Google Banana
    (() => {
      switch (f.displayMode) {
        case "product_box":
          return "The scene features both the product container and its matching retail packaging box side-by-side.";
        case "box_only":
          return "The focus is exclusively on the product's outer packaging box.";
        case "product":
        default:
          return "The focus is exclusively on the primary product container or bottle.";
      }
    })(),

    f.placement ? `The product is ${f.placement}.` : "",
    f.background ? `The scene features a ${f.background}.` : "",
    f.props ? `With ${f.props} as supporting scene elements.` : "",
    `The lighting is ${f.light}, expertly integrated to match the product and environment perfectly.`,
    `Mood is ${f.mood}.`,
    `Photographed using ${f.camera} and ${f.lens}.`,
    f.finish ? `Showcasing ${f.finish}.` : "",
    f.extra ? f.extra : "",
    "Clean editorial composition, 8k resolution, photorealistic, professional color grading, no watermarks, seamless integration."
  ]
    .filter(Boolean)
    .join(" ");

  // ดึงค่า Aspect Ratio จาก dropdown list (คลาส .pill.active)
  const ratioEl = document.querySelector("#ratio-group .pill.active");
  const selectedRatio = ratioEl ? ratioEl.dataset.val : "1:1";

  // Google Banana compatible JSON (img2img format)
  const json = {
    prompt,
    negative_prompt:
      "deformed packaging, modified label text, blurred branding, additional products, low quality, messy environment, distorted shadows, people, hands",
    image: null,
    parameters: {
      style: "photorealistic",
      aspect_ratio: selectedRatio,
      quality: "high",
      // เหมาะสำหรับ Google Banana (Img2Img)
      image_guidance_scale: 5.0, 
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
      product_count: f.productCount,
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

  // เก็บค่า HTML ดั้งเดิมไว้ถ้ายังไม่มีการเก็บ
  if (!btn._originalHtml) {
    btn._originalHtml = btn.innerHTML;
  }

  btn.innerHTML = successHtml;
  clearTimeout(btn._copyTimer);
  btn._copyTimer = setTimeout(() => {
    btn.innerHTML = btn._originalHtml;
    btn._originalHtml = null; // ล้างค่าเพื่อความถูกต้องในครั้งถัดไป
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
      '<span class="material-symbols-outlined">check</span> คัดลอกแล้ว!',
    );
  });
}

function copyPrompt() {
  navigator.clipboard.writeText(getInputValueById("out-compiled")).then(() => {
    flashCopyFeedback(
      "copy-btn",
      '<span class="material-symbols-outlined">check</span> คัดลอก JSON แล้ว!',
    );
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
