// ── ATMOSPHERE COMPONENT ───────────────────────────────────────────────

function initAtmosphereComponentEvents() {
  renderAtmosphereOptions();
}

function renderAtmosphereOptions() {
  const group = document.getElementById("atmosphere-group");
  if (!group) {
    console.warn("[Atmosphere] #atmosphere-group not found");
    return;
  }
  const data = window.atmosphereData;
  if (!data) {
    console.warn("[Atmosphere] window.atmosphereData not found");
    return;
  }

  group.innerHTML = "";

  data.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pill";
    btn.dataset.val = item.val;
    btn.textContent = item.label;
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
      _updateAtmosphereCount();
      if (typeof updateDOMValue === "function") {
        const arr = getAtmosphereVal();
        updateDOMValue("f-atmosphere", arr.join(". "));
      }
      tryRecompile();
    });
    group.appendChild(btn);
  });
}

function _updateAtmosphereCount() {
  const badge = document.getElementById("atmosphere-count");
  if (!badge) return;
  const count = document.querySelectorAll("#atmosphere-group .pill.active").length;
  badge.textContent = count > 0 ? `${count} selected` : "0 selected";
}

function getAtmosphereVal() {
  const active = document.querySelectorAll("#atmosphere-group .pill.active");
  return Array.from(active).map((b) => b.dataset.val).filter(Boolean);
}

function getAtmosphereLabel() {
  const active = document.querySelectorAll("#atmosphere-group .pill.active");
  return Array.from(active).map((b) => b.textContent.trim()).join(", ");
}
