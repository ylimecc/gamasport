/* Pruebas automáticas del sitio de GamaSport.
   Se ejecuta con:  node pruebas/pruebas.mjs

   Levanta el sitio en un servidor local, lo abre en un navegador de verdad y
   comprueba lo que de otra forma habría que revisar a mano cada vez. Cada
   comprobación explica qué se esperaba y qué pasó, para que se entienda sin
   tener que leer el código.

   Ninguna prueba toca la base de datos real: las respuestas de la nube se
   simulan, así que se puede correr las veces que haga falta sin ensuciar nada
   ni gastar cuota. */

import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const RAIZ = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const PUERTO = 8799;
const SITIO = `http://localhost:${PUERTO}`;

/* ---------- el navegador ---------- */
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch (e) {
  try {
    const require = createRequire(import.meta.url);
    ({ chromium } = require(join(process.env.APPDATA || '', 'npm', 'node_modules', 'playwright')));
  } catch (e2) {
    console.error('Falta Playwright. Instálalo con:\n  npm install -D playwright\n  npx playwright install chromium');
    process.exit(1);
  }
}

/* ---------- servidor local para no depender de nada más ---------- */
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.pdf': 'application/pdf'
};
const servidor = createServer(async (req, res) => {
  const ruta = decodeURIComponent(req.url.split('?')[0]);
  const archivo = resolve(RAIZ, '.' + (ruta === '/' ? '/index.html' : ruta));
  if (!archivo.startsWith(RAIZ)) { res.writeHead(403); return res.end(); }
  try {
    const datos = await readFile(archivo);
    res.writeHead(200, { 'Content-Type': TIPOS[extname(archivo)] || 'application/octet-stream' });
    res.end(datos);
  } catch { res.writeHead(404); res.end('no encontrado'); }
});
await new Promise(r => servidor.listen(PUERTO, r));

/* ---------- utilidades ---------- */
const navegador = await chromium.launch();
const resultados = [];

function anota(grupo, titulo, ok, detalle) {
  resultados.push({ grupo, titulo, ok });
  const marca = ok ? '  OK  ' : ' FALLA';
  console.log(`${marca}  ${titulo}\n        ${detalle}`);
}

