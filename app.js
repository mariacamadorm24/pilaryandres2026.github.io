/**
 * app.js
 * -----------------------------------------------------------------------
 * Pinta el contenido de WEDDING_CONFIG en el DOM, maneja las
 * micro-interacciones (reveal on scroll, hero, campo condicional) y el
 * envío del formulario RSVP hacia el Google Apps Script.
 * -----------------------------------------------------------------------
 */

(function () {
  "use strict";

  const cfg = window.WEDDING_CONFIG;
  if (!cfg) {
    console.error("WEDDING_CONFIG no está disponible. Revisa que config.js se cargue antes de app.js.");
    return;
  }

  /* ----------------------------- Utilidades ----------------------------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null) el.textContent = value;
  };

  const MONTHS = [
    "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
    "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"
  ];

  /* ------------------------------- Meta ---------------------------------- */
  document.title = cfg.meta.title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", cfg.meta.description);

  /* -------------------------------- Hero ---------------------------------- */
  setText("hero-kicker", cfg.event.heroKicker);

  const heroNames = document.getElementById("hero-names");
  heroNames.innerHTML =
    `<span>${cfg.couple.nameOne}</span>` +
    `<span class="hero__amp">${cfg.couple.ampersand}</span>` +
    `<span>${cfg.couple.nameTwo}</span>`;
  heroNames.setAttribute("aria-label", `${cfg.couple.nameOne} y ${cfg.couple.nameTwo}`);

  setText("hero-date", cfg.event.dateDisplay);
  setText("hero-place", cfg.event.place);

  requestAnimationFrame(() => {
    document.getElementById("hero").classList.add("is-ready");
  });

  /* ------------------------------ Bienvenida -------------------------------- */
  setText("welcome-eyebrow", cfg.welcome.eyebrow);
  setText("welcome-message", cfg.welcome.message);
  setText("welcome-signature", cfg.welcome.signature);

  /* --------------------------- Info del evento ------------------------------ */
  const dateParts = /(\d{1,2}) de (\w+) de (\d{4})/i.exec(cfg.event.dateDisplay);
  if (dateParts) {
    setText("evento-dia", dateParts[1]);
    setText("evento-mes", dateParts[2].toUpperCase());
  }
  setText("evento-hora", cfg.event.timeDisplay);

  setText("ceremonia-label", cfg.ceremony.label);
  setText("ceremonia-venue", cfg.ceremony.venue);
  setText("ceremonia-place", cfg.ceremony.place);
  const ceremoniaMap = document.getElementById("ceremonia-map");
  if (ceremoniaMap) ceremoniaMap.href = cfg.ceremony.mapsUrl;

  setText("recepcion-label", cfg.reception.label);
  setText("recepcion-venue", cfg.reception.venue);
  setText("recepcion-place", cfg.reception.place);
  const recepcionMap = document.getElementById("recepcion-map");
  if (recepcionMap) recepcionMap.href = cfg.reception.mapsUrl;

  /* -------------------------------- Itinerario -------------------------------- */
  const timelineList = document.getElementById("timeline-list");
  timelineList.innerHTML = cfg.itinerary
    .map(
      (item, i) => `
      <li class="timeline__item reveal reveal-delay-${Math.min(i + 1, 3)}">
        <p class="timeline__time">${item.time}</p>
        <p class="timeline__title">${item.title}</p>
        <p class="timeline__detail">${item.detail || ""}</p>
      </li>`
    )
    .join("");

  /* -------------------------------- Dress code -------------------------------- */
  setText("dresscode-heading", cfg.dressCode.title);
  setText("dress-men", cfg.dressCode.men);
  setText("dress-women", cfg.dressCode.women);

  const swatch = document.getElementById("reserved-swatch");
  if (swatch) swatch.style.background = cfg.dressCode.reservedColorHex;

  const reservedText = document.getElementById("reserved-text");
  if (reservedText) {
    reservedText.innerHTML =
      `<strong>${cfg.dressCode.reservedColorName}</strong> — ${cfg.dressCode.reservedNote}`;
  }

  /* ------------------------------ Info adicional -------------------------------- */
  const ICONS = {
    stay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 21V9l9-6 9 6v12"/><path d="M9 21v-8h6v8"/></svg>',
    transport: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="10" width="18" height="8" rx="2"/><circle cx="7.5" cy="18.5" r="1.5"/><circle cx="16.5" cy="18.5" r="1.5"/><path d="M5 10l1.5-5h11L19 10"/></svg>',
    parking: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 16V7h3.5a2.5 2.5 0 010 5H9"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="9" width="18" height="12"/><path d="M3 9h18v0"/><path d="M12 9v12"/><path d="M12 9c-1.5-4-6-5-6-2s3 2 6 2z"/><path d="M12 9c1.5-4 6-5 6-2s-3 2-6 2z"/></svg>',
    travel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 12l18-8-8 18-2-8-8-2z"/></svg>'
  };

  const infoGrid = document.getElementById("info-grid");
  infoGrid.innerHTML = cfg.additionalInfo
    .map((item) => {
      const hasText = item.text && item.text.trim().length > 0;
      return `
      <article class="info-card">
        <span class="info-card__icon">${ICONS[item.icon] || ""}</span>
        <p class="info-card__title">${item.title}</p>
        <p class="info-card__text${hasText ? "" : " info-card__text--pending"}">
          ${hasText ? item.text : "Muy pronto compartiremos esta información."}
        </p>
      </article>`;
    })
    .join("");

  /* ---------------------------------- Footer ---------------------------------- */
  setText("footer-names", `${cfg.couple.nameOne} ${cfg.couple.ampersand} ${cfg.couple.nameTwo}`);
  setText("footer-date", `${cfg.event.dateDisplay} · ${cfg.event.place}`);

  /* --------------------------------- RSVP form ---------------------------------- */
  const asistenciaWrap = document.getElementById("asistencia-options");
  asistenciaWrap.innerHTML = cfg.rsvp.attendanceOptions
    .map(
      (opt) => `
      <span class="radio-pill">
        <input type="radio" id="asist-${opt.value}" name="asistencia" value="${opt.value}" />
        <label for="asist-${opt.value}">${opt.label}</label>
      </span>`
    )
    .join("");

  const restriccionSelect = document.getElementById("f-restriccion");
  cfg.rsvp.dietaryOptions.forEach((opt) => {
    const o = document.createElement("option");
    o.value = opt.value;
    o.textContent = opt.label;
    restriccionSelect.appendChild(o);
  });

  const detalleWrapper = document.getElementById("detalle-wrapper");
  const detalleInput = document.getElementById("f-detalle");
  restriccionSelect.addEventListener("change", () => {
    const shouldShow = cfg.rsvp.dietaryFollowUpTriggers.includes(restriccionSelect.value);
    detalleWrapper.classList.toggle("is-shown", shouldShow);
    if (!shouldShow) detalleInput.value = "";
  });

  /* --------------------------- Validación y envío --------------------------- */
  const form = document.getElementById("rsvp-form");
  const submitBtn = document.getElementById("rsvp-submit");
  const statusEl = document.getElementById("form-status");
  const successBox = document.getElementById("rsvp-success");

  function clearErrors() {
    ["nombre", "telefono", "asistencia", "restriccion"].forEach((f) => {
      const errEl = document.getElementById(`err-${f}`);
      if (errEl) errEl.textContent = "";
      const inputEl = document.getElementById(`f-${f}`);
      if (inputEl) inputEl.classList.remove("has-error");
    });
  }

  function validate(data) {
    let valid = true;

    if (!data.nombre.trim()) {
      document.getElementById("err-nombre").textContent = "Por favor ingresa tu nombre completo.";
      document.getElementById("f-nombre").classList.add("has-error");
      valid = false;
    }
    if (!data.telefono.trim()) {
      document.getElementById("err-telefono").textContent = "Por favor ingresa tu número de teléfono.";
      document.getElementById("f-telefono").classList.add("has-error");
      valid = false;
    }
    if (!data.asistencia) {
      document.getElementById("err-asistencia").textContent = "Por favor confirma tu asistencia.";
      valid = false;
    }
    if (!data.restriccion) {
      document.getElementById("err-restriccion").textContent = "Por favor selecciona una opción.";
      document.getElementById("f-restriccion").classList.add("has-error");
      valid = false;
    }
    return valid;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();
    statusEl.textContent = "";
    statusEl.classList.remove("form-status--error");

    const formData = new FormData(form);
    const data = {
      nombre: (formData.get("nombre") || "").toString(),
      telefono: (formData.get("telefono") || "").toString(),
      asistencia: (formData.get("asistencia") || "").toString(),
      restriccion: (formData.get("restriccion") || "").toString(),
      detalleRestriccion: (formData.get("detalleRestriccion") || "").toString(),
      comentarios: (formData.get("comentarios") || "").toString()
    };

    if (!validate(data)) return;

    if (!cfg.appsScriptUrl || cfg.appsScriptUrl.indexOf("PEGA_AQUI") === 0 || cfg.appsScriptUrl.indexOf("PEGA_AQUI") > -1) {
      statusEl.textContent =
        "Falta configurar la URL de Google Apps Script en config.js (ver instrucciones.md).";
      statusEl.classList.add("form-status--error");
      return;
    }

    form.classList.add("is-loading");
    submitBtn.disabled = true;
    $$("input, select, textarea, button", form).forEach((el) => (el.disabled = true));

    try {
      const response = await fetch(cfg.appsScriptUrl, {
        method: "POST",
        // text/plain evita el preflight CORS; Apps Script devuelve JSON legible.
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result && result.result === "success") {
        form.hidden = true;
        successBox.hidden = false;
        document.getElementById("rsvp-success-text").textContent =
          data.asistencia === "no" ? cfg.rsvp.successMessageDecline : cfg.rsvp.successMessage;
        successBox.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        throw new Error((result && result.message) || "Error desconocido");
      }
    } catch (err) {
      statusEl.textContent = cfg.rsvp.errorMessage;
      statusEl.classList.add("form-status--error");
    } finally {
      form.classList.remove("is-loading");
      submitBtn.disabled = false;
      $$("input, select, textarea, button", form).forEach((el) => (el.disabled = false));
    }
  });

  /* ------------------------------ Scroll reveals ------------------------------ */
  const revealables = $$(".reveal, .divider-sprig");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add("is-visible"));
  }
})();
