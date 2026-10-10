/* Bodas · Connect Studios: barra, apariciones, cursor, frases, visor, películas y cotizador.
   Lo usan la página principal (/bodas/), cada historia y las guías. */
(function () {
  window.__BODAS = true;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- barra: se vuelve sólida al bajar y se esconde mientras sigues bajando ---------- */
  const barra = $(".barra");
  if (barra) {
    let y0 = scrollY;
    const alto = () => ($(".portada")?.offsetHeight || 0) - 90;
    const pinta = () => {
      const y = scrollY;
      barra.classList.toggle("solida", y > Math.max(alto(), 40));
      barra.classList.toggle("oculta", y > 400 && y > y0 + 4);
      if (y < y0 - 4 || y < 400) barra.classList.remove("oculta");
      y0 = y;
    };
    addEventListener("scroll", pinta, { passive: true }); pinta();
  }

  /* ---------- aparición de bloques al hacer scroll ---------- */
  if ("IntersectionObserver" in window && !quieto) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("vis"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    $$("[data-r]").forEach(el => io.observe(el));
  } else $$("[data-r]").forEach(el => el.classList.add("vis"));

  /* ---------- cursor "Ver" sobre fotos e historias (solo con mouse) ---------- */
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const c = document.createElement("div"); c.className = "cursor"; document.body.appendChild(c);
    let x = 0, y = 0, cx = 0, cy = 0, vivo = false;
    addEventListener("pointermove", e => { x = e.clientX; y = e.clientY; if (!vivo) { vivo = true; requestAnimationFrame(mueve); } }, { passive: true });
    function mueve() { cx += (x - cx) * .22; cy += (y - cy) * .22; c.style.translate = `${cx}px ${cy}px`; if (Math.abs(x - cx) + Math.abs(y - cy) > .5) requestAnimationFrame(mueve); else vivo = false; }
    document.addEventListener("pointerover", e => { const t = e.target.closest("[data-ver]"); if (t) { c.textContent = t.dataset.ver; c.classList.add("on"); } });
    document.addEventListener("pointerout", e => { const t = e.target.closest("[data-ver]"); if (t && !t.contains(e.relatedTarget)) c.classList.remove("on"); });
  }

  /* ---------- carrusel de historias ----------
     Compu: flechas solo si hay más bodas de las que caben. Celular: la fila avanza sola muy despacio
     hacia la derecha, en bucle (con copias de las tarjetas); si la tocan, se pausa unos segundos. */
  const cel = matchMedia("(max-width: 900px)");
  $$("[data-carrusel]").forEach(c => {
    const pista = $(".tiras", c);
    if (!pista) return;
    const originales = [...pista.children];
    const paso = () => (originales[0]?.offsetWidth || 300) + parseFloat(getComputedStyle(pista).columnGap || 16);
    $(".ant", c)?.addEventListener("click", () => pista.scrollBy({ left: -paso(), behavior: "smooth" }));
    $(".sig", c)?.addEventListener("click", () => pista.scrollBy({ left: paso(), behavior: "smooth" }));
    const mide = () => c.classList.toggle("desborda", pista.scrollWidth > pista.clientWidth + 4);
    addEventListener("resize", mide); mide();

    if (quieto || originales.length < 2) return;
    originales.forEach(t => {
      const k = t.cloneNode(true);
      k.classList.add("clon", "vis"); k.removeAttribute("data-r");
      k.setAttribute("aria-hidden", "true"); k.tabIndex = -1;
      pista.appendChild(k);
    });
    const vuelta = () => pista.children[originales.length].offsetLeft - originales[0].offsetLeft;
    const VEL = 22;                                // px por segundo: lento, apenas se nota que camina
    let x = 0, pausa = 0, antes = 0;
    const espera = () => { pausa = Date.now() + 4000; };
    ["touchstart", "pointerdown", "wheel"].forEach(ev => pista.addEventListener(ev, espera, { passive: true }));
    pista.addEventListener("scroll", () => {
      if (Date.now() > pausa) return;
      x = pista.scrollLeft;                       // el usuario la movió: seguimos desde ahí
      if (x >= vuelta()) { x -= vuelta(); pista.scrollLeft = x; }
    }, { passive: true });
    (function anda() {
      const t = performance.now(), dt = antes ? Math.min(.1, (t - antes) / 1000) : 0; antes = t;
      const r = pista.getBoundingClientRect();
      if (cel.matches && r.bottom > 0 && r.top < innerHeight && Date.now() > pausa) {
        x += VEL * dt;                              // según el tiempo real, aunque el celular vaya a pocos cuadros
        if (x >= vuelta()) x -= vuelta();
        pista.scrollLeft = x;
      }
      requestAnimationFrame(anda);
    })();
  });

  /* ---------- línea beige que serpentea de foto en foto en la galería de cada historia ----------
     Pasa por el centro de cada foto (queda detrás de ellas) y se va dibujando al bajar. */
  const rev = $(".revista");
  if (rev) {
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg"); svg.classList.add("serpentina"); svg.setAttribute("aria-hidden", "true");
    const linea = document.createElementNS(NS, "path"), eco = document.createElementNS(NS, "path");
    svg.append(linea, eco); rev.prepend(svg);
    // Posición sin contar el transform de la animación de aparición
    const sobre = (el) => { let x = 0, y = 0; while (el && el !== rev) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; } return [x, y]; };
    const curva = (p) => {               // Catmull-Rom → Bézier: una curva suave que pasa por todos los puntos
      let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
      for (let i = 0; i < p.length - 1; i++) {
        const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
        d += ` C${(b[0] + (c[0] - a[0]) / 6).toFixed(1)},${(b[1] + (c[1] - a[1]) / 6).toFixed(1)} ${(c[0] - (e[0] - b[0]) / 6).toFixed(1)},${(c[1] - (e[1] - b[1]) / 6).toFixed(1)} ${c[0].toFixed(1)},${c[1].toFixed(1)}`;
      }
      return d;
    };
    let largo = 0, largoEco = 0;
    const traza = () => {
      const bs = $$(".m button", rev);
      if (!bs.length) return;
      const pts = bs.map(b => { const [x, y] = sobre(b); return [x + b.offsetWidth / 2, y + b.offsetHeight / 2]; });
      const w = rev.clientWidth;
      pts.unshift([w * .08, pts[0][1] - 160]);                     // entra desde la izquierda, bajo el título
      pts.push([w * .92, pts[pts.length - 1][1] + 140]);
      // Entre cada par de fotos, un punto desplazado hacia un lado y luego hacia el otro: así ondula como serpentina
      const ond = [];
      pts.forEach((a, i) => {
        ond.push(a);
        const b = pts[i + 1]; if (!b) return;
        const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
        const amp = Math.min(l * .3, w * .3) * (i % 2 ? 1 : -1);
        const mx = (a[0] + b[0]) / 2 - dy / l * amp, my = (a[1] + b[1]) / 2 + dx / l * amp;
        ond.push([Math.min(w * .98, Math.max(w * .02, mx)), my]);
      });
      pts.splice(0, pts.length, ...ond);
      svg.setAttribute("height", rev.scrollHeight); svg.setAttribute("viewBox", `0 0 ${w} ${rev.scrollHeight}`);
      linea.setAttribute("d", curva(pts));
      eco.setAttribute("d", curva(pts.map(([x, y], i) => [x + (i % 2 ? 22 : -22), y + 14])));   // segunda hebra, más tenue
      largo = linea.getTotalLength(); largoEco = eco.getTotalLength();
      [[linea, largo], [eco, largoEco]].forEach(([p, l]) => { p.style.strokeDasharray = l; });
      dibuja();
    };
    const dibuja = () => {
      const r = rev.getBoundingClientRect();
      const avance = quieto ? 1 : Math.min(1, Math.max(0, (innerHeight * .85 - r.top) / r.height));
      linea.style.strokeDashoffset = largo * (1 - avance);
      eco.style.strokeDashoffset = largoEco * (1 - Math.min(1, avance * 1.02));
    };
    let pend = false;
    addEventListener("scroll", () => { if (!pend) { pend = true; requestAnimationFrame(() => { pend = false; dibuja(); }); } }, { passive: true });
    let t; addEventListener("resize", () => { clearTimeout(t); t = setTimeout(traza, 200); });
    traza();
    // Las letras del título pueden mover todo unos píxeles al cargar: se vuelve a trazar
    document.fonts?.ready.then(traza); addEventListener("load", traza);
  }

  /* ---------- frases que se van turnando ---------- */
  $$(".rot").forEach(f => {
    const ss = $$("span", f); let i = 0;
    if (ss.length < 2 || quieto) return;
    setInterval(() => { ss[i].classList.remove("on"); i = (i + 1) % ss.length; ss[i].classList.add("on"); }, 3600);
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
  function abre() { lb.classList.add("on"); document.body.style.overflow = "hidden"; $(".cursor")?.classList.remove("on"); }
  function cierra() {
    lb.classList.remove("on"); cuerpo.innerHTML = ""; document.body.style.overflow = "";
    if (alCerrar) { alCerrar(); alCerrar = null; }
  }
  const mueveLb = d => { if (lista.length > 1) { pos = (pos + d + lista.length) % lista.length; muestra(); } };
  $(".x", lb).onclick = cierra;
  $(".ant", lb).onclick = () => mueveLb(-1);
  $(".sig", lb).onclick = () => mueveLb(1);
  lb.addEventListener("click", e => { if (e.target === lb || e.target === cuerpo) cierra(); });
  addEventListener("keydown", e => {
    if (!lb.classList.contains("on")) return;
    if (e.key === "Escape") cierra();
    if (e.key === "ArrowRight") mueveLb(1);
    if (e.key === "ArrowLeft") mueveLb(-1);
  });
  let x0 = null;
  lb.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) mueveLb(dx < 0 ? 1 : -1);
  });
  // Cada grupo [data-lb] es una galería; el collage repite fotos para el bucle, así que se quitan las repetidas
  $$("[data-lb]").forEach(g => {
    const bs = $$("button[data-full]", g);
    const unicas = [...new Set(bs.map(b => b.dataset.full))];
    bs.forEach(b => b.addEventListener("click", () => {
      lista = unicas; pos = unicas.indexOf(b.dataset.full); muestra();
      $(".ant", lb).hidden = $(".sig", lb).hidden = $(".cont", lb).hidden = lista.length < 2;
      abre();
    }));
  });

  /* ---------- películas: avance sin sonido mientras está en pantalla; clic = película completa ---------- */
  const yt = id => `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1" title="Película de boda" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  const obs = "IntersectionObserver" in window && !quieto ? new IntersectionObserver(es => es.forEach(e => {
    const vid = e.target;
    if (e.isIntersecting) { if (!vid.src) vid.src = vid.dataset.src; vid.play().catch(() => {}); } else vid.pause();
  }), { threshold: .3 }) : null;
  $$(".peli").forEach(p => {
    const vid = $("video", p);
    if (vid && obs) obs.observe(vid);
    p.addEventListener("click", () => {
      lista = []; abre();
      $(".ant", lb).hidden = $(".sig", lb).hidden = $(".cont", lb).hidden = true;
      cuerpo.innerHTML = `<div class="yt">${yt(p.dataset.yt)}</div>`;
      if (vid) { vid.pause(); alCerrar = () => vid.play().catch(() => {}); }
    });
  });
  // En la historia la película va incrustada: YouTube se carga solo al tocarla
  $$(".yt-lite").forEach(b => b.addEventListener("click", () => { b.innerHTML = yt(b.dataset.yt); b.removeAttribute("data-ver"); $(".cursor")?.classList.remove("on"); }, { once: true }));

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
    id("lbl").textContent = sel ? larga(sel) : "Elijan su fecha";
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

  // Un solo precio según el destino (ya trae lo del viaje), sin desglose
  function precio() {
    const mx = id("pais").value === "México";
    id("edoF").hidden = !mx;
    const tot = BASE + (mx ? MX[id("edo").value] : INTL[id("pais").value]);
    id("tot").innerHTML = fmt(tot) + "<sup>MXN</sup>";
    id("res").innerHTML = `Reservar con ${fmt(Math.round(tot * RESERVA / 500) * 500)} <span class="flecha">→</span>`;
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
    err.textContent = ""; b.disabled = true; const txt = b.innerHTML; b.textContent = "Abriendo pago…";
    try {
      const r = await fetch(API + "/functions/v1/stripe-pagos", {
        method: "POST", headers: { apikey: LLAVE, "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "boda", fecha: iso(sel), pais: id("pais").value, estado: mx ? id("edo").value : "",
                               lugar: id("lugar").value, nombre: nom, correo: mail, whatsapp: wa })
      });
      const d = await r.json();
      if (!r.ok || !d.url) throw new Error(d.error || "No se pudo abrir el pago. Intenten de nuevo.");
      // Medición (Meta y Google): se abrió el pago. Solo va el monto del anticipo, nunca los datos de la pareja.
      // Se guarda para contar la reserva una sola vez al volver de Stripe.
      const valor = Math.round(precio() * RESERVA / 500) * 500;
      try { localStorage.setItem("cs.boda.pago", JSON.stringify({ valor, t: Date.now() })); } catch (x) { /* sin almacenamiento */ }
      if (window.csMedir) window.csMedir("InitiateCheckout", "begin_checkout", { value: valor, currency: "MXN" });
      setTimeout(() => { location.href = d.url; }, 400);   // deja salir el aviso antes de cambiar de página
    } catch (e) {
      err.textContent = e.message; b.disabled = false; b.innerHTML = txt;
    }
  };

  if (new URLSearchParams(location.search).get("pago") === "ok") {
    id("s1").hidden = true; id("s3").hidden = false;
    setTimeout(() => $(".tarjeta-cal").scrollIntoView({ block: "center" }), 300);
    // Medición: la reserva quedó pagada. Se cuenta una sola vez y solo si el pago se abrió desde este navegador.
    try {
      const p = JSON.parse(localStorage.getItem("cs.boda.pago") || "null");
      if (p && Date.now() - p.t < 864e5) {
        localStorage.removeItem("cs.boda.pago");
        const medir = () => { if (window.csMedir) window.csMedir("Purchase", "purchase", { value: p.valor, currency: "MXN" }); };
        if (document.readyState === "complete") medir(); else addEventListener("load", medir);
      }
    } catch (x) { /* sin almacenamiento */ }
  }
  render();
})();
