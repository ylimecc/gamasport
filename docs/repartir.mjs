/* Parte la documentación en cinco cuadernillos, uno por expositor.
   Cada uno lleva sus apartados completos, su tramo del guion, las preguntas
   que le pueden caer y el glosario. */
import { readFile, writeFile, mkdir } from 'fs/promises';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/ylime/AppData/Roaming/npm/node_modules/playwright');

const BASE = 'C:/Users/ylime/Documents/gamasport/docs';
const SALIDA = BASE + '/exposicion';
const fuente = await readFile(BASE + '/documentacion.html', 'utf8');

/* el estilo del documento original, para que los cuadernillos se vean igual */
const estilo = fuente.match(/<style>[\s\S]*?<\/style>/)[0];

/* los apartados vienen separados por marcadores de comentario */
const trozos = {};
const partes = fuente.split(/<!-- ={5,} (\d+|PORTADA|ÍNDICE) ={5,} -->/);
for (let i = 1; i < partes.length; i += 2) trozos[partes[i]] = partes[i + 1];

const GLOSARIO = '17';   // va al final de los cinco cuadernillos

const TOTAL = 5;

const REPARTO = [
  {
    n: 1,
    quien: 'El negocio y cómo está construido',
    resumen: 'Abre la exposición: por qué existe la plataforma, con qué se hizo y cómo encajan las piezas.',
    minutos: '0:00 a 2:30',
    apartados: ['1', '2', '3', '4'],
    enPantalla: [
      'La portada del sitio, para hablar del negocio.',
      'La estructura de carpetas de tu cuadernillo.',
      'El esquema de arquitectura, para explicar dónde vive cada cosa.'
    ],
    preguntas: [
      ['¿Por qué no basta con WhatsApp para reservar?',
       'Porque el cliente no ve la disponibilidad sin preguntar, dos personas pueden pedir la misma hora, y el control queda en la memoria de quien contesta. Los tres problemas están en el primer apartado de tu cuadernillo.'],
      ['¿Por qué no usaron un framework como React o Bootstrap?',
       'Para catorce páginas no aporta nada y sí agrega complejidad: habría que compilar, actualizar dependencias y cargar código extra. El sitio no descarga ni una librería externa, y por eso carga rápido aunque el internet esté lento.'],
      ['¿Dónde está el servidor?',
       'No hay servidor propio. GitHub Pages solo entrega archivos y toda la lógica corre en el navegador; lo que debe quedar guardado viaja a Firebase. Por eso la seguridad vive en las reglas de Firebase, que explica el tercer integrante.'],
      ['¿Por qué eligieron Firebase?',
       'Porque hacía falta guardar reservas y verificar contraseñas sin montar ni pagar un servidor propio. Firebase da base de datos y autenticación con reglas de seguridad, y el plan gratuito alcanza de sobra para el proyecto.']
    ]
  },
  {
    n: 2,
    quien: 'Las páginas, el catálogo y la reserva',
    resumen: 'Qué contiene cada página, cómo se calcula el precio con impuesto y cupones, y el recorrido completo de una reserva.',
    minutos: '2:30 a 4:30, con la demostración en vivo',
    apartados: ['5', '6', '7'],
    enPantalla: [
      'El catálogo con sus filtros y el buscador.',
      'El carrito con el cupón aplicado y el desglose del ISV.',
      'Una reserva completa hasta el comprobante.'
    ],
    preguntas: [
      ['¿Cómo se calcula el total?',
       'Subtotal, menos el descuento del cupón, y sobre ese resultado el ISV del 15 %. El descuento va antes del impuesto porque el impuesto grava lo que el cliente realmente paga por el servicio, no el precio de lista.'],
      ['¿Qué pasa si un servicio se queda sin cupos?',
       'El botón se deshabilita, la ficha muestra "agotado" y el carrito no deja agregar más de los que hay. El personal cambia esos cupos desde el panel.'],
      ['¿El carrito se pierde si cierro la página?',
       'No. Queda guardado en el navegador, así que se puede volver más tarde y seguir donde se quedó.'],
      ['¿Se cobra dinero de verdad?',
       'No. La pasarela está en modo de prueba y así se indica en pantalla. El último integrante explica qué haría falta para cobrar realmente.']
    ]
  },
  {
    n: 3,
    quien: 'Reservas sin conflicto, seguridad y panel',
    resumen: 'Cómo se reparten las canchas sin choques, quién puede ver y hacer qué, y cómo trabaja el personal.',
    minutos: '4:30 a 6:30',
    apartados: ['8', '9', '10'],
    enPantalla: [
      'El esquema de las tres personas pidiendo la misma hora.',
      'Mi cuenta con la sesión de un cliente, mostrando que solo ve sus reservas.',
      'El panel: cambiar el estado de una reserva y bloquear un horario.'
    ],
    preguntas: [
      ['¿Cómo evitan que dos personas reserven la misma hora?',
       'No preguntamos si está libre para después guardar, porque entre esas dos acciones se puede colar alguien. Intentamos crear un documento cuyo nombre ya identifica fecha, hora y cancha, y la base de datos rechaza al segundo que lo intente.'],
      ['¿Y si se cae el internet mientras alguien reserva?',
       'La reserva no se hace y el sitio lo dice, en vez de entregar un comprobante que nadie tiene registrado. El carrito no se pierde.'],
      ['La clave de Firebase se ve en el código, ¿eso no es un riesgo?',
       'Se ve a propósito: así funciona toda aplicación web, porque el navegador necesita esa clave para hablar con el servicio. La seguridad real está en las reglas de Firestore, que se aplican del lado de Google y deciden quién puede leer y escribir cada cosa.'],
      ['¿Dónde se guardan las contraseñas?',
       'En Firebase Authentication, transformadas de forma irreversible. El sitio nunca las ve ni las guarda. Recuperar la contraseña manda un correo con un enlace, así que nadie puede cambiar la clave de otra persona sabiendo su correo.'],
      ['¿Un cliente podría ver las reservas de otro?',
       'No. Se probó pidiendo esos datos directamente a la base de datos sin sesión y el servidor los rechazó. La restricción no está en el navegador, está en Firebase.']
    ]
  },
  {
    n: 4,
    quien: 'El asistente y el marco legal',
    resumen: 'Cómo responde las dudas frecuentes el sitio, y qué exige la ley hondureña a una tienda en línea.',
    minutos: '6:30 a 8:00',
    apartados: ['11', '12'],
    enPantalla: [
      'El asistente respondiendo una pregunta escrita a mano.',
      'Los términos y condiciones, en la parte de cancelaciones.',
      'El desglose del ISV en el carrito.'
    ],
    preguntas: [
      ['¿El asistente usa inteligencia artificial?',
       'No. Son catorce preguntas con sus respuestas escritas a mano. Lo que escribe el visitante se compara con palabras clave y gana la respuesta con más coincidencias; si ninguna coincide, se ofrece WhatsApp.'],
      ['¿El sitio cumple con la ley hondureña de comercio electrónico?',
       'En lo que le corresponde a la plataforma, sí: identifica al comercio, deja constancia de la operación con un número propio, pide consentimiento expreso y desglosa el ISV. Lo que no cumple es la factura fiscal, porque exige la clave de autorización de la SAR.'],
      ['¿Qué pasa con los datos personales de los clientes?',
       'Se pide solo lo necesario (nombre, correo y teléfono), se explica para qué en la política de privacidad, viaja cifrado por HTTPS y las reglas impiden que un cliente vea los datos de otro. Honduras no tiene todavía una ley general de protección de datos, así que se aplicaron los principios internacionales apoyados en el habeas data constitucional.'],
      ['¿Por qué el descuento se aplica antes del impuesto?',
       'Porque el impuesto grava el precio efectivamente cobrado. Si se aplicara después, el cliente pagaría ISV sobre un monto que nunca se le cobró.']
    ]
  },
  {
    n: 5,
    quien: 'Publicación, pruebas y cierre',
    resumen: 'Cómo llega el sitio a internet, cómo se comprueba que funciona y qué quedó fuera del proyecto.',
    minutos: '8:00 a 9:30',
    apartados: ['13', '14', '15', '16'],
    enPantalla: [
      'La dirección del sitio en el navegador, mostrando el candado de HTTPS.',
      'Cómo se ve el enlace al compartirlo por WhatsApp.',
      'Las pruebas corriendo en la terminal, si hay computadora disponible.'
    ],
    preguntas: [
      ['¿Cómo saben que el sitio funciona bien?',
       'Con veintiuna comprobaciones automáticas que abren el sitio en un navegador real y revisan las cuentas del carrito, la disponibilidad, la reserva, el panel y la interfaz en tres tamaños de pantalla. Se corren con un comando y no tocan la base de datos real.'],
      ['¿Por qué no se cobra dinero de verdad?',
       'La pasarela está en modo de prueba y se avisa en pantalla. Cobrar exige un contrato con el banco o el procesador y un servidor propio que reciba las notificaciones del pago, que excede el alcance del proyecto.'],
      ['¿Cuánto cuesta mantener el sitio?',
       'Nada por ahora. GitHub Pages es gratuito y el plan gratuito de Firebase cubre de sobra el volumen del proyecto. Solo habría costo al crecer mucho el número de reservas.'],
      ['¿Qué pasa si alguien entra sin internet?',
       'El sitio guarda una página de respaldo con la marca y los enlaces para volver, en vez del error del navegador. El catálogo y el carrito siguen disponibles porque están guardados en el propio navegador.']
    ]
  }
];

