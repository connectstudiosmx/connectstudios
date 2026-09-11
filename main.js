(function () {
  "use strict";

  var data = window.__BRAND__ || {};

  /* ---------- helpers ---------- */
  var $  = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var reduced   = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* =============================================================
     Splash — doble red de seguridad.
     Se quita en 'load' O a los 1200 ms, lo que ocurra primero.
     Si JS muere antes, la clase .js-splash nunca se agrega y la
     cortinilla no existe. Nunca puede dejar la pagina en negro.
     ============================================================= */
  function initSplash() {
    var root = document.documentElement;
    if (reduced) return;
    root.classList.add("js-splash");

    var done = false;
    function close() {
      if (done) return;
      done = true;
      root.classList.add("splash-done");
      setTimeout(function () { root.classList.remove("js-splash"); }, 800);
    }
    if (document.readyState === "complete") setTimeout(close, 550);
    else window.addEventListener("load", function () { setTimeout(close, 350); });
    setTimeout(close, 1200);            /* red de seguridad dura */
  }

  /* =============================================================
     Nav — transparente sobre el hero, solida al pasarlo
     ============================================================= */
  function initNav() {
    var nav = $("#nav");
    if (!nav) return;

    var solid = false;
    function onScroll() {
      var should = window.scrollY > 60;
      if (should !== solid) { solid = should; nav.classList.toggle("is-solid", should); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    var toggle = $("#nav-toggle"), panel = $("#nav-mobile");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!open));
        panel.hidden = open;
      });
      $$("a", panel).forEach(function (a) {
        a.addEventListener("click", function () {
          toggle.setAttribute("aria-expanded", "false");
          panel.hidden = true;
        });
      });
    }
  }

  /* =============================================================
     El loop del fondo del hero (manifest.reel.loop). Es un clip corto
     y mudo, no el reel completo: ese va por YouTube en El trabajo.
     En moviles nunca se monta: poster fijo (bateria y datos).
     ============================================================= */
  function mountReel() {
    var slot = $("[data-reel]");
    var reel = data.reel;
    if (!slot || !reel || !reel.loop) return;
    if (!fineHover || window.innerWidth < 960) return;
    if (slot.querySelector("video")) return;

    var v = document.createElement("video");
    v.src = reel.loop;
    if (reel.poster) v.poster = reel.poster;
    v.muted = true; v.loop = true; v.autoplay = true;
    v.playsInline = true; v.setAttribute("playsinline", "");
    v.preload = "metadata";
    v.setAttribute("aria-hidden", "true");
    v.addEventListener("loadeddata", function () {
      var img = slot.querySelector("img");
      if (img) img.remove();
    });
    slot.appendChild(v);
    var p = v.play();
    if (p && p.catch) p.catch(function () { /* si el navegador lo bloquea, queda el poster */ });

    /* fuera de pantalla no se decodifica: nadie lo esta viendo */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { var q = v.play(); if (q && q.catch) q.catch(function () {}); }
          else v.pause();
        });
      }, { threshold: 0 }).observe(slot);
    }
  }

  /* =============================================================
     Particulas del hero — canvas 2D, ~4 KB, sin librerias.
     Deriva lenta con profundidad + repulsion suave del cursor.
     Se pausa sola fuera de vista y con la pestaña en segundo plano.
     ============================================================= */
  function initParticles() {
    if (reduced) return;
    var cv = $("#particles");
    var hero = $(".hero");
    if (!cv || !hero || !cv.getContext) return;

    var ctx = cv.getContext("2d", { alpha: true });
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, parts = [], raf = null, running = false;
    var mouse = { x: -9999, y: -9999, on: false };

    var ACCENT = [57, 255, 136];
    var CREAM  = [242, 239, 233];

    function count() {
      var base = Math.round((w * h) / 17000);
      var cap = (fineHover && w >= 960) ? 90 : 34;
      return Math.max(14, Math.min(base, cap));
    }

    function build() {
      parts = [];
      var n = count();
      /* en pantallas chicas los puntos grandes se leen como manchas,
         no como polvo: se achican y se atenuan */
      var chico = w < 720;
      var rMax = chico ? 1.05 : 1.7;
      var aMax = chico ? 0.24 : 0.34;
      for (var i = 0; i < n; i++) {
        var z = Math.random();                     /* profundidad 0..1 */
        parts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.16 * (0.35 + z),
          vy: (Math.random() - 0.5) * 0.13 * (0.35 + z) - 0.02,
          r: 0.45 + z * rMax,
          a: 0.06 + z * aMax,
          verde: Math.random() < 0.12,
          ox: 0, oy: 0                             /* desplazamiento por cursor */
        });
      }
    }

    function resize() {
      var rect = hero.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      var R = 130, R2 = R * R;

      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx;
        p.y += p.vy;

        /* envolver bordes */
        if (p.x < -8) p.x = w + 8; else if (p.x > w + 8) p.x = -8;
        if (p.y < -8) p.y = h + 8; else if (p.y > h + 8) p.y = -8;

        /* repulsion suave del cursor */
        var tx = 0, ty = 0;
        if (mouse.on) {
          var dx = p.x - mouse.x, dy = p.y - mouse.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > 0.01) {
            var d = Math.sqrt(d2);
            var f = (1 - d / R) * 26 * (0.4 + p.r / 2.2);
            tx = (dx / d) * f;
            ty = (dy / d) * f;
          }
        }
        p.ox += (tx - p.ox) * 0.08;
        p.oy += (ty - p.oy) * 0.08;

        var c = p.verde ? ACCENT : CREAM;
        ctx.beginPath();
        ctx.arc(p.x + p.ox, p.y + p.oy, p.r, 0, 6.2832);
        ctx.fillStyle = "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + (p.verde ? p.a * 0.85 : p.a) + ")";
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    function start() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
    function stop()  { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

    resize();
    start();

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(resize, 180);
    });

    if (fineHover) {
      hero.addEventListener("pointermove", function (e) {
        var rect = hero.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.on = true;
      });
      hero.addEventListener("pointerleave", function () { mouse.on = false; });
    }

    /* pausa cuando el hero sale de pantalla */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { en.isIntersecting ? start() : stop(); });
      }, { threshold: 0 }).observe(hero);
    }

    /* pausa con la pestaña en segundo plano */
    document.addEventListener("visibilitychange", function () {
      document.hidden ? stop() : start();
    });
  }

  /* =============================================================
     Reveals al hacer scroll.
     Umbral 0.05 + temporizador de rescate: si el observer no
     dispara (navegador raro, seccion mas alta que la ventana),
     el contenido aparece igual a los 2 s.
     ============================================================= */
  function initReveals() {
    var items = $$(".reveal");
    if (!items.length) return;

    /* Escalonado: dentro de un contenedor [data-stagger] cada hijo
       entra despues del anterior, en vez de aparecer todos de golpe.
       El numero del atributo son los milisegundos entre uno y otro. */
    $$("[data-stagger]").forEach(function (grupo) {
      var paso = parseInt(grupo.getAttribute("data-stagger"), 10) || 120;
      $$(".reveal", grupo).forEach(function (el, i) {
        el.style.transitionDelay = (i * paso) + "ms";
      });
    });

    function show(el) { el.classList.add("is-in"); }

    if (!("IntersectionObserver" in window)) { items.forEach(show); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -12% 0px" });

    items.forEach(function (el) { io.observe(el); });

    /* rescate: si el observer nunca dispara, el contenido aparece igual.
       Se cuenta el escalonado mas largo para no cortarlo a media entrada. */
    setTimeout(function () { items.forEach(show); }, 3200);
  }

  /* =============================================================
     Entrada del hero: el titular sube por lineas, con mascara.
     Por lineas y no por letras: en español las frases son largas
     y letra por letra se ve nervioso.
     ============================================================= */
  function initHeroEntrada() {
    var lines = $$(".hero-titulo .line-i");
    var rest  = $$(".hero .reveal");
    var delay = reduced ? 0 : 0.35;

    function fallback() {
      lines.forEach(function (l) { l.style.transform = "none"; });
      rest.forEach(function (r) { r.classList.add("is-in"); });
    }

    if (!window.gsap || reduced) { fallback(); return; }

    var tl = gsap.timeline({ delay: delay, onInterrupt: fallback });
    tl.to(lines, { y: "0%", duration: 1.15, ease: "expo.out", stagger: 0.09 });
    tl.call(function () { rest.forEach(function (r) { r.classList.add("is-in"); }); }, null, "-=0.75");

    /* si por lo que sea GSAP no corre, el contenido aparece igual */
    setTimeout(function () {
      if (lines.length && getComputedStyle(lines[0]).transform !== "none") fallback();
    }, 2600);
  }

  /* =============================================================
     Imagenes que todavia no existen.
     Nunca se deja una imagen rota: el hueco se marca como
     pendiente, se ve deliberado, y en cuanto el archivo aparece
     esto no hace nada. No hay que tocar codigo para cambiarlas.
     ============================================================= */
  function initPendientes() {
    $$("img[data-pendiente]").forEach(function (img) {
      function marcar() {
        var fig = img.closest("figure") || img.parentNode;
        if (!fig || fig.classList.contains("is-pendiente")) return;
        fig.classList.add("is-pendiente");
        var nota = document.createElement("span");
        nota.className = "still-nota";
        nota.textContent = "[PENDIENTE: " + img.getAttribute("data-pendiente") + "]";
        fig.appendChild(nota);
      }
      if (img.complete) { if (!img.naturalWidth) marcar(); }
      else img.addEventListener("error", marcar);
    });
  }

  /* =============================================================
     El reproductor del reel (seccion El trabajo).
     Sin autoplay, sin audio automatico, sin muro: portada + play.
     Mientras manifest.reel.youtubeId sea null, se queda el aviso.
     ============================================================= */
  function initReelPlayer() {
    var wrap = $("[data-reel-player]");
    var reel = data.reel;
    var id = reel && reel.youtubeId;
    if (!wrap || !id) return;
    var marco = $(".reel-marco", wrap);
    if (!marco || marco.querySelector("iframe")) return;

    /* El HTML ya trae la fachada escrita (sin JS, el enlace abre YouTube).
       Si no la trae, se construye aqui a partir del manifest. */
    var a = $(".reel-fachada", marco);
    if (!a) {
      a = document.createElement("a");
      a.className = "reel-fachada";
      a.href = "https://www.youtube.com/watch?v=" + encodeURIComponent(id);
      a.setAttribute("aria-label", "Reproducir el demo reel");
      var img = document.createElement("img");
      img.className = "reel-poster reel-poster-real";
      img.alt = ""; img.decoding = "async"; img.loading = "lazy";
      img.src = reel.portada || ("https://i.ytimg.com/vi_webp/" + id + "/maxresdefault.webp");
      var play = document.createElement("span");
      play.className = "reel-play";
      play.setAttribute("aria-hidden", "true");
      play.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg>';
      a.appendChild(img); a.appendChild(play);
      Array.prototype.slice.call(marco.children).forEach(function (n) { n.remove(); });
      marco.appendChild(a);
    }

    /* calentar la conexion cuando el cursor se acerca: el clic se siente inmediato */
    var calentado = false;
    function calentar() {
      if (calentado) return;
      calentado = true;
      ["https://www.youtube-nocookie.com", "https://i.ytimg.com", "https://www.google.com"].forEach(function (u) {
        var l = document.createElement("link");
        l.rel = "preconnect"; l.href = u;
        document.head.appendChild(l);
      });
    }
    a.addEventListener("pointerenter", calentar, { once: true });
    a.addEventListener("focus", calentar, { once: true });

    /* Desde file:// (abrir index.html con doble clic) el navegador no manda
       referer, y YouTube responde con el error 153. Ahi no se inserta: el
       enlace abre el video en YouTube en otra pestaña. En linea, se inserta. */
    var local = location.protocol === "file:";
    if (local) {
      a.target = "_blank";
      a.rel = "noopener";
      return;
    }

    a.addEventListener("click", function (e) {
      e.preventDefault();
      var f = document.createElement("iframe");
      /* youtube-nocookie: no deja cookies hasta que el video se reproduce */
      f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) +
              "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
      f.title = "Demo reel — Connect Studios";
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.setAttribute("allowfullscreen", "");
      /* explicito: YouTube necesita saber desde que sitio lo insertan */
      f.referrerPolicy = "strict-origin-when-cross-origin";
      f.className = "reel-iframe";
      marco.replaceChild(f, a);
      /* sin preventScroll, el foco brinca de golpe y corta el scroll suave
         que viene del boton del hero */
      f.focus({ preventScroll: true });
    });
  }

  /* "Ver demo reel" del hero: baja hasta el reproductor y lo arranca.
     Sin JS, el enlace solo salta a #trabajo. */
  function initVerReel() {
    var btn = $("[data-ver-reel]");
    var marco = $("[data-reel-player] .reel-marco");
    if (!btn || !marco) return;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      marco.scrollIntoView({ block: "center" });
      var a = $(".reel-fachada", marco);
      if (a) a.click();
    });
  }


  /* =============================================================
     Parallax del collage. Maximo 40 px de recorrido: lo suficiente
     para que se sienta vivo, no tanto como para marear ni para
     costar frames. Se apaga en tactil y con reduced-motion.
     ============================================================= */
  function initParallax() {
    if (reduced || !fineHover) return;
    if (!window.gsap || !window.ScrollTrigger) return;

    $$("[data-parallax]").forEach(function (el) {
      var f = parseFloat(el.getAttribute("data-parallax")) || 0.1;
      var d = Math.min(40, Math.round(f * 260));
      gsap.fromTo(el, { y: d }, {
        y: -d,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 }
      });
    });
  }

  /* =============================================================
     Flotado constante de los stills y las BTS.
     No depende del scroll: van a la deriva todo el tiempo, muy poco
     (6-11 px y menos de un grado), cada una con su propio ritmo para
     que nunca se sincronicen. Vive en el <img>, mientras el parallax
     vive en el <figure>: dos elementos distintos, cero conflicto.
     ============================================================= */
  function initFlotado() {
    if (reduced || !window.gsap) return;

    var flotantes = $$(".still img, .criterio-foto img, .proceso-foto img, .proceso-clip video, .sobre-foto img");
    if (!flotantes.length) return;

    var tweens = [];
    flotantes.forEach(function (img, i) {
      var amp = 6 + (i % 3) * 2.5;                 /* 6 a 11 px */
      var dur = 4.2 + (i % 4) * 0.9;               /* 4.2 a 6.9 s */
      var giro = (i % 2 ? 1 : -1) * (0.25 + (i % 3) * 0.12);
      tweens.push(gsap.to(img, {
        y: amp, rotation: giro,
        duration: dur, ease: "sine.inOut",
        yoyo: true, repeat: -1, delay: i * 0.35
      }));
    });

    /* Fuera de pantalla no tiene caso gastar cuadros */
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var t = tweens[flotantes.indexOf(en.target)];
        if (!t) return;
        en.isIntersecting ? t.play() : t.pause();
      });
    }, { threshold: 0 });
    flotantes.forEach(function (img) { io.observe(img); });
  }

  /* =============================================================
     El clip de proceso. Sin audio, en bucle, y solo corre mientras
     esta en pantalla. En movil no se descarga siquiera: se queda el
     poster (preload="none" en el HTML) para no gastar datos ni bateria.
     ============================================================= */
  function initClip() {
    var clips = $$("[data-clip]");
    if (!clips.length) return;
    if (reduced) return;                                 /* queda el poster */
    if (!fineHover || window.innerWidth < 960) return;   /* movil: poster */
    if (!("IntersectionObserver" in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          v.preload = "auto";
          var p = v.play();
          if (p && p.catch) p.catch(function () { /* si lo bloquean, queda el poster */ });
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.2 });

    clips.forEach(function (v) { io.observe(v); });
  }

  /* =============================================================
     El formulario.
     Se envia en segundo plano para que el aviso salga aqui y no en
     la pantalla de Formspree. Si algo falla — red caida, servicio
     abajo — se deja que el formulario poste como siempre, para que
     el mensaje llegue de todos modos.
     ============================================================= */
  function initForm() {
    var form = $("[data-form]");
    if (!form || !window.fetch) return;

    var aviso = $("[data-aviso]", form);
    var boton = $("button[type=submit]", form);

    function decir(texto, clase) {
      if (!aviso) return;
      aviso.textContent = texto;
      aviso.className = "form-aviso " + clase;
      aviso.hidden = false;
    }

    form.addEventListener("submit", function (e) {
      /* el navegador ya valido required/email antes de llegar aqui */
      e.preventDefault();

      if (boton) { boton.disabled = true; boton.textContent = "Enviando…"; }
      if (aviso) aviso.hidden = true;

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (r) {
          if (!r.ok) throw new Error("respuesta " + r.status);
          form.reset();
          decir("Listo. El mensaje llegó — te contesto en menos de 24 horas.", "ok");
          if (boton) boton.textContent = "Enviado";
        })
        .catch(function () {
          /* ultimo recurso: envio nativo, aunque salga de la pagina */
          decir("No se pudo enviar desde aquí. Reintentando por la vía normal…", "mal");
          if (boton) { boton.disabled = false; boton.textContent = "Hablemos"; }
          setTimeout(function () { form.submit(); }, 1200);
        });
    });
  }

  /* =============================================================
     Detalles
     ============================================================= */
  function initAnio() {
    var el = $("[data-anio]");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* =============================================================
     Boot
     ============================================================= */
  function boot() {
    safe(initSplash, "initSplash");
    safe(initNav, "initNav");
    safe(mountReel, "mountReel");
    safe(initReelPlayer, "initReelPlayer");
    safe(initVerReel, "initVerReel");
    safe(initPendientes, "initPendientes");
    safe(initClip, "initClip");
    safe(initForm, "initForm");
    safe(initParticles, "initParticles");
    safe(initReveals, "initReveals");
    safe(initAnio, "initAnio");

    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (e) {}
      safe(initParallax, "initParallax");
      safe(initFlotado, "initFlotado");
    }
    safe(initHeroEntrada, "initHeroEntrada");

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
