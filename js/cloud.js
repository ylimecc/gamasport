/* Capa de datos en la nube (Firestore).

   Idea: el sitio sigue leyendo del navegador como siempre, así nada se
   bloquea esperando internet. Al cargar la página intento traer los datos
   de Firestore y actualizo la copia local; cada vez que se guarda algo,
   lo mando también a la nube sin esperar respuesta.

   Si Firebase no está configurado, no responde o falla, el sitio sigue
   funcionando con los datos del navegador. Nunca se rompe por esto. */
(function () {
  "use strict";

  const CFG = window.GS_FIREBASE || {};
  const ON = !!(CFG.apiKey && CFG.projectId);
  const BASE = ON ? `https://firestore.googleapis.com/v1/projects/${CFG.projectId}/databases/(default)/documents` : "";
  const TIMEOUT = 4000;          // si tarda más, seguimos con lo local

  // qué guardamos en la nube y en qué clave del navegador vive cada cosa
  const MAP = {
    orders:    { key: "gs_orders_v1", tipo: "lista"  },
    users:     { key: "gs_users_v1",  tipo: "lista"  },
    inventory: { key: "gs_inv_v1",    tipo: "objeto" },
    blocked:   { key: "gs_blocked_v1",tipo: "lista"  }
  };

  const estado = { activo: ON, sincronizado: false, error: null };

  function conTiempoLimite(promesa, ms) {
    return Promise.race([
      promesa,
      new Promise((_, rechazar) => setTimeout(() => rechazar(new Error("tiempo agotado")), ms))
    ]);
  }

  // Firestore guarda campos con tipo; meto el JSON completo en un solo campo de texto
  async function leer(col) {
    const r = await conTiempoLimite(fetch(`${BASE}/${col}/datos?key=${CFG.apiKey}`), TIMEOUT);
    if (r.status === 404) return null;                 // todavía no existe: no es un error
    if (!r.ok) throw new Error("Firestore respondió " + r.status);
    const doc = await r.json();
    const txt = doc && doc.fields && doc.fields.json && doc.fields.json.stringValue;
    return txt ? JSON.parse(txt) : null;
  }

  async function escribir(col, valor) {
    const cuerpo = JSON.stringify({ fields: { json: { stringValue: JSON.stringify(valor) } } });
    const r = await conTiempoLimite(
      fetch(`${BASE}/${col}/datos?key=${CFG.apiKey}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: cuerpo
      }), TIMEOUT);
    if (!r.ok) throw new Error("Firestore respondió " + r.status);
    return true;
  }

  /* Junta lo que hay en la nube con lo que hay en este navegador, sin perder
     nada de ninguno de los dos lados. Para las listas uno por su identificador
     y, si un elemento está en ambos, me quedo con el de la nube porque es el
     que ya vieron los demás dispositivos. */
  function fusionar(col, nube, local) {
    if (col === "inventory") return Object.assign({}, local || {}, nube || {});
    const a = Array.isArray(nube) ? nube : [];
    const b = Array.isArray(local) ? local : [];
    const id = col === "orders"  ? (o => o && o.number)
             : col === "users"   ? (u => u && u.email)
             : (x => x && x.fecha + "|" + x.hora);          // horarios bloqueados
    const vistos = new Set(a.map(id));
    return a.concat(b.filter(x => !vistos.has(id(x))));
  }

  /* Al abrir la página: traigo lo de la nube, lo fusiono con lo local y, si el
     resultado aporta algo que la nube no tenía, lo devuelvo actualizado. */
  async function bajar() {
    if (!ON) return false;
    try {
      const cols = Object.keys(MAP);
      const datos = await Promise.all(cols.map(c => leer(c).catch(() => undefined)));
      let alguno = false;
      cols.forEach((col, i) => {
        const enNube = datos[i];
        if (enNube === undefined) return;                // no se pudo leer: dejo lo local
        let enLocal = null;
        try { enLocal = JSON.parse(localStorage.getItem(MAP[col].key)); } catch (e) {}
        const unido = fusionar(col, enNube, enLocal);
        localStorage.setItem(MAP[col].key, JSON.stringify(unido));
        alguno = true;
        // si el navegador tenía algo que la nube no, lo subo para que se empareje
        if (JSON.stringify(unido) !== JSON.stringify(enNube || (MAP[col].tipo === "lista" ? [] : {}))) subir(col);
      });
      estado.sincronizado = true;
      return alguno;
    } catch (e) {
      estado.error = e.message;
      return false;                                    // seguimos con lo local
    }
  }

  /* Cuando algo cambia en el navegador, lo subo. No espero la respuesta:
     si falla, el dato ya quedó guardado localmente. */
  function subir(col) {
    if (!ON || !MAP[col]) return;
    let valor;
    try { valor = JSON.parse(localStorage.getItem(MAP[col].key) || (MAP[col].tipo === "lista" ? "[]" : "{}")); }
    catch (e) { return; }
    escribir(col, valor).catch(e => { estado.error = e.message; });
  }

  window.GS_CLOUD = { activo: ON, estado, bajar, subir };
})();
