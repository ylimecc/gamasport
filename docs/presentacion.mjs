import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pptxgen = require('pptxgenjs');

const IMG = 'C:/Users/ylime/Documents/gamasport/img/';
const SALIDA = process.argv[2];

/* paleta de la marca */
const NAVY = '0A1C24', NAVY2 = '14323D', VERDE = '16A34A', VERDE_OSC = '0F7A37';
const LIMA = 'A3E635', CLARO = 'F4F8F5', TEXTO = '1F2B30', SUAVE = '55656C', BLANCO = 'FFFFFF';
const CUERPO = 'Calibri';

const p = new pptxgen();
p.layout = 'LAYOUT_WIDE';           // 13.3 x 7.5 pulgadas
p.author = 'Equipo GamaSport';
p.title = 'GamaSport · Defensa del proyecto';

/* ---------- ayudantes ---------- */
const nuevaOscura = () => { const s = p.addSlide(); s.background = { color: NAVY }; return s; };
const nuevaClara  = () => { const s = p.addSlide(); s.background = { color: BLANCO }; return s; };

function titulo(s, texto, opciones = {}) {
  s.addText(texto, {
    x: 0.65, y: opciones.y ?? 0.45, w: 12, h: 0.9,
    fontSize: opciones.fontSize ?? 34, bold: true, fontFace: CUERPO,
    color: opciones.color ?? NAVY, margin: 0
  });
}
function bajada(s, texto, opciones = {}) {
  s.addText(texto, {
    x: 0.65, y: opciones.y ?? 1.3, w: opciones.w ?? 11.5, h: 0.5,
    fontSize: 15, fontFace: CUERPO, color: opciones.color ?? SUAVE, margin: 0
  });
}
// número dentro de un círculo verde: el motivo que se repite en todo el mazo
function circulo(s, x, y, texto, opciones = {}) {
  s.addShape(p.ShapeType.ellipse, {
    x, y, w: opciones.d ?? 0.55, h: opciones.d ?? 0.55,
    fill: { color: opciones.fondo ?? VERDE }
  });
  s.addText(texto, {
    x, y, w: opciones.d ?? 0.55, h: opciones.d ?? 0.55,
    fontSize: opciones.fontSize ?? 16, bold: true, fontFace: CUERPO,
    color: opciones.colorTexto ?? BLANCO, align: 'center', valign: 'middle', margin: 0
  });
}
function tarjeta(s, x, y, w, h, opciones = {}) {
  s.addShape(p.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.12,
    fill: { color: opciones.fondo ?? CLARO },
    line: { color: opciones.borde ?? 'E2EAE5', width: 1 }
  });
}

/* =========================================================
   1 · PORTADA
   ========================================================= */
{
  const s = nuevaOscura();
  s.addImage({ path: IMG + 'cancha-nocturna.jpg', x: 7.3, y: 0, w: 6, h: 7.5, transparency: 45 });

  s.addShape(p.ShapeType.roundRect, { x: 0.75, y: 0.75, w: 0.72, h: 0.72, rectRadius: 0.2, fill: { color: VERDE } });
  s.addShape(p.ShapeType.ellipse, { x: 0.93, y: 0.93, w: 0.36, h: 0.36, fill: { color: NAVY } });
  s.addText([{ text: 'Gama', options: { color: BLANCO } }, { text: 'Sport', options: { color: LIMA } }], {
    x: 1.65, y: 0.78, w: 4, h: 0.66, fontSize: 26, bold: true, fontFace: CUERPO, valign: 'middle', margin: 0
  });

  s.addText('Reservas y tienda\nen línea', {
    x: 0.75, y: 2.5, w: 6.6, h: 2, fontSize: 46, bold: true, fontFace: CUERPO,
    color: BLANCO, lineSpacing: 48, margin: 0
  });
  s.addText('Cómo construimos la plataforma del centro deportivo, cómo funciona por dentro y qué la hace confiable.', {
    x: 0.75, y: 4.5, w: 6.3, h: 1, fontSize: 15, fontFace: CUERPO, color: 'B9CCC3', margin: 0
  });
  s.addText('DIA-309 Negocios Electrónicos  ·  UNAH  ·  II PAC 2026', {
    x: 0.75, y: 6.4, w: 6.5, h: 0.4, fontSize: 12, fontFace: CUERPO, color: '8FA69C', margin: 0
  });
  s.addNotes('Presentación del equipo. Decir el nombre del negocio, que es un centro de fútbol 5 en Tegucigalpa con dos canchas, y que lo que van a ver es la plataforma completa: catálogo, reservas, cuentas y panel del personal. Aclarar desde ya que el sitio está publicado y funcionando, no es una maqueta.');
}

