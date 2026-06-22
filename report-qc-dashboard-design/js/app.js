/* Shared application helpers — Midnight Editorial QC Dashboard
   No global pollution. Each helper attaches to window.QC for readability.
*/
(function () {
  "use strict";

  const QC = (window.QC = window.QC || {});

  // ── State manager ──────────────────────────────────────────────
  const STATES = ["loading", "empty", "error", "success"];
  const State = (QC.State = {
    current: "success",
    listeners: new Set(),
    set(next) {
      if (!STATES.includes(next)) return;
      this.current = next;
      this.listeners.forEach((fn) => fn(next));
    },
    on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  });

  // ── Toggle helpers ─────────────────────────────────────────────
  QC.toggleAudio = function (btn) {
    const on = btn.getAttribute("aria-pressed") === "true";
    btn.setAttribute("aria-pressed", String(!on));
    btn.querySelector(".audio-label").textContent = !on ? "Sound On" : "Sound Off";
    btn.setAttribute("aria-label", !on ? "Mute dragon celebration sound" : "Enable dragon celebration sound");
  };

  QC.cycleState = function (target) {
    State.set(target);
    // Visually highlight the active switcher button
    document.querySelectorAll(".state-switcher [data-state]").forEach((b) => {
      b.setAttribute("aria-pressed", b.dataset.state === target ? "true" : "false");
    });
  };

  // ── Drag & drop for upload zone ────────────────────────────────
  QC.initDropZone = function (zone, onFiles) {
    if (!zone) return;
    ["dragenter", "dragover"].forEach((ev) =>
      zone.addEventListener(ev, (e) => {
        e.preventDefault();
        zone.classList.add("is-dragover");
      })
    );
    ["dragleave", "drop"].forEach((ev) =>
      zone.addEventListener(ev, (e) => {
        e.preventDefault();
        if (ev === "dragleave" && e.target !== zone) return;
        zone.classList.remove("is-dragover");
      })
    );
    zone.addEventListener("drop", (e) => {
      const files = Array.from(e.dataTransfer.files || []);
      if (files.length && typeof onFiles === "function") onFiles(files);
    });
  };

  // ── Number animation (count-up) ────────────────────────────────
  QC.countUp = function (el, to, durationMs = 800) {
    if (!el) return;
    const fromTxt = (el.textContent || "0").replace(/[^\d.-]/g, "");
    const from = parseFloat(fromTxt) || 0;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const t = Math.min(1, (now - start) / durationMs);
      const v = from + (to - from) * ease(t);
      el.textContent = Math.round(v).toLocaleString();
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // ── Reduced-motion respect (already in shared.css; just a guard)
  QC.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
})();
