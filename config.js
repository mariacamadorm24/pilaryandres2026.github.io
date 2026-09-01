/**
 * config.js
 * -----------------------------------------------------------------------
 * Toda la información editable de la boda vive aquí. No hay textos ni
 * datos "quemados" dentro del HTML o del JS de la aplicación: todo se
 * pinta en pantalla a partir de este objeto.
 *
 * Para editar la invitación (nombres, fecha, lugares, itinerario, etc.)
 * solo necesitas modificar los valores de este archivo.
 * -----------------------------------------------------------------------
 */

window.WEDDING_CONFIG = {

  // ------------------------------------------------------------------
  // META / SEO — ver instrucciones.md sección "SEO" para la imagen OG
  // ------------------------------------------------------------------
  meta: {
    title: "Pilar & Andrés — 31 de Octubre de 2026",
    description:
      "Acompáñanos a celebrar la boda de Pilar y Andrés el 31 de octubre de 2026 en Vélez, Santander. Confirma tu asistencia aquí.",
    ogImage: "assets/og-cover.jpg", // reemplaza por una fotografía real antes de publicar
    siteUrl: "" // pega aquí la URL final una vez publiques el sitio
  },

  // ------------------------------------------------------------------
  // NOVIOS
  // ------------------------------------------------------------------
  couple: {
    nameOne: "Pilar",
    nameTwo: "Andrés",
    ampersand: "&"
  },

  // ------------------------------------------------------------------
  // FECHA Y HERO
  // ------------------------------------------------------------------
  event: {
    dateDisplay: "31 de Octubre de 2026",
    dateISO: "2026-10-31T16:00:00-05:00",
    weekday: "Sábado",
    timeDisplay: "4:00 p. m.",
    place: "Vélez, Santander",
    heroKicker: "Nos casamos"
  },

  // ------------------------------------------------------------------
  // MENSAJE DE BIENVENIDA — [PLACEHOLDER] reemplazar con el texto real
  // ------------------------------------------------------------------
  welcome: {
    eyebrow: "Bienvenidos",
    message:
      "Pilar Martínez Serrano y Andrés Felipe Reyes P., tenemos el gusto de invitarlos a nuestra boda.",
    signature: "Pilar & Andrés"
  },

  // ------------------------------------------------------------------
  // INFORMACIÓN DEL EVENTO
  // ------------------------------------------------------------------
  ceremony: {
    label: "Ceremonia",
    venue: "Catedral Nuestra Señora de las Nieves",
    place: "Vélez, Santander",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Catedral+Nuestra+Se%C3%B1ora+de+las+Nieves+V%C3%A9lez+Santander"
  },

  reception: {
    label: "Recepción",
    venue: "Hotel Ecolodge Macúa",
    place: "Chipatá, Santander",
    mapsUrl: "https://maps.app.goo.gl/CtVhZnxQ4MNHuCxW6"
  },

  // ------------------------------------------------------------------
  // ITINERARIO — agrega, quita o reordena momentos libremente
  // ------------------------------------------------------------------
  itinerary: [
    { time: "4:00 p. m.", title: "Ceremonia", detail: "Catedral Nuestra Señora de las Nieves" },
    { time: "6:30 p. m.", title: "Recepción y fiesta", detail: "Hotel Ecolodge Macúa" }
  ],

  // ------------------------------------------------------------------
  // DRESS CODE
  // ------------------------------------------------------------------
  dressCode: {
    title: "Cocktail",
    men: "Traje oscuro, con o sin corbata.",
    women: "Vestido a media pierna o largo, o pantalón formal.",
    reservedColorName: "Palo rosa",
    reservedColorHex: "#D9BFB0",
    reservedNote: "Este color está reservado para el cortejo nupcial — te agradecemos evitarlo."
  },

  // ------------------------------------------------------------------
  // INFORMACIÓN ADICIONAL
  // Cada tarjeta es opcional: dale valor a "text" cuando tengas el
  // contenido real. Mientras tanto queda marcada como pendiente.
  // ------------------------------------------------------------------
  additionalInfo: [
    {
      icon: "stay",
      title: "Hospedaje",
      text: "Rancho Los Tres Potrillos (Chipatá, Santander) y Hotel Pringamosa (Vélez, Santander)."
    },
    {
      icon: "transport",
      title: "Transporte",
      text: "Tendremos servicio de buses ida y vuelta desde el parque principal de Vélez hasta Macúa. La información detallada se estará enviando próximamente."
    },
    {
      icon: "gift",
      title: "Regalos",
      text: "Lluvia de sobres."
    }
  ],

  // ------------------------------------------------------------------
  // RSVP — opciones del formulario
  // ------------------------------------------------------------------
  rsvp: {
    deadlineText: "El plazo máximo para confirmar tu asistencia es el 25 de septiembre de 2026.",
    attendanceOptions: [
      { value: "si", label: "Sí, asistiré" },
      { value: "no", label: "No podré asistir" }
    ],
    dietaryOptions: [
      { value: "ninguna", label: "Ninguna" },
      { value: "vegetariano", label: "Vegetariano/a" },
      { value: "vegano", label: "Vegano/a" },
      { value: "alergia", label: "Alergia alimentaria" },
      { value: "otra", label: "Otra" }
    ],
    dietaryFollowUpTriggers: ["alergia", "otra"],
    successMessage:
      "¡Gracias por confirmar! Nos hace muy felices saber que nos acompañarás en este día tan especial.",
    successMessageDecline:
      "Gracias por avisarnos. Te vamos a extrañar, ¡pero lo entendemos! Gracias por confirmar.",
    errorMessage:
      "Algo salió mal al enviar tu confirmación. Por favor, inténtalo de nuevo en unos segundos."
  },

  // ------------------------------------------------------------------
  // INTEGRACIÓN CON GOOGLE SHEETS
  // Pega aquí la URL que obtienes al desplegar el Google Apps Script
  // como aplicación web. Ver instrucciones.md paso a paso.
  // ------------------------------------------------------------------
  appsScriptUrl: "PEGA_AQUI_LA_URL_DE_TU_GOOGLE_APPS_SCRIPT"
};