/* =========================================================
   2 · EL PROBLEMA
   ========================================================= */
{
  const s = nuevaClara();
  titulo(s, 'Reservar por teléfono tiene tres agujeros');
  bajada(s, 'Así se manejaba antes: una llamada o un mensaje de WhatsApp por cada reserva.');

  const problemas = [
    ['1', 'El cliente no sabe qué hay libre', 'Tiene que preguntar y esperar respuesta para enterarse de si su horario está disponible.'],
    ['2', 'Dos personas piden la misma hora', 'Si dos escriben casi al mismo tiempo, alguien se queda sin cancha después de creer que la tenía.'],
    ['3', 'El control vive en una libreta', 'Las reservas dependen de quien contestó el teléfono. Si no está, nadie sabe qué hay agendado.']
  ];
  problemas.forEach((pr, i) => {
    const y = 2.05 + i * 1.5;
    circulo(s, 0.7, y, pr[0]);
    s.addText(pr[1], { x: 1.5, y: y - 0.05, w: 5.6, h: 0.4, fontSize: 17, bold: true, fontFace: CUERPO, color: NAVY, margin: 0 });
    s.addText(pr[2], { x: 1.5, y: y + 0.38, w: 5.7, h: 0.8, fontSize: 13, fontFace: CUERPO, color: SUAVE, margin: 0 });
  });

  s.addImage({ path: IMG + 'cancha-diurna.jpg', x: 7.9, y: 1.95, w: 4.75, h: 3.6, rounding: true });
  s.addNotes('Explicar el problema real del negocio antes de hablar de tecnología. Los tres puntos son la razón de existir de la plataforma. El segundo, dos personas pidiendo la misma hora, es el que resolvemos con la parte más interesante del sistema, y lo veremos más adelante.');
}

/* =========================================================
   3 · LA SOLUCIÓN
   ========================================================= */
{
  const s = nuevaClara();
  titulo(s, 'La plataforma responde con tres piezas');
  bajada(s, 'Cada una resuelve uno de los agujeros anteriores.');

  const piezas = [
    ['Catálogo', 'Once servicios con su precio, sus cupos y su disponibilidad, visibles sin preguntar a nadie.'],
    ['Reserva en línea', 'El cliente elige fecha y hora entre las que de verdad están libres, y recibe su comprobante.'],
    ['Panel del personal', 'Todas las reservas en un solo lugar, con estados, precios, cupos y bloqueo de horarios.']
  ];
  piezas.forEach((pz, i) => {
    const x = 0.65 + i * 4.15;
    tarjeta(s, x, 2.1, 3.85, 3.3);
    circulo(s, x + 0.35, 2.45, String(i + 1));
    s.addText(pz[0], { x: x + 0.35, y: 3.2, w: 3.15, h: 0.45, fontSize: 20, bold: true, fontFace: CUERPO, color: NAVY, margin: 0 });
    s.addText(pz[1], { x: x + 0.35, y: 3.7, w: 3.15, h: 1.4, fontSize: 13, fontFace: CUERPO, color: SUAVE, margin: 0 });
  });
  s.addNotes('Presentar la estructura de la exposición: primero el catálogo y la compra, después la reserva y el panel. Quien hable puede anticipar que la demostración en vivo viene en la siguiente parte.');
}

/* =========================================================
   4 · QUÉ SE PUEDE HACER
   ========================================================= */
{
  const s = nuevaClara();
  titulo(s, 'Qué se puede hacer en el sitio');

  const fns = [
    ['Reservar cancha', 'Diurna o nocturna, por hora, con la disponibilidad al día.'],
    ['Torneos y eventos', 'Inscripción de equipos, eventos privados y cumpleaños.'],
    ['Pedir del restaurante', 'Combos, boquitas y bebidas listas al terminar el partido.'],
    ['Membresías y extras', 'Plan mensual para equipos fijos, alquiler de balón y petos.'],
    ['Usar cupones', 'Tres códigos de descuento que se aplican en el carrito.'],
    ['Ver mis reservas', 'Cada cliente entra con su cuenta y consulta su historial.']
  ];
  fns.forEach((f, i) => {
    const x = 0.65 + (i % 3) * 4.15;
    const y = 1.75 + Math.floor(i / 3) * 2.55;
    tarjeta(s, x, y, 3.85, 2.15);
    circulo(s, x + 0.32, y + 0.3, '', { d: 0.4, fondo: LIMA });
    s.addText(f[0], { x: x + 0.32, y: y + 0.85, w: 3.2, h: 0.4, fontSize: 17, bold: true, fontFace: CUERPO, color: NAVY, margin: 0 });
    s.addText(f[1], { x: x + 0.32, y: y + 1.28, w: 3.25, h: 0.7, fontSize: 12.5, fontFace: CUERPO, color: SUAVE, margin: 0 });
  });
  s.addNotes('Repaso rápido, sin detenerse: son las funciones que el visitante puede usar. Si el tiempo aprieta, esta lámina se puede resumir en una frase y pasar directo a la demostración.');
}

