// ── MAIN ──────────────────────────────────────────────────────────────────

async function loadComponent(elementId, filePath) {
  const response = await fetch(filePath);
  if (!response.ok) {
    throw new Error(
      `Failed to load component "${filePath}" (HTTP ${response.status})`,
    );
  }
  const html = await response.text();
  const el = document.getElementById(elementId);
  if (el) el.innerHTML = html;
}

function initGenerateBtn() {
  const btn = document.getElementById("generate-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (typeof generatePrompt === "function") generatePrompt();
  });
}

function initTheme() {
  const themeToggle = document.getElementById("theme-toggle");
  const currentTheme =
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "dark");

  const updateIcon = (isDark) => {
    if (!themeToggle) return;
    const icon = themeToggle.querySelector("span") || themeToggle.querySelector("i");
    if (icon) {
      icon.textContent = isDark ? "dark_mode" : "light_mode";
    }
  };

  if (currentTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    updateIcon(true);
  } else {
    updateIcon(false);
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark =
        document.documentElement.getAttribute("data-theme") === "dark";
      if (isDark) {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("theme", "light");
        updateIcon(false);
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
        updateIcon(true);
      }
    });
  }
}

function initProductDisplayModeButtons() {
  const group = document.getElementById("product-display-mode-group");
  const hiddenInput = document.getElementById("product-display-mode");
  if (!group || !hiddenInput) return;

  const buttons = group.querySelectorAll(".pill");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      hiddenInput.value = btn.getAttribute("data-value");
      hiddenInput.dispatchEvent(new Event("change"));
    });
  });
}

async function initApplication() {
  try {
    // Load dashboard into left column
    await loadComponent(
      "dashboard-placeholder",
      "components/dashboard/dashboard.html",
    );

    // Load output into right column (unchanged)
    await loadComponent(
      "output-section-placeholder",
      "components/output-section/output-section.html",
    );

    // Init theme + generate button
    initTheme();
    initGenerateBtn();

    // Init dashboard (loads sections into hidden containers, inits, renders buttons)
    if (typeof initDashboard === "function") {
      await initDashboard();
    }

    // Init product display mode (needed separately)
    initProductDisplayModeButtons();

    // Check for stored product from product page
    if (typeof checkLocalStorageProduct === "function") {
      checkLocalStorageProduct();
    }

    // Reveal UI
    const revealIds = ["dashboard-placeholder", "output-section-placeholder"];
    revealIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.add("loaded");
        el.removeAttribute("aria-busy");
      }
    });

    // Trigger initial recompile
    tryRecompile();
  } catch (err) {
    console.error("[PromptGen] Boot error:", err);

    const container = document.getElementById("app-root");
    if (container) {
      const banner = document.createElement("div");
      banner.className = "error-banner";
      banner.innerHTML = `
        <strong>เกิดข้อผิดพลาดในการโหลดระบบ</strong>
        ${err.message}<br>
        <small>คำแนะนำ: รันหน้าเว็บผ่าน Live Server (http://...) ไม่ใช่เปิดไฟล์ตรงๆ (file:///...)</small>
      `;
      container.prepend(banner);
    }
  }
}

initApplication();
