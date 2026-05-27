// ── CORE ──────────────────────────────────────────────────────────────────

// ─ Prompt builder ──────────────────────────────────────────────────────────
function buildPromptString(f) {
  const parts = [
    `${f.quality} product photograph of ${f.product}.`,
    f.placement ? `The bottle is ${f.placement}.` : '',
    f.props ? `Surrounding scene elements: ${f.props}.` : '',
    `Background: ${f.background}.`,
    f.color ? `Overall color palette: ${f.color}.` : '',
    `Camera angle: ${f.camera}.`,
    `Lens: ${f.lens}.`,
    `Lighting: ${f.light}.`,
    `Mood: ${f.mood}.`,
    `Shallow depth of field, product label sharp and legible.`,
    `Professional luxury beauty commercial photography.`,
    f.extra ? `${f.extra}.` : '',
    `No text overlays, no people, no watermarks.`,
  ];
  return parts.filter(Boolean).join(' ');
}

// ─ Background resolver ─────────────────────────────────────────────────────
function getBgValue() {
  const iv = id => getInputValueById(id);
  const sel = css => { const el = document.querySelector(css); return el ? (el.dataset.val || '') : ''; };

  switch (currentBgType) {
    case 'solid': {
      const custom = iv('solid-custom');
      if (custom) return `${custom} solid background color`;
      const hex = iv('solid-hex');
      if (hex) return `solid background color ${hex}`;
      return sel('#solid-grid .bg-color-swatch.selected') || 'deep midnight purple solid background';
    }
    case 'gradient': {
      const base = sel('#grad-grid .grad-swatch.selected') || 'deep purple to violet gradient background';
      const dir = sel('#grad-dir-group .pill.active');
      return dir ? `${base}, gradient direction: ${dir}` : base;
    }
    case 'scene':
      return sel('#scene-grid .scene-card.selected') || 'softly blurred outdoor evening purple sky, bokeh lights';
    case 'custom':
      return iv('bg-custom-text') || 'custom background as specified';
    case 'studio': {
      const bgHex = iv('studio-bg-hex');
      const bgCustom = iv('studio-bg-custom');
      const backdrop = bgHex ? `seamless studio backdrop color ${bgHex}`
        : bgCustom ? `${bgCustom} seamless studio backdrop`
          : sel('#studio-bg-grid .bg-color-swatch.selected') || 'pure white seamless studio backdrop';

      const floorHex = iv('studio-floor-hex');
      const floorCustom = iv('studio-floor-custom');
      const floor = floorHex ? `studio floor color ${floorHex}`
        : floorCustom ? `${floorCustom} studio floor`
          : sel('#studio-floor-grid .bg-color-swatch.selected') || 'white studio floor';

      const shadow = sel('#studio-shadow-group .pill.active') || 'soft natural drop shadow';
      const light = sel('#studio-light-group .pill.active') || 'classic three-point studio lighting';

      return ['clean studio product photography setup', backdrop, floor, shadow, light,
        'no props, no decorative elements, product only'].join(', ');
    }
    default: return '';
  }
}