const portada = (r) => `
<section class="portada">
  <div class="marca">
    <svg width="52" height="52" viewBox="0 0 48 48">
      <defs><linearGradient id="lg${r.n}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#22c55e"/><stop offset="1" stop-color="#0f7a37"/></linearGradient></defs>
      <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#lg${r.n})"/>
      <circle cx="24" cy="24" r="13" fill="#0a1c24"/>
      <path d="M24 14.5 30 19l-2.3 7h-7.4L18 19z" fill="#fff"/>
    </svg>
    <div class="marca-txt">Gama<span>Sport</span></div>
  </div>
  <p style="color:#a3e635;font-size:12pt;font-weight:600;letter-spacing:1pt;margin-bottom:4mm">
    PARTE ${r.n} DE ${TOTAL}</p>
  <h1>${r.quien}</h1>
  <p class="sub">${r.resumen}</p>
  <div class="pie">
    <div><b>Te toca hablar</b><br>${r.minutos}</div>
    <div style="text-align:right"><b>Proyecto académico</b><br>DIA-309 · UNAH · II PAC 2026</div>
  </div>
</section>

<h2>Tu parte en una página</h2>
<div class="caja">
  <h4>Qué mostrar en pantalla mientras hablas</h4>
  <ul>${r.enPantalla.map(x => `<li>${x}</li>`).join('')}</ul>
</div>
<div class="caja aviso">
  <h4>Preguntas que te pueden hacer</h4>
  ${r.preguntas.map(q => `<p><strong>${q[0]}</strong><br>${q[1]}</p>`).join('')}
</div>
<p style="color:#55656c;font-size:9.5pt">
  Lo que sigue son los apartados de la documentación que te corresponden, con el glosario al final.
  El documento completo está en <code>docs/GamaSport-Documentacion.pdf</code>.
</p>
`;

