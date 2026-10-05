(function () {
  "use strict";

  /* ---------------------------------------------------------------
     Medicion del sitio — un solo archivo para las 7 paginas.
     Google Analytics 4: visitas, de donde llegan y que hacen.
     Pixel de Meta: el mismo del portal (/solicitud, /guia, /gracias,
     /casos), asi los anuncios ven el recorrido completo.
     Si cambias lo que se mide, actualiza tambien el aviso de privacidad
     (portal.connectstudios.mx/privacidad.html, seccion Cookies).
     --------------------------------------------------------------- */
  var CONFIG = {
    META_PIXEL: "580716017132096",   /* el mismo del portal */
    GA4: "G-SK1X1ZNG2L"
  };

  /* Solo se mide en el dominio real: las pruebas locales no ensucian
     las audiencias ni los reportes. Fuera de el, solo se avisa en consola. */
  var real = /(^|\.)connectstudios\.mx$/.test(location.hostname);

  if (real && CONFIG.META_PIXEL) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq("init", CONFIG.META_PIXEL);
    fbq("track", "PageView");
  }

  if (real && CONFIG.GA4) {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(CONFIG.GA4);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", CONFIG.GA4);
  }

  /* Para el resto del sitio: csMedir("Contact", "generate_lead").
     El primero es el evento de Meta y el segundo el de Google.
     "Lead" NO se usa aqui: en el portal significa prospecto que
     califico, y los anuncios optimizan con el. */
  window.csMedir = function (meta, google) {
    if (!real) { console.info("[medicion]", meta, google || ""); return; }
    try {
      if (window.fbq && meta) fbq("track", meta);
      if (window.gtag && google) gtag("event", google);
    } catch (e) { /* medir nunca rompe la pagina */ }
  };
})();
