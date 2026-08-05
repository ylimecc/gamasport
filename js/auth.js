/* Cuentas de GamaSport, contra Firebase Authentication por su API REST.

   Antes las cuentas vivían en el navegador y la contraseña se guardaba con una
   codificación casera. Ahora la contraseña nunca sale del formulario: viaja
   cifrada a Firebase, que es quien la guarda y la verifica. El sitio solo
   conserva un "refresh token", que sirve para seguir con la sesión abierta y
   no revela la contraseña.

   Quien reserva sin crear cuenta entra como invitado (sesión anónima). Si más
   tarde se registra desde el mismo navegador, su invitado se convierte en
   cuenta con correo y conserva el mismo identificador, así no pierde las
   reservas que ya hizo.

   Sin dependencias: todo se habla con fetch, igual que el resto del sitio. */
(function () {
  "use strict";

  const CFG      = window.GS_FIREBASE || {};
  const KEY      = CFG.apiKey || "";
  const CUENTAS  = "https://identitytoolkit.googleapis.com/v1/accounts:";
  const REFRESCO = "https://securetoken.googleapis.com/v1/token?key=" + KEY;
  const GUARDADO = "gs_sesion_v2";
  const TIMEOUT  = 8000;

  // lo que sabemos de quien está usando el sitio ahora mismo
  let sesion  = null;   // { uid, email, nombre, anonimo, refreshToken }
  let idToken = "";     // credencial corta que se manda a Firestore
  let vence   = 0;      // en qué momento deja de servir el idToken

  /* Firebase contesta los errores con nombres en mayúsculas; aquí los paso a
     algo que el cliente pueda entender. */
  const MENSAJES = {
    EMAIL_EXISTS:              "Ya existe una cuenta con ese correo.",
    EMAIL_NOT_FOUND:           "No hay ninguna cuenta con ese correo.",
    INVALID_PASSWORD:          "Correo o contraseña incorrectos.",
    INVALID_LOGIN_CREDENTIALS: "Correo o contraseña incorrectos.",
    INVALID_EMAIL:             "El correo no es válido.",
    WEAK_PASSWORD:             "La contraseña debe tener al menos 6 caracteres.",
    MISSING_PASSWORD:          "Escribe tu contraseña.",
    USER_DISABLED:             "Esta cuenta está deshabilitada.",
    TOO_MANY_ATTEMPTS_TRY_LATER:    "Demasiados intentos. Espera un momento y vuelve a probar.",
    CREDENTIAL_TOO_OLD_LOGIN_AGAIN: "Por seguridad, vuelve a iniciar sesión para hacer este cambio.",
    // estos tres solo salen si falta configurar algo en la consola de Firebase
    CONFIGURATION_NOT_FOUND:   "El acceso con cuenta todavía no está habilitado en Firebase.",
    OPERATION_NOT_ALLOWED:     "El acceso con correo y contraseña no está habilitado en Firebase.",
    ADMIN_ONLY_OPERATION:      "El acceso de invitado no está habilitado en Firebase."
  };

  function traducir(texto) {
    const codigo = String(texto || "").split(" ")[0];   // "WEAK_PASSWORD : Password should be..."
    return MENSAJES[codigo] || "No se pudo completar la operación. Revisa tu conexión e intenta de nuevo.";
  }

  function conTiempoLimite(promesa, ms) {
    return Promise.race([
      promesa,
      new Promise((_, rechazar) => setTimeout(() => rechazar(new Error("tiempo agotado")), ms))
    ]);
  }

  async function llamar(metodo, cuerpo) {
    if (!KEY) throw new Error("Firebase no está configurado.");
    const r = await conTiempoLimite(fetch(CUENTAS + metodo + "?key=" + KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo)
    }), TIMEOUT);
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      const e = new Error(traducir(d.error && d.error.message));
      e.crudo = (d.error && d.error.message) || "";
      throw e;
    }
    return d;
  }

  /* Guardo lo mínimo para seguir con la sesión abierta la próxima vez.
     El idToken no se guarda: dura una hora y se vuelve a pedir al arrancar. */
  function guardar() {
    if (!sesion) { localStorage.removeItem(GUARDADO); return; }
    localStorage.setItem(GUARDADO, JSON.stringify({
      uid: sesion.uid, email: sesion.email, nombre: sesion.nombre,
      anonimo: sesion.anonimo, refreshToken: sesion.refreshToken
    }));
  }

  function aplicar(d, extra) {
    idToken = d.idToken || d.id_token || "";
    vence   = Date.now() + (Number(d.expiresIn || d.expires_in || 3600) * 1000);
    sesion  = Object.assign({
      uid:          d.localId || d.user_id || (sesion && sesion.uid),
      email:        (d.email || (sesion && sesion.email) || "").toLowerCase(),
      nombre:       d.displayName || (sesion && sesion.nombre) || "",
      anonimo:      !(d.email || (sesion && sesion.email)),
      refreshToken: d.refreshToken || d.refresh_token || (sesion && sesion.refreshToken)
    }, extra || {});
    guardar();
    document.dispatchEvent(new Event("sesion:change"));
    return sesion;
  }

  // cambia el refresh token guardado por un idToken nuevo
  async function refrescar(refreshToken) {
    const r = await conTiempoLimite(fetch(REFRESCO, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=refresh_token&refresh_token=" + encodeURIComponent(refreshToken)
    }), TIMEOUT);
    if (!r.ok) throw new Error("sesión vencida");
    return r.json();
  }

  /* Al abrir cualquier página: si había sesión guardada, la reanudo. Si el
     refresh token ya no sirve (contraseña cambiada, cuenta borrada), la olvido
     en silencio y el visitante sigue como si nada. */
  async function iniciar() {
    let previa = null;
    try { previa = JSON.parse(localStorage.getItem(GUARDADO)); } catch (e) {}
    if (!previa || !previa.refreshToken || !KEY) return null;
    try {
      const d = await refrescar(previa.refreshToken);
      return aplicar(d, { nombre: previa.nombre, email: previa.email, anonimo: previa.anonimo });
    } catch (e) {
      sesion = null; idToken = ""; guardar();
      return null;
    }
  }

  /* Devuelve un idToken que todavía sirva. Lo llama la capa de datos antes de
     cada petición a Firestore. */
  async function token() {
    if (!sesion) return "";
    if (idToken && Date.now() < vence - 120000) return idToken;
    try {
      const d = await refrescar(sesion.refreshToken);
      aplicar(d, { nombre: sesion.nombre, email: sesion.email, anonimo: sesion.anonimo });
      return idToken;
    } catch (e) {
      sesion = null; idToken = ""; guardar();
      return "";
    }
  }

  /* Sesión de invitado: quien reserva sin registrarse igual necesita una
     identidad, para que Firestore sepa de quién es el pedido. */
  async function invitado() {
    if (sesion) return sesion;
    const d = await llamar("signUp", { returnSecureToken: true });
    return aplicar(d, { nombre: "", email: "", anonimo: true });
  }

  async function ponerNombre(nombre) {
    if (!nombre) return;
    const t = await token();
    if (!t) return;
    const d = await llamar("update", { idToken: t, displayName: nombre, returnSecureToken: true });
    aplicar(d, { nombre: nombre });
  }

  /* Crear cuenta. Si quien está reservando entró como invitado, en vez de abrir
     otra cuenta le agrego correo y contraseña a la que ya tiene: conserva su
     identificador y con él sus reservas. */
  async function registrar(nombre, email, pass) {
    email  = (email || "").trim().toLowerCase();
    nombre = (nombre || "").trim();
    if (nombre.length < 3) return "Escribe tu nombre completo.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "El correo no es válido.";
    if ((pass || "").length < 6) return "La contraseña debe tener al menos 6 caracteres.";
    try {
      if (sesion && sesion.anonimo) {
        const t = await token();
        const d = await llamar("update", { idToken: t, email: email, password: pass, returnSecureToken: true });
        aplicar(d, { email: email, anonimo: false });
      } else {
        const d = await llamar("signUp", { email: email, password: pass, returnSecureToken: true });
        aplicar(d, { email: email, anonimo: false });
      }
      await ponerNombre(nombre);
      return null;
    } catch (e) {
      return e.message;
    }
  }

  async function entrar(email, pass) {
    email = (email || "").trim().toLowerCase();
    if (!email || !pass) return "Escribe tu correo y tu contraseña.";
    try {
      const d = await llamar("signInWithPassword", { email: email, password: pass, returnSecureToken: true });
      aplicar(d, { email: email, anonimo: false, nombre: d.displayName || "" });
      return null;
    } catch (e) {
      return e.message;
    }
  }

  /* Recuperar la contraseña: Firebase manda el correo con el enlace. Ya no se
     puede cambiar la clave de otra persona con solo saber su correo, que era el
     agujero de la versión anterior. */
  async function recuperar(email) {
    email = (email || "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "El correo no es válido.";
    try {
      await llamar("sendOobCode", { requestType: "PASSWORD_RESET", email: email });
      return null;
    } catch (e) {
      // no confirmo si el correo existe o no: eso ayudaría a adivinar cuentas
      if (e.crudo && e.crudo.indexOf("EMAIL_NOT_FOUND") === 0) return null;
      return e.message;
    }
  }

  function salir() {
    sesion = null; idToken = ""; vence = 0;
    guardar();
    document.dispatchEvent(new Event("sesion:change"));
  }

  window.GS_AUTH = {
    configurado: !!KEY,
    iniciar, token, invitado, registrar, entrar, recuperar, salir, ponerNombre,
    sesion:  () => sesion,
    uid:     () => (sesion ? sesion.uid : ""),
    entrado: () => !!(sesion && !sesion.anonimo)
  };
})();
