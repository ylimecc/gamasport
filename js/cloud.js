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

  /* Al abrir la página: traigo lo que haya en la nube y actualizo el navegador.
     Devuelve true si logró sincronizar. */
  async function bajar() {
    if (!ON) return false;
    try {
      const cols = Object.keys(MAP);
      const datos = await Promise.all(cols.map(c => leer(c).catch(() => undefined)));
      let alguno = false;
      datos.forEach((valor, i) => {
        if (valor === undefined || valor === null) return;
        localStorage.setItem(MAP[cols[i]].key, JSON.stringify(valor));
        alguno = true;
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
