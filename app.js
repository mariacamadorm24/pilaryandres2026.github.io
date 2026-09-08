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

    if (cfg.theme.sections) {
      const s = cfg.theme.sections;
      const sectionMap = {
        showWelcome: "welcome",
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
  heroNames.innerHTML = `${cfg.couple.nameOne} ${cfg.couple.ampersand} ${cfg.couple.nameTwo}`;
  heroNames.setAttribute("aria-label", `${cfg.couple.nameOne} y ${cfg.couple.nameTwo}`);

  setText("hero-date", cfg.event.dateDisplay);
  setText("hero-place", cfg.event.place);

  // Foto de fondo del hero (opcional) — si no hay foto, se queda el fondo crema.
  const heroBg = document.getElementById("hero-bg");
  const heroPhoto = cfg.photos && cfg.photos.hero;
  if (heroBg && heroPhoto) {
    heroBg.style.backgroundImage = `url("${heroPhoto}")`;
    document.getElementById("hero").classList.add("hero--has-photo");
  }

  requestAnimationFrame(() => {
    document.getElementById("hero").classList.add("is-ready");
  });

  /* ------------------------ Invitación personalizada (?inv=codigo) ------------------------ */
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

  const cuposNumber = document.getElementById("cupos-number");
  const cuposLabel = document.getElementById("cupos-label");
  if (cuposNumber) cuposNumber.textContent = String(maxGuests);
  if (cuposLabel) cuposLabel.textContent = maxGuests === 1 ? "CUPO EN TU HONOR" : "CUPOS EN TU HONOR";

  /* ------------------------ Pantalla de entrada + música ------------------------ */
  const musicCfg = cfg.music || {};
  let ytPlayer = null;
  let ytReady = false;
  let ytApiReady = false;
  let pendingAutoplay = false;
  let progressTimer = null;

  const musicPlayer = document.getElementById("music-player");
  const musicPlayBtn = document.getElementById("music-play-btn");
  const musicIconPlay = musicPlayBtn ? musicPlayBtn.querySelector(".icon-play") : null;
  const musicIconPause = musicPlayBtn ? musicPlayBtn.querySelector(".icon-pause") : null;
  const musicBar = document.getElementById("music-progress-bar");
  const musicFill = document.getElementById("music-progress-fill");
  const musicHandle = document.getElementById("music-progress-handle");

  function setPlayIcon(isPlaying) {
    if (!musicIconPlay || !musicIconPause) return;
    musicIconPlay.hidden = isPlaying;
    musicIconPause.hidden = !isPlaying;
    if (musicPlayBtn) musicPlayBtn.setAttribute("aria-label", isPlaying ? "Pausar" : "Reproducir");
  }

  function updateProgress() {
    if (!ytPlayer || !ytReady || !musicFill || !musicHandle) return;
    const duration = ytPlayer.getDuration ? ytPlayer.getDuration() : 0;
    const current = ytPlayer.getCurrentTime ? ytPlayer.getCurrentTime() : 0;
    if (!duration) return;
    const pct = Math.min(100, (current / duration) * 100);
    musicFill.style.width = pct + "%";
    musicHandle.style.left = pct + "%";
  }

  function onPlayerReady() {
    ytReady = true;
    if (pendingAutoplay) {
      pendingAutoplay = false;
      ytPlayer.playVideo();
    }
  }

  function onPlayerStateChange(e) {
    const isPlaying = e.data === YT.PlayerState.PLAYING;
    setPlayIcon(isPlaying);
    if (isPlaying) {
      if (progressTimer) clearInterval(progressTimer);
      progressTimer = setInterval(updateProgress, 400);
    } else if (progressTimer) {
      clearInterval(progressTimer);
    }
  }

  function onPlayerError(e) {
    // Códigos 101/150: el dueño del video desactivó la reproducción en
    // sitios externos. En ese caso avisamos y damos un link directo.
    console.warn("Error al reproducir el video de YouTube. Código:", e.data);
    if (musicPlayer && (e.data === 101 || e.data === 150)) {
      musicPlayer.innerHTML =
        `<p class="music-player__error">Esta canción no se puede reproducir aquí. ` +
        `<a href="https://www.youtube.com/watch?v=${musicCfg.youtubeId}" target="_blank" rel="noopener noreferrer">Escúchala en YouTube</a>.</p>`;
    }
  }

  // Crea el reproductor de YouTube. IMPORTANTE: lo creamos recién cuando el
  // invitado toca "Abrir invitación" (no antes), porque los navegadores
  // solo permiten reproducir audio automáticamente si el iframe se crea
  // dentro de una interacción directa del usuario. Crearlo de antemano y
  // llamar a playVideo() después casi siempre queda bloqueado en silencio.
  function createPlayer(autoplayNow) {
    if (ytPlayer) {
      if (autoplayNow) {
        if (ytReady) ytPlayer.playVideo();
        else pendingAutoplay = true;
      }
      return;
    }
    if (autoplayNow) pendingAutoplay = true;
    ytPlayer = new YT.Player("yt-audio-player", {
      height: "200",
      width: "300",
      videoId: musicCfg.youtubeId,
      playerVars: {
        autoplay: autoplayNow ? 1 : 0,
        controls: 0,
        disablekb: 1,
        loop: 1,
        playlist: musicCfg.youtubeId,
        playsinline: 1,
        rel: 0
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError
      }
    });
  }

  window.onYouTubeIframeReady = function () {
    if (!musicCfg.enabled || !musicCfg.youtubeId) return;
    ytApiReady = true;
    if (pendingAutoplay) createPlayer(true);
  };

  const entranceOverlay = document.getElementById("entrance-overlay");
  const entranceBtn = document.getElementById("entrance-enter-btn");

  setText("entrance-kicker", cfg.event.heroKicker);
  const entranceNames = document.getElementById("entrance-names");
  if (entranceNames) {
    entranceNames.innerHTML =
      `${cfg.couple.nameOne} <span class="amp-glyph">${cfg.couple.ampersand}</span> ${cfg.couple.nameTwo}`;
  }

  document.body.classList.add("entrance-locked");

  function startMusic() {
    if (!musicCfg.enabled || !musicCfg.youtubeId) return;
    if (musicPlayer) musicPlayer.hidden = false;
    if (ytApiReady) {
      createPlayer(true);
    } else {
      pendingAutoplay = true;
    }
  }

  if (entranceBtn && entranceOverlay) {
    entranceBtn.addEventListener("click", () => {
      entranceOverlay.classList.add("is-hidden");
      document.body.classList.remove("entrance-locked");
      startMusic();
    });
  }

  if (musicPlayBtn) {
    musicPlayBtn.addEventListener("click", () => {
      if (!ytPlayer) {
        // Autoplay inicial bloqueado por el navegador: este clic sí cuenta
        // como interacción directa, así que creamos y arrancamos aquí.
        if (ytApiReady) createPlayer(true);
        else pendingAutoplay = true;
        return;
      }
      if (!ytReady) return;
      const state = ytPlayer.getPlayerState();
      if (state === YT.PlayerState.PLAYING) {
        ytPlayer.pauseVideo();
      } else {
        ytPlayer.playVideo();
      }
    });
  }

  if (musicBar) {
    musicBar.addEventListener("click", (e) => {
      if (!ytPlayer || !ytReady) return;
      const rect = musicBar.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      const duration = ytPlayer.getDuration ? ytPlayer.getDuration() : 0;
      if (duration) {
        ytPlayer.seekTo(duration * ratio, true);
        updateProgress();
      }
    });
  }

  /* ------------------------------ Galería / carrete ------------------------------ */
  const filmstrip = document.getElementById("filmstrip");
  if (filmstrip) {
    const galleryImages = (cfg.gallery && cfg.gallery.images) || [];
    if (galleryImages.length > 0) {
      filmstrip.innerHTML = galleryImages
        .map(
          (img) => `
        <figure class="filmstrip__frame">
          <img src="${img.src}" alt="${img.alt || ""}" loading="lazy" />
        </figure>`
        )
        .join("");
    } else {
      filmstrip.innerHTML =
        `<p class="filmstrip__placeholder">Muy pronto agregaremos aquí nuestras fotos favoritas.</p>`;
    }
  }

  /* ------------------------------ Bienvenida -------------------------------- */
  setText("welcome-eyebrow", cfg.welcome.eyebrow);
  setText("welcome-message", cfg.welcome.message);
  setText("welcome-signature", cfg.welcome.signature);

  /* --------------------------- Info del evento ------------------------------ */
  setText("evento-fecha-completa", `${cfg.event.weekday} ${cfg.event.dateDisplay}`);

  setText("ceremonia-label", cfg.ceremony.label);
  setText("ceremonia-time", cfg.ceremony.time);
  setText("ceremonia-venue", cfg.ceremony.venue);
  setText("ceremonia-place", cfg.ceremony.place);
  const ceremoniaMap = document.getElementById("ceremonia-map");
  if (ceremoniaMap) ceremoniaMap.href = cfg.ceremony.mapsUrl;

  setText("recepcion-label", cfg.reception.label);
  setText("recepcion-time", cfg.reception.time);
  setText("recepcion-venue", cfg.reception.venue);
  setText("recepcion-place", cfg.reception.place);
  const recepcionMap = document.getElementById("recepcion-map");
  if (recepcionMap) recepcionMap.href = cfg.reception.mapsUrl;

  setText("dresscode-heading", cfg.dressCode.title);
  setText("dress-men", cfg.dressCode.men);
  setText("dress-women", cfg.dressCode.women);

  const swatchWrap = document.getElementById("avoid-colors");
  if (swatchWrap) {
    swatchWrap.innerHTML = cfg.dressCode.avoidColors
      .map((c) => `<span class="avoid-swatch__circle" style="background:${c.hex}" title="${c.name}"></span>`)
      .join("");
  }

  const reservedText = document.getElementById("reserved-text");
  if (reservedText) {
    const names = cfg.dressCode.avoidColors.map((c) => c.name).join(" y ");
    reservedText.textContent = `${names}. ${cfg.dressCode.avoidNote}`;
  }

  const dressRefs = cfg.dressCode.referenceLinks || {};
  const dressRefWomen = document.getElementById("dress-ref-women");
  const dressRefMen = document.getElementById("dress-ref-men");
  if (dressRefWomen) {
    if (dressRefs.women) dressRefWomen.href = dressRefs.women;
    else dressRefWomen.hidden = true;
  }
  if (dressRefMen) {
    if (dressRefs.men) dressRefMen.href = dressRefs.men;
    else dressRefMen.hidden = true;
  }
  const dressRefsWrap = document.getElementById("dress-refs");
  if (dressRefsWrap && !dressRefs.women && !dressRefs.men) dressRefsWrap.hidden = true;

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
  const monogram = `${cfg.couple.nameOne.charAt(0)}${cfg.couple.ampersand}${cfg.couple.nameTwo.charAt(0)}`;
  setText("footer-monogram", monogram);
  document.getElementById("footer-names").innerHTML =
    `${cfg.couple.nameOne} <span class="amp-glyph">${cfg.couple.ampersand}</span> ${cfg.couple.nameTwo}`;
  setText("footer-date", `${cfg.event.dateDisplay} · ${cfg.event.place}`);

  /* --------------------------------- RSVP form ---------------------------------- */
  setText("rsvp-deadline", cfg.rsvp.deadlineText);

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
  const revealables = $$(".reveal, .section-divider");
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