/* =========================================================
   5 · HERRAMIENTAS
   ========================================================= */
{
  const s = nuevaClara();
  titulo(s, 'Con qué está construido y por qué');

  const herr = [
    ['HTML, CSS y JavaScript', 'Sin frameworks ni compilación. Menos piezas que puedan fallar y código que cualquiera del equipo puede leer.'],
    ['Firebase Authentication', 'Google guarda y verifica las contraseñas. Escribir eso a mano es donde más fallan los proyectos.'],
    ['Firebase Firestore', 'Base de datos en la nube con reglas de seguridad propias. Evita tener que programar y pagar un servidor.'],
    ['GitHub y GitHub Pages', 'Historial de cambios y publicación automática con HTTPS incluido, sin costo.']
  ];
  herr.forEach((h, i) => {
    const y = 1.75 + Math.floor(i / 2) * 2.5;
    const x = 0.65 + (i % 2) * 6.2;
    tarjeta(s, x, y, 5.9, 2.1);
    s.addText(h[0], { x: x + 0.4, y: y + 0.32, w: 5.1, h: 0.4, fontSize: 18, bold: true, fontFace: CUERPO, color: VERDE_OSC, margin: 0 });
    s.addText(h[1], { x: x + 0.4, y: y + 0.85, w: 5.2, h: 1, fontSize: 13, fontFace: CUERPO, color: SUAVE, margin: 0 });
  });

  s.addText('El sitio no carga ni una sola librería externa: ni jQuery, ni Bootstrap, ni fuentes de Google. Todo sale del propio sitio, así que carga rápido aunque el internet esté lento.', {
    x: 0.65, y: 6.5, w: 12, h: 0.6, fontSize: 13.5, italic: true, fontFace: CUERPO, color: NAVY, margin: 0
  });
  s.addNotes('Justificar las decisiones, no solo nombrarlas. La pregunta típica del docente es por qué no usaron un framework: la respuesta es que para catorce páginas no aporta nada y sí agrega complejidad. La segunda pregunta típica es por qué Firebase: porque necesitábamos guardar datos y validar contraseñas sin montar un servidor propio.');
}

/* =========================================================
   6 · ARQUITECTURA
   ========================================================= */
{
  const s = nuevaClara();
  titulo(s, 'Qué pasa cuando alguien entra al sitio');
  bajada(s, 'El sitio es estático: toda la lógica corre en el navegador del visitante y lo permanente viaja a la nube.');

  tarjeta(s, 0.65, 2.15, 3.7, 3.5, { fondo: CLARO });
  s.addText('Navegador del cliente', { x: 0.95, y: 2.4, w: 3.1, h: 0.4, fontSize: 15, bold: true, fontFace: CUERPO, color: NAVY, margin: 0 });
  s.addText([
    { text: 'Páginas, estilos y código', options: { bullet: true, breakLine: true } },
    { text: 'Carrito y catálogo guardados', options: { bullet: true, breakLine: true } },
    { text: 'Dibuja sin esperar a la nube', options: { bullet: true } }
  ], { x: 0.95, y: 2.95, w: 3.2, h: 2, fontSize: 12.5, fontFace: CUERPO, color: SUAVE, paraSpaceAfter: 8, margin: 0 });

  s.addShape(p.ShapeType.rightArrow, { x: 4.6, y: 3.4, w: 0.85, h: 0.4, fill: { color: VERDE } });
  s.addShape(p.ShapeType.leftArrow, { x: 4.6, y: 4.1, w: 0.85, h: 0.4, fill: { color: 'C3D5CB' } });

  tarjeta(s, 5.7, 2.15, 3.5, 3.5, { fondo: NAVY, borde: NAVY });
  s.addText('Firebase', { x: 6, y: 2.4, w: 3, h: 0.4, fontSize: 15, bold: true, fontFace: CUERPO, color: LIMA, margin: 0 });
  s.addText([
    { text: 'Guarda y verifica contraseñas', options: { bullet: true, breakLine: true } },
    { text: 'Reservas, perfiles y horarios', options: { bullet: true, breakLine: true } },
    { text: 'Las reglas deciden quién ve qué', options: { bullet: true } }
  ], { x: 6, y: 2.95, w: 3, h: 2, fontSize: 12.5, fontFace: CUERPO, color: 'CFE0D8', paraSpaceAfter: 8, margin: 0 });

  tarjeta(s, 9.5, 2.15, 3.15, 3.5);
  s.addText('GitHub Pages', { x: 9.8, y: 2.4, w: 2.6, h: 0.4, fontSize: 15, bold: true, fontFace: CUERPO, color: NAVY, margin: 0 });
  s.addText([
    { text: 'Entrega los archivos', options: { bullet: true, breakLine: true } },
    { text: 'HTTPS incluido', options: { bullet: true, breakLine: true } },
    { text: 'Publica solo al subir cambios', options: { bullet: true } }
  ], { x: 9.8, y: 2.95, w: 2.65, h: 2, fontSize: 12.5, fontFace: CUERPO, color: SUAVE, paraSpaceAfter: 8, margin: 0 });

  s.addText('Lo único que exige conexión de verdad es confirmar una reserva, porque es la nube la que decide quién se queda con la hora.', {
    x: 0.65, y: 6.15, w: 12, h: 0.6, fontSize: 13.5, italic: true, fontFace: CUERPO, color: NAVY, margin: 0
  });
  s.addNotes('Explicar que no hay un servidor propio ejecutando código: GitHub Pages solo entrega archivos. Eso abarata y simplifica, pero obliga a que la seguridad viva en las reglas de Firebase, que es lo que se explica más adelante.');
}

