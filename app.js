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

  /* --------------------------------- Apariencia --------------------------------- */
  if (cfg.theme) {
    const root = document.documentElement.style;
    const colorVarMap = {
      cream: "--cream",
      creamDeep: "--cream-deep",
      ink: "--ink",
      inkSoft: "--ink-soft",
      sage: "--forest",
      sageDeep: "--forest-deep",
      rose: "--sienna",
      mauve: "--plum",
      gold: "--gold",
      goldLight: "--gold-light"
    };
    if (cfg.theme.colors) {
      Object.keys(cfg.theme.colors).forEach((key) => {
        const cssVar = colorVarMap[key];
        if (cssVar) root.setProperty(cssVar, cfg.theme.colors[key]);
      });
    }

    if (cfg.theme.ornaments) {
      const o = cfg.theme.ornaments;
      if (o.heroScale !== undefined) root.setProperty("--hero-orn-scale", o.heroScale);
      if (o.sectionBloomOpacity !== undefined) root.setProperty("--bloom-opacity", o.sectionBloomOpacity);
      if (o.pageBordersOpacity !== undefined) root.setProperty("--page-border-opacity", o.pageBordersOpacity);
      if (o.pageBordersEnabled === false) document.body.classList.add("no-page-borders");
    }

    if (cfg.theme.sections) {
      const s = cfg.theme.sections;
      const sectionMap = {
        showWelcome: "welcome",
        showItinerary: "itinerario",
        showDressCode: "dresscode",
        showAdditionalInfo: "info-adicional"
      };
      Object.keys(sectionMap).forEach((key) => {
        if (s[key] === false) {
          const el = document.getElementById(sectionMap[key]);
          if (el) el.hidden = true;
        }
      });
    }
  }

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

  setText("dresscode-heading", cfg.dressCode.title);
  setText("dress-men", cfg.dressCode.men);
  setText("dress-women", cfg.dressCode.women);

  const swatchWrap = document.getElementById("avoid-colors");
  if (swatchWrap) {
    swatchWrap.innerHTML = cfg.dressCode.avoidColors
      .map(
        (c) => `
        <span class="avoid-swatch">
          <span class="avoid-swatch__circle" style="background:${c.hex}"></span>
          <span class="avoid-swatch__label">${c.name}</span>
        </span>`
      )
      .join("");
  }

  const reservedText = document.getElementById("reserved-text");
  if (reservedText) {
    reservedText.textContent = cfg.dressCode.avoidNote;
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
      const introHtml = item.intro
        ? `<p class="info-card__intro">${item.intro}</p>`
        : "";
      return `
      <article class="info-card">
        <span class="info-card__icon">${ICONS[item.icon] || ""}</span>
        <p class="info-card__title">${item.title}</p>
        ${introHtml}
        <p class="info-card__text${hasText ? "" : " info-card__text--pending"}">
          ${hasText ? item.text : "Muy pronto compartiremos esta información."}
        </p>
      </article>`;
    })
    .join("");

  /* ---------------------------------- Footer ---------------------------------- */
  document.getElementById("footer-names").innerHTML =
    `${cfg.couple.nameOne} <span class="amp-glyph">${cfg.couple.ampersand}</span> ${cfg.couple.nameTwo}`;
  setText("footer-date", `${cfg.event.dateDisplay} · ${cfg.event.place}`);

  /* --------------------------------- RSVP form ---------------------------------- */
  setText("rsvp-deadline", cfg.rsvp.deadlineText);

  // Invitación personalizada vía ?inv=codigo en la URL
  const urlParams = new URLSearchParams(window.location.search);
  const invCode = (urlParams.get("inv") || "").trim().toLowerCase();
  const invitation = (cfg.invitations && cfg.invitations[invCode]) || null;
  const maxGuests = invitation ? invitation.maxGuests : cfg.defaultMaxGuests || 1;

  const invitationNote = document.getElementById("rsvp-invitation-note");
  if (invitation && invitationNote) {
    invitationNote.textContent =
      maxGuests > 1
        ? `Esta invitación es para ${invitation.label} — hasta ${maxGuests} personas.`
        : `Esta invitación es para ${invitation.label}.`;
    invitationNote.hidden = false;
  }

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

  function dietaryOptionsHtml() {
    return cfg.rsvp.dietaryOptions
      .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
      .join("");
  }

  const restriccionSelect = document.getElementById("f-restriccion");
  restriccionSelect.insertAdjacentHTML("beforeend", dietaryOptionsHtml());

  const detalleWrapper = document.getElementById("detalle-wrapper");
  const detalleInput = document.getElementById("f-detalle");
  restriccionSelect.addEventListener("change", () => {
    const shouldShow = cfg.rsvp.dietaryFollowUpTriggers.includes(restriccionSelect.value);
    detalleWrapper.classList.toggle("is-shown", shouldShow);
    if (!shouldShow) detalleInput.value = "";
  });

  /* ----------------------- Acompañantes adicionales ----------------------- */
  const guestSection = document.getElementById("guest-section");
  const guestsList = document.getElementById("guests-list");
  const addGuestBtn = document.getElementById("add-guest-btn");
  const guestLimitNote = document.getElementById("guest-limit-note");
  let guestCounter = 0;

  function updateGuestUI() {
    const currentTotal = 1 + $$(".guest-row", guestsList).length; // +1 = quien llena el formulario
    const reachedLimit = currentTotal >= maxGuests;
    addGuestBtn.disabled = reachedLimit;
    if (guestLimitNote) {
      if (reachedLimit && maxGuests > 1) {
        guestLimitNote.textContent = `Esta invitación incluye hasta ${maxGuests} personas — ya agregaste el máximo.`;
        guestLimitNote.hidden = false;
      } else {
        guestLimitNote.hidden = true;
      }
    }
  }

  if (maxGuests <= 1) {
    // Esta invitación es solo para 1 persona: no mostramos la opción de acompañantes.
    if (guestSection) guestSection.hidden = true;
  } else {
    updateGuestUI();
  }

  function addGuestRow() {
    const currentTotal = 1 + $$(".guest-row", guestsList).length;
    if (currentTotal >= maxGuests) return;

    guestCounter += 1;
    const id = `guest-${guestCounter}`;

    const row = document.createElement("div");
    row.className = "guest-row";
    row.dataset.guestId = id;
    row.innerHTML = `
      <div class="guest-row__header">
        <p class="guest-row__label">Acompañante</p>
        <button type="button" class="guest-row__remove" data-remove="${id}">Quitar</button>
      </div>
      <div class="field">
        <label for="${id}-nombre">Nombre completo</label>
        <input type="text" id="${id}-nombre" data-field="nombre" />
        <p class="field-error" data-error="nombre"></p>
      </div>
      <div class="field">
        <label for="${id}-restriccion">Restricciones alimenticias</label>
        <select id="${id}-restriccion" data-field="restriccion">
          <option value="" disabled selected>Selecciona una opción</option>
          ${dietaryOptionsHtml()}
        </select>
        <p class="field-error" data-error="restriccion"></p>
      </div>
      <div class="field field--conditional" data-detalle-wrapper>
        <label for="${id}-detalle">Cuéntanos cuál</label>
        <input type="text" id="${id}-detalle" data-field="detalleRestriccion" />
      </div>
    `;

    guestsList.appendChild(row);

    const rowSelect = row.querySelector('[data-field="restriccion"]');
    const rowDetalleWrapper = row.querySelector("[data-detalle-wrapper]");
    const rowDetalleInput = row.querySelector('[data-field="detalleRestriccion"]');
    rowSelect.addEventListener("change", () => {
      const shouldShow = cfg.rsvp.dietaryFollowUpTriggers.includes(rowSelect.value);
      rowDetalleWrapper.classList.toggle("is-shown", shouldShow);
      if (!shouldShow) rowDetalleInput.value = "";
    });
  }

  addGuestBtn.addEventListener("click", () => {
    addGuestRow();
    updateGuestUI();
  });

  guestsList.addEventListener("click", (e) => {
    const removeId = e.target && e.target.getAttribute && e.target.getAttribute("data-remove");
    if (!removeId) return;
    const row = guestsList.querySelector(`[data-guest-id="${removeId}"]`);
    if (row) row.remove();
    updateGuestUI();
  });

  function collectGuestRows() {
    return $$(".guest-row", guestsList).map((row) => ({
      el: row,
      id: row.dataset.guestId,
      nombre: (row.querySelector('[data-field="nombre"]').value || "").trim(),
      restriccion: row.querySelector('[data-field="restriccion"]').value || "",
      detalleRestriccion: (row.querySelector('[data-field="detalleRestriccion"]').value || "").trim()
    }));
  }

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
    $$(".guest-row", guestsList).forEach((row) => {
      $$(".field-error", row).forEach((el) => (el.textContent = ""));
      $$("input, select", row).forEach((el) => el.classList.remove("has-error"));
    });
  }

  function validate(primary, asistencia, guestRows) {
    let valid = true;

    if (!primary.nombre.trim()) {
      document.getElementById("err-nombre").textContent = "Por favor ingresa tu nombre completo.";
      document.getElementById("f-nombre").classList.add("has-error");
      valid = false;
    }
    if (!primary.telefono.trim()) {
      document.getElementById("err-telefono").textContent = "Por favor ingresa tu número de teléfono.";
      document.getElementById("f-telefono").classList.add("has-error");
      valid = false;
    }
    if (!asistencia) {
      document.getElementById("err-asistencia").textContent = "Por favor confirma tu asistencia.";
      valid = false;
    }
    if (!primary.restriccion) {
      document.getElementById("err-restriccion").textContent = "Por favor selecciona una opción.";
      document.getElementById("f-restriccion").classList.add("has-error");
      valid = false;
    }

    guestRows.forEach((guest) => {
      if (!guest.nombre) {
        const errEl = guest.el.querySelector('[data-error="nombre"]');
        if (errEl) errEl.textContent = "Ingresa el nombre de esta persona.";
        guest.el.querySelector('[data-field="nombre"]').classList.add("has-error");
        valid = false;
      }
      if (!guest.restriccion) {
        const errEl = guest.el.querySelector('[data-error="restriccion"]');
        if (errEl) errEl.textContent = "Selecciona una opción.";
        guest.el.querySelector('[data-field="restriccion"]').classList.add("has-error");
        valid = false;
      }
    });

    return valid;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();
    statusEl.textContent = "";
    statusEl.classList.remove("form-status--error");

    const formData = new FormData(form);
    const primary = {
      nombre: (formData.get("nombre") || "").toString(),
      telefono: (formData.get("telefono") || "").toString(),
      restriccion: (formData.get("restriccion") || "").toString(),
      detalleRestriccion: (formData.get("detalleRestriccion") || "").toString()
    };
    const asistencia = (formData.get("asistencia") || "").toString();
    const comentarios = (formData.get("comentarios") || "").toString();
    const guestRows = collectGuestRows();

    if (!validate(primary, asistencia, guestRows)) return;

    const guests = [
      {
        nombre: primary.nombre.trim(),
        restriccion: primary.restriccion,
        detalleRestriccion: primary.detalleRestriccion.trim()
      },
      ...guestRows.map((g) => ({
        nombre: g.nombre,
        restriccion: g.restriccion,
        detalleRestriccion: g.detalleRestriccion
      }))
    ];

    const data = {
      telefono: primary.telefono.trim(),
      asistencia: asistencia,
      comentarios: comentarios.trim(),
      guests: guests
    };

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
