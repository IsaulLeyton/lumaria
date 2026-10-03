/* =========================================================
   Lumaria — Página de inicio
   ========================================================= */

(function () {
  const preview = document.getElementById("preview");

  function previewVacia() {
    preview.style.removeProperty("--rc");
    preview.innerHTML = `
      <div class="preview-vacia">
        <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 6c-9 0-16 7-16 16 0 12 16 34 16 34s16-22 16-34c0-9-7-16-16-16Z" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="22" r="6" fill="currentColor"/></svg>
        <b>Explora el mapa</b>
        Pasa el cursor sobre una región para ver un adelanto de su Flora, Fauna y Funga.
      </div>`;
  }

  function mostrarRegion(r) {
    const destacadas = [
      { ...r.flora[0], tipo: "flora" }, { ...r.fauna[0], tipo: "fauna" },
      { ...r.fungi[0], tipo: "fungi" }, { ...r.fauna[1], tipo: "fauna" }
    ];
    preview.style.setProperty("--rc", r.color);
    preview.innerHTML = `
      <div class="preview-cabecera">
        <span class="preview-num">REGIÓN ${r.num}</span>
        <h2>${r.nombre}</h2>
        <p class="preview-lema">${r.lema}</p>
      </div>
      <div class="preview-cuerpo">
        <p>${r.desc}</p>
        <div class="mini-especies">
          ${destacadas.map((e) => `
            <div class="mini-especie">
              <div class="foto" data-sci="${e.cientifico}" data-nom="${e.nombre}">${iconoTipo(e.tipo)}</div>
              ${e.nombre}
            </div>`).join("")}
        </div>
        <a class="boton" href="${urlRegion(r.id)}">Ver Flora, Fauna y Funga ${ICONOS.flecha}</a>
      </div>`;
    preview.querySelectorAll(".foto[data-sci]").forEach((n) => {
      infoEspecie(n.dataset.sci, n.dataset.nom).then((info) => {
        if (info && info.img && n.isConnected) {
          n.style.backgroundImage = `url("${info.img}")`;
          n.style.backgroundPosition = focoDe(n.dataset.sci);
          n.innerHTML = info.credito
            ? `<span class="credito-ico" data-tip="${_esc(textoCredito(info.credito))}" aria-label="${_esc(textoCredito(info.credito))}">i</span>`
            : "";
        }
      });
    });
  }

  previewVacia();
  let actual = null;
  renderChileMap(document.getElementById("mapa-chile"), {
    labels: true,
    onHover(id) {
      if (!id || id === actual) return; // conserva la última región mostrada
      actual = id;
      mostrarRegion(regionPorId(id));
    }
  });

  /* ---------- Cifras ---------- */
  const todas = new Map();
  REGIONES.forEach((r) => especiesDe(r).forEach((e) => todas.set(e.cientifico, e)));
  const especies = [...todas.values()];
  const cifras = [
    [REGIONES.length, "regiones por explorar"],
    [especies.length, "especies nativas destacadas"],
    [especies.filter((e) => e.endemica).length, "especies endémicas de Chile"],
    [especies.filter((e) => AMENAZADAS.includes(e.estado)).length, "especies con problemas de conservación"]
  ];
  document.getElementById("cifras").innerHTML = cifras
    .map(([n, t]) => `<div class="cifra"><b data-n="${n}">0</b><span>${t}</span></div>`).join("");

  // Animación de conteo al entrar en pantalla
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.querySelectorAll("b[data-n]").forEach((b) => {
        const fin = +b.dataset.n, t0 = performance.now();
        const paso = (t) => {
          const k = Math.min(1, (t - t0) / 1100);
          b.textContent = Math.round(fin * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(paso);
        };
        requestAnimationFrame(paso);
      });
      obs.unobserve(en.target);
    });
  }, { threshold: .4 });
  obs.observe(document.getElementById("cifras"));

  /* ---------- Tarjetas de regiones ---------- */
  document.getElementById("grid-regiones").innerHTML = REGIONES.map((r) => `
    <a class="tarjeta-region" href="${urlRegion(r.id)}" style="--rc:${r.color}">
      <span class="num">REGIÓN ${r.num}</span>
      <h3>${r.nombre}</h3>
      <p>${r.lema}</p>
      <span class="ir">${ICONOS.flecha}</span>
    </a>`).join("");

  /* ---------- Buscador ---------- */
  const input = document.getElementById("buscar");
  const lista = document.getElementById("resultados");
  const indice = [];
  REGIONES.forEach((r) => {
    especiesDe(r).forEach((e) => indice.push({ e, r, tipo: e.tipo }));
  });
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  input.addEventListener("input", () => {
    const q = norm(input.value.trim());
    if (q.length < 2) { lista.classList.remove("abierto"); return; }
    const hits = indice.filter(({ e, r }) =>
      norm(e.nombre).includes(q) || norm(e.cientifico).includes(q) || norm(r.nombre).includes(q)
    ).slice(0, 10);
    lista.innerHTML = hits.length
      ? hits.map(({ e, r, tipo }) => `
          <a class="resultado" role="option" href="${urlRegion(r.id, "especie=" + encodeURIComponent(e.cientifico))}">
            <span class="ico" style="background:${r.color}">${iconoTipo(tipo)}</span>
            <span><b>${e.nombre}</b><small><i>${e.cientifico}</i> · ${r.nombre}</small></span>
          </a>`).join("")
      : `<div class="sin-resultados">No encontramos “${input.value}”. Prueba con otro nombre.</div>`;
    lista.classList.add("abierto");
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { const a = lista.querySelector("a"); if (a) location.href = a.href; }
    if (e.key === "Escape") lista.classList.remove("abierto");
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".buscador")) lista.classList.remove("abierto");
  });
})();
