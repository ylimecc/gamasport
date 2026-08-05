/* Capa de datos en la nube (Firestore), ahora con credencial.

   Cada petición viaja con el token de quien está usando el sitio, así que las
   reglas de firestore.rules deciden qué se puede leer y qué no. El cliente solo
   alcanza sus propias reservas; el personal las ve todas.

   Lo único que se lee sin cuenta es la disponibilidad (qué horas están tomadas
   y cuáles bloqueó el personal), porque el calendario tiene que funcionar antes
   de que nadie inicie sesión. Ahí no hay datos de ninguna persona.

   El sitio sigue leyendo del navegador para dibujar, igual que antes: lo que
   baja de la nube se deja en una copia local y las páginas la usan sin esperar.
   La diferencia está en las reservas: confirmar una reserva sí necesita
   conexión, porque es la nube la que decide quién gana la hora. */
(function () {
  "use strict";

  const CFG  = window.GS_FIREBASE || {};
  const AUTH = window.GS_AUTH || null;
  const ON   = !!(CFG.apiKey && CFG.projectId && AUTH);
  const RAIZ = ON ? `https://firestore.googleapis.com/v1/projects/${CFG.projectId}/databases/(default)/documents` : "";
  const TIMEOUT = 8000;

  // dónde vive en el navegador la copia de cada cosa
  const LOCAL = {
    pedidos:    "gs_orders_v1",
    inventario: "gs_inv_v1",
    bloqueos:   "gs_blocked_v1",
    ocupados:   "gs_ocupados_v1"
  };

  const estado = { activo: ON, sincronizado: false, admin: false, error: null };

  function conTiempoLimite(promesa, ms) {
    return Promise.race([
      promesa,
      new Promise((_, rechazar) => setTimeout(() => rechazar(new Error("tiempo agotado")), ms))
    ]);
  }

  /* Firestore guarda cada campo con su tipo. Aquí solo uso textos, números y
     sí/no, que es todo lo que necesito: los pedidos completos viajan como un
     texto JSON en un solo campo. */
  function aFS(obj) {
    const fields = {};
    Object.keys(obj).forEach(k => {
      const v = obj[k];
      if (v === null || v === undefined) return;
      if (typeof v === "number")       fields[k] = Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
      else if (typeof v === "boolean") fields[k] = { booleanValue: v };
      else                             fields[k] = { stringValue: String(v) };
    });
    return { fields };
  }

  function deFS(doc) {
    const o = { _id: (doc.name || "").split("/").pop() };
    const f = doc.fields || {};
    Object.keys(f).forEach(k => {
      const v = f[k];
      if ("integerValue" in v)      o[k] = parseInt(v.integerValue, 10);
      else if ("doubleValue" in v)  o[k] = Number(v.doubleValue);
      else if ("booleanValue" in v) o[k] = v.booleanValue;
      else                          o[k] = v.stringValue;
    });
    return o;
  }

  // "3:00 PM" queda como "15-00", que sirve de identificador de documento
  function horaId(hora) {
    const m = String(hora).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return String(hora).replace(/[^\w]/g, "-");
    let h = parseInt(m[1], 10) % 12;
    if (/pm/i.test(m[3])) h += 12;
    return String(h).padStart(2, "0") + "-" + m[2];
  }

  function slotId(fecha, hora, cancha) {
    return `${fecha}_${horaId(hora)}_c${cancha}`;
  }

  async function pedir(url, opciones, conCredencial) {
    const o = Object.assign({ headers: {} }, opciones || {});
    o.headers = Object.assign({ "Content-Type": "application/json" }, o.headers);
    if (conCredencial) {
      const t = await AUTH.token();
      if (!t) throw new Error("Tu sesión venció. Vuelve a iniciar sesión.");
      o.headers.Authorization = "Bearer " + t;
    }
    const r = await conTiempoLimite(fetch(url + (url.indexOf("?") < 0 ? "?" : "&") + "key=" + CFG.apiKey, o), TIMEOUT);
    if (r.status === 404) return null;                       // todavía no existe
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      const e = new Error((d.error && d.error.message) || ("Firestore respondió " + r.status));
      e.status = r.status;
      throw e;
    }
    return r.json();
  }

  const leerDoc   = (col, id, cred)  => pedir(`${RAIZ}/${col}/${id}`, { method: "GET" }, cred);
  const crearDoc  = (col, id, datos) => pedir(`${RAIZ}/${col}?documentId=${encodeURIComponent(id)}`,
                                              { method: "POST", body: JSON.stringify(aFS(datos)) }, true);
  const grabarDoc = (col, id, datos) => pedir(`${RAIZ}/${col}/${id}`,
                                              { method: "PATCH", body: JSON.stringify(aFS(datos)) }, true);
  const borrarDoc = (col, id)        => pedir(`${RAIZ}/${col}/${id}`, { method: "DELETE" }, true);

  /* Consulta de colección. Con filtro, Firestore comprueba que la consulta no
     pueda devolver documentos ajenos: por eso los pedidos siempre se piden
     filtrando por uid, salvo que quien pregunte sea del personal. */
  async function consultar(col, filtro, cred) {
    const query = { from: [{ collectionId: col }], limit: 500 };
    if (filtro) {
      query.where = {
        fieldFilter: {
          field: { fieldPath: filtro.campo },
          op: filtro.op || "EQUAL",
          value: { stringValue: String(filtro.valor) }
        }
      };
      if ((filtro.op || "EQUAL") !== "EQUAL") query.orderBy = [{ field: { fieldPath: filtro.campo } }];
    }
    const d = await pedir(`${RAIZ}:runQuery`, {
      method: "POST", body: JSON.stringify({ structuredQuery: query })
    }, cred);
    if (!Array.isArray(d)) return [];
    return d.filter(x => x.document).map(x => deFS(x.document));
  }

  function guardarLocal(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) {}
  }

  /* La fecha de aquí, no la de Greenwich. Con toISOString, a partir de las 6 de
     la tarde de Honduras ya cuenta como el día siguiente, y las horas de esta
     noche desaparecían del calendario justo en el horario nocturno.
     Pido desde ayer para que el cambio de día nunca deje fuera lo de hoy. */
  function desdeCuando() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  /* ---------- lo que se baja al abrir cualquier página ---------- */

  // disponibilidad: pública, sin datos de nadie, y solo de hoy en adelante
  async function bajarDisponibilidad() {
    const desde = desdeCuando();
    const [ocupados, bloqueos] = await Promise.all([
      consultar("ocupados", { campo: "fecha", op: "GREATER_THAN_OR_EQUAL", valor: desde }, false).catch(() => null),
      consultar("bloqueos", { campo: "fecha", op: "GREATER_THAN_OR_EQUAL", valor: desde }, false).catch(() => null)
    ]);
    if (ocupados) guardarLocal(LOCAL.ocupados, ocupados.map(o => ({ fecha: o.fecha, hora: o.hora, cancha: o.cancha })));
    if (bloqueos) guardarLocal(LOCAL.bloqueos, bloqueos.map(b => ({ fecha: b.fecha, hora: b.hora })));
  }

  // precios y cupos que el personal haya cambiado
  async function bajarInventario() {
    const d = await leerDoc("config", "inventario", false).catch(() => null);
    if (!d) return;
    const o = deFS(d);
    try { guardarLocal(LOCAL.inventario, JSON.parse(o.json || "{}")); } catch (e) {}
  }

  // mis reservas (o todas, si soy del personal)
  async function bajarPedidos() {
    if (!AUTH.sesion()) { guardarLocal(LOCAL.pedidos, []); return; }
    const filtro = estado.admin ? null : { campo: "uid", valor: AUTH.uid() };
    const docs = await consultar("pedidos", filtro, true).catch(() => null);
    if (!docs) return;
    const pedidos = docs.map(d => {
      let o = null;
      try { o = JSON.parse(d.json); } catch (e) { return null; }
      o.estado = d.estado || o.estado || "pendiente";
      return o;
    }).filter(Boolean);
    pedidos.sort((a, b) => String(b.dateISO).localeCompare(String(a.dateISO)));
    guardarLocal(LOCAL.pedidos, pedidos);
  }

  /* Averigua si quien entró es del personal. Lo decide Firestore: existe o no
     existe el documento admins/<uid>, y esa colección no se puede escribir
     desde el sitio. */
  async function comprobarAdmin() {
    estado.admin = false;
    if (!AUTH.entrado()) return false;
    try {
      const d = await leerDoc("admins", AUTH.uid(), true);
      estado.admin = !!d;
    } catch (e) { estado.admin = false; }
    return estado.admin;
  }

  async function sincronizar() {
    if (!ON) return false;
    try {
      await comprobarAdmin();
      await Promise.all([bajarDisponibilidad(), bajarInventario(), bajarPedidos()]);
      estado.sincronizado = true;
      estado.error = null;
      return true;
    } catch (e) {
      estado.error = e.message;
      return false;
    }
  }

  /* ---------- escrituras ---------- */

  /* Aparta una cancha para esa fecha y hora. El identificador del documento es
     fecha_hora_cancha: si dos personas confirman al mismo tiempo, la segunda
     choca con un documento que ya existe (error 409) y se le ofrece la otra
     cancha. Cuando ya no queda ninguna, la hora está llena de verdad. */
  async function apartarHora(fecha, hora, canchas) {
    const total = Math.max(1, canchas || 1);
    for (let n = 1; n <= total; n++) {
      try {
        await crearDoc("ocupados", slotId(fecha, hora, n), {
          fecha: fecha, hora: hora, cancha: String(n), creado: new Date().toISOString()
        });
        return n;
      } catch (e) {
        if (e.status === 409) continue;                      // esa cancha ya estaba tomada
        throw e;
      }
    }
    return 0;
  }

  async function crearPedido(order) {
    await crearDoc("pedidos", order.number, {
      uid: AUTH.uid(),
      json: JSON.stringify(order),
      fecha: order.reserva.fecha,
      estado: "pendiente",
      creado: order.dateISO
    });
    return true;
  }

  async function guardarPerfil(nombre, email) {
    if (!AUTH.entrado()) return;
    await grabarDoc("usuarios", AUTH.uid(), {
      nombre: nombre || "", email: (email || "").toLowerCase(), creado: new Date().toISOString()
    });
  }

  /* ---------- solo personal (las reglas lo vuelven a comprobar) ---------- */

  async function cambiarEstadoPedido(numero, nuevo) {
    const d = await leerDoc("pedidos", numero, true);
    if (!d) throw new Error("Ese pedido ya no existe.");
    const actual = deFS(d);
    let o = {};
    try { o = JSON.parse(actual.json); } catch (e) {}

    const anterior    = actual.estado || o.estado || "pendiente";
    const tieneCancha = !!(o.reserva && o.reserva.cancha);
    const id          = tieneCancha ? slotId(o.reserva.fecha, o.reserva.hora, o.reserva.cancha) : "";

    /* Reactivar una reserva cancelada obliga a apartar su cancha otra vez,
       porque al cancelarla quedó libre y pudo tomarla alguien más. Se hace
       ANTES de cambiar el estado: si la hora ya no está, el pedido se queda
       cancelado en vez de quedar confirmado sobre una cancha ajena. */
    if (anterior === "cancelada" && nuevo !== "cancelada" && tieneCancha) {
      try {
        await crearDoc("ocupados", id, {
          fecha: o.reserva.fecha, hora: o.reserva.hora,
          cancha: String(o.reserva.cancha), creado: new Date().toISOString()
        });
      } catch (e) {
        if (e.status === 409) throw new Error("Esa hora ya la tomó otro cliente, así que esta reserva no se puede reactivar.");
        throw e;
      }
    }

    o.estado = nuevo;
    await grabarDoc("pedidos", numero, {
      uid: actual.uid, json: JSON.stringify(o), fecha: actual.fecha, estado: nuevo, creado: actual.creado
    });

    /* Al cancelar, la hora vuelve a quedar libre. Solo si el pedido dice qué
       cancha ocupó: si no lo dice (pedidos viejos), liberar "la primera" podría
       estar soltando la reserva de otro cliente. */
    if (nuevo === "cancelada" && tieneCancha) {
      await borrarDoc("ocupados", id).catch(() => {});
    }
    return true;
  }

  const guardarInventario = (obj) => grabarDoc("config", "inventario", { json: JSON.stringify(obj || {}) });

  const bloquearHora   = (fecha, hora) => crearDoc("bloqueos", `${fecha}_${horaId(hora)}`, { fecha, hora })
                                            .catch(e => { if (e.status !== 409) throw e; });
  const liberarHora    = (fecha, hora) => borrarDoc("bloqueos", `${fecha}_${horaId(hora)}`);
  const listarUsuarios = () => consultar("usuarios", null, true);

  window.GS_CLOUD = {
    activo: ON, estado,
    sincronizar, comprobarAdmin,
    apartarHora, crearPedido, guardarPerfil,
    cambiarEstadoPedido, guardarInventario, bloquearHora, liberarHora, listarUsuarios,
    esAdmin: () => estado.admin,
    horaId, slotId
  };
})();