// deja pasar cualquier llamada a la nube con una respuesta vacía
async function sinNube(pagina) {
  await pagina.route('**/firestore.googleapis.com/**', r =>
    r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await pagina.route('**/identitytoolkit.googleapis.com/**', r =>
    r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
}

// finge que hay una sesión abierta, sin pasar por Firebase
const SESION_FINGIDA = () => {
  window.GS_AUTH.token = async () => 'token-de-prueba';
  window.GS_AUTH.sesion = () => ({ uid: 'u1', anonimo: true });
  window.GS_AUTH.uid = () => 'u1';
};

console.log('\nPRUEBAS DE GAMASPORT\n' + '='.repeat(60));

/* ================= 1. Las páginas cargan ================= */
console.log('\n1. Las páginas cargan y se dibujan');
{
  const c = await navegador.newContext();
  const p = await c.newPage();
  await sinNube(p);
  const errores = [];
  p.on('pageerror', e => errores.push(e.message));
  await p.goto(SITIO + '/index.html', { waitUntil: 'networkidle' });
  const r = await p.evaluate(() => ({
    tarjetas: document.querySelectorAll('#featuredGrid .product-card').length,
    menu: document.querySelectorAll('.primary-nav > a').length,
    boletin: !!document.querySelector('.news-band #newsForm'),
    pie: !!document.querySelector('.site-footer .footer-estado')
  }));
  anota('carga', 'El inicio se dibuja completo y sin errores de código',
    r.tarjetas === 6 && r.menu >= 7 && r.boletin && r.pie && errores.length === 0,
    `servicios destacados: ${r.tarjetas} · enlaces del menú: ${r.menu} · boletín: ${r.boletin} · estado del pie: ${r.pie} · errores: ${errores.length}`);

  for (const pag of ['catalogo', 'promociones', 'nosotros', 'contacto', 'carrito', 'cuenta', 'terminos', 'privacidad']) {
    const resp = await p.goto(`${SITIO}/${pag}.html`, { waitUntil: 'domcontentloaded' });
    if (resp.status() !== 200) anota('carga', `La página ${pag} responde`, false, `respondió ${resp.status()}`);
  }
  anota('carga', 'Las ocho páginas secundarias responden', errores.length === 0, `errores de código encontrados: ${errores.length}`);
  await c.close();
}

/* ================= 2. Carrito y precios ================= */
console.log('\n2. Carrito, cupones e impuesto');
{
  const c = await navegador.newContext();
  const p = await c.newPage();
  await sinNube(p);
  await p.goto(SITIO + '/index.html', { waitUntil: 'networkidle' });

  const cuentas = await p.evaluate(() => {
    const { Cart } = window.GS;
    Cart.clear();
    Cart.add('GS-101', 2);                 // cancha diurna, 800 cada una
    const sinCupon = Cart.totals();
    Cart.applyCoupon('GAMA10');            // 10 %
    const conCupon = Cart.totals();
    return { sinCupon, conCupon };
  });
  const s = cuentas.sinCupon, d = cuentas.conCupon;
  anota('carrito', 'El impuesto se calcula sobre el precio ya rebajado',
    s.subtotal === 1600 && s.isv === 240 && s.total === 1840 &&
    d.discount === 160 && d.isv === 216 && d.total === 1656,
    `sin cupón: subtotal ${s.subtotal}, ISV ${s.isv}, total ${s.total} · con GAMA10: descuento ${d.discount}, ISV ${d.isv}, total ${d.total}`);

  const cupon = await p.evaluate(() => {
    const { Cart } = window.GS;
    return { inventado: Cart.applyCoupon('NOEXISTE'), enMinusculas: Cart.applyCoupon('gama10') };
  });
  anota('carrito', 'Solo se aceptan los cupones que existen',
    cupon.inventado === false && cupon.enMinusculas === true,
    `cupón inventado: ${cupon.inventado ? 'aceptado' : 'rechazado'} · el mismo cupón en minúsculas: ${cupon.enMinusculas ? 'aceptado' : 'rechazado'}`);

  const tope = await p.evaluate(() => {
    const { Cart } = window.GS;
    Cart.clear();
    Cart.add('GS-202', 99);                // evento privado, solo 2 cupos
    return Cart.lines()[0].qty;
  });
  anota('carrito', 'No se puede reservar más de los cupos que hay', tope === 2,
    `se pidieron 99 unidades de un servicio con 2 cupos y quedaron ${tope}`);

  // un servicio que se queda sin cupos mientras está en el carrito
  const agotado = await p.evaluate(() => {
    const { Cart } = window.GS;
    Cart.clear();
    Cart.add('GS-101', 2);
    window.GS_DATA.PRODUCTS.find(x => x.id === 'GS-101').stock = 0;
    Cart.setQty('GS-101', 2);
    return Cart.lines().length;
  });
  anota('carrito', 'Un servicio agotado sale del carrito', agotado === 0,
    `líneas que quedan en el carrito tras agotarse: ${agotado}`);
  await c.close();
}

/* ================= 3. Disponibilidad y zona horaria ================= */
console.log('\n3. Disponibilidad de horarios');
{
  const c = await navegador.newContext({ timezoneId: 'America/Tegucigalpa' });
  const p = await c.newPage();
  await p.clock.setFixedTime(new Date('2026-08-10T01:30:00Z'));   // 19:30 del día 9 en Honduras
  let fechaPedida = null;
  await p.route('**/firestore.googleapis.com/**', async route => {
    const cuerpo = route.request().postData();
    if (cuerpo && cuerpo.includes('ocupados')) {
      const m = cuerpo.match(/"stringValue":"(\d{4}-\d{2}-\d{2})"/);
      if (m) fechaPedida = m[1];
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
  await p.goto(SITIO + '/index.html', { waitUntil: 'networkidle' });
  const hoy = await p.evaluate(() => {
    const d = new Date(), z = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
  });
  anota('horarios', 'De noche la consulta sigue cubriendo el día de hoy',
    !!fechaPedida && fechaPedida <= hoy,
    `a las 19:30 del ${hoy} en Honduras, el sitio pide las horas ocupadas desde ${fechaPedida}`);

  // el calendario no debe dejar elegir un día que ya pasó
  await p.evaluate(() => window.GS.Cart.add('GS-101', 1));
  await p.goto(SITIO + '/checkout.html', { waitUntil: 'networkidle' });
  const min = await p.evaluate(() => document.querySelector('[name="fecha"]').min);
  anota('horarios', 'El calendario no permite fechas pasadas', min === hoy,
    `mínimo del campo de fecha: ${min} · hoy en Honduras: ${hoy}`);

  // una hora ocupada en las dos canchas debe salir de la lista
  const ocupada = await p.evaluate(() => {
    localStorage.setItem('gs_ocupados_v1', JSON.stringify([
      { fecha: '2026-12-30', hora: '8:00 PM', cancha: '1' },
      { fecha: '2026-12-30', hora: '8:00 PM', cancha: '2' },
      { fecha: '2026-12-30', hora: '7:00 PM', cancha: '1' }
    ]));
    return { llenas: window.GS.busySlots('2026-12-30') };
  });
  anota('horarios', 'Una hora se bloquea solo cuando no queda ninguna cancha',
    ocupada.llenas.length === 1 && ocupada.llenas[0] === '8:00 PM',
    `con las dos canchas tomadas a las 8 y una sola a las 7, el sitio bloquea: ${ocupada.llenas.join(', ') || 'nada'}`);
  await c.close();
}

/* ================= 4. Confirmar una reserva ================= */
console.log('\n4. Confirmación de la reserva');
{
  // el número de reserva ya existía: debe reintentar con otro y no perder nada
  const c = await navegador.newContext();
  const p = await c.newPage();
  const intentos = [];
  await p.route('**/firestore.googleapis.com/**', async route => {
    const url = route.request().url(), metodo = route.request().method();
    if (metodo === 'POST' && url.includes('/pedidos?documentId=')) {
      intentos.push(decodeURIComponent(url.split('documentId=')[1].split('&')[0]));
      return intentos.length === 1
        ? route.fulfill({ status: 409, contentType: 'application/json', body: '{"error":{"message":"ya existe"}}' })
        : route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
    if (metodo === 'POST' && url.includes('/ocupados?documentId='))
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
  await p.goto(SITIO + '/index.html', { waitUntil: 'networkidle' });
  await p.evaluate(SESION_FINGIDA);
  await p.evaluate(() => window.GS.Cart.add('GS-101', 1));
  await p.goto(SITIO + '/checkout.html', { waitUntil: 'networkidle' });
  await p.evaluate(SESION_FINGIDA);
  await p.evaluate(() => {
    const f = document.querySelector('#checkoutForm');
    const set = (n, v) => { const el = f.querySelector(`[name="${n}"]`); el.value = v; el.dispatchEvent(new Event('change', { bubbles: true })); };
    set('nombre', 'Cliente de Prueba'); set('email', 'prueba@correo.test'); set('telefono', '99998888');
    set('fecha', new Date(Date.now() + 86400000).toISOString().slice(0, 10)); set('hora', '4:00 PM');
    set('card', '4242 4242 4242 4242'); set('exp', '12/28'); set('cvv', '123');
    f.requestSubmit();
  });
  await p.waitForTimeout(2500);
  anota('reserva', 'Un número de reserva repetido no pierde la reserva',
    intentos.length === 2 && intentos[0] !== intentos[1] && p.url().includes('confirmacion'),
    `números probados: ${intentos.join(' y luego ')} · llega al comprobante: ${p.url().includes('confirmacion')}`);
  await c.close();
}
{
  // sin conexión no se puede confirmar, y el carrito no se pierde
  const c = await navegador.newContext();
  const p = await c.newPage();
  await p.route('**/identitytoolkit.googleapis.com/**', r => r.abort());
  await p.route('**/firestore.googleapis.com/**', async route => {
    if (route.request().method() === 'POST' && route.request().url().includes('documentId=')) return route.abort();
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
  await p.goto(SITIO + '/index.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => window.GS.Cart.add('GS-101', 1));
  await p.goto(SITIO + '/checkout.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => {
    const f = document.querySelector('#checkoutForm');
    const set = (n, v) => { const el = f.querySelector(`[name="${n}"]`); el.value = v; el.dispatchEvent(new Event('change', { bubbles: true })); };
    set('nombre', 'Cliente de Prueba'); set('email', 'prueba@correo.test'); set('telefono', '99998888');
    set('fecha', new Date(Date.now() + 86400000).toISOString().slice(0, 10)); set('hora', '5:00 PM');
    set('card', '4242 4242 4242 4242'); set('exp', '12/28'); set('cvv', '123');
    f.requestSubmit();
  });
  await p.waitForTimeout(3000);
  const r = await p.evaluate(() => ({ carrito: window.GS.Cart.count(), url: location.pathname }));
  anota('reserva', 'Sin conexión avisa y conserva el carrito',
    r.carrito === 1 && !r.url.includes('confirmacion'),
    `servicios que quedan en el carrito: ${r.carrito} · sigue en el pago: ${!r.url.includes('confirmacion')}`);
  await c.close();
}

/* ================= 5. Panel del personal ================= */
console.log('\n5. Panel del personal');
{
  const pedido = (estado, conCancha) => {
    const o = { number: 'GS-20260805-111111', estado,
      reserva: { fecha: '2026-09-01', hora: '7:00 PM', ...(conCancha ? { cancha: 2 } : {}) } };
    return { name: 'x/documents/pedidos/GS-20260805-111111', fields: {
      uid: { stringValue: 'u1' }, json: { stringValue: JSON.stringify(o) },
      fecha: { stringValue: '2026-09-01' }, estado: { stringValue: estado }, creado: { stringValue: '2026-08-05' } } };
  };

  async function cambiarEstado({ estadoActual, conCancha, horaLibre, nuevo }) {
    const c = await navegador.newContext();
    const p = await c.newPage();
    const borrados = [], apartados = [], grabados = [];
    await p.route('**/firestore.googleapis.com/**', async route => {
      const url = route.request().url(), metodo = route.request().method();
      if (metodo === 'GET' && url.includes('/pedidos/'))
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(pedido(estadoActual, conCancha)) });
      if (metodo === 'DELETE') { borrados.push(url.split('/documents/')[1].split('?')[0]); return route.fulfill({ status: 200, body: '{}' }); }
      if (metodo === 'POST' && url.includes('/ocupados?documentId=')) {
        apartados.push(decodeURIComponent(url.split('documentId=')[1].split('&')[0]));
        return horaLibre ? route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
                         : route.fulfill({ status: 409, contentType: 'application/json', body: '{"error":{"message":"ya existe"}}' });
      }
      if (metodo === 'PATCH' && url.includes('/pedidos/')) {
        grabados.push(JSON.parse(route.request().postData()).fields.estado.stringValue);
        return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await p.goto(SITIO + '/index.html', { waitUntil: 'networkidle' });
    const salida = await p.evaluate(async ([nuevoEstado]) => {
      window.GS_AUTH.token = async () => 'token-de-prueba';
      window.GS_AUTH.uid = () => 'u1';
      try { await window.GS_CLOUD.cambiarEstadoPedido('GS-20260805-111111', nuevoEstado); return { ok: true, error: null }; }
      catch (e) { return { ok: false, error: e.message }; }
    }, [nuevo]);
    await c.close();
    return { ...salida, borrados, apartados, grabados };
  }

  const a = await cambiarEstado({ estadoActual: 'pendiente', conCancha: true, horaLibre: true, nuevo: 'cancelada' });
  anota('panel', 'Cancelar una reserva libera su cancha',
    a.ok && a.borrados.length === 1 && a.borrados[0].includes('_c2'),
    `liberó: ${a.borrados.join(', ') || 'nada'}`);

  const b = await cambiarEstado({ estadoActual: 'pendiente', conCancha: false, horaLibre: true, nuevo: 'cancelada' });
  anota('panel', 'Cancelar un pedido sin cancha no libera la de otro',
    b.ok && b.borrados.length === 0,
    `documentos que intentó borrar: ${b.borrados.length ? b.borrados.join(', ') : 'ninguno'}`);

  const d = await cambiarEstado({ estadoActual: 'cancelada', conCancha: true, horaLibre: true, nuevo: 'confirmada' });
  anota('panel', 'Reactivar una reserva vuelve a apartar su cancha',
    d.ok && d.apartados.length === 1 && d.apartados[0].includes('_c2') && d.grabados.includes('confirmada'),
    `apartó: ${d.apartados.join(', ') || 'nada'} · estado grabado: ${d.grabados.join(', ') || 'ninguno'}`);

  const e = await cambiarEstado({ estadoActual: 'cancelada', conCancha: true, horaLibre: false, nuevo: 'confirmada' });
  anota('panel', 'No se reactiva si otro cliente ya tomó esa hora',
    !e.ok && e.grabados.length === 0 && /ya la tom/i.test(e.error || ''),
    `respuesta: ${e.error || 'la reactivó igual'} · cambios guardados: ${e.grabados.length}`);
}

/* ================= 6. Interfaz en distintas pantallas ================= */
console.log('\n6. Interfaz en celular, tableta y computadora');
{
  for (const v of [{ n: 'celular', w: 360, h: 740 }, { n: 'tableta', w: 768, h: 1024 }, { n: 'computadora', w: 1280, h: 800 }]) {
    const c = await navegador.newContext({ viewport: { width: v.w, height: v.h } });
    const p = await c.newPage();
    await sinNube(p);
    await p.goto(SITIO + '/index.html', { waitUntil: 'networkidle' });
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await p.waitForTimeout(400);
    const r = await p.evaluate(() => {
      const de = document.documentElement;
      const fab = document.querySelector('.bot-fab').getBoundingClientRect();
      const choca = Array.from(document.querySelectorAll('.footer-bottom span')).some(t => {
        const x = t.getBoundingClientRect();
        return !(fab.left > x.right || fab.right < x.left || fab.top > x.bottom || fab.bottom < x.top);
      });
      return { desborde: de.scrollWidth > de.clientWidth, ancho: de.scrollWidth, visible: de.clientWidth, choca };
    });
    anota('interfaz', `En ${v.n} (${v.w}px) no se desborda ni se tapa el texto`,
      !r.desborde && !r.choca,
      `ancho del contenido: ${r.ancho} · ancho visible: ${r.visible} · el asistente tapa el pie: ${r.choca}`);
    await c.close();
  }
}
{
  // los enlaces de la página de error llevan a donde dicen
  for (const w of [360, 1280]) {
    const c = await navegador.newContext({ viewport: { width: w, height: 800 } });
    const p = await c.newPage();
    await sinNube(p);
    let bien = true, detalle = [];
    for (const [texto, destino] of [['Volver al inicio', 'index.html'], ['Ver canchas y servicios', 'catalogo.html']]) {
      await p.goto(SITIO + '/404.html', { waitUntil: 'domcontentloaded' });
      await p.getByRole('link', { name: texto, exact: true }).click();
      await p.waitForLoadState('domcontentloaded');
      const ok = p.url().includes(destino);
      if (!ok) bien = false;
      detalle.push(`${texto} → ${p.url().split('/').pop()}`);
    }
    anota('interfaz', `Los botones del error 404 funcionan a ${w}px`, bien, detalle.join(' · '));
    await c.close();
  }
}
{
  // el boletín guarda el correo y avisa
  const c = await navegador.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await c.newPage();
  await sinNube(p);
  await p.goto(SITIO + '/index.html', { waitUntil: 'networkidle' });
  await p.locator('#newsForm input').fill('correo@prueba.test');
  await p.locator('#newsForm button').click();
  await p.waitForTimeout(600);
  const r = await p.evaluate(() => ({
    aviso: (document.querySelector('.toast') || {}).textContent || '',
    guardados: JSON.parse(localStorage.getItem('gs_news_v1') || '[]'),
    campoLimpio: document.querySelector('#newsForm input').value === ''
  }));
  anota('interfaz', 'El boletín guarda el correo y avisa',
    r.guardados.includes('correo@prueba.test') && r.campoLimpio && r.aviso.length > 0,
    `guardados: ${r.guardados.join(', ')} · aviso mostrado: ${r.aviso.trim().slice(0, 40)}`);
  await c.close();
}

/* ---------- resumen ---------- */
await navegador.close();
servidor.close();

const fallos = resultados.filter(r => !r.ok);
console.log('\n' + '='.repeat(60));
console.log(`${resultados.length - fallos.length} de ${resultados.length} comprobaciones pasaron`);
if (fallos.length) {
  console.log('\nNo pasaron:');
  fallos.forEach(f => console.log('  · ' + f.titulo));
}
process.exit(fallos.length ? 1 : 0);
