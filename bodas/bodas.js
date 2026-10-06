/* Bodas Premium: portada en video, frases, carrusel, visor de fotos, películas y cotizador.
   Lo usan la página principal (/bodas/) y cada historia (/bodas/<pareja>/). */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- portada en video: versión ligera en celular ---------- */
  const v = $(".hero video");
  if (v) {
    const src = innerWidth < 760 ? v.dataset.cel : v.dataset.src;
    if (!quieto && src) { v.src = src; v.play().catch(() => {}); }
  }

  /* ---------- frases que se van turnando ---------- */
  $$(".frase:not(.fija)").forEach(f => {
    const ss = $$("span", f); let i = 0;
    if (ss.length < 2 || quieto) return;
    setInterval(() => { ss[i].classList.remove("on"); i = (i + 1) % ss.length; ss[i].classList.add("on"); }, 3400);
  });

  /* ---------- carrusel de historias ---------- */
  $$("[data-carrusel]").forEach(c => {
    const pista = $(".carrusel", c), paso = () => ($(".tarjeta", pista)?.offsetWidth || 300) + 14;
    $(".ant", c)?.addEventListener("click", () => pista.scrollBy({ left: -paso(), behavior: "smooth" }));
    $(".sig", c)?.addEventListener("click", () => pista.scrollBy({ left: paso(), behavior: "smooth" }));
  });

  /* ---------- visor a pantalla completa ---------- */
  const lb = document.createElement("div");
  lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true");
  lb.innerHTML = '<button class="x" aria-label="Cerrar">✕</button><button class="ant" aria-label="Anterior">‹</button><button class="sig" aria-label="Siguiente">›</button><div class="cuerpo"></div><div class="cont"></div>';
  document.body.appendChild(lb);
  const cuerpo = $(".cuerpo", lb);
  let lista = [], pos = 0, alCerrar = null;
  function muestra() {
    cuerpo.innerHTML = `<img src="${lista[pos]}" alt="">`;
    $(".cont", lb).textContent = `${pos + 1} / ${lista.length}`;
    [lista[pos + 1], lista[pos - 1]].forEach(s => { if (s) new Image().src = s; });
  }
  function abre(srcs, i) {
    lista = srcs; pos = i; muestra();
    $(".ant", lb).hidden = $(".sig", lb).hidden = $(".cont", lb).hidden = lista.length < 2;
    lb.classList.add("on"); document.body.style.overflow = "hidden";
  }
  function cierra() {
    lb.classList.remove("on"); cuerpo.innerHTML = ""; document.body.style.overflow = "";
    if (alCerrar) { alCerrar(); alCerrar = null; }
  }
  const mueve = d => { if (lista.length > 1) { pos = (pos + d + lista.length) % lista.length; muestra(); } };
  $(".x", lb).onclick = cierra;
  $(".ant", lb).onclick = () => mueve(-1);
  $(".sig", lb).onclick = () => mueve(1);
  lb.addEventListener("click", e => { if (e.target === lb || e.target === cuerpo) cierra(); });
  addEventListener("keydown", e => {
    if (!lb.classList.contains("on")) return;
    if (e.key === "Escape") cierra();
    if (e.key === "ArrowRight") mueve(1);
    if (e.key === "ArrowLeft") mueve(-1);
  });
  let x0 = null;
  lb.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) mueve(dx < 0 ? 1 : -1);
  });
  $$("[data-lb]").forEach(g => {
    const bs = $$("button", g);
    bs.forEach((b, i) => b.addEventListener("click", () => abre(bs.map(x => $("img", x).currentSrc || $("img", x).src), i)));
  });

  /* ---------- películas: avance sin sonido al estar en pantalla; clic = película completa ---------- */
  const yt = id => `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1" title="Película de boda" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  const obs = "IntersectionObserver" in window && !quieto ? new IntersectionObserver(es => es.forEach(e => {
    const vid = e.target;
    if (e.isIntersecting) { if (!vid.src) vid.src = vid.dataset.src; vid.play().catch(() => {}); } else vid.pause();
  }), { threshold: .35 }) : null;
  $$(".peli").forEach(p => {
    const vid = $("video", p);
    if (vid && obs) obs.observe(vid);
    p.addEventListener("click", () => {
      lista = []; lb.classList.add("on"); document.body.style.overflow = "hidden";
      $(".ant", lb).hidden = $(".sig", lb).hidden = $(".cont", lb).hidden = true;
      cuerpo.innerHTML = `<div class="yt">${yt(p.dataset.yt)}</div>`;
      if (vid) { vid.pause(); alCerrar = () => vid.play().catch(() => {}); }
    });
  });
  // En la historia el video va incrustado: carga YouTube solo al tocarlo
  $$(".yt-lite").forEach(b => b.addEventListener("click", () => { b.innerHTML = yt(b.dataset.yt); }, { once: true }));

  /* ---------- cotizador ---------- */
  const caja = $("#reservar");
  if (!caja) return;
  const API = "https://ypguioklwhyixacfuksu.supabase.co";
  const LLAVE = "sb_publishable_qjTIY_M5HJ9R653m_uOmXw_bBbVTibS";
  // La base (tabla boda_destinos) es la que manda: estos números solo sirven si no responde
  let BASE = 25000, RESERVA = 0.2, OCUPADAS = new Set();
  let MX = {
    "Jalisco": 0, "Aguascalientes": 3000, "Colima": 3000, "Guanajuato": 3000, "Michoacán": 3000, "Nayarit": 3000, "Zacatecas": 3000,
    "Querétaro": 4000, "San Luis Potosí": 4000,
    "Ciudad de México": 8000, "Estado de México": 8000, "Morelos": 8000, "Hidalgo": 8000, "Puebla": 8000, "Tlaxcala": 8000,
    "Nuevo León": 9000, "Coahuila": 9000, "Durango": 9000, "Sinaloa": 9000, "Tamaulipas": 9000, "Guerrero": 9000, "Veracruz": 9000,
    "Oaxaca": 10000, "Sonora": 10000, "Chihuahua": 10000, "Baja California": 11000, "Baja California Sur": 11000,
    "Tabasco": 11000, "Chiapas": 11000, "Quintana Roo": 12000, "Yucatán": 12000, "Campeche": 12000
  };
  let INTL = { "Belice": 20000, "Costa Rica": 22000, "España": 40000 };

  const id = s => document.getElementById(s);
  const fmt = n => "$" + Number(n).toLocaleString("es-MX");
  const MES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  let y = hoy.getFullYear(), m = hoy.getMonth(), sel = null;
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const larga = d => { const s = d.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); return s[0].toUpperCase() + s.slice(1); };

  function render() {
    const y0 = hoy.getFullYear();
    id("yrs").innerHTML = [0, 1, 2].map(i => `<button type="button" class="${y === y0 + i ? "on" : ""}" data-y="${y0 + i}">${y0 + i}</button>`).join("");
    id("mos").innerHTML = MES.map((t, i) => `<button type="button" data-m="${i}" class="${i === m ? "on" : ""}" ${y === y0 && i < hoy.getMonth() ? "disabled" : ""}>${t}</button>`).join("");
    const first = new Date(y, m, 1).getDay(), n = new Date(y, m + 1, 0).getDate();
    let h = "DLMIJVS".split("").map(d => `<b>${d}</b>`).join("") + "<span></span>".repeat(first);
    for (let d = 1; d <= n; d++) {
      const dt = new Date(y, m, d), w = dt.getDay(), oc = OCUPADAS.has(iso(dt));
      const on = sel && +sel === +dt;
      h += `<button type="button" data-d="${d}" class="${w === 0 || w === 5 || w === 6 ? "we" : ""} ${on ? "on" : ""} ${oc ? "oc" : ""}" ${dt <= hoy || oc ? "disabled" : ""} ${oc ? 'title="Fecha apartada"' : ""}>${d}</button>`;
    }
    id("days").innerHTML = h;
    id("go").disabled = !sel;
    id("lbl").textContent = sel ? larga(sel) : "Selecciona una fecha disponible";
  }
  id("yrs").onclick = e => { const b = e.target.closest("[data-y]"); if (b) { y = +b.dataset.y; if (y === hoy.getFullYear() && m < hoy.getMonth()) m = hoy.getMonth(); render(); } };
  id("mos").onclick = e => { const b = e.target.closest("[data-m]"); if (b && !b.disabled) { m = +b.dataset.m; render(); } };
  id("days").onclick = e => { const b = e.target.closest("[data-d]"); if (b && !b.disabled) { sel = new Date(y, m, +b.dataset.d); render(); } };

  function lugares() {
    id("pais").innerHTML = ["México", ...Object.keys(INTL)].map(p => `<option>${p}</option>`).join("");
    id("edo").innerHTML = Object.keys(MX).sort((a, b) => a.localeCompare(b, "es")).map(s => `<option ${s === "Jalisco" ? "selected" : ""}>${s}</option>`).join("");
  }
  lugares();
  fetch(API + "/rest/v1/rpc/bodas_info", { method: "POST", headers: { apikey: LLAVE, "Content-Type": "application/json" }, body: "{}" })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(d => {
      BASE = +d.base; RESERVA = +d.anticipo; OCUPADAS = new Set(d.ocupadas);
      MX = {}; INTL = {};
      d.destinos.forEach(x => { if (x.pais === "México") MX[x.estado] = +x.viaticos; else INTL[x.pais] = +x.viaticos; });
      lugares(); render();
    }).catch(() => {});

  function precio() {
    const mx = id("pais").value === "México";
    id("edoF").hidden = !mx;
    const via = mx ? MX[id("edo").value] : INTL[id("pais").value];
    const tot = BASE + via;
    id("base").innerHTML = fmt(BASE) + "<sup>MXN</sup>";
    id("via").innerHTML = via ? fmt(via) + "<sup>MXN</sup>" : "Incluidos";
    id("tot").innerHTML = fmt(tot) + "<sup>MXN</sup>";
    id("res").textContent = "Reserva con " + fmt(Math.round(tot * RESERVA / 500) * 500);
    return tot;
  }
  id("pais").onchange = id("edo").onchange = precio;
  id("go").onclick = () => { id("s1").hidden = true; id("s2").hidden = false; id("fecha").textContent = larga(sel); precio(); };
  id("bk").onclick = () => { id("s2").hidden = true; id("s1").hidden = false; };

  id("res").onclick = async () => {
    const mx = id("pais").value === "México", err = id("err"), b = id("res");
    const nom = id("nom").value.trim(), mail = id("mail").value.trim(), wa = id("wa").value.trim();
    if (nom.length < 3) { err.textContent = "Escriban sus nombres."; return id("nom").focus(); }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) { err.textContent = "Revisen el correo."; return id("mail").focus(); }
    if (wa.replace(/\D/g, "").length < 10) { err.textContent = "Escriban un WhatsApp de 10 dígitos."; return id("wa").focus(); }
    err.textContent = ""; b.disabled = true; const txt = b.textContent; b.textContent = "Abriendo pago…";
    try {
      const r = await fetch(API + "/functions/v1/stripe-pagos", {
        method: "POST", headers: { apikey: LLAVE, "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "boda", fecha: iso(sel), pais: id("pais").value, estado: mx ? id("edo").value : "",
                               lugar: id("lugar").value, nombre: nom, correo: mail, whatsapp: wa })
      });
      const d = await r.json();
      if (!r.ok || !d.url) throw new Error(d.error || "No se pudo abrir el pago. Intenten de nuevo.");
      location.href = d.url;
    } catch (e) {
      err.textContent = e.message; b.disabled = false; b.textContent = txt;
    }
  };

  if (new URLSearchParams(location.search).get("pago") === "ok") {
    id("s1").hidden = true; id("s3").hidden = false;
    setTimeout(() => caja.scrollIntoView({ block: "center" }), 300);
  }
  render();
})();
