// ── THEME COMPONENT ─────────────────────────────────────────────────────

function initThemeComponentEvents() {
  renderThemeOptions();
  updateThemeDisplay();
}

function renderThemeOptions() {
  const group = document.getElementById("theme-group");
  if (!group) return;
  const data = window.themeData;
  if (!data) return;
  group.innerHTML = "";

  data.forEach((item) => {
    const card = document.createElement("div");
    card.className = "scene-card";
    card.dataset.val = item.val;
    card.tabIndex = 0;

    const colorHint = item.colorHint || "#888";
    card.innerHTML = `
      <div class="scene-card__image-wrapper" style="background:${colorHint};height:60px;display:flex;align-items:center;justify-content:center;">
        <span class="material-symbols-outlined" style="font-size:24px;color:rgba(255,255,255,0.7);">auto_awesome</span>
      </div>
      <div class="scene-card__content">
        <div class="scene-card__title">${item.label}</div>
      </div>
    `;
    group.appendChild(card);
  });

  group.addEventListener("click", (e) => {
    const card = e.target.closest(".scene-card");
    if (!card) return;
    group.querySelectorAll(".scene-card").forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
    // Sync hidden input for live recompile
    if (typeof getThemeVal === "function" && typeof updateDOMValue === "function") {
      updateDOMValue("f-theme", getThemeVal());
    }
    applyThemeSuggestions();
    tryRecompile();
  });
}

function getSelectedTheme() {
  const sel = document.querySelector("#theme-group .scene-card.selected");
  if (!sel) return null;
  const idx = Array.from(document.querySelectorAll("#theme-group .scene-card")).indexOf(sel);
  const data = window.themeData;
  return data ? data[idx] || null : null;
}

function applyThemeSuggestions() {
  const theme = getSelectedTheme();
  if (!theme) return;

  document.querySelectorAll("#props-group .props-card").forEach((card) => {
    const label = card.querySelector(".props-card-label")?.textContent?.trim().toLowerCase();
    const suggested = theme.suggestedProps.some((p) => label && label.includes(p.toLowerCase()));
    card.style.boxShadow = suggested ? "0 0 0 2px var(--accent)" : "";
  });
}

function getThemeVal() {
  const theme = getSelectedTheme();
  return theme ? theme.val : "";
}