/* =========================================================
   7 · RECORRIDO DE COMPRA
   ========================================================= */
{
  const s = nuevaClara();
  titulo(s, 'El recorrido del cliente, de principio a fin');
  bajada(s, 'Este es el momento de mostrarlo en vivo en el sitio.');

  const pasos = [
    ['1', 'Elegir servicio', 'Catálogo con filtros y buscador.'],
    ['2', 'Agregar al carrito', 'Queda guardado aunque cierre la página.'],
    ['3', 'Aplicar cupón', 'Ve el descuento y el impuesto al instante.'],
    ['4', 'Fecha y hora', 'Las horas ocupadas salen deshabilitadas.'],
    ['5', 'Sus datos y pago', 'Todo se valida antes de continuar.'],
    ['6', 'Confirmar', 'Se aparta la cancha y se guarda el pedido.'],
    ['7', 'Comprobante', 'Número propio, por WhatsApp o impreso.']
  ];
  pasos.forEach((ps, i) => {
    const col = i % 4, fila = Math.floor(i / 4);
    const x = 0.65 + col * 3.1;
    const y = 2.1 + fila * 2.35;
    circulo(s, x, y, ps[0], { d: 0.5 });
    s.addText(ps[1], { x: x, y: y + 0.65, w: 2.8, h: 0.4, fontSize: 15, bold: true, fontFace: CUERPO, color: NAVY, margin: 0 });
    s.addText(ps[2], { x: x, y: y + 1.05, w: 2.85, h: 0.8, fontSize: 12, fontFace: CUERPO, color: SUAVE, margin: 0 });
  });
  s.addNotes('Aquí va la demostración en vivo: entrar al catálogo, abrir una cancha, agregarla, aplicar el cupón GAMA10 y mostrar cómo cambia el total, elegir fecha y hora, y llegar hasta el comprobante. Mientras se hace, ir nombrando los pasos de la lámina.');
}

/* =========================================================
   8 · EL PRECIO
   ========================================================= */
{
  const s = nuevaClara();
  titulo(s, 'Cómo se calcula lo que paga el cliente');
  bajada(s, 'Ejemplo real: dos horas de cancha diurna con el cupón GAMA10.');

  const filas = [
    ['Subtotal', '2 horas x L 800.00', 'L 1,600.00', false],
    ['Descuento GAMA10', '10 % sobre el subtotal', '- L 160.00', false],
    ['Base gravable', 'sobre esto se calcula el impuesto', 'L 1,440.00', false],
    ['ISV 15 %', 'impuesto sobre ventas', 'L 216.00', false],
    ['Total a pagar', '', 'L 1,656.00', true]
  ];
  filas.forEach((f, i) => {
    const y = 2.1 + i * 0.78;
    if (f[3]) tarjeta(s, 0.65, y - 0.08, 8.4, 0.72, { fondo: NAVY, borde: NAVY });
    s.addText(f[0], { x: 0.95, y, w: 3.4, h: 0.5, fontSize: f[3] ? 17 : 15, bold: f[3], fontFace: CUERPO, color: f[3] ? BLANCO : NAVY, valign: 'middle', margin: 0 });
    s.addText(f[1], { x: 4.3, y, w: 3.2, h: 0.5, fontSize: 12, fontFace: CUERPO, color: f[3] ? 'CFE0D8' : SUAVE, valign: 'middle', margin: 0 });
    s.addText(f[2], { x: 7.2, y, w: 1.6, h: 0.5, fontSize: f[3] ? 18 : 15, bold: true, fontFace: CUERPO, color: f[3] ? LIMA : NAVY, align: 'right', valign: 'middle', margin: 0 });
  });

  tarjeta(s, 9.5, 2.1, 3.15, 3.4, { fondo: CLARO });
  s.addText('El detalle que hay que saber defender', { x: 9.8, y: 2.4, w: 2.6, h: 0.7, fontSize: 14, bold: true, fontFace: CUERPO, color: NAVY, margin: 0 });
  s.addText('El descuento se aplica antes del impuesto, no después. El ISV se calcula sobre lo que el cliente paga realmente por el servicio, no sobre el precio de lista.', {
    x: 9.8, y: 3.15, w: 2.6, h: 2, fontSize: 12.5, fontFace: CUERPO, color: SUAVE, margin: 0
  });
  s.addNotes('Es la lámina con más probabilidad de pregunta del docente. La respuesta corta: primero se descuenta, luego se aplica el 15 %. Si preguntan por qué, porque el impuesto grava el precio efectivamente cobrado. Los números de la lámina son los mismos que arroja el sitio y que verifican las pruebas automáticas.');
}

