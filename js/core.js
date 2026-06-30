// ── CORE ──────────────────────────────────────────────────────────────────

function buildPromptString(f) {
  const count = f.productCount || 1;
  const arrangement = f.arrangement || "single hero";

  const integrity =
    "Strictly preserve original product/packaging from reference image. Do not change branding, logo, text, or label. Do not redesign packaging. Do not generate new products.";

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

  const subjectLine = `${f.quality} commercial editorial shot of the product in a refined studio environment. The scene is directed with precision: modify the environment while protecting the original product assets completely.`;

  const parts = [
    integrity,
    displayInstr,
    `Using the product as the main subject, create a ${f.theme} commercial product photography scene.`,
    `Arrange ${count} product(s) ${arrangement} within the frame, ensuring clear visibility of each.`,
    subjectLine,
    f.placement ? `Placement: ${f.placement}.` : "",
    f.props ? `Styled with ${f.props}, emphasizing realistic material quality.` : "",
    `Environment: ${f.background}.`,
    f.lighting ? `Lighting: ${f.lighting}.` : "",
    f.atmosphere ? `Atmosphere: ${f.atmosphere}.` : "",
    f.colorLock ? `Color accent: ${f.colorLock}.` : "",
    (f.camerabody
      ? `Camera direction: shot on a ${f.camerabody}, ${f.camera} angle paired with ${f.lens} for precise depth and perspective control.`
      : `Camera direction: ${f.camera} paired with ${f.lens} for precise depth and perspective control.`),
    f.composition ? `Composition: ${f.composition}.` : "",
    f.effects ? `Optical treatment: ${f.effects}.` : "",
    "Shallow depth of field, product labels remain crisp and original.",
    "No text overlays, no people, no watermark.",
  ];

  return parts.filter(Boolean).join(" ");
}

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

function generatePrompt() {
  const customBrand = getInputValueById("product-custom-brand");
  const customName = getInputValueById("product-custom-name");
  const customLabel = getInputValueById("product-custom-label");
  const hasCustom = customBrand || customName || customLabel;

  const selectedProductsData =
    typeof getSelectedProducts === "function" ? getSelectedProducts() : [];

  const productCount = hasCustom ? 1 : (typeof getProductCount === "function" ? getProductCount() : 1);
  const productArrangement = typeof getProductArrangement === "function" ? getProductArrangement() : "single hero";
  const productNames = hasCustom
    ? [customName || customLabel || "Product"]
    : selectedProductsData.map((p) => p.name);

  const productStr = hasCustom
    ? `${customBrand || "Percentage"} \u2014 ${customLabel || customName || "Product"}`
    : selectedProductsData.length
      ? selectedProductsData.map((p) => `${p.brand} \u2014 ${p.name}`).join(", ")
      : "Percentage \u2014 Oolong Terrace";

  const displayMode =
    typeof getDisplayMode === "function" ? getDisplayMode() : "product";

  const customPlacement = getInputValueById("placement-custom");
  const placementPill = (() => {
    const el = document.querySelector("#placement-group .scene-card.selected");
    return el ? el.dataset.val || "" : "";
  })();
  const placement = customPlacement
    ? `placed on ${customPlacement}`
    : placementPill;

  const props =
    typeof getSelectedPropsVal === "function"
      ? getSelectedPropsVal()
      : getSel("props-group").join(", ");

  const bg = getBgValue();

  // New: Theme
  const themeVal = typeof getThemeVal === "function" ? getThemeVal() : "";

  // New: Lighting sub-controls
  const lightingVal = typeof getLightingVal === "function" ? getLightingVal() : "";
  const lightingLabel = typeof getLightingLabel === "function" ? getLightingLabel() : "";

  // New: Atmosphere
  const atmosphereArr = typeof getAtmosphereVal === "function" ? getAtmosphereVal() : [];
  const atmosphereStr = atmosphereArr.join(". ");

  // New: Color Lock
  const colorLockHex = typeof getColorLockHex === "function" ? getColorLockHex() : "";

  const camerabodyVal = getSel("camerabody-group")[0] || "";
  const cameraVal = getSel("angle-group")[0] || "straight-on front view";
  const lensVal =
    getSel("lens-group")[0] ||
    "85mm lens, refined proportions, soft creamy bokeh";
  const compositionVal = getSel("composition-group").join(", ");
  const effectsVal = getSel("effects-group").join(", ");
  const qualityVal =
    getSel("quality-group").join(", ") ||
    "ultra-realistic commercial beauty photography";
  const extraVal = getInputValueById("extra");

  const scentLabel = hasCustom
    ? customName || customLabel || "Custom Product"
    : selectedProductsData.length
      ? selectedProductsData.map((p) => p.name).join(", ")
      : "";

  updateDOMText("out-scent-name", scentLabel);
  updateDOMValue("f-product", productStr || "");
  updateDOMValue("f-display-mode", displayMode);
  updateDOMValue("f-product-count", String(productCount));
  updateDOMValue("f-product-names", productNames.join(","));
  updateDOMValue("f-placement", placement || "");
  updateDOMValue("f-props", props || "");
  updateDOMValue("f-bg", bg);
  updateDOMValue("f-theme", themeVal);
  updateDOMValue("f-lighting", lightingVal);
  updateDOMValue("f-atmosphere", atmosphereStr);
  updateDOMValue("f-color", colorLockHex);
  updateDOMValue("f-camerabody", camerabodyVal);
  updateDOMValue("f-camera", cameraVal);
  updateDOMValue("f-lens", lensVal);
  updateDOMValue("f-composition", compositionVal);
  updateDOMValue("f-effects", effectsVal);
  updateDOMValue("f-quality", qualityVal);
  updateDOMValue("f-extra", extraVal);

  recompile();

  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelectorAll(".workspace-panel").forEach((panel) => {
    panel.scrollTo({ top: 0, behavior: "smooth" });
  });

  const outPanel = document.getElementById("out-panel");
  if (outPanel) {
    outPanel.classList.add("show");
  }
}

