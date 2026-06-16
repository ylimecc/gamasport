/* Solo efectos visuales. Si borro este archivo el sitio sigue funcionando igual */
(function () {
  "use strict";
  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine   = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function ready(fn){ document.readyState !== "loading" ? fn() : document.addEventListener("DOMContentLoaded", fn); }

  ready(function () {

    /* la barrita de arriba que se va llenando mientras bajo */
    if (!reduce) {
      const bar = document.createElement("div");
      bar.id = "scrollProgress";
      document.body.appendChild(bar);
      const onScroll = () => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        bar.style.transform = "scaleX(" + (max > 0 ? h.scrollTop / max : 0) + ")";
      };
      addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    /* el header se pone sólido apenas bajo un poco */
    const header = $(".site-header");
    if (header) {
      const onScrollH = () => header.classList.toggle("scrolled", scrollY > 24);
      addEventListener("scroll", onScrollH, { passive: true });
      onScrollH();
    }

    /* un foco de luz que sigue el mouse en las zonas oscuras */
    if (fine && !reduce) {
      $$(".hero, .section--ink, .page-hero").forEach(zone => {
        zone.addEventListener("pointermove", e => {
          const r = zone.getBoundingClientRect();
          zone.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
          zone.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
        });
      });
    }

    /* los números del hero suben de 0 hasta su valor */
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    function countUp(el) {
      const target = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.decimals || "0", 10);
      const suf = el.dataset.suffix || "";
      const pre = el.dataset.prefix || "";
      if (isNaN(target)) return;
      if (reduce) { el.textContent = pre + target.toFixed(dec) + suf; return; }
      const dur = 1300; let start = null;
      function step(ts) {
        if (start === null) start = ts;
        const p = Math.min(1, (ts - start) / dur);
        el.textContent = pre + (target * easeOut(p)).toFixed(dec) + suf;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = pre + target.toFixed(dec) + suf;
      }
      requestAnimationFrame(step);
    }
    const counters = $$("[data-count]");
    if (counters.length && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((ents) => {
        ents.forEach(en => { if (en.isIntersecting) { countUp(en.target); io.unobserve(en.target); } });
      }, { threshold: 0.6 });
      counters.forEach(c => io.observe(c));
    } else counters.forEach(countUp);

    /* hago que las tarjetas aparezcan una tras otra, no todas de golpe */
    [".features", ".products", ".steps", ".testimonials", ".footer-grid"].forEach(sel => {
      $$(sel).forEach(group => {
        $$(":scope > .reveal", group).forEach((el, i) => el.style.setProperty("--d", (i * 0.08) + "s"));
      });
    });
    $$(".products .reveal, #featuredGrid .reveal").forEach(el => { if (!el.dataset.reveal) el.dataset.reveal = "scale"; });

    /* las tarjetas se inclinan siguiendo el mouse (solo en compu) */
    if (fine && !reduce) {
      function onMove(e) {
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(900px) translateY(-6px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 7).toFixed(2) + "deg)";
      }
      function onLeave(e) { e.currentTarget.style.transform = ""; }
      function bind(el) {
        if (el._tilt) return; el._tilt = true;
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
      }
      const scan = () => $$(".product-card, .feature, .tcard").forEach(bind);
      scan();
      if ("MutationObserver" in window) {
        let queued = false;
        new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; scan(); }); } })
          .observe(document.body, { childList: true, subtree: true });
      }
    }

    /* los botones se "pegan" un poco al cursor (solo en compu) */
    if (fine && !reduce) {
      $$(".hero .btn, .cta-band .btn").forEach(btn => {
        btn.addEventListener("pointermove", e => {
          const r = btn.getBoundingClientRect();
          const x = (e.clientX - r.left - r.width / 2) * 0.25;
          const y = (e.clientY - r.top - r.height / 2) * 0.35;
          btn.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
        });
        btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
      });
    }
  });
})();
