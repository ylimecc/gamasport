/* Iconos e ilustraciones en SVG */
(function () {
  "use strict";

  /* Íconos de interfaz (24x24, usan currentColor) */
  const I = {
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1.5"/><circle cx="19" cy="21" r="1.5"/><path d="M2.5 3h2l2.2 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21.5 7H6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>',
    checkCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14.01l-3-3"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.157 5.335 5.494 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.512 5.26l-.999 3.648 3.985-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    arrowR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h8l-1 8 10-12h-8z"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    ball: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m12 7 4 3-1.5 4.5h-5L8 10z"/><path d="M12 3v4M3.5 9 8 10M5 18l3.5-3.5M19 18l-3.5-3.5M20.5 9 16 10"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.82a4.28 4.28 0 0 1-1.06-2.82h-3.1v12.36a2.52 2.52 0 1 1-2.52-2.52c.26 0 .52.04.76.12V9.78a5.66 5.66 0 0 0-.76-.06 5.62 5.62 0 1 0 5.62 5.62V9.01a7.3 7.3 0 0 0 4.26 1.37V7.27a4.28 4.28 0 0 1-3.2-1.45z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 3 12V4a1 1 0 0 1 1-1h8a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.6z"/><circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 4h13v12H1zM14 8h4l3 3v5h-7"/><circle cx="6" cy="18" r="1.6"/><circle cx="18" cy="18" r="1.6"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1z"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>',
    print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>'
  };

  function icon(name) { const s = I[name]; return s ? s.replace("<svg ", '<svg class="gi" ') : ""; }

  /* Logo de marca (monograma GS + balón) */
  const LOGO = `<svg class="logo-mark" viewBox="0 0 48 48" role="img" aria-label="GamaSport">
    <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#22c55e"/><stop offset="1" stop-color="#0f7a37"/></linearGradient></defs>
    <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#lg)"/>
    <circle cx="24" cy="24" r="13" fill="#0a1c24"/>
    <path d="M24 14.5 30 19l-2.3 7h-7.4L18 19z" fill="#fff"/>
    <path d="M24 11.5v3M14 18l4 1M14.5 30l3.5-3.5M33.5 30 30 26.5M34 18l-4 1" stroke="#a3e635" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  </svg>`;

  /* Helpers para ilustraciones */
  const open = (extra) => `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" ${extra || ''}>`;
  const defs = `<defs>
    <linearGradient id="pitch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f9e4b"/><stop offset="1" stop-color="#0f7a37"/></linearGradient>
    <linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c2230"/><stop offset="1" stop-color="#0a3a2c"/></linearGradient>
    <linearGradient id="warm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#f59e3b"/></linearGradient>
    <linearGradient id="teal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f5a52"/><stop offset="1" stop-color="#0a3a3a"/></linearGradient>
    <linearGradient id="dark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f2a35"/><stop offset="1" stop-color="#0a1c24"/></linearGradient>
    <radialGradient id="lampGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff7cc" stop-opacity=".9"/><stop offset="1" stop-color="#fff7cc" stop-opacity="0"/></radialGradient>
  </defs>`;

  // balón de fútbol reutilizable
  const ball = (cx, cy, r, dark) => {
    const s = dark ? '#0a1c24' : '#13321f';
    return `<g transform="translate(${cx},${cy})">
      <circle r="${r}" fill="#fff"/>
      <path d="M0 ${-r*0.55} ${r*0.52} ${-r*0.17} ${r*0.32} ${r*0.45} ${-r*0.32} ${r*0.45} ${-r*0.52} ${-r*0.17}z" fill="${s}"/>
      <path d="M0 ${-r} 0 ${-r*0.55}M${r*0.95} ${-r*0.31} ${r*0.52} ${-r*0.17}M${r*0.59} ${r*0.81} ${r*0.32} ${r*0.45}M${-r*0.59} ${r*0.81} ${-r*0.32} ${r*0.45}M${-r*0.95} ${-r*0.31} ${-r*0.52} ${-r*0.17}" stroke="${s}" stroke-width="${r*0.09}" fill="none"/>
      <circle r="${r}" fill="none" stroke="#cfd8d2" stroke-width="${r*0.05}"/>
    </g>`;
  };

  // marcas de cancha (líneas blancas) sobre un fondo
  const pitchLines = (op) => `<g stroke="#eafff1" stroke-opacity="${op||0.55}" stroke-width="3" fill="none">
    <rect x="22" y="40" width="356" height="220" rx="4"/>
    <line x1="200" y1="40" x2="200" y2="260"/>
    <circle cx="200" cy="150" r="40"/>
    <circle cx="200" cy="150" r="4" fill="#eafff1" stroke="none"/>
    <rect x="22" y="105" width="42" height="90"/><rect x="336" y="105" width="42" height="90"/>
  </g>`;

  /* Ilustraciones por producto */
  const ART = {
    "cancha-diurna": () => open() + defs +
      `<rect width="400" height="300" fill="url(#pitch)"/>
       <g opacity=".5"><rect width="400" height="300" fill="url(#pitch)"/>
       <rect x="0" y="0" width="400" height="50" fill="#23a955" opacity=".5"/><rect x="0" y="100" width="400" height="50" fill="#23a955" opacity=".5"/><rect x="0" y="200" width="400" height="50" fill="#23a955" opacity=".5"/></g>
       ${pitchLines(0.6)}
       <g transform="translate(330,55)"><circle r="26" fill="#ffe27a"/><g stroke="#ffe27a" stroke-width="4" stroke-linecap="round"><path d="M0 -38V-30M0 38V30M-38 0H-30M38 0H30M-27 -27l6 6M27 27l-6 -6M-27 27l6 -6M27 -27l-6 6"/></g></g>
       ${ball(150, 175, 22)}`,

    "cancha-nocturna": () => open() + defs +
      `<rect width="400" height="300" fill="url(#night)"/>
       <circle cx="60" cy="55" r="18" fill="#e9f0ff" opacity=".85"/><circle cx="52" cy="50" r="16" fill="#0c2230"/>
       <g fill="#cfe0ff"><circle cx="120" cy="40" r="1.6"/><circle cx="200" cy="30" r="1.6"/><circle cx="270" cy="55" r="1.6"/><circle cx="330" cy="35" r="1.6"/><circle cx="160" cy="60" r="1.2"/></g>
       ${pitchLines(0.4)}
       <g><rect x="44" y="70" width="8" height="150" fill="#10303d"/><polygon points="30,62 66,62 60,78 36,78" fill="#1a4250"/><circle cx="48" cy="70" r="46" fill="url(#lampGlow)"/><g fill="#fff7cc"><circle cx="40" cy="68" r="3"/><circle cx="48" cy="66" r="3"/><circle cx="56" cy="68" r="3"/><circle cx="44" cy="74" r="3"/><circle cx="52" cy="74" r="3"/></g></g>
       <g><rect x="348" y="70" width="8" height="150" fill="#10303d"/><polygon points="334,62 370,62 364,78 340,78" fill="#1a4250"/><circle cx="352" cy="70" r="46" fill="url(#lampGlow)"/><g fill="#fff7cc"><circle cx="344" cy="68" r="3"/><circle cx="352" cy="66" r="3"/><circle cx="360" cy="68" r="3"/><circle cx="348" cy="74" r="3"/><circle cx="356" cy="74" r="3"/></g></g>
       ${ball(200, 180, 24, true)}`,

    "paquete-2h": () => open() + defs +
      `<rect width="400" height="300" fill="url(#pitch)"/>${pitchLines(0.5)}
       ${ball(120, 175, 22)}
       <g transform="translate(290,135)"><circle r="52" fill="#0a1c24" opacity=".9"/><circle r="52" fill="none" stroke="#a3e635" stroke-width="4"/><text x="0" y="10" font-family="Segoe UI,Arial" font-size="34" font-weight="800" fill="#fff" text-anchor="middle">2h</text></g>
       <g transform="translate(300,225)"><rect x="-12" y="-26" width="24" height="44" rx="6" fill="#bfe9ff" opacity=".95"/><rect x="-10" y="-10" width="20" height="26" rx="3" fill="#3aa0e0"/><rect x="-7" y="-34" width="14" height="10" rx="2" fill="#0a4d6b"/></g>`,

    "torneo": () => open() + defs +
      `<rect width="400" height="300" fill="url(#dark)"/>
       <g fill="#a3e635" opacity=".9"><rect x="40" y="40" width="8" height="8" transform="rotate(20 44 44)"/><rect x="330" y="60" width="8" height="8" transform="rotate(-15 334 64)"/><rect x="80" y="70" width="6" height="6" transform="rotate(30 83 73)"/></g>
       <g fill="#ff6b6b" opacity=".9"><rect x="300" y="40" width="8" height="8" transform="rotate(15 304 44)"/><rect x="120" y="50" width="6" height="6"/></g>
       <g fill="#5ab0ff" opacity=".9"><rect x="60" y="200" width="7" height="7"/><rect x="340" y="210" width="7" height="7" transform="rotate(25 343 213)"/></g>
       <g transform="translate(200,160)">
         <ellipse cx="0" cy="92" rx="70" ry="12" fill="#000" opacity=".25"/>
         <path d="M-46 -78h92v28a46 46 0 0 1-92 0z" fill="#ffd24a"/>
         <path d="M-46 -78h92v28a46 46 0 0 1-92 0z" fill="none" stroke="#e0a615" stroke-width="3"/>
         <path d="M-46 -70h-22v12a22 22 0 0 0 24 20" fill="none" stroke="#ffd24a" stroke-width="9"/>
         <path d="M46 -70h22v12a22 22 0 0 1-24 20" fill="none" stroke="#ffd24a" stroke-width="9"/>
         <rect x="-10" y="0" width="20" height="34" fill="#e0a615"/><rect x="-30" y="34" width="60" height="14" rx="4" fill="#caa30f"/>
         <path d="M0 -56l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" fill="#fff" opacity=".85"/>
       </g>`,

    "evento": () => open() + defs +
      `<rect width="400" height="300" fill="url(#pitch)"/>${pitchLines(0.45)}
       <g transform="translate(70,60)"><path d="M0 0h120v30l-12-8-12 8-12-8-12 8-12-8-12 8-12-8-12 8-12-8-12 8z" fill="#a3e635"/><text x="60" y="20" font-family="Segoe UI,Arial" font-size="15" font-weight="800" fill="#0a1c24" text-anchor="middle">EVENTO</text></g>
       <g fill="#0a1c24"><circle cx="120" cy="180" r="16"/><rect x="106" y="196" width="28" height="44" rx="12"/></g>
       <g fill="#0a1c24" opacity=".85"><circle cx="200" cy="170" r="18"/><rect x="184" y="188" width="32" height="50" rx="13"/></g>
       <g fill="#0a1c24" opacity=".7"><circle cx="285" cy="180" r="16"/><rect x="271" y="196" width="28" height="44" rx="12"/></g>
       ${ball(330, 230, 16)}`,

    "cumpleanos": () => open() + defs +
      `<rect width="400" height="300" fill="url(#teal)"/>
       <g><line x1="120" y1="70" x2="120" y2="150" stroke="#cbd5d1" stroke-width="2"/><ellipse cx="120" cy="60" rx="26" ry="32" fill="#ff6b9d"/><polygon points="120,90 113,100 127,100" fill="#ff6b9d"/></g>
       <g><line x1="200" y1="55" x2="200" y2="140" stroke="#cbd5d1" stroke-width="2"/><ellipse cx="200" cy="44" rx="28" ry="34" fill="#a3e635"/><polygon points="200,76 192,87 208,87" fill="#a3e635"/></g>
       <g><line x1="280" y1="70" x2="280" y2="150" stroke="#cbd5d1" stroke-width="2"/><ellipse cx="280" cy="60" rx="26" ry="32" fill="#5ab0ff"/><polygon points="280,90 273,100 287,100" fill="#5ab0ff"/></g>
       <g transform="translate(200,235)"><rect x="-60" y="-26" width="120" height="44" rx="6" fill="#fff0d6"/><rect x="-60" y="-26" width="120" height="14" fill="#ff9ec2"/><rect x="-8" y="-52" width="16" height="26" fill="#ffce5c"/><circle cx="0" cy="-56" r="6" fill="#ff7a45"/></g>
       ${ball(70, 200, 18)}`,

    "combo": () => open() + defs +
      `<rect width="400" height="300" fill="url(#warm)"/>
       <g transform="translate(120,150)">
         <ellipse cx="0" cy="60" rx="62" ry="10" fill="#b86b1d" opacity=".3"/>
         <path d="M-52 -34a52 30 0 0 1 104 0z" fill="#f2a65a"/><path d="M-52 -34a52 30 0 0 1 104 0z" fill="none" stroke="#d98634" stroke-width="2"/>
         <g fill="#fff"><circle cx="-26" cy="-46" r="2.2"/><circle cx="0" cy="-50" r="2.2"/><circle cx="26" cy="-46" r="2.2"/><circle cx="-12" cy="-42" r="2.2"/><circle cx="14" cy="-42" r="2.2"/></g>
         <path d="M-54 -20h108l-6 8H-48z" fill="#6abf4b"/>
         <rect x="-56" y="-12" width="112" height="14" rx="4" fill="#c0392b"/>
         <rect x="-56" y="-2" width="112" height="12" fill="#ffd24a"/>
         <path d="M-54 8a54 22 0 0 0 108 0z" fill="#e6a23c"/>
       </g>
       <g transform="translate(255,160)"><path d="M-34 -40h68l-10 78a8 8 0 0 1-8 7h-24a8 8 0 0 1-8-7z" fill="#e23b3b"/><path d="M-34 -40h68l-2 16h-64z" fill="#fff"/><g fill="#ffce5c"><rect x="-24" y="-58" width="7" height="30" rx="2"/><rect x="-12" y="-64" width="7" height="36" rx="2"/><rect x="0" y="-60" width="7" height="32" rx="2"/><rect x="12" y="-66" width="7" height="38" rx="2"/></g></g>
       <g transform="translate(330,185)"><path d="M-22 -34h44l-5 60a6 6 0 0 1-6 5h-16a6 6 0 0 1-6-5z" fill="#fff" opacity=".95"/><rect x="-24" y="-40" width="48" height="9" rx="3" fill="#cfd8d2"/><rect x="-3" y="-58" width="6" height="20" fill="#cfd8d2"/><path d="M-18 -20h36" stroke="#c0392b" stroke-width="6"/></g>`,

    "boquitas": () => open() + defs +
      `<rect width="400" height="300" fill="url(#warm)"/>
       <ellipse cx="200" cy="180" rx="140" ry="80" fill="#fff" opacity=".96"/><ellipse cx="200" cy="180" rx="140" ry="80" fill="none" stroke="#e2c08a" stroke-width="4"/>
       <g fill="#f6c453" stroke="#dba62f" stroke-width="2">
         <polygon points="120,140 150,150 128,176"/><polygon points="155,135 188,142 162,170"/><polygon points="195,138 226,150 200,174"/><polygon points="235,142 262,156 232,176"/><polygon points="140,176 170,182 146,202"/><polygon points="180,178 210,188 184,206"/></g>
       <g fill="#c9772e"><ellipse cx="250" cy="150" rx="20" ry="13" transform="rotate(-20 250 150)"/><rect x="262" y="150" width="14" height="6" rx="3" fill="#efe2c0" transform="rotate(-20 262 150)"/></g>
       <g fill="#c9772e"><ellipse cx="275" cy="185" rx="20" ry="13" transform="rotate(15 275 185)"/><rect x="287" y="190" width="14" height="6" rx="3" fill="#efe2c0" transform="rotate(15 287 190)"/></g>
       <ellipse cx="165" cy="160" rx="16" ry="10" fill="#c0392b"/><ellipse cx="205" cy="158" rx="14" ry="9" fill="#6abf4b"/>`,

    "hidratacion": () => open() + defs +
      `<rect width="400" height="300" fill="url(#teal)"/>
       ${[110,175,240,305].map((x,i)=>{const c=['#5ab0ff','#a3e635','#ff7a45','#ffd24a'][i];return `<g transform="translate(${x},150)"><rect x="-22" y="-58" width="44" height="120" rx="14" fill="#dff3ff" opacity=".92"/><rect x="-22" y="-10" width="44" height="72" rx="12" fill="${c}"/><rect x="-13" y="-74" width="26" height="20" rx="5" fill="#0a3a3a"/><rect x="-22" y="-2" width="44" height="14" fill="#fff" opacity=".55"/></g>`}).join('')}`,

    "membresia": () => open() + defs +
      `<rect width="400" height="300" fill="url(#dark)"/>
       <g transform="translate(200,150) rotate(-8)">
         <rect x="-130" y="-78" width="260" height="156" rx="18" fill="#103a32"/>
         <rect x="-130" y="-78" width="260" height="156" rx="18" fill="none" stroke="#a3e635" stroke-width="2.5"/>
         <rect x="-130" y="-78" width="260" height="44" rx="18" fill="#16a34a" opacity=".5"/>
         <text x="-112" y="-46" font-family="Segoe UI,Arial" font-size="20" font-weight="900" fill="#fff">GamaPro</text>
         <rect x="-112" y="-18" width="46" height="34" rx="6" fill="#ffd24a"/><path d="M-112 -2h46M-89 -18v34" stroke="#c99a16" stroke-width="1.5"/>
         <path d="M70 -34l7 15 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2z" fill="#a3e635"/>
         <text x="-112" y="48" font-family="Consolas,monospace" font-size="16" letter-spacing="3" fill="#cfe0d8">5040 0000 PRO</text>
         <text x="-112" y="68" font-family="Segoe UI,Arial" font-size="11" fill="#8ba398">MIEMBRO GAMASPORT</text>
       </g>`,

    "balon-petos": () => open() + defs +
      `<rect width="400" height="300" fill="url(#pitch)"/>${pitchLines(0.4)}
       ${ball(135, 165, 46)}
       <g transform="translate(265,150)">
         <path d="M-46 -34l24 -14 12 10 12 -10 24 14-12 22-10-5v52h-28v-52l-10 5z" fill="#ff6b3d"/>
         <path d="M-46 -34l24 -14 12 10 12 -10 24 14-12 22-10-5v52h-28v-52l-10 5z" fill="none" stroke="#d94f24" stroke-width="2"/>
       </g>
       <g transform="translate(310,195)" opacity=".9">
         <path d="M-40 -30l21 -12 10 8 10 -8 21 12-10 19-9-4v45h-24v-45l-9 4z" fill="#ffd24a"/>
       </g>`
  };

  function productArt(key) {
    const fn = ART[key] || ART["cancha-diurna"];
    return fn() + "</svg>";
  }

  /* mapa de fondo estilizado para contacto */
  function mapArt() {
    return open('aria-label="Mapa de ubicación de GamaSport"') + defs +
      `<rect width="400" height="300" fill="#e8efe9"/>
       <g stroke="#cdd9ce" stroke-width="10" fill="none"><path d="M-20 90H420"/><path d="M-20 210H420"/><path d="M120 -20V320"/><path d="M280 -20V320"/></g>
       <g stroke="#dfe8e0" stroke-width="4" fill="none"><path d="M-20 150H420"/><path d="M200 -20V320"/></g>
       <rect x="135" y="105" width="60" height="40" rx="3" fill="#d6e3d7"/><rect x="300" y="220" width="50" height="40" rx="3" fill="#d6e3d7"/><rect x="40" y="220" width="55" height="40" rx="3" fill="#d6e3d7"/>
       <path d="M120 90 Q200 110 280 90" stroke="#a3e635" stroke-width="6" fill="none" stroke-dasharray="2 10" stroke-linecap="round"/>
       <g transform="translate(248,150)"><path d="M0 0c-14-18-22-28-22-40a22 22 0 0 1 44 0c0 12-8 22-22 40z" fill="#16a34a"/><circle cx="0" cy="-40" r="9" fill="#fff"/></g>
       <text x="252" y="178" font-family="Segoe UI,Arial" font-size="12" font-weight="800" fill="#0a1c24" text-anchor="middle">GamaSport</text>`
      + "</svg>";
  }

  /* Exponer en window */
  window.GS_ASSETS = { icon, productArt, mapArt, LOGO };
})();
