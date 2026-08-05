/* La lógica del sitio: el carrito y lo que se dibuja en cada página lo manejo desde aquí */
(function () {
  "use strict";

  const { CONFIG, CATEGORIES, PRODUCTS, PROMOS, catName, getProduct } = window.GS_DATA;
  const { icon, productArt, mapArt, LOGO } = window.GS_ASSETS;

  /* atajos que uso en todo el archivo para no repetir tanto */
  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const money = (n) => CONFIG.currency + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const param = (k) => new URLSearchParams(location.search).get(k);
  const esc = (s) => String(s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));

  const COUPONS = { "GAMA10": 0.10, "EQUIPO15": 0.15, "SEMANA15": 0.15 };

  // sube a la nube lo que acabo de guardar; si no hay nube configurada, no hace nada
  function nube(col) { if (window.GS_CLOUD && window.GS_CLOUD.activo) window.GS_CLOUD.subir(col); }

  function waLink(msg) {
    const text = encodeURIComponent(msg || `¡Hola ${CONFIG.name}! Quisiera información para reservar.`);
    return `https://wa.me/${CONFIG.whatsapp}?text=${text}`;
  }

  // arma un mailto con el resumen del pedido, para mandarlo por correo
  function mailtoOrder(o) {
    const items = o.items.map(i => `- ${i.name} x${i.qty} (${money(i.lineTotal)})`).join("\n");
    const body = `Hola GamaSport,\n\nConfirmo mi pedido ${o.number}.\nFecha de reserva: ${o.reserva.fecha} a las ${o.reserva.hora}.\nA nombre de: ${o.customer.nombre}\n\nServicios:\n${items}\n\nTotal: ${money(o.totals.total)} (${o.payment})\n\nSaludos.`;
    return `mailto:${CONFIG.email}?subject=${encodeURIComponent("Pedido " + o.number + " - " + o.customer.nombre)}&body=${encodeURIComponent(body)}`;
  }

  /* El carrito. Lo guardo en el localStorage para que no se pierda al recargar la página */
  const Cart = {
    KEY: "gs_cart_v1",
    get() { try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch (e) { return []; } },
    save(items) { localStorage.setItem(this.KEY, JSON.stringify(items)); document.dispatchEvent(new Event("cart:change")); },
    // nunca dejo pasar de los cupos que tiene el servicio
    tope(id) {
      const p = getProduct(id);
      const cupos = p && p.stock != null ? p.stock : 50;
      return Math.max(1, Math.min(50, cupos));
    },
    add(id, qty) {
      qty = Math.max(1, parseInt(qty || 1, 10));
      const items = this.get();
      const row = items.find(i => i.id === id);
      const tope = this.tope(id);
      if (row) row.qty = Math.min(tope, row.qty + qty); else items.push({ id, qty: Math.min(tope, qty) });
      this.save(items);
    },
    setQty(id, qty) {
      qty = parseInt(qty, 10);
      let items = this.get();
      if (!qty || qty < 1) items = items.filter(i => i.id !== id);
      else { const row = items.find(i => i.id === id); if (row) row.qty = Math.min(this.tope(id), qty); }
      this.save(items);
    },
    remove(id) { this.save(this.get().filter(i => i.id !== id)); },
    clear() { this.save([]); localStorage.removeItem("gs_coupon"); },
    count() { return this.get().reduce((s, i) => s + i.qty, 0); },
    lines() {
      return this.get().map(i => {
        const p = getProduct(i.id);
        if (!p) return null;
        return { ...p, qty: i.qty, lineTotal: p.price * i.qty };
      }).filter(Boolean);
    },
    coupon() { return localStorage.getItem("gs_coupon") || ""; },
    applyCoupon(code) {
      code = (code || "").trim().toUpperCase();
      if (COUPONS[code] != null) { localStorage.setItem("gs_coupon", code); return true; }
      return false;
    },
    clearCoupon() { localStorage.removeItem("gs_coupon"); },
    totals() {
      const subtotal = this.lines().reduce((s, l) => s + l.lineTotal, 0);
      const code = this.coupon();
      const rate = COUPONS[code] || 0;
      const discount = +(subtotal * rate).toFixed(2);
      const taxBase = subtotal - discount;
      const isv = +(taxBase * CONFIG.isvRate).toFixed(2);
      const total = +(taxBase + isv).toFixed(2);
      return { subtotal, discount, code, rate, isv, total };
    }
  };

  /* Cuentas de usuario. Para la demo las guardo en el localStorage;
     el siguiente paso natural sería moverlas a Firebase Authentication. */
  const Auth = {
    UKEY: "gs_users_v1",
    SKEY: "gs_session_v1",
    // codificación simple para no guardar la clave tal cual (es una demo, no producción)
    code(s) { let h = 7; for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; } return "u" + h.toString(16); },
    users() { try { return JSON.parse(localStorage.getItem(this.UKEY)) || []; } catch (e) { return []; } },
    saveUsers(list) { localStorage.setItem(this.UKEY, JSON.stringify(list)); nube("users"); },
    find(email) { return this.users().find(u => u.email === (email || "").trim().toLowerCase()) || null; },
    register(nombre, email, pass) {
      email = (email || "").trim().toLowerCase();
      if (nombre.trim().length < 3) return "Escribe tu nombre completo.";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "El correo no es válido.";
      if (pass.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
      if (this.find(email)) return "Ya existe una cuenta con ese correo.";
      const list = this.users();
      list.push({ nombre: nombre.trim(), email, pass: this.code(pass), creado: new Date().toISOString() });
      this.saveUsers(list);
      this.setSession(email);
      return null;
    },
    login(email, pass) {
      const u = this.find(email);
      if (!u || u.pass !== this.code(pass)) return "Correo o contraseña incorrectos.";
      this.setSession(u.email);
      return null;
    },
    reset(email, pass) {
      const u = this.find(email);
      if (!u) return "No hay ninguna cuenta con ese correo.";
      if (pass.length < 6) return "La contraseña nueva debe tener al menos 6 caracteres.";
      u.pass = this.code(pass);
      this.saveUsers(this.users().map(x => x.email === u.email ? u : x));
      return null;
    },
    setSession(email) { localStorage.setItem(this.SKEY, email); },
    current() { const e = localStorage.getItem(this.SKEY); return e ? this.find(e) : null; },
    logout() { localStorage.removeItem(this.SKEY); }
  };

  /* Historial de reservas. Cada pedido confirmado se agrega a la lista
     para poder verlo en Mi cuenta y en el panel administrativo. */
  const Orders = {
    KEY: "gs_orders_v1",
    all() { try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch (e) { return []; } },
    add(order) { const l = this.all(); l.unshift(order); localStorage.setItem(this.KEY, JSON.stringify(l)); nube("orders"); },
    setStatus(number, estado) {
      const l = this.all().map(o => o.number === number ? { ...o, estado } : o);
      localStorage.setItem(this.KEY, JSON.stringify(l));
      nube("orders");
    },
    byEmail(email) { return this.all().filter(o => o.customer && o.customer.email === email); }
  };

  /* Inventario. El administrador puede cambiar precio, cupos disponibles y si el
     servicio se muestra o no; esos cambios se guardan aparte y se aplican encima
     de la lista base de products.js, así el catálogo original nunca se pierde. */
  const Inventory = {
    KEY: "gs_inv_v1",
    all() { try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; } catch (e) { return {}; } },
    set(id, patch) {
      const o = this.all();
      o[id] = Object.assign({}, o[id] || {}, patch);
      localStorage.setItem(this.KEY, JSON.stringify(o));
      applyInventory(); nube("inventory");
    },
    reset() { localStorage.removeItem(this.KEY); applyInventory(); nube("inventory"); }
  };

  function applyInventory() {
    const o = Inventory.all();
    PRODUCTS.forEach(p => {
      if (!p._base) p._base = { price: p.price, stock: p.stock };
      const ov = o[p.id] || {};
      p.price  = ov.price != null ? ov.price : p._base.price;
      p.stock  = ov.stock != null ? ov.stock : p._base.stock;
      p.activo = ov.activo != null ? ov.activo : true;
    });
  }

  // texto y color del estado de disponibilidad de un servicio
  function availability(p) {
    if (p.activo === false) return { txt: "No disponible", cls: "no" };
    if (!p.stock)           return { txt: "Agotado",       cls: "no" };
    if (p.stock <= 3)       return { txt: "Últimos " + p.stock, cls: "poco" };
    return { txt: "Disponible", cls: "si" };
  }

  /* Horarios bloqueados por el administrador (mantenimiento, ligas privadas, etc.) */
  const Blocked = {
    KEY: "gs_blocked_v1",
    all() { try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch (e) { return []; } },
    add(fecha, hora) { const l = this.all(); if (!l.find(b => b.fecha === fecha && b.hora === hora)) { l.push({ fecha, hora }); localStorage.setItem(this.KEY, JSON.stringify(l)); nube("blocked"); } },
    remove(fecha, hora) { localStorage.setItem(this.KEY, JSON.stringify(this.all().filter(b => !(b.fecha === fecha && b.hora === hora)))); nube("blocked"); }
  };

  // horas que ya no se pueden reservar en una fecha (reservas hechas aquí + bloqueos del admin)
  function busySlots(fecha) {
    const res = Orders.all().filter(o => o.reserva && o.reserva.fecha === fecha && o.estado !== "cancelada").map(o => o.reserva.hora);
    const blk = Blocked.all().filter(b => b.fecha === fecha).map(b => b.hora);
    return res.concat(blk);
  }

  /* lo que aparece en todas las páginas: el numerito del carrito, el menú y el footer */
  function syncBadges(pulse) {
    const n = Cart.count();
    $$(".cart-badge").forEach(b => {
      b.textContent = n;
      if (pulse) { b.classList.remove("is-pulsing"); void b.offsetWidth; b.classList.add("is-pulsing"); }
    });
  }

  function buildLogo() {
    return `${LOGO}<span class="logo-text">Gama<span>Sport</span></span>`;
  }

  // agarra el HTML y le mete los iconos, los enlaces y los datos del negocio
  function hydrate(scope) {
    scope = scope || document;
    $$(".brand[data-logo]", scope).forEach(el => { if (!el.children.length) el.innerHTML = buildLogo(); });
    $$("[data-wa]", scope).forEach(a => a.href = waLink(a.dataset.wa || ""));
    $$("[data-phone-link]", scope).forEach(a => a.href = "tel:+" + CONFIG.phone);
    $$("[data-mail-link]", scope).forEach(a => a.href = "mailto:" + CONFIG.email);
    $$("[data-maps]", scope).forEach(a => a.href = CONFIG.mapsUrl);
    $$("[data-cfg]", scope).forEach(el => { const v = CONFIG[el.dataset.cfg]; if (v != null) el.textContent = v; });
    $$("[data-social=instagram]", scope).forEach(a => a.href = CONFIG.instagram);
    $$("[data-social=facebook]", scope).forEach(a => a.href = CONFIG.facebook);
    $$("[data-social=tiktok]", scope).forEach(a => a.href = CONFIG.tiktok);
    $$("[data-icon]", scope).forEach(el => { if (!el.children.length) el.innerHTML = icon(el.dataset.icon); });
    $$("[data-year]", scope).forEach(el => el.textContent = new Date().getFullYear());
  }

  /* Meto en el menú los enlaces de Promociones y Mi cuenta desde aquí,
     así no tengo que editar el nav de cada página HTML. */
  function injectNav() {
    const nav = $("#primaryNav");
    if (!nav || nav.querySelector('[data-nav="promos"]')) return;
    const cartLink = nav.querySelector(".nav-cart");
    const promos = document.createElement("a");
    promos.href = "promociones.html"; promos.dataset.nav = "promos"; promos.textContent = "Promociones";
    const about = document.createElement("a");
    about.href = "nosotros.html"; about.dataset.nav = "about"; about.textContent = "Nosotros";
    const account = document.createElement("a");
    const user = Auth.current();
    account.href = "cuenta.html"; account.dataset.nav = "account";
    account.textContent = user ? ("Hola, " + user.nombre.split(" ")[0]) : "Mi cuenta";
    const contact = nav.querySelector('[data-nav="contact"]');
    nav.insertBefore(promos, contact || cartLink);
    nav.insertBefore(about, contact || cartLink);
    nav.insertBefore(account, cartLink);
  }

  /* El boletín del footer también lo inyecto para no repetirlo 12 veces */
  function injectNewsletter() {
    const brand = $(".site-footer .footer-brand");
    if (!brand || $("#newsForm")) return;
    const box = document.createElement("div");
    box.className = "newsletter";
    box.innerHTML = `<h4>Boletín de GamaSport</h4>
      <p>Promociones y torneos en tu correo. Sin spam.</p>
      <form id="newsForm"><input type="email" required placeholder="Tu correo electrónico" aria-label="Correo para el boletín"><button class="btn btn--lime btn--sm" type="submit">Suscribirme</button></form>`;
    brand.appendChild(box);
    $("#newsForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const mail = e.target.querySelector("input").value.trim().toLowerCase();
      let list = [];
      try { list = JSON.parse(localStorage.getItem("gs_news_v1")) || []; } catch (err) {}
      if (!list.includes(mail)) { list.push(mail); localStorage.setItem("gs_news_v1", JSON.stringify(list)); }
      e.target.reset();
      showToast("¡Listo! Te avisaremos de las próximas promociones.");
    });
  }

  /* ============ Asistente de preguntas frecuentes ============
     No es inteligencia artificial: es una lista de preguntas con sus respuestas.
     Lo que escribe el visitante se compara con unas palabras clave y gana la
     respuesta que coincida en más. Si ninguna coincide, lo mando a WhatsApp. */
  function initAsistente() {
    // en el panel del administrador no pinta nada: es una ayuda para el cliente
    if ($("#gsBot") || document.body.dataset.page === "admin") return;

    const sinTildes = (s) => String(s).toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ");

    const enlace = (href, txt) => `<a href="${href}">${txt}</a>`;

    const FAQ = [
      { p: "¿Cuánto cuesta la cancha?",
        claves: "precio precios cuanto cuesta vale valor tarifa costo cobran caro barato",
        r: `La cancha diurna (3:00 a 6:00 PM) cuesta <b>${money(800)} la hora</b> y la nocturna
            (6:00 a 9:00 PM) <b>${money(1000)} la hora</b>. Los torneos, el restaurante y las
            membresías tienen su propio precio. A todo se le suma el ISV del 15 %.
            ${enlace("catalogo.html", "Ver todos los precios")}` },

      { p: "¿Cómo reservo?",
        claves: "reservar reserva reservo apartar agendar separar proceso pasos",
        r: `En cuatro pasos: elige el servicio en el catálogo, agrégalo al carrito, escoge fecha y
            hora (las horas ya ocupadas aparecen deshabilitadas) y confirma con tus datos.
            Al final recibes tu número de reserva. ${enlace("catalogo.html", "Empezar ahora")}` },

      { p: "¿Cuál es el horario?",
        claves: "horario horarios hora abren cierran abierto cierre atienden dias domingo tarde noche",
        r: `Atendemos <b>${CONFIG.hours}</b>. Las canchas se alquilan por hora dentro de ese horario:
            de 3:00 a 6:00 PM es tarifa diurna y de 6:00 a 9:00 PM nocturna.` },

      { p: "¿Dónde están ubicados?",
        claves: "donde ubicacion ubicados direccion llegar llego llegamos quedan lugar mapa zona sucursal",
        r: `Estamos en ${CONFIG.address}, ${CONFIG.city}.
            ${enlace(CONFIG.mapsUrl, "Abrir en Google Maps")}` },

      { p: "¿Tienen promociones?",
        claves: "promocion promociones cupon cupones descuento descuentos oferta ofertas codigo rebaja",
        r: `Sí: <b>GAMA10</b> (10 %), <b>EQUIPO15</b> (15 %) y <b>SEMANA15</b> (15 %). El código se
            escribe en el carrito, antes de pagar. ${enlace("promociones.html", "Ver promociones")}` },

      { p: "¿Cómo puedo pagar?",
        claves: "pago pagar pagos tarjeta paypal efectivo tigo money transferencia deposito",
        r: `Puedes pagar con tarjeta de crédito o débito, PayPal, Tigo Money, o en efectivo al llegar
            a la cancha. El pago en línea viaja cifrado con HTTPS.` },

      { p: "¿Puedo cancelar mi reserva?",
        claves: "cancelar cancelacion cancelo reembolso devolucion reprogramar cambiar fecha mover",
        r: `Si cancelas con <b>más de 24 horas</b> de anticipación, te devolvemos el total o
            reprogramamos sin costo. ${enlace("terminos.html#cancelaciones", "Ver la política completa")}` },

      { p: "¿Organizan torneos?",
        claves: "torneo torneos liga ligas evento eventos campeonato relampago equipos inscripcion",
        r: `Sí. Organizamos torneos relámpago y ligas. La inscripción es por equipo e incluye tres
            partidos garantizados. ${enlace("catalogo.html?cat=torneos", "Ver torneos y eventos")}` },

      { p: "¿Tienen restaurante?",
        claves: "restaurante comida comer boquitas bebidas hamburguesa nachos cerveza tercer tiempo",
        r: `Sí, el restaurante está en el mismo centro. Puedes agregar boquitas y bebidas a tu reserva
            para tenerlas listas al terminar el partido.
            ${enlace("catalogo.html?cat=restaurante", "Ver el menú")}` },

      { p: "¿Dónde veo mis reservas?",
        claves: "mis reservas historial cuenta perfil pedido pedidos sesion entrar registrarme",
        r: `En <b>Mi cuenta</b>, con el mismo correo que usaste al reservar. Ahí aparece el historial
            con el estado de cada reserva. ${enlace("cuenta.html", "Ir a Mi cuenta")}` },

      { p: "¿Hay membresías?",
        claves: "membresia membresias mensualidad plan planes socio suscripcion equipo fijo",
        r: `Sí, hay planes para equipos que juegan seguido, con horario preferente y descuento.
            ${enlace("catalogo.html?cat=extras", "Ver membresías y extras")}` },

      { p: "¿Hay parqueo?",
        claves: "parqueo estacionamiento carro vehiculo seguro dejar",
        r: `Sí, el parqueo privado está incluido y no tiene costo adicional.` },

      { p: "¿Cuántos jugadores caben?",
        claves: "jugadores cuantos personas capacidad caben equipo grama cancha tamano",
        r: `Es una cancha de fútbol 5 con grama sintética, pensada para <b>10 a 12 jugadores</b>.
            Tenemos dos canchas disponibles.` },

      { p: "Quiero hablar con alguien",
        claves: "hablar persona humano asesor alguien atencion telefono llamar whatsapp contacto ayuda",
        r: `Con gusto. Escríbenos por WhatsApp al <b>${CONFIG.phoneDisplay}</b> y te responde alguien
            del equipo. ${enlace(waLink("¡Hola GamaSport! Tengo una consulta."), "Abrir WhatsApp")}` }
    ];

    const NO_ENTENDI = `Esa no la tengo respondida todavía. Escríbenos por WhatsApp y te contesta
      alguien del equipo: ${enlace(waLink("¡Hola GamaSport! Tengo una consulta."), "abrir WhatsApp")},
      o déjanos tu mensaje en ${enlace("contacto.html", "la página de contacto")}.`;

    /* Gana la pregunta que comparta más palabras con lo que escribieron. Las palabras
       largas pesan más que las cortas, porque "cancelar" dice mucho más que "como";
       si no, en "quiero cancelar mi reserva" ganaba la respuesta de cómo reservar. */
    function buscar(texto) {
      const palabras = sinTildes(texto).split(/\s+/).filter(w => w.length > 2);
      if (!palabras.length) return null;
      let mejor = null, top = 0;
      FAQ.forEach(f => {
        const claves = f.claves.split(" ");
        const puntos = palabras.reduce((n, w) => {
          const c = claves.find(k => k.startsWith(w) || w.startsWith(k));
          return n + (c ? Math.max(w.length, c.length) + (c === w ? 2 : 0) : 0);
        }, 0);
        if (puntos > top) { top = puntos; mejor = f; }
      });
      return top ? mejor : null;
    }

    const burbuja = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.9 8.9 0 0 1-3.8-.8L3 21l1.9-5A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z"/>
      </svg>`;

    const wrap = document.createElement("div");
    wrap.id = "gsBot";
    wrap.innerHTML = `
      <button class="bot-fab" id="botFab" aria-expanded="false" aria-controls="botPanel"
        aria-label="Abrir el asistente de preguntas frecuentes">${burbuja}</button>
      <section class="bot-panel" id="botPanel" role="dialog" aria-label="Asistente GamaSport" hidden>
        <header class="bot-head">
          <div><strong>Asistente GamaSport</strong><span>Preguntas frecuentes</span></div>
          <button class="bot-x" id="botClose" aria-label="Cerrar el asistente">&times;</button>
        </header>
        <div class="bot-body" id="botBody" aria-live="polite"></div>
        <div class="bot-chips" id="botChips"></div>
        <a class="bot-wa" id="botWa" target="_blank" rel="noopener">${icon("whatsapp")} Escribir por WhatsApp</a>
        <form class="bot-form" id="botForm">
          <input id="botInput" type="text" autocomplete="off" placeholder="Escribe tu pregunta...">
          <button class="btn btn--primary btn--sm" type="submit">Enviar</button>
        </form>
      </section>`;
    document.body.appendChild(wrap);

    const panel = $("#botPanel"), body = $("#botBody"), chips = $("#botChips"), fab = $("#botFab");
    $("#botWa").href = waLink("¡Hola GamaSport! Quiero reservar una cancha.");

    function decir(texto, quien) {
      const b = document.createElement("div");
      b.className = "bot-msg " + (quien === "yo" ? "mine" : "bot");
      b.innerHTML = texto;
      body.appendChild(b);
      body.scrollTop = body.scrollHeight;
    }

    function pintarChips() {
      chips.innerHTML = FAQ.slice(0, 6)
        .map((f, i) => `<button type="button" data-faq="${i}">${esc(f.p)}</button>`).join("");
    }

    function responder(f, pregunta) {
      decir(esc(pregunta), "yo");
      setTimeout(() => decir(f ? f.r : NO_ENTENDI, "bot"), 260);
    }

    decir(`¡Hola! Puedo ayudarte con precios, horarios, reservas y promociones.
      Elige una pregunta o escríbeme la tuya.`, "bot");
    pintarChips();

    function abrir(si) {
      panel.hidden = !si;
      fab.setAttribute("aria-expanded", si ? "true" : "false");
      wrap.classList.toggle("open", si);
      if (si) setTimeout(() => $("#botInput").focus(), 80);
    }
    fab.addEventListener("click", () => abrir(panel.hidden));
    $("#botClose").addEventListener("click", () => { abrir(false); fab.focus(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) abrir(false); });

    chips.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-faq]");
      if (!b) return;
      const f = FAQ[+b.dataset.faq];
      responder(f, f.p);
    });

    $("#botForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const inp = $("#botInput"), txt = inp.value.trim();
      if (!txt) return;
      inp.value = "";
      responder(buscar(txt), txt);
    });
  }

  function initLayout() {
    applyInventory();
    hydrate(document);
    injectNav();
    injectNewsletter();
    // le pongo "active" al enlace de la página en la que estoy parado
    const page = document.body.dataset.page;
    $$(".primary-nav > a[data-nav]").forEach(a => { if (a.dataset.nav === page) a.classList.add("active"); });
    // el menú hamburguesa del celular
    const toggle = $("#navToggle"), nav = $("#primaryNav");
    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      $$("a", nav).forEach(a => a.addEventListener("click", () => {
        nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false");
      }));
    }
    syncBadges(false);
    document.addEventListener("cart:change", () => syncBadges(true));
    revealOnScroll();
    initAsistente();
  }

  function revealOnScroll() {
    const els = $$(".reveal");
    if (!els.length || !("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(e => io.observe(e));
  }

  /* el mensajito que sale abajo cuando agrego algo al carrito */
  let toastWrap;
  function showToast(msg, linkText, linkHref) {
    if (!toastWrap) { toastWrap = document.createElement("div"); toastWrap.className = "toast-wrap"; document.body.appendChild(toastWrap); }
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<span class="t-ic">${icon("check")}</span><span class="t-msg">${esc(msg)}</span>` +
      (linkText ? `<a href="${linkHref}">${esc(linkText)}</a>` : "");
    toastWrap.appendChild(t);
    setTimeout(() => { t.classList.add("leaving"); setTimeout(() => t.remove(), 260); }, 3200);
  }

  /* si el producto tiene foto uso la foto; si no, pongo el dibujo SVG */
  function productMedia(p, eager) {
    if (p.img) {
      return `<img src="${p.img}" alt="${esc(p.name)}" loading="${eager ? "eager" : "lazy"}" decoding="async">`;
    }
    return productArt(p.art);
  }

  /* Pedazos de HTML que repito en varias páginas (tarjetas, control de cantidad) */
  function productCard(p) {
    const old = p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span>` : "";
    const av = availability(p);
    return `<article class="product-card reveal">
      <div class="product-thumb">
        <a href="producto.html?id=${p.id}" aria-label="${esc(p.name)}">${productMedia(p)}</a>
        ${p.tag ? `<span class="product-tag ${p.popular ? "is-pop" : ""}">${esc(p.tag)}</span>` : ""}
      </div>
      <div class="product-body">
        <span class="product-cat">${esc(catName(p.cat))}</span>
        <h3><a href="producto.html?id=${p.id}">${esc(p.name)}</a></h3>
        <p class="product-desc">${esc(p.short)}</p>
        <div class="stock-line"><span class="stock-dot ${av.cls}"></span>${esc(av.txt)}</div>
        <div class="product-foot">
          <div class="price">${old}<span class="now">${money(p.price)} <span class="unit">${esc(p.unit)}</span></span></div>
          ${av.cls === "no"
            ? `<button class="btn btn--ghost btn--sm" disabled>Sin cupos</button>`
            : `<button class="btn btn--primary btn--sm" data-add="${p.id}">${icon("plus")} Agregar</button>`}
        </div>
      </div>
    </article>`;
  }

  function qtyControl(value, id, max) {
    const tope = Math.max(1, Math.min(50, max == null ? 50 : max));
    return `<div class="qty" data-qty data-max="${tope}">
      <button type="button" data-step="-1" aria-label="Disminuir">−</button>
      <input type="number" min="1" max="${tope}" value="${value}" aria-label="Cantidad" ${id ? `data-id="${id}"` : ""}>
      <button type="button" data-step="1" aria-label="Aumentar">+</button>
    </div>`;
  }

  function wireQty(scope, onChange) {
    $$("[data-qty]", scope).forEach(box => {
      const input = $("input", box);
      const tope = parseInt(box.dataset.max, 10) || 50;
      $$("button", box).forEach(btn => btn.addEventListener("click", () => {
        let v = parseInt(input.value, 10) || 1;
        v = Math.min(tope, Math.max(1, v + parseInt(btn.dataset.step, 10)));
        input.value = v; onChange && onChange(v, input);
      }));
      input.addEventListener("change", () => {
        let v = parseInt(input.value, 10) || 1; v = Math.min(tope, Math.max(1, v));
        input.value = v; onChange && onChange(v, input);
      });
    });
  }

  // un solo "escuchador" para todos los botones Agregar, en vez de uno por botón
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const p = getProduct(btn.dataset.add);
    if (!p) return;
    if (p.activo === false || !p.stock) { showToast("Ese servicio no tiene cupos disponibles."); return; }
    const yaEnCarrito = (Cart.get().find(i => i.id === p.id) || {}).qty || 0;
    if (yaEnCarrito >= Cart.tope(p.id)) { showToast(`Solo quedan ${p.stock} cupos de este servicio.`); return; }
    const qtyInput = btn.closest("[data-add-scope]") && $("[data-qty] input", btn.closest("[data-add-scope]"));
    Cart.add(p.id, qtyInput ? qtyInput.value : 1);
    showToast(`${p.name} agregado al carrito`, "Ver carrito →", "carrito.html");
  });

  /* inicio (home) */
  function initHome() {
    const grid = $("#featuredGrid");
    if (grid) {
      const featured = PRODUCTS.filter(p => p.popular).concat(PRODUCTS.filter(p => !p.popular)).slice(0, 6);
      grid.innerHTML = featured.map(productCard).join("");
      revealOnScroll();
    }
    /* Carrusel del hero. Cada foto va con su servicio, así la tarjeta de abajo
       (nombre, precio y botón) siempre corresponde a la foto que se está viendo.
       La primera que se muestra depende de la hora: diurna de 3 a 6, nocturna de 6 a 9. */
    const quick = $("#heroQuick");
    const heroImg = $("#heroPitchImg");
    const pitch = heroImg && heroImg.closest(".pitch");
    if (quick && heroImg) {
      const h = new Date().getHours();
      const daytime = h >= 15 && h < 18;        // 3:00 a 5:59 PM
      const open = h >= 15 && h < 21;           // horario del negocio: 3:00 a 9:00 PM
      const badge = $("#heroBadge");
      if (badge) badge.textContent = open ? "Disponible ahora" : "Reserva para hoy";

      const slides = [
        { id: "GS-102", src: "img/cancha-nocturna.jpg", alt: "Cancha de fútbol 5 con iluminación nocturna", sub: "Iluminación LED · 6 a 9 PM" },
        { id: "GS-101", src: "img/cancha-diurna.jpg",   alt: "Cancha de fútbol 5 en horario diurno",        sub: "Grama sintética · 3 a 6 PM" },
        { id: "GS-201", src: "img/torneo.jpg",          alt: "Torneo relámpago de fútbol 5 en GamaSport",   sub: "Por equipo · 3 partidos garantizados" },
        { id: "GS-301", src: "img/combo.jpg",           alt: "Combo del restaurante de GamaSport",          sub: "Del restaurante · para después del partido" }
      ];
      let idx = daytime ? 1 : 0;

      function render(i) {
        idx = (i + slides.length) % slides.length;
        const s = slides[idx];
        const p = getProduct(s.id);
        if (!p) return;
        heroImg.src = s.src; heroImg.alt = s.alt;
        quick.innerHTML = `
          <div class="quick-row"><div><div class="q-name">${esc(p.name)}</div><div class="q-sub">${esc(s.sub)}</div></div><div class="q-price">${money(p.price)}</div></div>
          <a class="btn btn--primary btn--block" href="producto.html?id=${p.id}">Reservar ahora ${icon("arrow")}</a>`;
        if (dots) Array.from(dots.children).forEach((d, n) => d.classList.toggle("on", n === idx));
      }

      // los puntitos para cambiar de foto a mano
      let dots = null, timer = null;
      if (pitch) {
        dots = document.createElement("div");
        dots.className = "carousel-dots";
        slides.forEach((s, i) => {
          const b = document.createElement("button");
          b.type = "button";
          b.setAttribute("aria-label", "Ver " + s.alt);
          b.addEventListener("click", () => { render(i); restart(); });
          dots.appendChild(b);
        });
        pitch.insertAdjacentElement("afterend", dots);
      }
      function restart() { clearInterval(timer); timer = setInterval(() => render(idx + 1), 6000); }
      render(idx);
      restart();
      if (pitch) {
        pitch.addEventListener("pointerenter", () => clearInterval(timer));
        pitch.addEventListener("pointerleave", restart);
      }
    }

    // franja de promociones destacadas (los datos viven en products.js)
    const strip = $("#promoStrip");
    if (strip && PROMOS && PROMOS.length) {
      strip.innerHTML = PROMOS.slice(0, 3).map(pr => `
        <a class="promo-card reveal" href="promociones.html">
          <span class="promo-off">-${pr.off}%</span>
          <div><h3>${esc(pr.title)}</h3><p>${esc(pr.desc)}</p>
          <span class="promo-code">Cupón: ${esc(pr.code)}</span></div>
        </a>`).join("");
      revealOnScroll();
    }
  }

  /* catálogo: filtros y buscador */
  function initCatalog() {
    const grid = $("#catalogGrid");
    if (!grid) return;
    const filterBox = $("#filterList");
    const resultCount = $("#resultCount");
    const search = $("#searchInput");
    let activeCat = param("cat") || "all";
    let query = "";

    function counts() {
      const m = { all: PRODUCTS.length };
      CATEGORIES.forEach(c => m[c.key] = PRODUCTS.filter(p => p.cat === c.key).length);
      return m;
    }
    function renderFilters() {
      const c = counts();
      const items = [{ key: "all", name: "Todos los servicios" }].concat(CATEGORIES);
      filterBox.innerHTML = items.map(it =>
        `<button class="filter-btn ${it.key === activeCat ? "active" : ""}" data-cat="${it.key}">
           <span>${esc(it.name)}</span><span class="count">${c[it.key]}</span></button>`).join("");
      $$(".filter-btn", filterBox).forEach(b => b.addEventListener("click", () => {
        activeCat = b.dataset.cat; renderFilters(); render();
        const fl = $("#filterList").closest(".filters"); if (fl) fl.classList.remove("show");
      }));
    }
    function render() {
      let list = PRODUCTS.slice();
      if (activeCat !== "all") list = list.filter(p => p.cat === activeCat);
      if (query) {
        const q = query.toLowerCase();
        list = list.filter(p => (p.name + " " + p.short + " " + catName(p.cat)).toLowerCase().includes(q));
      }
      grid.innerHTML = list.length
        ? list.map(productCard).join("")
        : `<div class="empty-state">${icon("search")}<h3>Sin resultados</h3><p>No encontramos servicios para tu búsqueda.</p></div>`;
      if (resultCount) resultCount.textContent = `${list.length} ${list.length === 1 ? "servicio" : "servicios"}`;
      revealOnScroll();
    }
    renderFilters(); render();
    if (search) search.addEventListener("input", () => { query = search.value; render(); });
    const fToggle = $("#filterToggle");
    if (fToggle) fToggle.addEventListener("click", () => $(".filters").classList.toggle("show"));
  }

  /* detalle de un producto */
  function initProduct() {
    const root = $("#productRoot");
    if (!root) return;
    const p = getProduct(param("id"));
    if (!p) {
      root.innerHTML = `<div class="empty-state">${icon("info")}<h3>Producto no encontrado</h3>
        <p>El servicio que buscas no existe o fue movido.</p>
        <a class="btn btn--primary" href="catalogo.html" style="margin-top:16px">Ver catálogo</a></div>`;
      return;
    }
    document.title = `${p.name} - GamaSport`;
    const old = p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span>` : "";
    root.innerHTML = `
      <nav class="breadcrumb" aria-label="Ruta">
        <a href="index.html">Inicio</a> ${icon("arrowR")}
        <a href="catalogo.html?cat=${p.cat}">${esc(catName(p.cat))}</a> ${icon("arrowR")}
        <span>${esc(p.name)}</span>
      </nav>
      <div class="pd-layout" data-add-scope>
        <div class="pd-media">${productMedia(p, true)}${p.tag ? `<span class="product-tag ${p.popular ? "is-pop" : ""}" style="position:absolute;top:16px;left:16px">${esc(p.tag)}</span>` : ""}</div>
        <div class="pd-info">
          <span class="product-cat">${esc(catName(p.cat))}</span>
          <h1>${esc(p.name)}</h1>
          <div class="tag-pill">${icon("star")} 4.9 · Servicio destacado</div>
          <p class="pd-desc">${esc(p.long)}</p>
          <div class="pd-price">${old}<span class="now">${money(p.price)} <span class="unit">${esc(p.unit)}</span></span></div>
          <ul class="specs">${p.specs.map(s => `<li>${icon("check")}<span>${esc(s)}</span></li>`).join("")}</ul>
          <div class="stock-line stock-line--lg"><span class="stock-dot ${availability(p).cls}"></span>${esc(availability(p).txt)}${p.activo !== false && p.stock ? ` · ${p.stock} cupos` : ""}</div>
          <div class="pd-actions">
            ${qtyControl(1, p.id, p.stock)}
            ${availability(p).cls === "no"
              ? `<button class="btn btn--ghost btn--lg" disabled>${icon("info")} Sin cupos disponibles</button>`
              : `<button class="btn btn--primary btn--lg" data-add="${p.id}">${icon("cart")} Agregar al carrito</button>`}
            <a class="btn btn--ghost btn--lg" data-wa="Hola GamaSport, quiero reservar: ${p.name}">${icon("whatsapp")} Consultar</a>
          </div>
          <p class="hint" style="color:var(--muted);font-size:.85rem;margin-top:14px">${icon("shield")} Reserva protegida · Pago seguro con HTTPS · Cancelación flexible</p>
        </div>
      </div>`;
    wireQty(root);
    // los productos relacionados que muestro abajo
    const rel = $("#relatedGrid");
    if (rel) {
      const others = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id)
        .concat(PRODUCTS.filter(x => x.cat !== p.cat && x.id !== p.id)).slice(0, 3);
      rel.innerHTML = others.map(productCard).join("");
    }
    hydrate(root); hydrate($("#relatedSection")); revealOnScroll();
  }

  /* carrito */
  function initCart() {
    const root = $("#cartRoot");
    if (!root) return;
    function render() {
      const lines = Cart.lines();
      if (!lines.length) {
        root.innerHTML = `<div class="cart-empty">${icon("cart")}
          <h2>Tu carrito está vacío</h2>
          <p>Aún no has agregado servicios. Explora nuestras canchas, torneos y más.</p>
          <a class="btn btn--primary btn--lg" href="catalogo.html">${icon("arrow")} Ver servicios</a></div>`;
        return;
      }
      const t = Cart.totals();
      root.innerHTML = `
        <div class="cart-layout">
          <div class="cart-items">
            ${lines.map(l => `
              <div class="cart-item" data-row="${l.id}">
                <a class="ci-thumb" href="producto.html?id=${l.id}">${productMedia(l)}</a>
                <div>
                  <div class="ci-cat">${esc(catName(l.cat))}</div>
                  <a class="ci-name" href="producto.html?id=${l.id}">${esc(l.name)}</a>
                  <div class="ci-price">${money(l.price)} ${esc(l.unit)}</div>
                </div>
                <div class="ci-end">
                  ${qtyControl(l.qty, l.id, l.stock)}
                  <div class="ci-total">${money(l.lineTotal)}</div>
                  <button class="ci-remove" data-remove="${l.id}">${icon("trash")} Quitar</button>
                </div>
              </div>`).join("")}
            <a href="catalogo.html" class="btn btn--ghost" style="margin-top:6px">${icon("arrow")} Seguir reservando</a>
          </div>
          <aside class="summary">
            <h3>Resumen del pedido</h3>
            <div class="coupon">
              <input type="text" id="couponInput" placeholder="Código de descuento" value="${esc(t.code)}">
              <button class="btn btn--ghost btn--sm" id="couponBtn">Aplicar</button>
            </div>
            <p class="coupon-msg ${t.code ? "ok" : ""}" id="couponMsg">${t.code ? `Cupón ${t.code} aplicado (−${Math.round(t.rate*100)}%)` : "Prueba: GAMA10 o EQUIPO15"}</p>
            <div class="summary-row"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
            ${t.discount ? `<div class="summary-row" style="color:var(--green-dark)"><span>Descuento (${t.code})</span><span>−${money(t.discount)}</span></div>` : ""}
            <div class="summary-row"><span>ISV (15%)</span><span>${money(t.isv)}</span></div>
            <div class="summary-row total"><span>Total</span><span>${money(t.total)}</span></div>
            <a class="btn btn--primary btn--block btn--lg" href="checkout.html">${icon("lock")} Proceder al pago</a>
            <p class="note">${icon("shield")} Pago seguro · Pasarela en modo prueba</p>
          </aside>
        </div>`;
      wireQty(root, (v, input) => { Cart.setQty(input.dataset.id, v); render(); });
      $$("[data-remove]", root).forEach(b => b.addEventListener("click", () => { Cart.remove(b.dataset.remove); render(); }));
      const cBtn = $("#couponBtn");
      if (cBtn) cBtn.addEventListener("click", () => {
        const code = $("#couponInput").value;
        if (!code.trim()) { Cart.clearCoupon(); render(); return; }
        if (Cart.applyCoupon(code)) { render(); }
        else { const m = $("#couponMsg"); m.textContent = "Código no válido"; m.className = "coupon-msg err"; }
      });
      hydrate(root);
    }
    render();
  }

  /* checkout / pago */
  function pad(n) { return String(n).padStart(2, "0"); }
  function orderNumber() {
    const d = new Date();
    const ymd = `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;
    const rnd = Math.floor(1000 + Math.random() * 9000);
    return `GS-${ymd}-${rnd}`;
  }

  function initCheckout() {
    const root = $("#checkoutRoot");
    if (!root) return;
    const lines = Cart.lines();
    if (!lines.length) {
      root.innerHTML = `<div class="cart-empty">${icon("cart")}<h2>No hay nada para pagar</h2>
        <p>Tu carrito está vacío. Agrega un servicio para continuar.</p>
        <a class="btn btn--primary btn--lg" href="catalogo.html">Ver servicios</a></div>`;
      return;
    }
    const t = Cart.totals();
    const slots = ["3:00 PM","4:00 PM","5:00 PM","6:00 PM","7:00 PM","8:00 PM"];
    const today = new Date(); const minDate = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;

    root.innerHTML = `
      <div class="checkout-layout">
        <form class="checkout-form" id="checkoutForm" novalidate>
          <fieldset class="fieldset">
            <legend><span class="step-num">1</span> Datos del comprador</legend>
            <div class="form-grid">
              <div class="field col-2"><label>Nombre completo <span class="req">*</span></label>
                <input name="nombre" required autocomplete="name"><span class="error-msg">Ingresa tu nombre.</span></div>
              <div class="field"><label>Correo electrónico <span class="req">*</span></label>
                <input name="email" type="email" required autocomplete="email"><span class="error-msg">Correo no válido.</span></div>
              <div class="field"><label>Teléfono / WhatsApp <span class="req">*</span></label>
                <input name="telefono" type="tel" required autocomplete="tel" placeholder="9999-9999"><span class="error-msg">Mínimo 8 dígitos.</span></div>
            </div>
          </fieldset>
          <fieldset class="fieldset">
            <legend><span class="step-num">2</span> Detalles de la reserva</legend>
            <div class="form-grid">
              <div class="field"><label>Fecha de la reserva <span class="req">*</span></label>
                <input name="fecha" type="date" required min="${minDate}"><span class="error-msg">Elige una fecha de hoy en adelante.</span></div>
              <div class="field"><label>Hora preferida <span class="req">*</span></label>
                <select name="hora" required><option value="">Selecciona…</option>${slots.map(s=>`<option>${s}</option>`).join("")}</select>
                <span class="error-msg">Elige una hora libre.</span></div>
              <div class="field col-2"><label>Notas para el equipo (opcional)</label>
                <textarea name="notas" rows="2" placeholder="Ej. somos 12 jugadores, necesitamos petos"></textarea></div>
            </div>
          </fieldset>
          <fieldset class="fieldset">
            <legend><span class="step-num">3</span> Método de pago</legend>
            <div class="pay-methods" id="payMethods">
              <label class="pay-opt selected"><input type="radio" name="pago" value="Tarjeta (sandbox)" checked>
                <span><span class="pm-name">Tarjeta de crédito / débito</span><span class="pm-sub">Visa · Mastercard (modo prueba)</span></span><span class="pm-logo">VISA</span></label>
              <label class="pay-opt"><input type="radio" name="pago" value="PayPal Sandbox">
                <span><span class="pm-name">PayPal</span><span class="pm-sub">Pago simulado (sandbox)</span></span><span class="pm-logo">PayPal</span></label>
              <label class="pay-opt"><input type="radio" name="pago" value="Tigo Money">
                <span><span class="pm-name">Tigo Money</span><span class="pm-sub">Billetera móvil</span></span><span class="pm-logo">Tigo</span></label>
              <label class="pay-opt"><input type="radio" name="pago" value="Pago en sitio">
                <span><span class="pm-name">Pago en el sitio</span><span class="pm-sub">Paga al llegar a la cancha</span></span><span class="pm-logo">Efectivo</span></label>
            </div>
            <div class="card-fields show" id="cardFields">
              <div class="form-grid">
                <div class="field col-2"><label>Número de tarjeta <span class="req">*</span></label>
                  <input name="card" inputmode="numeric" placeholder="4242 4242 4242 4242" maxlength="19"><span class="error-msg">Número de tarjeta no válido.</span></div>
                <div class="field"><label>Vence (MM/AA) <span class="req">*</span></label>
                  <input name="exp" placeholder="12/28" maxlength="5"><span class="error-msg">Formato MM/AA.</span></div>
                <div class="field"><label>CVV <span class="req">*</span></label>
                  <input name="cvv" inputmode="numeric" placeholder="123" maxlength="4"><span class="error-msg">CVV no válido.</span></div>
              </div>
              <div class="sandbox-note">${icon("info")}<span><strong>Pasarela en modo prueba (sandbox).</strong> No se procesan cobros reales. Usa la tarjeta de prueba <strong>4242 4242 4242 4242</strong>, cualquier fecha futura y cualquier CVV.</span></div>
            </div>
            <div class="paypal-box" id="paypalBox">
              <div class="pp-logo">Pay<span>Pal</span> <em>SANDBOX</em></div>
              <p>Al confirmar, simulamos el flujo de PayPal en modo prueba: no se abre una cuenta real ni se cobra dinero. El pedido queda registrado como pagado con PayPal Sandbox.</p>
            </div>
          </fieldset>
          <button type="submit" class="btn btn--primary btn--block btn--lg">${icon("lock")} Confirmar y pagar ${money(t.total)}</button>
        </form>

        <aside class="summary">
          <h3>Tu pedido</h3>
          <div class="mini-cart">
            ${lines.map(l => `<div class="mini-item"><span class="mi-thumb">${productMedia(l)}</span>
              <span><span class="mi-name">${esc(l.name)}</span><span class="mi-qty"> ×${l.qty}</span></span>
              <span class="mi-price">${money(l.lineTotal)}</span></div>`).join("")}
          </div>
          <div class="summary-row"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
          ${t.discount ? `<div class="summary-row" style="color:var(--green-dark)"><span>Descuento (${t.code})</span><span>−${money(t.discount)}</span></div>` : ""}
          <div class="summary-row"><span>ISV (15%)</span><span>${money(t.isv)}</span></div>
          <div class="summary-row total"><span>Total</span><span>${money(t.total)}</span></div>
          <p class="note">${icon("shield")} Conexión segura HTTPS · Datos cifrados</p>
        </aside>
      </div>`;

    hydrate(root);

    // marca el método de pago elegido y enseña los campos de tarjeta o el aviso de PayPal
    const cardFields = $("#cardFields");
    const paypalBox = $("#paypalBox");
    $$(".pay-opt", root).forEach(opt => {
      opt.addEventListener("click", () => {
        $$(".pay-opt", root).forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
        const val = $("input", opt).value;
        cardFields.classList.toggle("show", val === "Tarjeta (sandbox)");
        if (paypalBox) paypalBox.classList.toggle("show", val === "PayPal Sandbox");
      });
    });

    // si el cliente tiene cuenta, le relleno nombre y correo para no hacerlo escribir de más
    const me = Auth.current();
    if (me) {
      const nIn = root.querySelector('input[name="nombre"]');
      const eIn = root.querySelector('input[name="email"]');
      if (nIn && !nIn.value) nIn.value = me.nombre;
      if (eIn && !eIn.value) eIn.value = me.email;
    }

    // disponibilidad: al elegir la fecha, las horas ya reservadas o bloqueadas se deshabilitan
    const fechaInput = root.querySelector('input[name="fecha"]');
    const horaSel = root.querySelector('select[name="hora"]');
    function refreshSlots() {
      if (!fechaInput.value) return;
      const busy = busySlots(fechaInput.value);
      Array.from(horaSel.options).forEach(op => {
        if (!op.value && op.value !== "") return;
        if (op.value === "") return;
        const base = op.value;
        const taken = busy.includes(base);
        op.disabled = taken;
        op.textContent = base + (taken ? " (ocupado)" : "");
      });
      if (horaSel.selectedOptions[0] && horaSel.selectedOptions[0].disabled) horaSel.value = "";
    }
    if (fechaInput && horaSel) { fechaInput.addEventListener("change", refreshSlots); }

    // le voy dando formato MM/AA a la fecha mientras escriben
    const expInput = root.querySelector('input[name="exp"]');
    if (expInput) expInput.addEventListener("input", () => {
      let v = expInput.value.replace(/\D/g, "").slice(0, 4);
      if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
      expInput.value = v;
    });
    const cardInput = root.querySelector('input[name="card"]');
    if (cardInput) cardInput.addEventListener("input", () => {
      cardInput.value = cardInput.value.replace(/\D/g, "").slice(0,16).replace(/(.{4})/g, "$1 ").trim();
    });

    // reviso que todo esté bien y, si sí, "mando" el pedido
    $("#checkoutForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      let ok = true;
      const setErr = (name, bad) => {
        const f = form.querySelector(`[name="${name}"]`); if (!f) return;
        f.closest(".field").classList.toggle("invalid", bad); if (bad) ok = false;
      };
      const val = (n) => (form.querySelector(`[name="${n}"]`)?.value || "").trim();
      setErr("nombre", val("nombre").length < 3);
      setErr("email", !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val("email")));
      setErr("telefono", val("telefono").replace(/\D/g, "").length < 8);
      // la fecha debe existir y no puede ser de un día que ya pasó
      setErr("fecha", !val("fecha") || val("fecha") < minDate);
      // y la hora elegida no puede estar ya ocupada
      const horaTomada = val("fecha") && busySlots(val("fecha")).includes(val("hora"));
      setErr("hora", !val("hora") || horaTomada);
      const pago = form.querySelector('input[name="pago"]:checked').value;
      if (pago === "Tarjeta (sandbox)") {
        setErr("card", val("card").replace(/\s/g, "").length < 13);
        setErr("exp", !/^\d{2}\/\d{2}$/.test(val("exp")));
        setErr("cvv", val("cvv").length < 3);
      }
      if (!ok) { form.querySelector(".field.invalid input, .field.invalid select")?.focus(); return; }

      const order = {
        number: orderNumber(),
        dateISO: new Date().toISOString(),
        customer: { nombre: val("nombre"), email: val("email").toLowerCase(), telefono: val("telefono") },
        reserva: { fecha: val("fecha"), hora: val("hora"), notas: val("notas") },
        payment: pago,
        estado: "pendiente",
        items: lines.map(l => ({ id: l.id, name: l.name, qty: l.qty, price: l.price, unit: l.unit, lineTotal: l.lineTotal })),
        totals: t
      };
      function finish() {
        localStorage.setItem("gs_last_order", JSON.stringify(order));
        Orders.add(order);
        Cart.clear();
        location.href = "confirmacion.html";
      }
      if (pago === "PayPal Sandbox") {
        // simulo el salto a PayPal: overlay azul un momento y de regreso con el pago aprobado
        const ov = document.createElement("div");
        ov.className = "pay-overlay";
        ov.innerHTML = `<div class="pay-overlay-card"><div class="pp-logo">Pay<span>Pal</span> <em>SANDBOX</em></div><div class="pp-spin"></div><p>Procesando el pago de prueba…</p></div>`;
        document.body.appendChild(ov);
        setTimeout(finish, 1600);
      } else {
        finish();
      }
    });
  }

  /* confirmación del pedido */
  function fmtDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("es-HN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    } catch (e) { return iso; }
  }
  function fmtReserva(f) {
    try { const [y,m,dd] = f.split("-"); return new Date(+y, +m-1, +dd).toLocaleDateString("es-HN", { weekday:"long", day:"numeric", month:"long", year:"numeric" }); }
    catch (e) { return f; }
  }

  function initConfirm() {
    const root = $("#confirmRoot");
    if (!root) return;
    let order;
    try { order = JSON.parse(localStorage.getItem("gs_last_order")); } catch (e) { order = null; }
    if (!order) {
      root.innerHTML = `<div class="cart-empty">${icon("info")}<h2>No hay pedidos recientes</h2>
        <p>No encontramos una confirmación de pedido en este navegador.</p>
        <a class="btn btn--primary btn--lg" href="catalogo.html">Hacer una reserva</a></div>`;
      return;
    }
    const t = order.totals;
    const waMsg = `¡Hola GamaSport! Confirmo mi pedido ${order.number} para el ${fmtReserva(order.reserva.fecha)} a las ${order.reserva.hora}.`;
    root.innerHTML = `
      <div class="confirm-card">
        <div class="confirm-top">
          <div class="confirm-check">${icon("check")}</div>
          <h1>¡Reserva confirmada!</h1>
          <p>Gracias, ${esc(order.customer.nombre.split(" ")[0])}. Tu pedido fue registrado con éxito.</p>
          <div class="order-num">Pedido ${esc(order.number)}</div>
        </div>
        <div class="confirm-body">
          <div class="confirm-grid">
            <div><div class="ci-label">Fecha de reserva</div><div class="ci-value">${esc(fmtReserva(order.reserva.fecha))}</div></div>
            <div><div class="ci-label">Hora</div><div class="ci-value">${esc(order.reserva.hora)}</div></div>
            <div><div class="ci-label">A nombre de</div><div class="ci-value">${esc(order.customer.nombre)}</div></div>
            <div><div class="ci-label">Método de pago</div><div class="ci-value">${esc(order.payment)}</div></div>
            <div><div class="ci-label">Correo</div><div class="ci-value">${esc(order.customer.email)}</div></div>
            <div><div class="ci-label">Teléfono</div><div class="ci-value">${esc(order.customer.telefono)}</div></div>
            ${order.reserva.notas ? `<div style="grid-column:1/-1"><div class="ci-label">Notas</div><div class="ci-value">${esc(order.reserva.notas)}</div></div>` : ""}
          </div>
          <div class="confirm-lines">
            ${order.items.map(it => `<div class="cl-row"><span class="cl-name">${esc(it.name)} <span>×${it.qty}</span></span><span>${money(it.lineTotal)}</span></div>`).join("")}
            <div class="cl-row"><span class="cl-name">Subtotal</span><span>${money(t.subtotal)}</span></div>
            ${t.discount ? `<div class="cl-row"><span class="cl-name">Descuento (${t.code})</span><span>−${money(t.discount)}</span></div>` : ""}
            <div class="cl-row"><span class="cl-name">ISV (15%)</span><span>${money(t.isv)}</span></div>
            <div class="cl-row tot"><span class="cl-name">Total ${order.payment === "Pago en sitio" ? "a pagar en sitio" : "pagado"}</span><span>${money(t.total)}</span></div>
          </div>
          <p style="text-align:center;color:var(--text-soft);font-size:.92rem;margin-bottom:20px">${icon("info")} Recibirás los detalles en ${esc(order.customer.email)}. Te esperamos en ${CONFIG.address}.</p>
          <div class="confirm-actions">
            <a class="btn btn--primary" href="${waLink(waMsg)}" target="_blank" rel="noopener">${icon("whatsapp")} Confirmar por WhatsApp</a>
            <a class="btn btn--ghost" href="${mailtoOrder(order)}">${icon("mail")} Enviar por correo</a>
            <a class="btn btn--ghost" href="cuenta.html#reservas">${icon("user")} Ver mis reservas</a>
            <button class="btn btn--ghost" onclick="window.print()">${icon("print")} Imprimir comprobante</button>
            <a class="btn btn--ghost" href="catalogo.html">${icon("arrow")} Seguir reservando</a>
          </div>
        </div>
      </div>`;
    hydrate(root);
  }

  /* contacto */
  function initContact() {
    const mapHolder = $("#mapArt");
    if (mapHolder) mapHolder.innerHTML = mapArt();
    const form = $("#contactForm");
    if (form) form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = (form.querySelector('[name="nombre"]').value || "").trim();
      const msg = (form.querySelector('[name="mensaje"]').value || "").trim();
      if (nombre.length < 2 || msg.length < 4) { showToast("Completa tu nombre y mensaje."); return; }
      window.open(waLink(`Hola GamaSport, soy ${nombre}. ${msg}`), "_blank");
      showToast("Abriendo WhatsApp para enviar tu mensaje…");
      form.reset();
    });
  }

  /* ---- página de promociones ---- */
  function initPromos() {
    const grid = $("#promoGrid");
    if (!grid) return;
    grid.innerHTML = PROMOS.map(pr => `
      <article class="promo-card reveal">
        <span class="promo-off">-${pr.off}%</span>
        <div>
          <span class="product-cat">${esc(pr.tag)}</span>
          <h3>${esc(pr.title)}</h3>
          <p>${esc(pr.desc)}</p>
          <div class="promo-foot">
            <span class="promo-code">Cupón: ${esc(pr.code)}</span>
            <a class="btn btn--primary btn--sm" href="catalogo.html">Usar en el catálogo</a>
          </div>
        </div>
      </article>`).join("");
    revealOnScroll();
  }

  /* ---- Mi cuenta: registro, inicio de sesión y mis reservas ---- */
  function ordersTable(list) {
    if (!list.length) return `<div class="empty-state">${icon("calendar")}<h3>Aún no tienes reservas</h3><p>Cuando hagas una reserva con este correo, aparecerá aquí.</p><a class="btn btn--primary" href="catalogo.html" style="margin-top:14px">Reservar ahora</a></div>`;
    return `<div class="orders-wrap"><table class="orders-table">
      <thead><tr><th>Pedido</th><th>Reserva</th><th>Servicios</th><th>Total</th><th>Estado</th></tr></thead>
      <tbody>${list.map(o => `<tr>
        <td data-th="Pedido"><strong>${esc(o.number)}</strong></td>
        <td data-th="Reserva">${esc(o.reserva.fecha)}<br>${esc(o.reserva.hora)}</td>
        <td data-th="Servicios">${o.items.map(i => esc(i.name) + " ×" + i.qty).join("<br>")}</td>
        <td data-th="Total">${money(o.totals.total)}</td>
        <td data-th="Estado"><span class="estado-pill est-${esc(o.estado || "pendiente")}">${esc(o.estado || "pendiente")}</span></td>
      </tr>`).join("")}</tbody></table></div>`;
  }

  function initAccount() {
    const root = $("#accountRoot");
    if (!root) return;
    const user = Auth.current();

    if (!user) {
      root.innerHTML = `
        <div class="auth-card">
          <div class="auth-tabs">
            <button class="on" data-tab="login">Iniciar sesión</button>
            <button data-tab="signup">Crear cuenta</button>
            <button data-tab="reset">Recuperar</button>
          </div>
          <form class="auth-form" id="loginForm" data-view="login">
            <div class="field"><label>Correo electrónico</label><input name="email" type="email" required></div>
            <div class="field"><label>Contraseña</label><input name="pass" type="password" required></div>
            <button class="btn btn--primary btn--block">${icon("user")} Entrar</button>
          </form>
          <form class="auth-form" id="signupForm" data-view="signup" hidden>
            <div class="field"><label>Nombre completo</label><input name="nombre" required></div>
            <div class="field"><label>Correo electrónico</label><input name="email" type="email" required></div>
            <div class="field"><label>Contraseña (mínimo 6 caracteres)</label><input name="pass" type="password" required></div>
            <button class="btn btn--primary btn--block">${icon("plus")} Crear mi cuenta</button>
          </form>
          <form class="auth-form" id="resetForm" data-view="reset" hidden>
            <p class="auth-note">Por seguridad, confirma tu correo y define una contraseña nueva.</p>
            <div class="field"><label>Correo electrónico</label><input name="email" type="email" required></div>
            <div class="field"><label>Contraseña nueva</label><input name="pass" type="password" required></div>
            <button class="btn btn--primary btn--block">Restablecer</button>
          </form>
          <p class="auth-msg" id="authMsg" role="alert"></p>
          <p class="auth-note">Con tu cuenta reservas más rápido y llevas el control de tus partidos.</p>
        </div>`;
      const msg = $("#authMsg");
      $$(".auth-tabs button", root).forEach(b => b.addEventListener("click", () => {
        $$(".auth-tabs button", root).forEach(x => x.classList.remove("on"));
        b.classList.add("on");
        $$(".auth-form", root).forEach(f => f.hidden = f.dataset.view !== b.dataset.tab);
        msg.textContent = "";
      }));
      const val = (f, n) => (f.querySelector(`[name="${n}"]`) || {}).value || "";
      $("#loginForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const err = Auth.login(val(e.target, "email"), val(e.target, "pass"));
        if (err) { msg.textContent = err; return; }
        location.reload();
      });
      $("#signupForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const err = Auth.register(val(e.target, "nombre"), val(e.target, "email"), val(e.target, "pass"));
        if (err) { msg.textContent = err; return; }
        showToast("¡Cuenta creada! Bienvenido a GamaSport.");
        setTimeout(() => location.reload(), 600);
      });
      $("#resetForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const err = Auth.reset(val(e.target, "email"), val(e.target, "pass"));
        msg.textContent = err || "Contraseña actualizada. Ya puedes iniciar sesión.";
      });
      return;
    }

    const mine = Orders.byEmail(user.email);
    root.innerHTML = `
      <div class="account-head">
        <div class="avatar avatar--lg">${esc(user.nombre.trim().slice(0, 1).toUpperCase())}</div>
        <div>
          <h2>Hola, ${esc(user.nombre.split(" ")[0])}</h2>
          <p>${esc(user.email)} · miembro desde ${new Date(user.creado).toLocaleDateString("es-HN")}</p>
        </div>
        <button class="btn btn--ghost btn--sm" id="logoutBtn">${icon("logout")} Cerrar sesión</button>
      </div>
      <h3 id="reservas" class="account-sub">Mis reservas</h3>
      ${ordersTable(mine)}
      <p class="auth-note" style="margin-top:14px">${icon("info")} Aquí aparecen las reservas hechas con tu correo.</p>`;
    $("#logoutBtn").addEventListener("click", () => { Auth.logout(); location.reload(); });
    hydrate(root); revealOnScroll();
  }

  /* ---- panel administrativo (demo protegida con credenciales fijas) ---- */
  const ADMIN_MAIL = "admin@gamasport.hn";
  const ADMIN_PASS = "gamasport2026";

  function initAdmin() {
    const root = $("#adminRoot");
    if (!root) return;

    if (sessionStorage.getItem("gs_admin") !== "1") {
      root.innerHTML = `
        <div class="auth-card">
          <h2 style="margin-bottom:6px">Panel administrativo</h2>
          <p class="auth-note">Acceso solo para el personal de GamaSport.</p>
          <form class="auth-form" id="adminForm">
            <div class="field"><label>Correo</label><input name="email" type="email" required placeholder="admin@gamasport.hn"></div>
            <div class="field"><label>Contraseña</label><input name="pass" type="password" required></div>
            <button class="btn btn--primary btn--block">${icon("lock")} Entrar al panel</button>
          </form>
          <p class="auth-msg" id="adminMsg" role="alert"></p>
          <p class="auth-note">Demo académica: admin@gamasport.hn / gamasport2026</p>
        </div>`;
      $("#adminForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const em = e.target.querySelector('[name="email"]').value.trim().toLowerCase();
        const pw = e.target.querySelector('[name="pass"]').value;
        if (em === ADMIN_MAIL && pw === ADMIN_PASS) { sessionStorage.setItem("gs_admin", "1"); render(); }
        else { $("#adminMsg").textContent = "Credenciales incorrectas."; }
      });
      return;
    }
    render();

    function render() {
      const orders = Orders.all();
      const activos = orders.filter(o => o.estado !== "cancelada");
      const ingresos = activos.reduce((s, o) => s + (o.totals ? o.totals.total : 0), 0);
      const bloqueos = Blocked.all();
      const estados = ["pendiente", "confirmada", "atendida", "cancelada"];
      root.innerHTML = `
        <div class="admin-top">
          <h2>Panel administrativo</h2>
          <button class="btn btn--ghost btn--sm" id="adminOut">${icon("logout")} Salir</button>
        </div>
        <div class="admin-stats">
          <div class="stat"><div class="num">${orders.length}</div><div class="lbl">Reservas totales</div></div>
          <div class="stat"><div class="num">${orders.filter(o => o.estado === "pendiente").length}</div><div class="lbl">Pendientes</div></div>
          <div class="stat"><div class="num">${money(ingresos)}</div><div class="lbl">Ingresos registrados</div></div>
          <div class="stat"><div class="num">${bloqueos.length}</div><div class="lbl">Horarios bloqueados</div></div>
          <div class="stat"><div class="num">${PRODUCTS.filter(p => p.activo !== false && p.stock).length}/${PRODUCTS.length}</div><div class="lbl">Servicios disponibles</div></div>
          <div class="stat"><div class="num">${Auth.users().length}</div><div class="lbl">Usuarios registrados</div></div>
        </div>

        <h3 class="account-sub">Reservas</h3>
        ${orders.length ? `<div class="orders-wrap"><table class="orders-table">
          <thead><tr><th>Pedido</th><th>Cliente</th><th>Reserva</th><th>Total</th><th>Pago</th><th>Estado</th></tr></thead>
          <tbody>${orders.map(o => `<tr>
            <td data-th="Pedido"><strong>${esc(o.number)}</strong></td>
            <td data-th="Cliente">${esc(o.customer.nombre)}<br><small>${esc(o.customer.telefono)}</small></td>
            <td data-th="Reserva">${esc(o.reserva.fecha)} ${esc(o.reserva.hora)}</td>
            <td data-th="Total">${money(o.totals.total)}</td>
            <td data-th="Pago">${esc(o.payment)}</td>
            <td data-th="Estado"><select class="estado-sel est-${esc(o.estado || "pendiente")}" data-order="${esc(o.number)}">
              ${estados.map(s => `<option ${s === (o.estado || "pendiente") ? "selected" : ""}>${s}</option>`).join("")}
            </select></td>
          </tr>`).join("")}</tbody></table></div>`
        : `<div class="empty-state">${icon("calendar")}<h3>Sin reservas todavía</h3><p>Cuando los clientes reserven, aparecerán aquí.</p></div>`}

        <h3 class="account-sub">Productos y servicios (inventario)</h3>
        <div class="orders-wrap"><table class="orders-table">
          <thead><tr><th>Servicio</th><th>Categoría</th><th>Precio (L)</th><th>Cupos</th><th>Estado</th></tr></thead>
          <tbody>${PRODUCTS.map(p => `<tr>
            <td data-th="Servicio"><strong>${esc(p.name)}</strong><br><small>${esc(p.id)}</small></td>
            <td data-th="Categoría">${esc(catName(p.cat))}</td>
            <td data-th="Precio"><input class="inv-in" type="number" min="0" step="10" value="${p.price}" data-price="${p.id}"></td>
            <td data-th="Cupos"><input class="inv-in" type="number" min="0" max="99" value="${p.stock}" data-stock="${p.id}"></td>
            <td data-th="Estado"><label class="inv-check"><input type="checkbox" data-activo="${p.id}" ${p.activo === false ? "" : "checked"}> visible</label></td>
          </tr>`).join("")}</tbody></table></div>
        <p class="auth-note">Los cambios se guardan al salir del campo y se reflejan de inmediato en el catálogo.
          <button class="btn btn--ghost btn--sm" id="invReset" style="margin-left:8px">Restaurar valores originales</button></p>

        <h3 class="account-sub">Usuarios registrados</h3>
        ${(function () {
          const us = Auth.users();
          if (!us.length) return `<div class="empty-state">${icon("user")}<h3>Todavía no hay usuarios</h3><p>Las cuentas creadas desde "Mi cuenta" aparecerán aquí.</p></div>`;
          return `<div class="orders-wrap"><table class="orders-table">
            <thead><tr><th>Nombre</th><th>Correo</th><th>Registro</th><th>Reservas</th></tr></thead>
            <tbody>${us.map(u => `<tr>
              <td data-th="Nombre">${esc(u.nombre)}</td>
              <td data-th="Correo">${esc(u.email)}</td>
              <td data-th="Registro">${new Date(u.creado).toLocaleDateString("es-HN")}</td>
              <td data-th="Reservas">${Orders.byEmail(u.email).length}</td>
            </tr>`).join("")}</tbody></table></div>`;
        })()}

        <h3 class="account-sub">Bloquear horarios (mantenimiento, ligas, eventos)</h3>
        <form class="block-form" id="blockForm">
          <input type="date" name="fecha" required>
          <select name="hora" required>${["3:00 PM","4:00 PM","5:00 PM","6:00 PM","7:00 PM","8:00 PM"].map(h => `<option>${h}</option>`).join("")}</select>
          <button class="btn btn--primary btn--sm">Bloquear</button>
        </form>
        ${bloqueos.length ? `<ul class="block-list">${bloqueos.map(b => `<li>${esc(b.fecha)} · ${esc(b.hora)} <button class="ci-remove" data-unblock="${esc(b.fecha)}|${esc(b.hora)}">${icon("trash")} Quitar</button></li>`).join("")}</ul>` : ""}
        <p class="auth-note" style="margin-top:16px">${icon("info")} Panel de demostración: los datos viven en este navegador. El plan de la Fase 2 contempla moverlos a Firebase Firestore.</p>`;

      $("#adminOut").addEventListener("click", () => { sessionStorage.removeItem("gs_admin"); location.reload(); });
      $$(".estado-sel", root).forEach(sel => sel.addEventListener("change", () => {
        Orders.setStatus(sel.dataset.order, sel.value);
        showToast(`Pedido ${sel.dataset.order}: ${sel.value}.`);
        render();
      }));
      // guardar precio, cupos y visibilidad del inventario
      $$("[data-price]", root).forEach(inp => inp.addEventListener("change", () => {
        const v = Math.max(0, parseInt(inp.value, 10) || 0);
        Inventory.set(inp.dataset.price, { price: v });
        showToast("Precio actualizado."); render();
      }));
      $$("[data-stock]", root).forEach(inp => inp.addEventListener("change", () => {
        const v = Math.max(0, Math.min(99, parseInt(inp.value, 10) || 0));
        Inventory.set(inp.dataset.stock, { stock: v });
        showToast("Cupos actualizados."); render();
      }));
      $$("[data-activo]", root).forEach(chk => chk.addEventListener("change", () => {
        Inventory.set(chk.dataset.activo, { activo: chk.checked });
        showToast(chk.checked ? "Servicio visible en el catálogo." : "Servicio oculto del catálogo."); render();
      }));
      $("#invReset").addEventListener("click", () => { Inventory.reset(); showToast("Inventario restaurado."); render(); });

      $("#blockForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const f = e.target.querySelector('[name="fecha"]').value;
        const h = e.target.querySelector('[name="hora"]').value;
        if (f) { Blocked.add(f, h); render(); }
      });
      $$("[data-unblock]", root).forEach(b => b.addEventListener("click", () => {
        const [f, h] = b.dataset.unblock.split("|");
        Blocked.remove(f, h); render();
      }));
      hydrate(root);
    }
  }

  /* miro qué página es y llamo a la función que le toca */
  async function arrancar() {
    // si hay nube, intento traer los datos antes de dibujar; si falla, sigo con lo local
    if (window.GS_CLOUD && window.GS_CLOUD.activo) {
      try { await window.GS_CLOUD.bajar(); } catch (e) { /* seguimos con los datos del navegador */ }
    }
    initLayout();
    const page = document.body.dataset.page;
    ({ home: initHome, catalog: initCatalog, product: initProduct, cart: initCart,
       checkout: initCheckout, confirm: initConfirm, contact: initContact,
       promos: initPromos, account: initAccount, admin: initAdmin }[page] || function(){})();
  }
  document.addEventListener("DOMContentLoaded", arrancar);

  window.GS = { Cart, money, showToast, Auth, Orders, Blocked, busySlots, Inventory, availability };
})();