await mkdir(SALIDA, { recursive: true });
const navegador = await chromium.launch();

for (const r of REPARTO) {
  /* Los apartados conservan el número que tenían en el documento completo, así que
     dentro del cuadernillo saldrían salteados (1, 5, 9...). Se renumeran de corrido
     para que cada cuadernillo se lea como un documento propio. */
  let i = 0;
  const cuerpo = [...r.apartados, GLOSARIO]
    .map(a => trozos[a])
    .join('\n')
    .replace(/(<h2[^>]*>)\s*\d+\.\s*/g, (_, abre) => `${abre}${++i}. `);

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<title>GamaSport · Parte ${r.n}: ${r.quien}</title>${estilo}</head><body>
${portada(r)}
<div class="nueva-pagina"></div>
${cuerpo}
</body></html>`;

  const nombreHtml = `${SALIDA}/parte-${r.n}.html`;
  await writeFile(nombreHtml, html, 'utf8');

  const p = await navegador.newPage();
  await p.goto('file:///' + nombreHtml.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  // sin tildes ni eñes en el nombre del archivo, para que el enlace funcione en cualquier parte
  const limpio = r.quien.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z ]/g, '').trim().replace(/ +/g, '-');
  const pdf = `${SALIDA}/Parte-${r.n}-${limpio}.pdf`;
  await p.pdf({
    path: pdf, format: 'A4', printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%;font-size:8pt;color:#8a979d;font-family:Segoe UI,Arial,sans-serif;padding:0 16mm;display:flex;justify-content:space-between;"><span>GamaSport · Parte ${r.n} de ${TOTAL}: ${r.quien}</span><span class="pageNumber"></span></div>`
  });
  await p.close();
  console.log('creado:', pdf.split('/').pop());
}

await navegador.close();