// ─ Generate (เรียกจากปุ่ม "สร้าง Prompt") ────────────────────────────────
function generatePrompt() {
  // ── Product ──
  const customBrand = getInputValueById('product-custom-brand');
  const customName = getInputValueById('product-custom-name');
  const customLabel = getInputValueById('product-custom-label');
  const hasCustom = customBrand || customName || customLabel;

  const productStr = hasCustom
    ? `${customBrand || 'Percentage'} — ${customLabel || customName || 'Product'}`
    : (() => {
      const t = getActiveText('#product-tabs-container .stab.active');
      return t ? `Percentage — ${t}` : 'Percentage — Oolong Terrace';
    })();

  // ── Placement ──
  const customPlacement = getInputValueById('placement-custom');
  const placementPill = (() => {
    const el = document.querySelector('#placement-group .pill.active');
    return el ? (el.dataset.val || '') : '';
  })();
  const placement = customPlacement ? `placed on ${customPlacement}` : placementPill;

  // ── Props (จาก scene-section.js helper) ──
  const props = (typeof getSelectedPropsVal === 'function')
    ? getSelectedPropsVal()
    : getSel('props-group').join(', ');

  // ── Background ──
  const bg = getBgValue();

  // ── Mood ──
  const customMood = getInputValueById('mood-custom');
  const mood = customMood || getSel('mood-group')[0] || 'soft feminine luxury';

  // ── Camera (ID = angle-group) ──
  const cameraVal = getSel('angle-group')[0] || 'straight-on front view';

  // ── Lens (ID = lens-group) ──
  const lensVal = getSel('lens-group')[0] || '85mm lens, refined proportions, soft creamy bokeh';


  // ── Lighting (ID = light-group) ──
  const lightVal = getSel('light-group')[0] || 'soft diffused backlight with soft elegant shadows';

  // ── Quality & Extra ──
  const qualityVal = getSel('quality-group').join(', ') || 'ultra-realistic commercial beauty photography';
  const extraVal = getInputValueById('extra');

  // ── Scent label for output header ──
  const scentLabel = hasCustom
    ? (customName || customLabel || 'Custom Product')
    : getActiveText('#product-tabs-container .stab.active');

  // ── Push into hidden fields ──
  updateDOMText('out-scent-name', scentLabel);
  updateDOMValue('f-product', productStr);
  updateDOMValue('f-placement', placement);
  updateDOMValue('f-props', props);
  updateDOMValue('f-bg', bg);
  updateDOMValue('f-color', '');
  updateDOMValue('f-mood', mood);
  updateDOMValue('f-light', lightVal);
  updateDOMValue('f-camera', cameraVal);
  updateDOMValue('f-lens', lensVal);
  updateDOMValue('f-quality', qualityVal);
  updateDOMValue('f-extra', extraVal);
  console.log(document.getElementById('f-lens'));
  console.log(getInputValueById('f-lens'));

  recompile();

  const outPanel = document.getElementById('out-panel');
  if (outPanel) {
    outPanel.classList.add('show');
    outPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ─ Recompile (live rebuild while output panel is open) ────────────────────
function recompile() {
  const f = {
    product: getInputValueById('f-product'),
    placement: getInputValueById('f-placement'),
    props: getInputValueById('f-props'),
    background: getInputValueById('f-bg'),
    color: getInputValueById('f-color'),
    mood: getInputValueById('f-mood'),
    light: getInputValueById('f-light'),
    camera: getInputValueById('f-camera'),
    lens: getInputValueById('f-lens'),
    quality: getInputValueById('f-quality'),
    extra: getInputValueById('f-extra'),
  };

  const prompt = buildPromptString(f);
  const ratioEl = document.querySelector('#ratio-group .pill.active');

  const json = {
    prompt,
    negative_prompt: 'text, watermark, logo, people, hands, blurry label, distorted bottle, extra objects, cluttered background, oversaturated, unrealistic proportions',
    parameters: {
      style: 'photorealistic',
      aspect_ratio: ratioEl ? ratioEl.dataset.val : '9:16',
      quality: 'high',
      seed: null,
    },
    metadata: {
      product: f.product,
      scent: (() => { const el = document.getElementById('out-scent-name'); return el ? el.textContent : ''; })(),
      placement: f.placement,
      background: f.background,
      mood: f.mood,
      camera: f.camera,
      lens: f.lens,
      lighting: f.light,
      props: f.props ? f.props.split(', ').filter(Boolean) : [],
    },
  };

  const compiled = JSON.stringify(json, null, 2);
  updateDOMValue('out-compiled', compiled);
  updateDOMText('char-count', `${prompt.length} chars in prompt · ${compiled.length} chars total`);
  autoResize();
}

// ─ Auto-resize textarea ───────────────────────────────────────────────────
function autoResize() {
  const el = document.getElementById('out-compiled');
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

// ─ Copy helpers ───────────────────────────────────────────────────────────
function flashCopyFeedback(btnId, successHtml, delay = 1600) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const orig = btn.innerHTML;
  btn.innerHTML = successHtml;
  setTimeout(() => { btn.innerHTML = orig; }, delay);
}

function copyAsPrompt() {
  const f = {
    product: getInputValueById('f-product'),
    placement: getInputValueById('f-placement'),
    props: getInputValueById('f-props'),
    background: getInputValueById('f-bg'),
    color: getInputValueById('f-color'),
    mood: getInputValueById('f-mood'),
    light: getInputValueById('f-light'),
    camera: getInputValueById('f-camera'),
    lens: getInputValueById('f-lens'),
    quality: getInputValueById('f-quality'),
    extra: getInputValueById('f-extra'),
  };
  navigator.clipboard.writeText(buildPromptString(f)).then(() => {
    flashCopyFeedback('btn-copy-prompt', '<i class="ti ti-check"></i> Copied!');
  });
}

function copyPrompt() {
  navigator.clipboard.writeText(getInputValueById('out-compiled')).then(() => {
    flashCopyFeedback('copy-btn', '<i class="ti ti-check"></i> Copied!');
  });
}

function sendToChat() {
  if (typeof sendPrompt === 'function') {
    sendPrompt('ช่วยปรับปรุง prompt นี้ให้ creative และสวยขึ้น:\n\n' + getInputValueById('out-compiled'));
  }
}
