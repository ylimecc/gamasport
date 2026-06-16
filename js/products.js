/* Datos del negocio y catalogo de servicios */
(function () {
  "use strict";

  /* Configuración del negocio */
  // cambiar por el WhatsApp y telefono reales
  const CONFIG = {
    name: "GamaSport",
    slogan: "Tu pasión, nuestro campo",
    phoneDisplay: "+504 9876-5432",
    phone: "50498765432",
    whatsapp: "50498765432",
    email: "reservas@gamasport.hn",
    address: "Anillo Periférico, frente al Coliseum Nacional de Ingenieros",
    city: "Tegucigalpa, Francisco Morazán, Honduras",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Coliseum+Nacional+de+Ingenieros+Tegucigalpa",
    hours: "Lunes a Domingo, 3:00 PM – 9:00 PM",
    currency: "L",          // Lempira hondureño
    isvRate: 0.15,          // ISV Honduras 15%
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    tiktok: "https://tiktok.com/"
  };

  /* Categorías */
  const CATEGORIES = [
    { key: "canchas",     name: "Alquiler de Canchas" },
    { key: "torneos",     name: "Torneos y Eventos" },
    { key: "restaurante", name: "Restaurante" },
    { key: "extras",      name: "Membresías y Extras" }
  ];

  /* Servicios y productos */
  const PRODUCTS = [
    {
      id: "GS-101",
      slug: "alquiler-cancha-diurna",
      name: "Alquiler Cancha Fútbol 5 — Hora Diurna",
      cat: "canchas",
      price: 800, unit: "/ hora", tag: "Más reservado", popular: true,
      art: "cancha-diurna",
      short: "Una hora de juego en cancha de fútbol 5 con grama sintética profesional, horario de 3:00 a 6:00 PM.",
      long: "Reserva tu hora de juego en nuestra cancha de fútbol 5 con grama sintética de última generación. Ideal para partidos entre amigos, prácticas de equipo o picados de fin de semana. Incluye uso del parqueo privado y acceso al área de restaurante. Capacidad recomendada de 10 a 12 jugadores.",
      specs: ["Cancha de fútbol 5 con grama sintética", "Duración: 1 hora continua", "Horario diurno (3:00 – 6:00 PM)", "Parqueo privado incluido", "Acceso al área de restaurante", "Para 10–12 jugadores"]
    },
    {
      id: "GS-102",
      slug: "alquiler-cancha-nocturna",
      name: "Alquiler Cancha Fútbol 5 — Hora Nocturna",
      cat: "canchas",
      price: 1000, unit: "/ hora", tag: "Iluminación LED",
      art: "cancha-nocturna",
      short: "Una hora de juego bajo iluminación nocturna profesional, horario de 6:00 a 9:00 PM.",
      long: "Vive la experiencia del fútbol nocturno en GamaSport. Nuestra cancha cuenta con iluminación LED de alto rendimiento que garantiza visibilidad total para tus partidos de noche. El horario nocturno es el preferido por equipos y ligas amistosas. Incluye parqueo privado y acceso al restaurante.",
      specs: ["Cancha de fútbol 5 con grama sintética", "Iluminación LED nocturna", "Duración: 1 hora continua", "Horario nocturno (6:00 – 9:00 PM)", "Parqueo privado incluido", "Para 10–12 jugadores"]
    },
    {
      id: "GS-103",
      slug: "paquete-2-horas",
      name: "Paquete Picado 2 Horas + Hidratación",
      cat: "canchas",
      price: 1750, oldPrice: 2000, unit: "/ paquete", tag: "Ahorra L250",
      art: "paquete-2h",
      short: "Dos horas continuas de cancha más 12 bebidas hidratantes para todo el equipo.",
      long: "El paquete perfecto para el picado largo del fin de semana. Disfruta de dos horas continuas en cancha (diurno o nocturno) e incluye 12 bebidas hidratantes frías para mantener a tu equipo en juego. Reserva tu horario preferido y nosotros nos encargamos del resto.",
      specs: ["2 horas continuas de cancha", "Incluye 12 bebidas hidratantes", "Disponible diurno o nocturno", "Parqueo privado incluido", "Acceso al área de restaurante", "Ahorro de L250 vs. precio normal"]
    },
    {
      id: "GS-201",
      slug: "inscripcion-torneo-relampago",
      name: "Inscripción a Torneo Relámpago",
      cat: "torneos",
      price: 1500, unit: "/ equipo", tag: "Por equipo", popular: true,
      art: "torneo",
      short: "Inscribe a tu equipo en el torneo relámpago de un día: mínimo 3 partidos garantizados.",
      long: "Compite en nuestro tradicional torneo relámpago de fútbol 5. La inscripción es por equipo (hasta 10 jugadores) e incluye un mínimo de 3 partidos garantizados, arbitraje oficial, hidratación para la jornada y premiación para el equipo campeón. ¡Demuestra de qué está hecho tu equipo!",
      specs: ["Inscripción por equipo (hasta 10 jugadores)", "Mínimo 3 partidos garantizados", "Arbitraje oficial incluido", "Hidratación durante la jornada", "Premiación para el campeón", "Camiseta conmemorativa del torneo"]
    },
    {
      id: "GS-202",
      slug: "evento-deportivo-privado",
      name: "Evento Deportivo Privado (3 horas)",
      cat: "torneos",
      price: 3500, unit: "/ evento", tag: "Cancha exclusiva",
      art: "evento",
      short: "Tres horas de cancha exclusiva para tu empresa o grupo, con organización y logística incluida.",
      long: "Organiza el evento deportivo de tu empresa, colonia o grupo de amigos con uso exclusivo de la cancha durante 3 horas. Incluye coordinación logística, marcador, sonido ambiental y opción de catering del restaurante. Perfecto para integraciones empresariales y celebraciones deportivas.",
      specs: ["Uso exclusivo de cancha por 3 horas", "Coordinación logística incluida", "Marcador y sonido ambiental", "Opción de catering (cotización aparte)", "Parqueo privado para invitados", "Diurno o nocturno"]
    },
    {
      id: "GS-203",
      slug: "cumpleanos-deportivo",
      name: "Cumpleaños Deportivo (Cancha 2h + Área)",
      cat: "torneos",
      price: 2800, unit: "/ paquete", tag: "Celebración",
      art: "cumpleanos",
      short: "Celebra tu cumpleaños jugando: 2 horas de cancha más área reservada en el restaurante.",
      long: "El plan ideal para festejar a lo grande. Incluye 2 horas de cancha de fútbol 5 y un área reservada en nuestro restaurante para la celebración. Agrega decoración deportiva básica y la posibilidad de personalizar tu combo de comida. Una experiencia distinta para niños, jóvenes y adultos.",
      specs: ["2 horas de cancha de fútbol 5", "Área reservada en el restaurante", "Decoración deportiva básica", "Combos de comida personalizables", "Parqueo privado para invitados", "Hasta 20 personas"]
    },
    {
      id: "GS-301",
      slug: "combo-deportivo",
      name: "Combo Deportivo (Hamburguesa + Papas + Bebida)",
      cat: "restaurante",
      price: 160, unit: "/ combo", tag: "Del restaurante", popular: true,
      art: "combo",
      short: "Hamburguesa artesanal, papas fritas y bebida fría. Energía para después del partido.",
      long: "Recupera energías con nuestro Combo Deportivo: una jugosa hamburguesa artesanal acompañada de papas fritas crujientes y una bebida fría a elección. Disponible para consumo en el área de restaurante o para llevar. Pídelo anticipado con tu reserva y tenlo listo al terminar tu partido.",
      specs: ["Hamburguesa artesanal de res", "Porción de papas fritas", "Bebida fría a elección", "Disponible para llevar", "Se puede pedir anticipado con la reserva"]
    },
    {
      id: "GS-302",
      slug: "boquitas-para-equipo",
      name: "Boquitas para Equipo (Nachos + Alitas)",
      cat: "restaurante",
      price: 380, unit: "/ porción", tag: "Para compartir",
      art: "boquitas",
      short: "Tabla de nachos con queso y alitas BBQ para compartir entre 6 personas.",
      long: "La picada perfecta para compartir tras el juego. Incluye una generosa tabla de nachos con queso fundido, pico de gallo y guacamole, más 12 alitas en salsa BBQ o picante. Pensada para 6 personas. Acompáñala con bebidas frías del restaurante.",
      specs: ["Nachos con queso fundido", "Pico de gallo y guacamole", "12 alitas (BBQ o picante)", "Ideal para 6 personas", "Disponible en el área de restaurante"]
    },
    {
      id: "GS-303",
      slug: "hidratacion-deportiva",
      name: "Hidratación Deportiva (6 Bebidas)",
      cat: "restaurante",
      price: 150, unit: "/ paquete", tag: "6 unidades",
      art: "hidratacion",
      short: "Paquete de 6 bebidas hidratantes frías, listas para tu equipo durante el partido.",
      long: "Mantén a tu equipo hidratado y rindiendo al máximo. Este paquete incluye 6 bebidas hidratantes frías (mezcla de agua, bebidas isotónicas y gaseosas a elección). Agrégalo a tu reserva y recógelas frías al llegar a la cancha.",
      specs: ["6 bebidas frías a elección", "Mezcla de agua, isotónicas y gaseosas", "Entregadas frías", "Se agrega a la reserva de cancha"]
    },
    {
      id: "GS-401",
      slug: "membresia-gamapro",
      name: "Membresía Mensual GamaPro",
      cat: "extras",
      price: 2900, unit: "/ mes", tag: "Mejor valor",
      art: "membresia",
      short: "4 horas de cancha al mes, 10% de descuento permanente y reserva prioritaria.",
      long: "Para los que no fallan ni un fin de semana. La Membresía GamaPro te da 4 horas de cancha al mes (diurno o nocturno), un 10% de descuento permanente en restaurante y servicios, reserva prioritaria de horarios y acceso anticipado a torneos. La forma más inteligente de jugar todo el mes.",
      specs: ["4 horas de cancha al mes", "10% de descuento permanente", "Reserva prioritaria de horarios", "Acceso anticipado a torneos", "Carné digital de miembro", "Renovación mensual flexible"]
    },
    {
      id: "GS-402",
      slug: "alquiler-balon-petos",
      name: "Alquiler de Balón + Set de Petos",
      cat: "extras",
      price: 120, unit: "/ partido", tag: "Complemento",
      art: "balon-petos",
      short: "Balón oficial de fútbol 5 más set de 10 petos para diferenciar a los equipos.",
      long: "¿Llegaste sin equipo? Nosotros te lo prestamos. Este complemento incluye un balón oficial de fútbol 5 en buen estado y un set de 10 petos de colores para diferenciar a los dos equipos. Se agrega fácilmente a tu reserva de cancha.",
      specs: ["1 balón oficial de fútbol 5", "Set de 10 petos de colores", "Por partido reservado", "Se agrega a la reserva de cancha"]
    }
  ];

  function catName(key) {
    const c = CATEGORIES.find(x => x.key === key);
    return c ? c.name : key;
  }
  function getProduct(id) { return PRODUCTS.find(p => p.id === id) || null; }

  window.GS_DATA = { CONFIG, CATEGORIES, PRODUCTS, catName, getProduct };
})();
