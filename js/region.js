/* =========================================================
   Lumaria — Página de región
   ========================================================= */

(function () {
  const params = new URLSearchParams(location.search);
  // Las páginas generadas (regiones/maule.html) indican su región en <body data-region>
  const r = regionPorId(document.body.dataset.region || params.get("id")) || REGIONES[0];
  const idx = REGIONES.indexOf(r);
  const $ = (id) => document.getElementById(id);

  if (!document.body.dataset.region) document.title = `${r.nombre} · Flora, Fauna y Funga nativas · Lumaria`;
  document.body.style.setProperty("--rc", r.color);

  /* ---------- Cabecera ---------- */
  $("miga-region").textContent = r.nombre;
  $("kicker").textContent = `Región ${r.num} · Capital: ${r.capital}`;
  $("titulo").textContent = r.nombre;
  $("lema").textContent = r.lema;
  $("desc").textContent = r.desc;
  $("chips").innerHTML = r.ecosistemas.map((e) => `<span class="chip">${e}</span>`).join("");

  // Especies del atlas (data.js) + las aportadas por la comunidad y aprobadas (se agregan al cargar)
  const especies = especiesDe(r);

  function pintarDatos() {
    const contar = (fn) => especies.filter(fn).length;
    $("datos").innerHTML = `
      <div><b>${contar((e) => e.tipo === "flora")}</b><span>especies de flora</span></div>
      <div><b>${contar((e) => e.tipo === "fauna")}</b><span>especies de fauna</span></div>
      <div><b>${contar((e) => e.tipo === "fungi")}</b><span>hongos y líquenes</span></div>
      <div><b>${contar((e) => e.endemica)}</b><span>endémicas</span></div>
      <div><b>${contar((e) => AMENAZADAS.includes(e.estado))}</b><span>amenazadas</span></div>`;
  }
  pintarDatos();

  renderChileMap($("mini-mapa"), {
    labels: false, highlight: r.id, compact: true,
    onSelect(id) { location.href = urlRegion(id); }
  });

  /* ---------- Filtros ---------- */
  const filtros = [
    { id: "todas", txt: "Todas", fn: () => true },
    { id: "flora", txt: "Flora", ico: ICONOS.hoja, fn: (e) => e.tipo === "flora" },
    { id: "fauna", txt: "Fauna", ico: ICONOS.huella, fn: (e) => e.tipo === "fauna" },
    { id: "fungi", txt: "Funga", ico: ICONOS.hongo, fn: (e) => e.tipo === "fungi" },
    { id: "endemicas", txt: "Endémicas", ico: ICONOS.estrella, fn: (e) => e.endemica },
    { id: "amenazadas", txt: "Amenazadas", fn: (e) => AMENAZADAS.includes(e.estado) },
    { id: "comunidad", txt: "Aportes de la comunidad", fn: (e) => !!e.comunidad, soloSiHay: true }
  ];
  let filtroActual = "todas";
  function pintarFiltros() {
    $("filtros").innerHTML = filtros
      .filter((f) => !f.soloSiHay || especies.some(f.fn))
      .map((f) => `
        <button class="filtro" data-f="${f.id}" aria-pressed="${f.id === filtroActual}">
          ${f.ico || ""}${f.txt} <span class="n">${especies.filter(f.fn).length}</span>
        </button>`).join("");
  }
  pintarFiltros();
  $("filtros").addEventListener("click", (ev) => {
    const b = ev.target.closest(".filtro");
    if (!b) return;
    filtroActual = b.dataset.f;
    $("filtros").querySelectorAll(".filtro").forEach((n) => n.setAttribute("aria-pressed", n === b));
    pintar();
  });

  /* ---------- Tarjetas ---------- */
  // Los textos se escapan siempre: las especies de la comunidad los escribe el público
  function tarjeta(e, i) {
    const est = e.estado ? `<span class="estado ${claseEstado(e.estado)}">${_esc(e.estado)}</span>` : "";
    return `
      <button class="especie" data-sci="${_esc(e.cientifico)}" style="animation-delay:${i * 50}ms">
        <div class="foto">
          <span class="tipo">${iconoTipo(e.tipo)}${TIPOS[e.tipo].etiqueta}${e.grupo ? " · " + _esc(e.grupo) : ""}</span>
          ${e.endemica ? `<span class="endemica">${ICONOS.estrella}Endémica</span>` : ""}
          <div class="foto-vacia cargando">${iconoTipo(e.tipo)}</div>
        </div>
        <div class="cuerpo">
          ${e.comunidad ? `<span class="aporte-comunidad">Aporte de la comunidad</span>` : ""}
          <h3>${_esc(e.nombre)}</h3>
          <span class="cientifico">${_esc(e.cientifico)}</span>
          <p>${_esc(e.desc)}</p>
          ${est}
        </div>
      </button>`;
  }

  function pintar() {
    const f = filtros.find((x) => x.id === filtroActual);
    const lista = especies.filter(f.fn);
    $("especies").innerHTML = lista.map(tarjeta).join("");
    $("especies").querySelectorAll(".especie").forEach((card) => {
      const e = especies.find((x) => x.cientifico === card.dataset.sci);
      cargarFoto(card.querySelector(".foto"), e);
    });
  }

  /** Foto y crédito de una especie: de Wikimedia, o de quien la aportó si es de la comunidad. */
  async function fotoDe(e) {
    if (!e.comunidad) return infoEspecie(e.cientifico, e.nombre);
    const [url] = await urlsFotos([e.comunidad.ruta], "especies");
    return url ? { img: url, imgGrande: url, credito: { comunidad: true, autor: e.comunidad.autor } } : null;
  }
  const textoCreditoDe = (c) => c.comunidad ? `Foto: ${c.autor} · Comunidad Lumaria` : textoCredito(c);

  function cargarFoto(cont, e) {
    fotoDe(e).then((info) => {
      const vacia = cont.querySelector(".foto-vacia");
      if (vacia) vacia.classList.remove("cargando");
      if (!info || !info.img || !cont.isConnected) return;
      const img = new Image();
      img.alt = e.nombre;
      img.decoding = "async";
      img.onload = () => {
        img.classList.add("cargada");
        vacia && vacia.remove();
        if (info.credito) {
          const ico = document.createElement("span");
          ico.className = "credito-ico";
          ico.textContent = "i";
          ico.dataset.tip = textoCreditoDe(info.credito);
          ico.setAttribute("aria-label", textoCreditoDe(info.credito));
          cont.appendChild(ico);
        }
      };
      img.onerror = () => img.remove();
      img.style.objectPosition = ajustes[e.cientifico] || focoDe(e.cientifico);
      img.src = info.img;
      cont.appendChild(img);
    });
  }

  /* ---------- Modo ajuste de encuadre (regiones/REGION.html?ajustar) ---------- */
  const AJUSTE = params.has("ajustar");
  const ajustes = {};
  if (AJUSTE) {
    document.body.classList.add("modo-ajuste");
    $("especies").insertAdjacentHTML("beforebegin", `
      <div class="aviso-ajuste" id="aviso-ajuste">
        <b>Modo ajuste de encuadre.</b> Haz clic sobre el animal o la planta en cada foto para centrar el recorte ahí.
        <button class="boton claro" id="ver-resultado" style="padding:6px 14px;margin-left:8px">Ver resultado</button>
        <code id="codigo-ajuste">Aún no has ajustado ninguna foto.</code>
      </div>`);
    $("ver-resultado").addEventListener("click", () => {
      const ver = document.body.classList.toggle("modo-ajuste");
      $("ver-resultado").textContent = ver ? "Ver resultado" : "Seguir ajustando";
    });
  }

  function registrarAjuste(card, ev) {
    const img = card.querySelector(".foto img");
    if (!img || !img.naturalWidth) return;
    // la foto se muestra completa (contain): calculamos dónde quedó dibujada
    const caja = img.getBoundingClientRect();
    const escala = Math.min(caja.width / img.naturalWidth, caja.height / img.naturalHeight);
    const w = img.naturalWidth * escala, h = img.naturalHeight * escala;
    const x0 = caja.left + (caja.width - w) / 2, y0 = caja.top + (caja.height - h) / 2;
    const px = Math.max(0, Math.min(100, Math.round(((ev.clientX - x0) / w) * 100 / 5) * 5));
    const py = Math.max(0, Math.min(100, Math.round(((ev.clientY - y0) / h) * 100 / 5) * 5));
    const foco = `${px}% ${py}%`;
    ajustes[card.dataset.sci] = foco;
    img.style.objectPosition = foco;

    let marca = card.querySelector(".marca");
    if (!marca) { marca = document.createElement("span"); marca.className = "marca"; card.querySelector(".foto").appendChild(marca); }
    const fr = card.querySelector(".foto").getBoundingClientRect();
    marca.style.left = `${ev.clientX - fr.left}px`;
    marca.style.top = `${ev.clientY - fr.top}px`;

    const lineas = Object.entries(ajustes).map(([sci, f]) => `  "${sci}": "${f}",`).join("\n");
    $("codigo-ajuste").textContent = "Copia estas líneas dentro de FOCOS, al final de js/data.js:\n" + lineas;
    try { navigator.clipboard.writeText(lineas); } catch (e) { /* sin portapapeles */ }
  }

  $("especies").addEventListener("click", (ev) => {
    const card = ev.target.closest(".especie");
    if (!card) return;
    if (document.body.classList.contains("modo-ajuste") && ev.target.closest(".foto")) {
      registrarAjuste(card, ev);
      return;
    }
    abrirModal(especies.find((x) => x.cientifico === card.dataset.sci));
  });

  /* ---------- Modal ---------- */
  const modal = $("modal");
  function abrirModal(e) {
    $("modal-foto").innerHTML = `<div class="foto-vacia cargando">${iconoTipo(e.tipo)}</div>`;
    $("modal-credito").innerHTML = "";
    $("modal-foto").style.removeProperty("--fondo");
    const est = e.estado ? `<span class="estado ${claseEstado(e.estado)}">${_esc(e.estado)}</span>` : "";
    $("modal-cuerpo").innerHTML = `
      <span class="kicker">${TIPOS[e.tipo].etiqueta}${e.grupo ? " · " + _esc(e.grupo) : ""} · ${r.nombre}</span>
      <h2 id="modal-titulo" style="margin-top:10px">${_esc(e.nombre)}</h2>
      <div class="cientifico">${_esc(e.cientifico)}</div>
      <div class="etiquetas-modal">
        ${est}
        ${e.endemica ? `<span class="estado" style="--dot:var(--copihue)">Endémica de Chile</span>` : ""}
        ${e.comunidad ? `<span class="aporte-comunidad">Aporte de la comunidad</span>` : ""}
        ${e.estado || e.endemica ? `<a class="que-significa" href="glosario.html#${e.estado ? "conservacion" : "endemica"}">¿Qué significa?</a>` : ""}
      </div>
      <p>${_esc(e.desc)}</p>
      <div id="modal-extra"></div>
      <p class="acciones-contenido">
        <a href="comunidad.html?region=${r.id}&especie=${encodeURIComponent(e.cientifico)}">Ver fotos de la comunidad →</a>
        <a href="comunidad.html?region=${r.id}&subir=1">¿La has visto? Sube tu foto</a>
      </p>`;
    if (typeof modal.showModal === "function") modal.showModal(); else modal.setAttribute("open", "");

    if (e.comunidad) {
      fotoDe(e).then((info) => {
        const v = $("modal-foto").querySelector(".foto-vacia");
        if (!info) { v && v.classList.remove("cargando"); return; }
        const img = new Image();
        img.alt = e.nombre;
        img.onload = () => {
          $("modal-foto").innerHTML = "";
          $("modal-foto").style.setProperty("--fondo", `url("${info.img}")`);
          $("modal-foto").appendChild(img);
        };
        img.src = info.img;
      });
      $("modal-credito").innerHTML = `Foto y ficha aportadas por <b>${_esc(e.comunidad.autor)}</b> a la comunidad Lumaria · revisadas por la moderación`;
      return;
    }

    infoEspecie(e.cientifico, e.nombre).then((info) => {
      if (!info) return;
      if (info.imgGrande) {
        const img = new Image();
        img.alt = e.nombre;
        img.onload = () => {
          $("modal-foto").innerHTML = "";
          $("modal-foto").style.setProperty("--fondo", `url("${info.img}")`);
          $("modal-foto").appendChild(img);
          $("modal-credito").innerHTML = htmlCredito(info.credito);
        };
        // versión de 960 px (más liviana que el original); si no existe, usamos el original
        const mediana = /\/thumb\//.test(info.img) ? info.img.replace(/\/\d+px-/, "/960px-") : info.imgGrande;
        img.onerror = () => { if (img.src !== info.imgGrande) img.src = info.imgGrande; };
        img.src = mediana;
      } else {
        const v = $("modal-foto").querySelector(".foto-vacia"); v && v.classList.remove("cargando");
        $("modal-credito").textContent = "No encontramos una fotografía de esta especie con licencia libre.";
      }
      if (info.extracto) {
        const p = document.createElement("p");
        p.className = "extracto";
        p.textContent = info.extracto;
        $("modal-extra").appendChild(p);
      }
      if (info.url) {
        $("modal-extra").insertAdjacentHTML("beforeend",
          `<p class="fuente">Fuente: <a href="${info.url}" target="_blank" rel="noopener">Wikipedia${info.lang === "en" ? " (en inglés)" : ""}</a></p>`);
      }
    });
  }
  const cerrar = () => (modal.close ? modal.close() : modal.removeAttribute("open"));
  $("modal-cerrar").addEventListener("click", cerrar);
  modal.addEventListener("click", (ev) => { if (ev.target === modal) cerrar(); });

  /* ---------- Navegación entre regiones ---------- */
  const ant = REGIONES[(idx - 1 + REGIONES.length) % REGIONES.length];
  const sig = REGIONES[(idx + 1) % REGIONES.length];
  $("nav-regiones").innerHTML = `
    <a class="nav-region" href="${urlRegion(ant.id)}"><small>← Hacia el norte</small><b>${ant.nombre}</b></a>
    <a class="nav-region sig" href="${urlRegion(sig.id)}"><small>Hacia el sur →</small><b>${sig.nombre}</b></a>`;

  pintar();

  /* ---------- Especies aportadas por la comunidad (aprobadas) ---------- */
  if ($("cta-agregar")) $("cta-agregar").href = `agregar-especie.html?region=${r.id}`;
  const especiesComunidad = (async () => {
    if (typeof COMUNIDAD_ACTIVA === "undefined" || !COMUNIDAD_ACTIVA) return;
    const { data, error } = await sb.from("especies_propuestas").select(CAMPOS_PROPUESTA)
      .eq("region", r.id).eq("estado", "aprobada").order("creado", { ascending: true });
    if (error || !data.length) return;
    const yaEstan = new Set(especies.map((e) => e.cientifico.toLowerCase()));
    const nuevas = data.map(especieDePropuesta).filter((e) => !yaEstan.has(e.cientifico.toLowerCase()));
    if (!nuevas.length) return;
    especies.push(...nuevas);
    pintarDatos();
    pintarFiltros();
    pintar();
  })();

  /* ---------- Fotos de la comunidad ---------- */
  $("cta-subir").href = `comunidad.html?region=${r.id}&subir=1`;
  $("cta-comunidad").href = `comunidad.html?region=${r.id}`;
  (async () => {
    const grid = $("fotos-comunidad");
    if (typeof COMUNIDAD_ACTIVA === "undefined" || !COMUNIDAD_ACTIVA) {
      grid.innerHTML = `<div class="vacio"><b>Pronto</b>Aquí aparecerán las fotos que la comunidad tome en ${_esc(r.nombre)}.</div>`;
      return;
    }
    const { data, error } = await sb.from("fotos")
      .select("id, especie_nombre, lugar, ruta, perfiles(nombre)")
      .eq("region", r.id).eq("estado", "aprobada")
      .order("creado", { ascending: false }).limit(8);
    if (error || !data.length) {
      grid.innerHTML = `<div class="vacio"><b>Todavía no hay fotos de ${_esc(r.nombre)}</b>¿Tienes una? Compártela con la comunidad.</div>`;
      return;
    }
    const urls = await urlsFotos(data.map((f) => f.ruta));
    grid.innerHTML = data.map((f, i) => `
      <a class="foto-comunidad" href="comunidad.html?region=${r.id}" style="--rc:${r.color}">
        <span class="fc-img">${urls[i] ? `<img src="${_esc(urls[i])}" alt="${_esc(f.especie_nombre)}" loading="lazy">` : ""}</span>
        <span class="fc-info"><b>${_esc(f.especie_nombre)}</b><small>${_esc(f.lugar)} · por ${_esc(f.perfiles ? f.perfiles.nombre : "—")}</small></span>
      </a>`).join("");
  })();

  // Si llegamos desde el buscador o un enlace, abrir la especie (puede ser de la comunidad)
  const buscada = params.get("especie");
  if (buscada) {
    const e = especies.find((x) => x.cientifico === buscada);
    if (e) abrirModal(e);
    else especiesComunidad.then(() => {
      const c = especies.find((x) => x.cientifico === buscada);
      if (c) abrirModal(c);
    });
  }
})();
