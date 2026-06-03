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

  // ── Layout instruction for multi-product ────────────────────────────
  // Tell Banana the exact count + arrangement so all items stay visible
  const layoutHint = (() => {
    if (!isMulti) return "";
    const nums = ["two","three","four","five","six","seven","eight"];
    const word = nums[count - 2] || `${count}`;
    // Vary arrangement by count for best render result
    const arrangement = count <= 3
      ? "side by side in a row"
      : count <= 5
        ? "arranged in a slight arc, evenly spaced"
        : "grouped in a flat-lay cluster";
    return `Exactly ${word} distinct skincare products ${arrangement}, each product fully visible and clearly separated, all labels legible.`;
  })();

  // ── Subject line ─────────────────────────────────────────────────────
  let subjectLine;
  if (isMulti) {
    // Multi: lead with layout, then identify the collection by brand
    const brand = f.productNames.length ? f.productNames[0].split(" ")[0] : "Percentage";
    switch (f.displayMode) {
      case "box_only":
        subjectLine = `${f.quality} product photograph. ${layoutHint} Showing retail packaging boxes of the ${brand} skincare collection.`;
        break;
      case "product_box":
        subjectLine = `${f.quality} product photograph. ${layoutHint} Each product is shown together with its matching retail packaging box.`;
        break;
      default:
        subjectLine = `${f.quality} product photograph. ${layoutHint} Products: ${f.product}.`;
    }
  } else {
    // Single: original clean subject
    switch (f.displayMode) {
      case "box_only":
        subjectLine = `${f.quality} product photograph of the retail packaging box of ${f.product}.`;
        break;
      case "product_box":
        subjectLine = `${f.quality} product photograph of ${f.product} with its matching retail packaging box displayed beside it.`;
        break;
      default:
        subjectLine = `${f.quality} product photograph of ${f.product}.`;
    }
  }

  const parts = [
    subjectLine,
    f.placement ? `The ${isMulti ? "products are" : "product is"} ${f.placement}.` : "",
    f.props ? `Surrounding scene elements: ${f.props}.` : "",
    `Background: ${f.background}.`,
    f.color ? `Overall color palette: ${f.color}.` : "",
    `Camera angle: ${f.camera}.`,
    `Lens: ${f.lens}.`,
    `Lighting: ${f.light}.`,
    `Mood: ${f.mood}.`,
    isMulti
      ? `Shallow depth of field, all product labels sharp and legible, no product cropped.`
      : `Shallow depth of field, product label sharp and legible.`,
    f.finish ? `${f.finish}.` : "",
    `Professional luxury beauty commercial photography.`,
    f.extra ? `${f.extra}.` : "",
    `No text overlays, no people, no watermarks.`,
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
}

// ─ Recompile (live rebuild while output panel is open) ────────────────────
function recompile() {
  const f = {
    product:      getInputValueById("f-product"),
    displayMode:  getInputValueById("f-display-mode") || "product",
    productCount: parseInt(getInputValueById("f-product-count") || "1", 10),
    productNames: (getInputValueById("f-product-names") || "").split(",").filter(Boolean),
    placement:    getInputValueById("f-placement"),
    props:       getInputValueById("f-props"),
    background:  getInputValueById("f-bg"),
    color:       getInputValueById("f-color"),
    mood:        getInputValueById("f-mood"),
    light:       getInputValueById("f-light"),
    camera:      getInputValueById("f-camera"),
    lens:        getInputValueById("f-lens"),
    finish:      getInputValueById("f-finish"),
    quality:     getInputValueById("f-quality"),
    extra:       getInputValueById("f-extra"),
  };

  const prompt = buildPromptString(f);
  const ratioEl = document.querySelector("#ratio-group .pill.active");

  // Google Banana compatible JSON (img2img format)
  const json = {
    prompt,
    negative_prompt:
      "text, watermark, logo, people, hands, blurry label, distorted bottle, extra objects, cluttered background, oversaturated, unrealistic proportions",
    image: null, // img2img source — set externally before submit
    parameters: {
      aspect_ratio: ratioEl ? ratioEl.dataset.val : "9:16",
      image_guidance_scale: 1.5,
      guidance_scale: 7.5,
      num_inference_steps: 30,
      seed: null,
    },
    metadata: {
      product:       f.product,
      product_count: f.productCount,
      display_mode:  f.displayMode,
      placement:     f.placement,
      background:   f.background,
      mood:         f.mood,
      camera:       f.camera,
      lens:         f.lens,
      lighting:     f.light,
      props:        f.props ? f.props.split(", ").filter(Boolean) : [],
      finish:       f.finish || "",
    },
  };

  const compiled = JSON.stringify(json, null, 2);
  updateDOMValue("out-compiled", compiled);
  updateDOMText(
    "char-count",
    `${prompt.length} chars in prompt · ${compiled.length} chars total`,
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
function flashCopyFeedback(btnId, successHtml, delay = 1600) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const orig = btn.innerHTML;
  btn.innerHTML = successHtml;
  setTimeout(() => (btn.innerHTML = orig), delay);
}

function copyAsPrompt() {
  const f = {
    product:      getInputValueById("f-product"),
    displayMode:  getInputValueById("f-display-mode") || "product",
    productCount: parseInt(getInputValueById("f-product-count") || "1", 10),
    productNames: (getInputValueById("f-product-names") || "").split(",").filter(Boolean),
    placement:    getInputValueById("f-placement"),
    props:        getInputValueById("f-props"),
    background:   getInputValueById("f-bg"),
    color:        getInputValueById("f-color"),
    mood:         getInputValueById("f-mood"),
    light:        getInputValueById("f-light"),
    camera:       getInputValueById("f-camera"),
    lens:         getInputValueById("f-lens"),
    finish:       getInputValueById("f-finish"),
    quality:      getInputValueById("f-quality"),
    extra:        getInputValueById("f-extra"),
  };
  navigator.clipboard.writeText(buildPromptString(f)).then(() => {
    flashCopyFeedback("btn-copy-prompt", '<i class="ti ti-check"></i> Copied!');
  });
}

function copyPrompt() {
  navigator.clipboard.writeText(getInputValueById("out-compiled")).then(() => {
    flashCopyFeedback("copy-btn", '<i class="ti ti-check"></i> Copied!');
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
