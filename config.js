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
    time: "3:00 p. m.",
    venue: "Catedral Nuestra Señora de las Nieves",
    place: "Vélez, Santander",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Catedral+Nuestra+Se%C3%B1ora+de+las+Nieves+V%C3%A9lez+Santander"
  },

  reception: {
    label: "Recepción",
    time: "6:30 p. m.",
    venue: "Hotel Ecolodge Macúa",
    place: "Chipatá, Santander",
    mapsUrl: "https://maps.app.goo.gl/CtVhZnxQ4MNHuCxW6"
  },

  // ------------------------------------------------------------------
  // DRESS CODE
  // ------------------------------------------------------------------
  dressCode: {
    title: "Cocktail",
    men: "Traje de colores oscuros o claros, con telas respirables. Corbata opcional.",
    women: "Vestidos a media pierna, largos o pantalón formal de colores o estampados.",
    avoidColors: [
      { name: "Blanco", hex: "#FAF8F2" },
      { name: "Palo rosa", hex: "#D9BFB0" }
    ],
    avoidNote: "Por favor, absténganse de usar estos colores.",
    referenceLinks: {
      women: "https://pin.it/6fiCJb3Lm",
      men: "https://pin.it/5vFp074xb"
    }
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
      intro: "Si vienes de afuera, sugerimos los siguientes hospedajes:",
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
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbwBqZst11_OBBNSk_fOHGZcqosv61UCznWBrxt3N1Su1RlyK_a3VThQQxZhJg0pB4A_Fg/exec",

  // ------------------------------------------------------------------
  // INVITACIONES PERSONALIZADAS
  // Cada invitación es un link distinto: .../?inv=CODIGO
  // "maxGuests" es el máximo de personas que esa invitación puede
  // registrar en el RSVP (contando a quien llena el formulario).
  // "label" es el texto que se muestra para personalizar el saludo.
  //
  // Agrega, quita o edita las que necesites — el código (la parte
  // después de "inv=") puede ser cualquier palabra sin espacios ni
  // acentos, en minúsculas.
  // ------------------------------------------------------------------
  invitations: {
    "familia-1": { label: "Familia 1", maxGuests: 1 },
    "familia-2": { label: "Familia 2", maxGuests: 2 },
    "familia-3": { label: "Familia 3", maxGuests: 3 },
    "familia-4": { label: "Familia 4", maxGuests: 4 },
    "familia-5": { label: "Familia 5", maxGuests: 5 }
  },

  // Si alguien abre el sitio sin un código de invitación válido en la
  // URL, este es el máximo de personas que puede registrar (por
  // defecto 1: solo quien llena el formulario, sin acompañantes).
  defaultMaxGuests: 1,

  // ------------------------------------------------------------------
  // APARIENCIA — "panel de control" visual
  // Ajusta estos valores para cambiar colores, tamaño de las
  // ilustraciones o mostrar/ocultar secciones, SIN tocar CSS ni HTML.
  // ------------------------------------------------------------------
  theme: {
    // Colores del sitio. Usa códigos hexadecimales (#RRGGBB).
    colors: {
      cream: "#faf6ef",       // fondo principal
      creamDeep: "#f5e8e3",   // fondo de secciones alternas
      ink: "#332e2a",         // color principal de texto
      inkSoft: "#6b5d56",     // texto secundario / descripciones
      sage: "#7c8c68",        // verde salvia (etiquetas)
      sageDeep: "#566047",    // salvia oscuro
      rose: "#c2607a",        // rosa de acento (títulos pequeños, botón RSVP)
      mauve: "#8c5468",       // malva (firma, detalles)
      gold: "#b6903a",        // dorado (líneas divisorias)
      goldLight: "#e6cfa0"    // dorado claro
    },

    // Mostrar (true) u ocultar (false) secciones completas sin borrarlas.
    sections: {
      showWelcome: true,
      showDressCode: true,
      showAdditionalInfo: true
    }
  },

  // ------------------------------------------------------------------
  // FOTOS
  // "hero" es la foto grande de fondo en la portada. Si la dejas vacía
  // (""), la portada se queda con el fondo de color sólido, sin foto.
  // Sube tus fotos a una carpeta "assets/" junto a index.html y
  // escribe la ruta aquí, por ejemplo: "assets/portada.jpg"
  // ------------------------------------------------------------------
  photos: {
    hero: "foto-4.jpg"
  },

  // ------------------------------------------------------------------
  // MÚSICA — se reproduce cuando el invitado toca "Abrir invitación"
  // en la pantalla de entrada. "youtubeId" es la parte del link de
  // YouTube después de youtu.be/ o v= (aquí: LeLV0W-uFTQ).
  // ------------------------------------------------------------------
  music: {
    enabled: true,
    youtubeId: "LeLV0W-uFTQ"
  },

  // ------------------------------------------------------------------
  // GALERÍA / CARRETE DE FOTOS
  // Cada foto está en la raíz del repositorio, junto a index.html.
  // Puedes agregar "caption": "texto" a cualquier foto si quieres que
  // aparezca una leyenda debajo de ella.
  // ------------------------------------------------------------------
  gallery: {
    images: [
      { src: "foto-1.jpg", alt: "Pilar y Andrés en una cafetería" },
      { src: "foto-2.jpg", alt: "Pilar y Andrés en Madrid, frente a la Plaza de Toros de Las Ventas" },
      { src: "foto-3.jpg", alt: "Pilar y Andrés de noche frente a la Torre Eiffel" },
      { src: "foto-4.jpg", alt: "Pilar y Andrés en una fiesta" },
      { src: "foto-5.jpg", alt: "Pilar y Andrés en la playa, en la Riviera Maya" },
      { src: "foto-6.jpg", alt: "Pilar y Andrés el día de su graduación" },
      { src: "foto-7.jpg", alt: "Pilar y Andrés sentados en una plaza iluminada de noche" },
      { src: "foto-8.jpg", alt: "Pilar y Andrés frente a la Torre Eiffel" }
    ]
  }
};