function recompile() {
  const qVal = getSel("quality-group").join(", ");

  const f = {
    product: getInputValueById("f-product"),
    displayMode: getInputValueById("f-display-mode") || "product",
    productCount: parseInt(getInputValueById("f-product-count") || "1", 10),
    arrangement: typeof getProductArrangement === "function" ? getProductArrangement() : "single hero",
    placement: getInputValueById("f-placement"),
    props: getInputValueById("f-props"),
    background: getInputValueById("f-bg"),
    theme: getInputValueById("f-theme") || "luxury commercial",
    lighting: getInputValueById("f-lighting") || "soft diffused lighting",
    atmosphere: getInputValueById("f-atmosphere") || "",
    colorLock: getInputValueById("f-color") || "",
    camerabody: getInputValueById("f-camerabody"),
    camera: getInputValueById("f-camera"),
    lens: getInputValueById("f-lens"),
    composition: getInputValueById("f-composition"),
    effects: getInputValueById("f-effects"),
    quality: qVal || getInputValueById("f-quality"),
    extra: getInputValueById("f-extra"),
  };

  const prompt = [
    "Commercial luxury beauty editorial shot featuring the exact product from the reference image.",
    "Strictly preserve the original packaging geometry, label, branding, and text without any alterations.",
    f.productCount > 1
      ? `All ${f.productCount} products must remain clearly visible and perfectly unchanged in their original positions, arranged ${f.arrangement}.`
      : "The single product must remain perfectly unchanged.",
    (() => {
      switch (f.displayMode) {
        case "product_box":
          return "The scene includes both the product container and its matching retail packaging box arranged side-by-side.";
        case "box_only":
          return "The composition focuses exclusively on the product's outer packaging box.";
        case "product":
        default:
          return "The composition focuses exclusively on the primary product container or bottle.";
      }
    })(),
    `Using the product as the main subject, create a ${f.theme} commercial product photography scene.`,
    f.placement ? `Product placed ${f.placement}.` : "",
    f.background ? `Environment: ${f.background}.` : "",
    f.props ? `Styled with ${f.props} as supporting scene elements, emphasizing their tactile materiality.` : "",
    f.lighting ? `Lighting designed with ${f.lighting}.` : "",
    f.atmosphere ? `Atmospheric treatment: ${f.atmosphere}.` : "",
    f.colorLock ? `Maintain strict color accent using hex ${f.colorLock} for scene accents and background details.` : "",
    (f.camerabody
      ? `Shot on a ${f.camerabody}, using ${f.camera} with ${f.lens}, controlling depth, perspective, and optical character.`
      : `Captured using ${f.camera} with ${f.lens}, controlling depth, perspective, and optical character.`),
    f.composition ? `Composition: ${f.composition}.` : "",
    f.effects ? `Optical effects: ${f.effects}.` : "",
    f.extra || "",
    "Clean editorial composition, 8k resolution, photorealistic, professional color grading, no watermarks, seamless integration with the original product.",
  ]
    .filter(Boolean)
    .join(" ");

  const ratioEl = document.querySelector("#ratio-group .pill.active");
  const selectedRatio = ratioEl ? ratioEl.dataset.val : "1:1";

  const json = {
    prompt,
    negative_prompt:
      "deformed packaging, modified label text, blurred branding, additional products, low quality, messy environment, distorted shadows, people, hands",
    image: null,
    parameters: {
      style: "photorealistic",
      aspect_ratio: selectedRatio,
      quality: "high",
      image_guidance_scale: 5.0,
      denoising_strength: 0.35,
      num_inference_steps: 35,
      seed: null,
    },
    metadata: {
      schemaVersion: "2.0",
      product: f.product,
      display_mode: f.displayMode,
      product_count: f.productCount,
      arrangement: f.arrangement,
      placement: f.placement,
      props: f.props,
      environment: f.background,
      theme: f.theme,
      lighting: f.lighting,
      atmosphere: f.atmosphere,
      color_lock: f.colorLock,
      camera_body: f.camerabody || "",
      camera_settings: `${f.camera}, ${f.lens}`,
      composition: f.composition,
      effects: f.effects,
    },
  };

  const compiled = JSON.stringify(json, null, 2);
  updateDOMValue("out-compiled", compiled);
  updateDOMText(
    "char-count",
    `${prompt.length} \u0e15\u0e31\u0e27\u0e2d\u0e31\u0e01\u0e29\u0e23 (Prompt) \u00b7 ${compiled.length} \u0e15\u0e31\u0e27\u0e2d\u0e31\u0e01\u0e29\u0e23\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14`,
  );
  autoResize();
}