/* =========================================================
   9 · LA HORA ÚNICA
   ========================================================= */
{
  const s = nuevaClara();
  titulo(s, 'Dos personas no pueden llevarse la misma cancha');
  bajada(s, 'El problema clásico de todo sistema de reservas, resuelto sin depender de la suerte.');

  s.addText('Cada combinación de fecha, hora y cancha se guarda con un nombre único, y la base de datos no admite dos veces el mismo nombre.', {
    x: 0.65, y: 1.85, w: 12, h: 0.5, fontSize: 14, fontFace: CUERPO, color: TEXTO, margin: 0
  });

  const casos = [
    ['Cliente A', 'crea 2026-08-10_19-00_c1', 'Se queda con la cancha 1', VERDE],
    ['Cliente B', 'ese nombre ya existe, intenta _c2', 'Se queda con la cancha 2', VERDE],
    ['Cliente C', 'las dos canchas están tomadas', 'Aviso: esa hora se acaba de ocupar', 'B45309']
  ];
  casos.forEach((c, i) => {
    const y = 2.6 + i * 1.35;
    tarjeta(s, 0.65, y, 12, 1.1);
    s.addText(c[0], { x: 1, y: y + 0.3, w: 1.7, h: 0.5, fontSize: 16, bold: true, fontFace: CUERPO, color: NAVY, margin: 0 });
    s.addText(c[1], { x: 2.8, y: y + 0.3, w: 5, h: 0.5, fontSize: 13, fontFace: CUERPO, color: SUAVE, margin: 0 });
    s.addShape(p.ShapeType.roundRect, { x: 8.1, y: y + 0.25, w: 4.2, h: 0.6, rectRadius: 0.1, fill: { color: c[3] } });
    s.addText(c[2], { x: 8.1, y: y + 0.25, w: 4.2, h: 0.6, fontSize: 13, bold: true, fontFace: CUERPO, color: BLANCO, align: 'center', valign: 'middle', margin: 0 });
  });
  s.addNotes('Esta es la lámina técnica más fuerte de la exposición y conviene explicarla despacio. La clave: no preguntamos primero si está libre y luego guardamos, porque entre esas dos acciones se puede colar alguien. Lo que hacemos es intentar crear un documento cuyo nombre ya identifica la hora y la cancha, y dejar que la base de datos rechace al segundo. Se probó de verdad sobre el sitio publicado: primera reserva cancha 1, segunda cancha 2, tercera rechazada.');
}

/* =========================================================
   10 · SEGURIDAD
   ========================================================= */
{
  const s = nuevaOscura();
  titulo(s, 'Lo que encontramos al auditar la seguridad', { color: BLANCO });
  bajada(s, 'Contarlo suma: demuestra que entendemos la diferencia entre que algo funcione y que sea seguro.', { color: '9DB3AA' });

  tarjeta(s, 0.65, 2.1, 5.9, 3.6, { fondo: NAVY2, borde: '2A4A55' });
  s.addText('Antes', { x: 1, y: 2.4, w: 5, h: 0.4, fontSize: 19, bold: true, fontFace: CUERPO, color: 'F87171', margin: 0 });
  s.addText([
    { text: 'La base de datos estaba abierta: cualquiera podía leer nombres, correos y teléfonos de los clientes.', options: { bullet: true, breakLine: true } },
    { text: 'También se podían borrar o falsear reservas desde fuera.', options: { bullet: true, breakLine: true } },
    { text: 'La contraseña del panel estaba escrita dentro del código, a la vista.', options: { bullet: true } }
  ], { x: 1, y: 3, w: 5.2, h: 2.5, fontSize: 13, fontFace: CUERPO, color: 'CFE0D8', paraSpaceAfter: 10, margin: 0 });

  tarjeta(s, 6.75, 2.1, 5.9, 3.6, { fondo: NAVY2, borde: '2A4A55' });
  s.addText('Ahora', { x: 7.1, y: 2.4, w: 5, h: 0.4, fontSize: 19, bold: true, fontFace: CUERPO, color: LIMA, margin: 0 });
  s.addText([
    { text: 'Las reglas de Firebase cierran el acceso: cada cliente solo alcanza sus propias reservas.', options: { bullet: true, breakLine: true } },
    { text: 'Las contraseñas las maneja Firebase; el sitio nunca las ve ni las guarda.', options: { bullet: true, breakLine: true } },
    { text: 'Ser administrador depende de una autorización que solo se crea desde la consola.', options: { bullet: true } }
  ], { x: 7.1, y: 3, w: 5.2, h: 2.5, fontSize: 13, fontFace: CUERPO, color: 'CFE0D8', paraSpaceAfter: 10, margin: 0 });

  s.addText('La seguridad de un sitio no está en el diseño ni en el código bonito, sino en quién puede hacer qué.', {
    x: 0.65, y: 6.2, w: 12, h: 0.5, fontSize: 15, italic: true, fontFace: CUERPO, color: LIMA, margin: 0
  });
  s.addNotes('Si preguntan por qué la clave de Firebase se ve en el código del sitio, responder: se ve a propósito, así funciona toda aplicación web, y por eso la seguridad real está en las reglas del servidor, que dicen quién puede leer y escribir cada cosa. Nunca en esconder la clave.');
}

