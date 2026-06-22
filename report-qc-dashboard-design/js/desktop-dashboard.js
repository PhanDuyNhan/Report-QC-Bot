/* Desktop dashboard — screen-specific behavior
   Renders mock data, wires the state switcher, animates counters.
*/
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    // ── Audio toggle ─────────────────────────────────────────────
    document.querySelectorAll(".audio-toggle").forEach((btn) => {
      btn.addEventListener("click", () => window.QC.toggleAudio(btn));
    });

    // ── State switcher (demo / handoff control) ──────────────────
    document.querySelectorAll(".state-switcher [data-state]").forEach((btn) => {
      btn.addEventListener("click", () => window.QC.cycleState(btn.dataset.state));
    });

    // ── Drop zone wiring ─────────────────────────────────────────
    const zone = document.querySelector("[data-upload-zone]");
    window.QC.initDropZone(zone, (files) => {
      console.info("[QC] Files received:", files.map((f) => f.name));
      window.QC.cycleState("success");
    });

    // ── Number animations on KPI metrics ────────────────────────
    const kpis = document.querySelectorAll("[data-countup]");
    kpis.forEach((el) => {
      const target = parseFloat(el.dataset.countup || "0");
      window.QC.countUp(el, target, 900);
    });

    // ── Tab switching for raw browser / wrong cases ──────────────
    document.querySelectorAll("[role='tablist']").forEach((group) => {
      const tabs = group.querySelectorAll("[role='tab']");
      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          tabs.forEach((t) => {
            t.setAttribute("aria-selected", "false");
            t.setAttribute("tabindex", "-1");
          });
          tab.setAttribute("aria-selected", "true");
          tab.setAttribute("tabindex", "0");
          const panelId = tab.getAttribute("aria-controls");
          const root = group.parentElement;
          root.querySelectorAll("[role='tabpanel']").forEach((p) => {
            p.hidden = p.id !== panelId;
          });
        });
        tab.addEventListener("keydown", (e) => {
          const idx = Array.from(tabs).indexOf(tab);
          if (e.key === "ArrowRight") tabs[(idx + 1) % tabs.length].focus();
          if (e.key === "ArrowLeft") tabs[(idx - 1 + tabs.length) % tabs.length].focus();
        });
      });
    });

    // ── Add/remove model 2 (mimics original app) ────────────────
    const compareSection = document.querySelector("[data-compare-section]");
    const addBtn = document.querySelector("[data-add-model]");
    if (addBtn && compareSection) {
      addBtn.addEventListener("click", () => {
        compareSection.hidden = !compareSection.hidden;
        addBtn.textContent = compareSection.hidden ? "+ Add Model 2" : "✕ Remove Model 2";
      });
    }
  });
})();