function autoResize() {
  const el = document.getElementById("out-compiled");
  if (!el) return;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

function flashCopyFeedback(btnId, successHtml, delay = 1600) {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  if (!btn._originalHtml) {
    btn._originalHtml = btn.innerHTML;
  }

  btn.innerHTML = successHtml;
  clearTimeout(btn._copyTimer);
  btn._copyTimer = setTimeout(() => {
    btn.innerHTML = btn._originalHtml;
    btn._originalHtml = null;
  }, delay);
}

function copyAsPrompt() {
  const f = {
    product: getInputValueById("f-product"),
    displayMode: getInputValueById("f-display-mode") || "product",
    productCount: parseInt(getInputValueById("f-product-count") || "1", 10),
    arrangement: typeof getProductArrangement === "function" ? getProductArrangement() : "single hero",
    productNames: (getInputValueById("f-product-names") || "")
      .split(",")
      .filter(Boolean),
    placement: getInputValueById("f-placement"),
    props: getInputValueById("f-props"),
    background: getInputValueById("f-bg"),
    theme: getInputValueById("f-theme"),
    lighting: getInputValueById("f-lighting"),
    atmosphere: getInputValueById("f-atmosphere"),
    colorLock: getInputValueById("f-color"),
    camerabody: getInputValueById("f-camerabody"),
    camera: getInputValueById("f-camera"),
    lens: getInputValueById("f-lens"),
    composition: getInputValueById("f-composition"),
    effects: getInputValueById("f-effects"),
    quality: getInputValueById("f-quality"),
    extra: getInputValueById("f-extra"),
  };
  navigator.clipboard.writeText(buildPromptString(f)).then(() => {
    flashCopyFeedback(
      "btn-copy-prompt",
      '<span class="material-symbols-outlined">check</span> \u0e04\u0e31\u0e14\u0e25\u0e2d\u0e01\u0e41\u0e25\u0e49\u0e27!',
    );
  });
}

function copyPrompt() {
  navigator.clipboard.writeText(getInputValueById("out-compiled")).then(() => {
    flashCopyFeedback(
      "copy-btn",
      '<span class="material-symbols-outlined">check</span> \u0e04\u0e31\u0e14\u0e25\u0e2d\u0e01 JSON \u0e41\u0e25\u0e49\u0e27!',
    );
  });
}

function sendToChat() {
  if (typeof sendPrompt === "function") {
    sendPrompt(
      "\u0e0a\u0e48\u0e27\u0e22\u0e1b\u0e23\u0e31\u0e1a\u0e1b\u0e23\u0e38\u0e07 prompt \u0e19\u0e35\u0e49\u0e43\u0e2b\u0e49 creative \u0e41\u0e25\u0e30\u0e2a\u0e27\u0e22\u0e02\u0e36\u0e49\u0e19:\n\n" +
        getInputValueById("out-compiled"),
    );
  }
}