/* =========================================================
   11 · QUIÉN VE QUÉ
   ========================================================= */
{
  const s = nuevaClara();
  titulo(s, 'Quién puede ver y hacer qué');

  const filas = [
    ['Visitante', 'Sin cuenta', 'Catálogo, precios y qué horas están libres'],
    ['Invitado', 'Identidad temporal al reservar', 'Solo sus propias reservas'],
    ['Cliente', 'Correo y contraseña', 'Su perfil y su historial. Nada de otros clientes'],
    ['Personal', 'Cuenta autorizada desde la consola', 'Todas las reservas, precios, cupos y horarios']
  ];
  s.addTable(
    [[
      { text: 'Quién', options: { bold: true, color: BLANCO, fill: { color: NAVY }, fontSize: 13 } },
      { text: 'Cómo entra', options: { bold: true, color: BLANCO, fill: { color: NAVY }, fontSize: 13 } },
      { text: 'Qué alcanza', options: { bold: true, color: BLANCO, fill: { color: NAVY }, fontSize: 13 } }
    ]].concat(filas.map((f, i) => f.map(celda => ({
      text: celda,
      options: { fontSize: 13, color: TEXTO, fill: { color: i % 2 ? CLARO : BLANCO } }
    })))),
    { x: 0.65, y: 1.8, w: 12, colW: [2.4, 4, 5.6], rowH: 0.72, border: { type: 'solid', color: 'E2EAE5', pt: 1 }, fontFace: CUERPO, valign: 'middle' }
  );

  s.addText('Un cliente que intente consultar las reservas de otro recibe un rechazo del servidor, no una pantalla en blanco: la restricción vive en Firebase, no en el navegador.', {
    x: 0.65, y: 5.5, w: 12, h: 0.6, fontSize: 13.5, italic: true, fontFace: CUERPO, color: NAVY, margin: 0
  });
  s.addNotes('Se puede demostrar en vivo: entrar con una cuenta de cliente y mostrar que en Mi cuenta solo aparecen sus reservas. Si hay tiempo, mencionar que se probó pidiendo datos ajenos directamente a la base y el servidor los rechazó.');
}

/* =========================================================
   12 · PANEL DEL PERSONAL
   ========================================================= */
{
  const s = nuevaClara();
  titulo(s, 'El panel del personal');
  bajada(s, 'Área privada, fuera del menú y con instrucción de no aparecer en buscadores.');

  const cosas = [
    ['Reservas', 'Cliente, teléfono, fecha, total y método de pago de cada una.'],
    ['Estados', 'Pendiente, confirmada, atendida o cancelada.'],
    ['Catálogo', 'Cambiar precios y cupos, u ocultar un servicio sin borrarlo.'],
    ['Clientes', 'Quiénes se registraron y cuántas reservas llevan.'],
    ['Horarios', 'Bloquear horas por mantenimiento, ligas o eventos.'],
    ['Resumen', 'Reservas totales, pendientes e ingresos registrados.']
  ];
  cosas.forEach((c, i) => {
    const x = 0.65 + (i % 2) * 6.2;
    const y = 1.95 + Math.floor(i / 2) * 1.6;
    circulo(s, x, y, '', { d: 0.35, fondo: VERDE });
    s.addText(c[0], { x: x + 0.6, y: y - 0.05, w: 5.2, h: 0.4, fontSize: 16, bold: true, fontFace: CUERPO, color: NAVY, margin: 0 });
    s.addText(c[1], { x: x + 0.6, y: y + 0.38, w: 5.3, h: 0.7, fontSize: 12.5, fontFace: CUERPO, color: SUAVE, margin: 0 });
  });

  s.addText('Cancelar una reserva libera automáticamente esa cancha, para que otro cliente pueda tomarla.', {
    x: 0.65, y: 6.5, w: 12, h: 0.5, fontSize: 13.5, italic: true, fontFace: CUERPO, color: NAVY, margin: 0
  });
  s.addNotes('Demostración corta: entrar al panel, cambiar el estado de una reserva y bloquear un horario. Después mostrar en el catálogo que esa hora ya no aparece disponible. Es la forma más clara de que se entienda que el panel y el sitio son el mismo sistema.');
}

