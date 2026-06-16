/* Carrito de compras y render de las paginas */
(function () {
  "use strict";

  const { CONFIG, CATEGORIES, PRODUCTS, catName, getProduct } = window.GS_DATA;
  const { icon, productArt, mapArt, LOGO } = window.GS_ASSETS;

  /* Utilidades */
  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const money = (n) => CONFIG.currency + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const param = (k) => new URLSearchParams(location.search).get(k);
  const esc = (s) => String(s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));

  const COUPONS = { "GAMA10": 0.10, "EQUIPO15": 0.15 };

  function waLink(msg) {
    const text = encodeURIComponent(msg || `¡Hola ${CONFIG.name}! Quisiera información para reservar.`);
    return `https://wa.me/${CONFIG.whatsapp}?text=${text}`;
  }

  /* Carrito (localStorage) */
  const Cart = {
    KEY: "gs_cart_v1",
    get() { try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch (e) { return []; } },
    save(items) { localStorage.setItem(this.KEY, JSON.stringify(items)); document.dispatchEvent(new Event("cart:change")); },
    add(id, qty) {
      qty = Math.max(1, parseInt(qty || 1, 10));
      const items = this.get();
      const row = items.find(i => i.id === id);
      if (row) row.qty += qty; else items.push({ id, qty });
      this.save(items);
    },
    setQty(id, qty) {
      qty = parseInt(qty, 10);
      let items = this.get();
      if (!qty || qty < 1) items = items.filter(i => i.id !== id);
      else { const row = items.find(i => i.id === id); if (row) row.qty = qty; }
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

  /* Layout compartido (badge, nav, footer) */
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

  // pone iconos, enlaces y datos del negocio en el HTML
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

  function initLayout() {
    hydrate(document);
    // marcar enlace activo
    const page = document.body.dataset.page;
    $$(".primary-nav > a[data-nav]").forEach(a => { if (a.dataset.nav === page) a.classList.add("active"); });
    // menú móvil
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
  }

  function revealOnScroll() {
    const els = $$(".reveal");
    if (!els.length || !("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(e => io.observe(e));
  }

  /* Toast */
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

  /* Componentes reutilizables */
  function productCard(p) {
    const old = p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span>` : "";
    return `<article class="product-card reveal">
      <div class="product-thumb">
        <a href="producto.html?id=${p.id}" aria-label="${esc(p.name)}">${productArt(p.art)}</a>
        ${p.tag ? `<span class="product-tag ${p.popular ? "is-pop" : ""}">${esc(p.tag)}</span>` : ""}
      </div>
      <div class="product-body">
        <span class="product-cat">${esc(catName(p.cat))}</span>
        <h3><a href="producto.html?id=${p.id}">${esc(p.name)}</a></h3>
        <p class="product-desc">${esc(p.short)}</p>
        <div class="product-foot">
          <div class="price">${old}${money(p.price)} <span class="unit">${esc(p.unit)}</span></div>
          <button class="btn btn--primary btn--sm" data-add="${p.id}">${icon("plus")} Agregar</button>
        </div>
      </div>
    </article>`;
  }

  function qtyControl(value, id) {
    return `<div class="qty" data-qty>
      <button type="button" data-step="-1" aria-label="Disminuir">−</button>
      <input type="number" min="1" max="50" value="${value}" aria-label="Cantidad" ${id ? `data-id="${id}"` : ""}>
      <button type="button" data-step="1" aria-label="Aumentar">+</button>
    </div>`;
  }

  function wireQty(scope, onChange) {
    $$("[data-qty]", scope).forEach(box => {
      const input = $("input", box);
      $$("button", box).forEach(btn => btn.addEventListener("click", () => {
        let v = parseInt(input.value, 10) || 1;
        v = Math.min(50, Math.max(1, v + parseInt(btn.dataset.step, 10)));
        input.value = v; onChange && onChange(v, input);
      }));
      input.addEventListener("change", () => {
        let v = parseInt(input.value, 10) || 1; v = Math.min(50, Math.max(1, v));
        input.value = v; onChange && onChange(v, input);
      });
    });
  }

  // delegación global para botones "Agregar"
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const p = getProduct(btn.dataset.add);
    if (!p) return;
    const qtyInput = btn.closest("[data-add-scope]") && $("[data-qty] input", btn.closest("[data-add-scope]"));
    Cart.add(p.id, qtyInput ? qtyInput.value : 1);
    showToast(`${p.name} agregado al carrito`, "Ver carrito →", "carrito.html");
  });

  /* Página: Home */
  function initHome() {
    const grid = $("#featuredGrid");
    if (grid) {
      const featured = PRODUCTS.filter(p => p.popular).concat(PRODUCTS.filter(p => !p.popular)).slice(0, 6);
      grid.innerHTML = featured.map(productCard).join("");
      revealOnScroll();
    }
    // tarjeta rápida del hero
    const quick = $("#heroQuick");
    if (quick) {
      const p = getProduct("GS-102");
      quick.innerHTML = `
        <div class="quick-row"><div><div class="q-name">${esc(p.name)}</div><div class="q-sub">Iluminación LED · 6–9 PM</div></div><div class="q-price">${money(p.price)}</div></div>
        <a class="btn btn--primary btn--block" href="producto.html?id=${p.id}">Reservar ahora ${icon("arrow")}</a>`;
    }
  }

  /* Página: Catálogo */
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

  /* Página: Detalle de producto */
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
    document.title = `${p.name} — GamaSport`;
    const old = p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span>` : "";
    root.innerHTML = `
      <nav class="breadcrumb" aria-label="Ruta">
        <a href="index.html">Inicio</a> ${icon("arrowR")}
        <a href="catalogo.html?cat=${p.cat}">${esc(catName(p.cat))}</a> ${icon("arrowR")}
        <span>${esc(p.name)}</span>
      </nav>
      <div class="pd-layout" data-add-scope>
        <div class="pd-media">${productArt(p.art)}${p.tag ? `<span class="product-tag ${p.popular ? "is-pop" : ""}" style="position:absolute;top:16px;left:16px">${esc(p.tag)}</span>` : ""}</div>
        <div class="pd-info">
          <span class="product-cat">${esc(catName(p.cat))}</span>
          <h1>${esc(p.name)}</h1>
          <div class="tag-pill">${icon("star")} 4.9 · Servicio destacado</div>
          <p class="pd-desc">${esc(p.long)}</p>
          <div class="pd-price">${old}${money(p.price)} <span class="unit">${esc(p.unit)}</span></div>
          <ul class="specs">${p.specs.map(s => `<li>${icon("check")}<span>${esc(s)}</span></li>`).join("")}</ul>
          <div class="pd-actions">
            ${qtyControl(1, p.id)}
            <button class="btn btn--primary btn--lg" data-add="${p.id}">${icon("cart")} Agregar al carrito</button>
            <a class="btn btn--ghost btn--lg" data-wa="Hola GamaSport, quiero reservar: ${p.name}">${icon("whatsapp")} Consultar</a>
          </div>
          <p class="hint" style="color:var(--muted);font-size:.85rem;margin-top:14px">${icon("shield")} Reserva protegida · Pago seguro con HTTPS · Cancelación flexible</p>
        </div>
      </div>`;
    wireQty(root);
    // relacionados
    const rel = $("#relatedGrid");
    if (rel) {
      const others = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id)
        .concat(PRODUCTS.filter(x => x.cat !== p.cat && x.id !== p.id)).slice(0, 3);
      rel.innerHTML = others.map(productCard).join("");
    }
    hydrate(root); hydrate($("#relatedSection")); revealOnScroll();
  }

  /* Página: Carrito */
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
                <a class="ci-thumb" href="producto.html?id=${l.id}">${productArt(l.art)}</a>
                <div>
                  <div class="ci-cat">${esc(catName(l.cat))}</div>
                  <a class="ci-name" href="producto.html?id=${l.id}">${esc(l.name)}</a>
                  <div class="ci-price">${money(l.price)} ${esc(l.unit)}</div>
                </div>
                <div class="ci-end">
                  ${qtyControl(l.qty, l.id)}
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

  /* Página: Checkout */
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
                <input name="fecha" type="date" required min="${minDate}"><span class="error-msg">Selecciona una fecha válida.</span></div>
              <div class="field"><label>Hora preferida <span class="req">*</span></label>
                <select name="hora" required><option value="">Selecciona…</option>${slots.map(s=>`<option>${s}</option>`).join("")}</select>
                <span class="error-msg">Selecciona una hora.</span></div>
              <div class="field col-2"><label>Notas para el equipo (opcional)</label>
                <textarea name="notas" rows="2" placeholder="Ej. somos 12 jugadores, necesitamos petos"></textarea></div>
            </div>
          </fieldset>
          <fieldset class="fieldset">
            <legend><span class="step-num">3</span> Método de pago</legend>
            <div class="pay-methods" id="payMethods">
              <label class="pay-opt selected"><input type="radio" name="pago" value="Tarjeta (sandbox)" checked>
                <span><span class="pm-name">Tarjeta de crédito / débito</span><span class="pm-sub">Visa · Mastercard — modo prueba</span></span><span class="pm-logo">VISA</span></label>
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
          </fieldset>
          <button type="submit" class="btn btn--primary btn--block btn--lg">${icon("lock")} Confirmar y pagar ${money(t.total)}</button>
        </form>

        <aside class="summary">
          <h3>Tu pedido</h3>
          <div class="mini-cart">
            ${lines.map(l => `<div class="mini-item"><span class="mi-thumb">${productArt(l.art)}</span>
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

    // selección visual de método de pago + mostrar tarjeta
    const cardFields = $("#cardFields");
    $$(".pay-opt", root).forEach(opt => {
      opt.addEventListener("click", () => {
        $$(".pay-opt", root).forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
        const val = $("input", opt).value;
        cardFields.classList.toggle("show", val === "Tarjeta (sandbox)");
      });
    });

    // máscara simple de expiración
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

    // validación + envío
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
      setErr("fecha", !val("fecha"));
      setErr("hora", !val("hora"));
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
        customer: { nombre: val("nombre"), email: val("email"), telefono: val("telefono") },
        reserva: { fecha: val("fecha"), hora: val("hora"), notas: val("notas") },
        payment: pago,
        items: lines.map(l => ({ id: l.id, name: l.name, qty: l.qty, price: l.price, unit: l.unit, lineTotal: l.lineTotal })),
        totals: t
      };
      localStorage.setItem("gs_last_order", JSON.stringify(order));
      Cart.clear();
      location.href = "confirmacion.html";
    });
  }

  /* Página: Confirmación */
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
            <button class="btn btn--ghost" onclick="window.print()">${icon("print")} Imprimir comprobante</button>
            <a class="btn btn--ghost" href="catalogo.html">${icon("arrow")} Seguir reservando</a>
          </div>
        </div>
      </div>`;
    hydrate(root);
  }

  /* Página: Contacto */
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

  /* Router por página */
  document.addEventListener("DOMContentLoaded", () => {
    initLayout();
    const page = document.body.dataset.page;
    ({ home: initHome, catalog: initCatalog, product: initProduct, cart: initCart,
       checkout: initCheckout, confirm: initConfirm, contact: initContact }[page] || function(){})();
  });

  window.GS = { Cart, money, showToast };
})();
