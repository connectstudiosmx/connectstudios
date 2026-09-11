(function () {
  "use strict";

  /* ---------------------------------------------------------------
     Connect Studios — datos de marca y contenido.
     Todo el texto del sitio vive aqui (no en el HTML) para que
     agregar ingles despues sea agregar un objeto, no reescribir.
     El HTML ya trae el contenido escrito: esto lo enriquece.
     --------------------------------------------------------------- */

  window.__BRAND__ = {
    name: "Connect Studios",
    tagline: "Siempre en contacto.",
    city: "Guadalajara",
    founder: "Manuel Alejandro Pérez Becerra",

    /* -------------------------------------------------------------
       ⚠️ PUNTO DE REEMPLAZO DEL DEMO REEL — son DOS piezas distintas:

       1. youtubeId — el reel COMPLETO, en la seccion El trabajo.
          Con sonido y controles. Se pega solo el ID: lo que va despues
          de "v=" en el enlace.  youtube.com/watch?v=AbC123  ->  "AbC123"
          En YouTube: el video puede ir "No listado", pero debe tener
          activado "Permitir insercion".

       2. loop — el FONDO del hero. Mudo, en bucle, 8-12 segundos,
          1280x720, H.264, sin audio, unos 2-3 MB. Va en assets/video/.
          No se usa YouTube aqui: cargaria ~1 MB de reproductor antes
          que el titular y mostraria su interfaz encima del hero.
       ------------------------------------------------------------- */
    reel: {
      /* "Demo Reel 2026 | Connect Studios Mexico" — 2:25, insercion permitida */
      youtubeId: "7-ilQ97QtZQ",

      /* 9 s del tramo de CABB (brindis, recepcion, pasillo), cortado entre
         dos cortes del montaje y con fundido a negro para que el bucle no
         se note. 1280x720, sin audio, 1.3 MB. */
      loop: "assets/video/reel-loop.mp4",

      /* fondo del hero en celular y antes de que cargue el loop */
      poster: "assets/img/reel-poster.webp",

      /* portada del reproductor en El trabajo. Se usa un fotograma propio
         y no la miniatura de YouTube, que hoy es la diapositiva de
         beautiful.ai con marca de agua. */
      portada: "assets/img/reel-portada.webp"
    },

    hero: {
      eyebrow: "Productora audiovisual · Guadalajara",
      /* cambiado por Manuel el 10-sep-2026; solo "me toca a mí." va en verde */
      titulo: "La reputación ya la hiciste tú. Que se vea bien",
      tituloAcento: "me toca a mí.",
      subtitulo:
        "Video corporativo para negocios cuya reputación va muy por delante de su imagen.",
      cta: { texto: "Hablemos", href: "#contacto" }
    },

    /* Criterio — el manifiesto.
       Reencuadre pedido por Manuel: no se compara con otros productores
       ni los critica. El argumento se sostiene por si mismo. */
    criterio: {
      titulo: "Aquí nada se graba porque sí.",
      lead: [
        "La pregunta no es cómo se ve. Es qué tiene que lograr.",
        "Cada pieza sale con un objetivo definido antes de encender la cámara. Ese objetivo decide el guion, el tono y hasta dónde se graba. No al revés."
      ],
      puntos: [
        { nombre: "Que convierta",
          descripcion: "Confianza, percepción o una acción concreta: depende del objetivo de la campaña. Lo que no cambia es que el objetivo se define antes de grabar, porque en edición ya no se corrige." },
        { nombre: "Percepción",
          descripcion: "Cómo te ve un cliente antes de sentarse contigo. Esa impresión se construye a propósito o se deja al azar, pero ocurre de todas formas." },
        { nombre: "Siempre en contacto",
          descripcion: "Transparencia durante todo el proceso. El resultado sale bien porque se corrige a tiempo, no porque se adivinó. No entregamos y desaparecemos." }
      ]
    },

    nav: [
      { texto: "Criterio", href: "#problema" },
      { texto: "El trabajo", href: "#trabajo" },
      { texto: "Servicios", href: "#servicios" },
      { texto: "Proceso", href: "#proceso" }
    ],

    /* Clientes y colaboraciones — un solo grupo, sin separar.
       Decision de Manuel: el encabezado cubre ambos casos sin
       atribuirse nada de ninguna empresa en particular. */
    clientes: [
      { nombre: "Tequila Carrera",             img: "assets/img/clientes/tequila-carrera.webp" },
      { nombre: "CABB Arrenda",                img: "assets/img/clientes/cabb-arrenda.webp" },
      { nombre: "Eture Lab",                   img: "assets/img/clientes/eture-lab.webp" },
      { nombre: "Activate My Skin",            img: "assets/img/clientes/activate-my-skin.webp" },
      { nombre: "Tendencias Alta Costura",     img: "assets/img/clientes/tendencias.webp" },
      { nombre: "Dorma",                       img: "assets/img/clientes/dorma.webp" },
      { nombre: "C&A",                         img: "assets/img/clientes/cya.webp" },
      { nombre: "New York Life Seguros Monterrey", img: "assets/img/clientes/seguros-monterrey.webp" },
      { nombre: "Galería Ajolote",             img: "assets/img/clientes/galeria-ajolote.webp" },
      { nombre: "Finvivir",                    img: "assets/img/clientes/finvivir.webp" },
      { nombre: "Jugo Comunicación",           img: "assets/img/clientes/jugo-comunicacion.webp" },
      { nombre: "Confexion Design",            img: "assets/img/clientes/confexion-design.webp" }
    ],

    /* El caso. Un solo proyecto contado a fondo, sin parrilla.
       Dorma queda deliberadamente fuera de aqui: se guarda para
       ilustrar el contenido vertical del retainer (decision de Manuel). */
    caso: {
      cliente: "CABB Arrenda",
      pieza: "Video institucional",
      lugar: "Guadalajara",
      anio: 2024,
      bloques: [
        { nombre: "El reto",
          parrafos: ["Un video de aniversario tiende a quedarse en felicitación interna. Un institucional tiene que vender confianza hacia afuera. Esta pieza tenía que hacer las dos cosas sin quedarse a medias en ninguna."] },
        { nombre: "La decisión creativa",
          parrafos: [
            "La llamada fue corta: van a hacer un video de aniversario y quieren una propuesta. Lo que propuse fue no hacer un aniversario.",
            "Si ya íbamos a armar una pieza, valía más usarla para contar la historia de la empresa, su proceso y, sobre todo, cómo se siente ser su cliente: cómo lo atienden y cómo lo cuidan. El aniversario dejó de ser el tema y pasó a ser el motivo."
          ] },
        { nombre: "Cómo se resolvió",
          parrafos: [
            "Se grabó donde de verdad pasa: en sus oficinas. La recepción, el trato, la firma del contrato, la explicación. Y el cierre en la distribuidora de autos, cuando el cliente recibe las llaves y se va con su camioneta.",
            "Encima, un guion hablado con la trayectoria de la empresa. La imagen muestra el proceso completo; la voz cuenta la historia."
          ] }
      ],
      /* [PENDIENTE] Los 5 archivos van en assets/img/cabb/.
         Mientras no existan, main.js pinta un hueco marcado, nunca
         una imagen rota. En cuanto aparezcan, no hay que tocar nada. */
      stills: [
        { src: "assets/img/cabb/cabb-1-puerta.webp",   alt: "Entrada del corporativo de CABB" },
        { src: "assets/img/cabb/cabb-2-junta.webp",    alt: "Junta interna de CABB Arrenda" },
        { src: "assets/img/cabb/cabb-3-atencion.webp", alt: "Atención a un cliente en las oficinas" },
        { src: "assets/img/cabb/cabb-4-entrega.webp",  alt: "Entrega del vehículo en la distribuidora" },
        { src: "assets/img/cabb/cabb-5-llaves.webp",   alt: "El vehículo listo para entregarse al cliente" }
      ]
    },

    /* Retainer — precio confirmado por Manuel: 14,499 mas IVA */
    retainer: {
      nombre: "Retainer mensual de contenido",
      precio: "desde $14,499 MXN al mes",
      precioNota: "más IVA",
      videos: 12,
      cadencia: "Lunes, miércoles y viernes.",
      /* Alcance / Nutrir / Historia — corregido por Manuel.
         No es "Cercanía": la cercanía es el resultado de Historia. */
      framework: [
        { nombre: "Alcance",
          descripcion: "Contenido simple y fácil de ver. Su trabajo es abrir la puerta: que más gente llegue a la marca, empezando por el cliente ideal." },
        { nombre: "Nutrir",
          descripcion: "Para la audiencia que ya se interesó. Le entrega algo de valor, y con eso se queda y sigue a la marca." },
        { nombre: "Historia",
          descripcion: "Genera cercanía. Deja de ser una empresa que informa en redes y pasa a ser alguien con quien la gente conecta." }
      ],
      garantias: [
        "Si no se entregan los 12 videos del mes, el cobro se ajusta proporcionalmente.",
        "El primer mes se puede terminar sin penalización."
      ]
    },

    /* Proyectos puntuales — sin precios (decision de Manuel).
       Confirmados desde el Catalogo de servicios 2025. */
    proyectos: [
      { nombre: "Video institucional",
        descripcion: "Quién es la empresa: cultura, planta, procesos, gente y trayectoria en una sola pieza." },
      { nombre: "Video corporativo",
        descripcion: "Comunicación interna, externa o híbrida. Informativo, dirigido a un público definido." },
      { nombre: "Video comercial",
        descripcion: "Para mostrar un producto con una intención de venta clara." },
      { nombre: "Video promocional",
        descripcion: "Productos, ofertas o eventos. Informativo, sin intención de venta directa." },
      { nombre: "Podcast multicámara",
        descripcion: "Guion, grabación a dos cámaras y edición, más las piezas cortas derivadas." },
      { nombre: "Dirección creativa fraccional",
        descripcion: "No se entrega video: se entrega criterio, guion y línea visual para el equipo que ya tienes." }
    ],

    /* Cómo trabajo — los cuatro pasos reales, dictados por Manuel. */
    proceso: {
      titulo: "Entrego lo que me pidieron. Y una cosa más.",
      pasos: [
        { nombre: "Diagnóstico",
          descripcion: "Primero entiendo qué necesita el cliente: qué quiere lograr, a quién quiere llegar y para qué va a usar el contenido. No me quedo en «necesito un video» — busco el objetivo que hay detrás." },
        { nombre: "Propongo una solución",
          descripcion: "Con lo que detecto, propongo lo que creo que va a funcionar mejor. No sólo la producción: también cómo se puede usar el contenido en comunicación, marketing, publicidad o redes." },
        { nombre: "Produzco y acompaño",
          descripcion: "Planeación, grabación, fotografía, multicámara: lo que pida el proyecto. Durante todo el proceso mantengo comunicación con el cliente, para ir ajustando y detectar dónde se puede hacer algo mejor." },
        { nombre: "Edito, entrego y aporto algo más",
          descripcion: "Postproducción y entrega del material listo para usarse. Y siempre que puedo, aporto algo que no me pidieron: una recomendación, una adaptación, una idea de contenido. Algo que de verdad le sirva." }
      ]
    },

    contacto: {
      endpoint: "https://formspree.io/f/meaqqpkr",

      email: "manuelperez@connectstudios.mx",
      dominio: "connectstudios.mx",
      redes: {
        youtube: "https://www.youtube.com/@connect.studiosmx",
        instagram: "https://www.instagram.com/connect.stu/"
      }
    }
  };
})();