/* =========================================================
   13 · MARCO LEGAL
   ========================================================= */
{
  const s = nuevaClara();
  titulo(s, 'Qué exige la ley y dónde se cumple');

  const normas = [
    ['Comercio electrónico', 'Decreto 149-2014', 'Identificar al comercio, dejar constancia de la operación y consentimiento expreso del cliente.', 'Datos en el pie de todas las páginas, comprobante con número propio y confirmación deliberada.'],
    ['Protección al consumidor', 'Decreto 24-2008', 'Precio final sin cargos ocultos, información veraz y condiciones de cancelación conocidas.', 'Desglose completo antes de pagar y política de 24 horas publicada en los términos.'],
    ['Impuesto sobre ventas', 'Tasa general 15 %', 'Cobrar y desglosar el impuesto correctamente.', 'Se calcula sobre la base gravable y se muestra como línea aparte en carrito, pago y comprobante.'],
    ['Datos personales', 'Habeas data constitucional', 'Pedir solo lo necesario, decir para qué se usa y protegerlo.', 'Nombre, correo y teléfono; acceso restringido por las reglas y todo el sitio cifrado con HTTPS.']
  ];
  normas.forEach((n, i) => {
    const x = 0.65 + (i % 2) * 6.2;
    const y = 1.7 + Math.floor(i / 2) * 2.6;
    tarjeta(s, x, y, 5.9, 2.25);
    s.addText(n[0], { x: x + 0.35, y: y + 0.22, w: 4, h: 0.35, fontSize: 16, bold: true, fontFace: CUERPO, color: NAVY, margin: 0 });
    s.addText(n[1], { x: x + 0.35, y: y + 0.6, w: 5.2, h: 0.3, fontSize: 11.5, fontFace: CUERPO, color: VERDE_OSC, margin: 0 });
    s.addText(n[2], { x: x + 0.35, y: y + 0.95, w: 5.2, h: 0.55, fontSize: 12, fontFace: CUERPO, color: SUAVE, margin: 0 });
    s.addText(n[3], { x: x + 0.35, y: y + 1.5, w: 5.2, h: 0.6, fontSize: 12, bold: true, fontFace: CUERPO, color: TEXTO, margin: 0 });
  });

  s.addText('El comprobante del sitio no es una factura fiscal: eso exige la clave de autorización de la SAR, y así está señalado en la documentación.', {
    x: 0.65, y: 6.8, w: 12, h: 0.5, fontSize: 12.5, italic: true, fontFace: CUERPO, color: SUAVE, margin: 0
  });
  s.addNotes('Decir lo que sí se cumple y también lo que no. Reconocer que el comprobante no es factura fiscal da credibilidad y evita que lo señalen como un descuido. Si preguntan por protección de datos, explicar que Honduras aún no tiene una ley general y que por eso se aplicaron los principios internacionales apoyados en el habeas data.');
}

/* =========================================================
   14 · PRUEBAS
   ========================================================= */
{
  const s = nuevaClara();
  titulo(s, 'No lo decimos: está comprobado');

  tarjeta(s, 0.65, 1.85, 3.6, 3.9, { fondo: NAVY, borde: NAVY });
  s.addText('21', { x: 0.65, y: 2.3, w: 3.6, h: 1.5, fontSize: 84, bold: true, fontFace: CUERPO, color: LIMA, align: 'center', margin: 0 });
  s.addText('comprobaciones\nautomáticas', { x: 0.65, y: 3.75, w: 3.6, h: 0.9, fontSize: 15, fontFace: CUERPO, color: BLANCO, align: 'center', margin: 0 });
  s.addText('en un navegador real', { x: 0.65, y: 4.7, w: 3.6, h: 0.4, fontSize: 12.5, fontFace: CUERPO, color: '9DB3AA', align: 'center', margin: 0 });

  const bloques = [
    ['Carga', 'Que todas las páginas abran sin errores.'],
    ['Carrito', 'Que las cuentas con cupón e impuesto cuadren.'],
    ['Horarios', 'Que la disponibilidad use la hora de Honduras.'],
    ['Reserva', 'Que no se pierda una reserva ni se dé por hecha sin conexión.'],
    ['Panel', 'Que cancelar y reactivar liberen la cancha correcta.'],
    ['Pantallas', 'Que nada se desborde en celular, tableta ni computadora.']
  ];
  bloques.forEach((b, i) => {
    const y = 1.9 + i * 0.65;
    circulo(s, 4.6, y, '', { d: 0.3, fondo: VERDE });
    s.addText(b[0], { x: 5.1, y: y - 0.06, w: 1.6, h: 0.4, fontSize: 14, bold: true, fontFace: CUERPO, color: NAVY, valign: 'middle', margin: 0 });
    s.addText(b[1], { x: 6.6, y: y - 0.06, w: 6, h: 0.4, fontSize: 12.5, fontFace: CUERPO, color: SUAVE, valign: 'middle', margin: 0 });
  });

  s.addText('Se ejecutan con un comando y no tocan la base de datos real, así que se pueden correr las veces que haga falta.', {
    x: 4.6, y: 6, w: 8, h: 0.5, fontSize: 13, italic: true, fontFace: CUERPO, color: NAVY, margin: 0
  });
  s.addNotes('Si el docente pregunta cómo saben que funciona, esta es la respuesta. Se puede correr en vivo con node pruebas/pruebas.mjs y mostrar las veintiuna líneas en verde. Las pruebas nacieron de una cacería de errores: cinco fallos reales encontrados y corregidos, y cada uno dejó su prueba para que no vuelva.');
}

/* =========================================================
   15 · LÍMITES
   ========================================================= */
{
  const s = nuevaClara();
  titulo(s, 'Qué quedó fuera y por qué');
  bajada(s, 'Decirlo con claridad demuestra que entendemos la diferencia entre un prototipo académico y un sistema en producción.');

  const fuera = [
    ['Cobro real con tarjeta', 'La pasarela está en modo de prueba. Cobrar de verdad exige contrato con el banco y un servidor propio que reciba las notificaciones.'],
    ['Factura fiscal', 'Requiere la clave de autorización que otorga el Servicio de Administración de Rentas.'],
    ['Correo automático', 'La confirmación se manda hoy por WhatsApp o por el correo del cliente. El envío automático necesita un servicio con servidor.'],
    ['Recordatorios y reportes', 'Avisar antes del partido o filtrar ingresos por fechas requiere tareas programadas que un sitio estático no puede ejecutar solo.']
  ];
  fuera.forEach((f, i) => {
    const y = 2.1 + i * 1.15;
    tarjeta(s, 0.65, y, 12, 0.95);
    s.addText(f[0], { x: 1, y: y + 0.22, w: 3.3, h: 0.5, fontSize: 15, bold: true, fontFace: CUERPO, color: NAVY, valign: 'middle', margin: 0 });
    s.addText(f[1], { x: 4.4, y: y + 0.22, w: 7.9, h: 0.5, fontSize: 12.5, fontFace: CUERPO, color: SUAVE, valign: 'middle', margin: 0 });
  });
  s.addNotes('Adelantarse a la pregunta incómoda. Si el docente pregunta por qué no se cobra de verdad, la respuesta ya está dada: no es una limitación técnica del proyecto sino un requisito comercial y legal que excede el alcance de la clase.');
}

/* =========================================================
   16 · CIERRE
   ========================================================= */
{
  const s = nuevaOscura();
  s.addImage({ path: IMG + 'torneo.jpg', x: 7.6, y: 0, w: 5.7, h: 7.5, transparency: 55 });

  titulo(s, 'El sitio está en línea', { color: BLANCO, y: 0.9 });
  s.addText('ylimecc.github.io/gamasport', {
    x: 0.65, y: 1.9, w: 6.6, h: 0.6, fontSize: 20, bold: true, fontFace: CUERPO, color: LIMA, margin: 0
  });

  s.addText('Tres respuestas preparadas', { x: 0.65, y: 3, w: 6.6, h: 0.4, fontSize: 16, bold: true, fontFace: CUERPO, color: BLANCO, margin: 0 });
  s.addText([
    { text: 'La clave de Firebase se ve a propósito: la seguridad está en las reglas del servidor.', options: { bullet: true, breakLine: true } },
    { text: 'El asistente no es inteligencia artificial: son catorce preguntas con sus respuestas.', options: { bullet: true, breakLine: true } },
    { text: 'La pasarela está en modo de prueba y se avisa en pantalla: no se cobra dinero real.', options: { bullet: true } }
  ], { x: 0.65, y: 3.55, w: 6.6, h: 2.2, fontSize: 13, fontFace: CUERPO, color: 'CFE0D8', paraSpaceAfter: 12, margin: 0 });

  s.addText('Gracias. ¿Preguntas?', {
    x: 0.65, y: 6.2, w: 6.6, h: 0.6, fontSize: 22, bold: true, fontFace: CUERPO, color: BLANCO, margin: 0
  });
  s.addNotes('Cerrar invitando a que abran el sitio en su teléfono durante las preguntas. Tener a mano las tres respuestas de la lámina, que son las dudas que más se repiten.');
}

await p.writeFile({ fileName: SALIDA });
console.log('presentación creada:', SALIDA);
