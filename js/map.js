/* =========================================================
   Lumaria — Mapa interactivo de Chile (SVG generado)
   Coordenadas en grados [Oeste, Sur] (valores positivos).
   ========================================================= */

(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";

  // Contorno continental: frontera norte → frontera oriental →
  // Estrecho de Magallanes → costa del Pacífico hacia el norte.
  const CONTINENTE = [
    [70.37, 18.35], [69.95, 17.95], [69.5, 17.5], [69.1, 17.95], [69.0, 18.3],
    [69.05, 18.9], [68.75, 19.15], [68.4, 19.45], [68.7, 19.8], [68.55, 20.3],
    [68.6, 20.9], [68.2, 21.3], [67.9, 21.9], [67.6, 22.3], [67.2, 22.6],
    [67.0, 23.0], [67.3, 23.6], [67.4, 24.1], [68.3, 24.4], [68.5, 25.1],
    [68.4, 26.1], [68.6, 26.9], [69.0, 27.4], [69.4, 28.0], [69.7, 28.5],
    [69.9, 29.3], [70.0, 30.2], [69.9, 30.9], [70.3, 31.6], [70.2, 32.2],
    [70.0, 32.9], [69.9, 33.6], [69.8, 34.2], [70.3, 34.9], [70.5, 35.5],
    [70.4, 36.2], [71.0, 36.7], [71.1, 37.4], [71.2, 38.0], [70.9, 38.6],
    [71.4, 39.3], [71.6, 39.9], [71.8, 40.5], [71.9, 41.1], [71.8, 41.8],
    [71.7, 42.5], [71.8, 43.2], [71.7, 43.9], [71.6, 44.6], [71.3, 45.2],
    [71.8, 45.7], [71.6, 46.3], [71.9, 46.8], [72.4, 47.4], [72.5, 48.0],
    [72.9, 48.6], [73.4, 49.2], [73.1, 49.9], [72.4, 50.5], [72.3, 51.1],
    [72.0, 51.6], [71.6, 52.0], [70.5, 52.0], [69.5, 52.1], [68.45, 52.3],
    [69.4, 52.4], [70.0, 52.6], [70.9, 52.8], [71.0, 53.3], [71.3, 53.85],
    [71.9, 53.75], [72.6, 53.5], [73.4, 53.1], [74.2, 52.8], [74.8, 52.3],
    [75.1, 51.6], [74.6, 51.2], [75.3, 50.6], [75.0, 50.0], [75.5, 49.4],
    [75.2, 48.8], [75.6, 48.2], [74.9, 47.8], [74.6, 47.0], [75.6, 46.7],
    [75.4, 46.2], [74.7, 45.9], [74.4, 45.3], [74.6, 44.6], [74.0, 44.1],
    [73.3, 43.7], [72.9, 42.9], [72.8, 42.2], [72.95, 41.55], [73.5, 41.75],
    [73.95, 41.2], [73.7, 40.3], [73.5, 39.6], [73.4, 38.9], [73.55, 38.2],
    [73.7, 37.6], [73.5, 37.1], [73.1, 36.7], [72.8, 36.1], [72.4, 35.4],
    [72.1, 34.8], [71.95, 34.2], [71.65, 33.6], [71.55, 33.0], [71.5, 32.4],
    [71.45, 31.8], [71.6, 31.0], [71.7, 30.3], [71.35, 29.6], [71.45, 28.8],
    [71.2, 28.0], [70.95, 27.2], [70.7, 26.4], [70.6, 25.5], [70.5, 24.6],
    [70.45, 23.9], [70.6, 23.4], [70.3, 22.6], [70.25, 21.8], [70.15, 21.0],
    [70.1, 20.2], [70.2, 19.3], [70.32, 18.6]
  ];

  const ISLAS = [
    // Chiloé
    [[73.55, 41.8], [74.05, 41.85], [74.2, 42.4], [74.15, 43.1], [73.7, 43.4], [73.5, 42.9], [73.45, 42.3]],
    // Archipiélago de los Chonos (simplificado)
    [[74.2, 44.2], [74.9, 44.4], [75.1, 45.0], [74.7, 45.4], [74.5, 44.9]],
    // Isla Wellington (simplificada)
    [[75.8, 48.4], [76.0, 49.1], [75.8, 49.8], [75.65, 49.2]],
    // Isla Santa Inés / Riesco (simplificada)
    [[72.9, 53.65], [73.7, 53.35], [74.6, 53.5], [73.9, 54.0], [73.1, 54.0]],
    // Tierra del Fuego (sector chileno)
    [[68.6, 52.62], [69.5, 52.62], [70.0, 52.95], [70.4, 53.3], [70.0, 53.75], [70.7, 54.0],
     [71.6, 54.3], [70.9, 54.6], [69.8, 54.85], [68.6, 54.9]],
    // Isla Hoste
    [[68.6, 55.0], [69.8, 55.0], [70.0, 55.3], [68.9, 55.5], [68.4, 55.3]],
    // Isla Navarino
    [[68.3, 54.95], [67.1, 54.9], [67.0, 55.2], [68.0, 55.35]],
    // Islas Wollaston / Cabo de Hornos
    [[67.6, 55.5], [67.0, 55.6], [67.2, 55.95], [67.7, 55.8]]
  ];

  // Cada región = unión de rectángulos [Wmin, Wmax, Smin, Smax] recortados contra el territorio.
  const ANY = [60, 80];
  const CAJAS = {
    arica:        [[...ANY, 17.0, 19.2]],
    tarapaca:     [[...ANY, 19.2, 21.6]],
    antofagasta:  [[...ANY, 21.6, 26.05]],
    atacama:      [[...ANY, 26.05, 29.1]],
    coquimbo:     [[...ANY, 29.1, 32.15]],
    valparaiso:   [[...ANY, 32.15, 32.95], [71.25, 80, 32.95, 33.95]],
    metropolitana:[[60, 71.25, 32.95, 34.3]],
    ohiggins:     [[71.25, 80, 33.95, 34.3], [...ANY, 34.3, 34.95]],
    maule:        [[...ANY, 34.95, 36.1]],
    nuble:        [[...ANY, 36.1, 36.45], [60, 72.7, 36.45, 37.2]],
    biobio:       [[72.7, 80, 36.45, 37.2], [...ANY, 37.2, 38.0], [73.0, 80, 38.0, 38.5]],
    araucania:    [[60, 73.0, 38.0, 38.5], [...ANY, 38.5, 39.5]],
    losrios:      [[...ANY, 39.5, 40.65]],
    loslagos:     [[...ANY, 40.65, 43.9]],
    aysen:        [[...ANY, 43.9, 49.0]],
    magallanes:   [[...ANY, 49.0, 57.0]]
  };

  // Proyección simple (equirectangular con corrección de latitud media)
  // (se ensancha levemente para que las regiones angostas sean fáciles de seleccionar)
  const K = 30, COSL = 0.95, W_MAX = 76.3, S_MIN = 17.2;
  const X0 = 96, Y0 = 24;
  const px = (w) => X0 + (W_MAX - w) * K * COSL;
  const py = (s) => Y0 + (s - S_MIN) * K;

  // --- Recorte Sutherland–Hodgman contra un rectángulo ---
  function clip(poly, inside, intersect) {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const cur = poly[i], prev = poly[(i + poly.length - 1) % poly.length];
      const ci = inside(cur), pi = inside(prev);
      if (ci) {
        if (!pi) out.push(intersect(prev, cur));
        out.push(cur);
      } else if (pi) {
        out.push(intersect(prev, cur));
      }
    }
    return out;
  }
  const lerpAt = (a, b, axis, v) => {
    const t = (v - a[axis]) / (b[axis] - a[axis]);
    return axis === 0 ? [v, a[1] + t * (b[1] - a[1])] : [a[0] + t * (b[0] - a[0]), v];
  };
  function clipRect(poly, [w0, w1, s0, s1]) {
    let p = poly;
    p = clip(p, (q) => q[0] >= w0, (a, b) => lerpAt(a, b, 0, w0)); if (p.length < 3) return [];
    p = clip(p, (q) => q[0] <= w1, (a, b) => lerpAt(a, b, 0, w1)); if (p.length < 3) return [];
    p = clip(p, (q) => q[1] >= s0, (a, b) => lerpAt(a, b, 1, s0)); if (p.length < 3) return [];
    p = clip(p, (q) => q[1] <= s1, (a, b) => lerpAt(a, b, 1, s1));
    return p.length < 3 ? [] : p;
  }

  // --- Geometría de cada región (se calcula una sola vez) ---
  const GEO = {};
  for (const [id, cajas] of Object.entries(CAJAS)) {
    const partes = [];
    for (const caja of cajas) {
      for (const poly of [CONTINENTE, ...ISLAS]) {
        const r = clipRect(poly, caja);
        if (r.length >= 3) partes.push(r.map(([w, s]) => [px(w), py(s)]));
      }
    }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    // centroide ponderado por área de cada parte
    let ax = 0, ay = 0, at = 0;
    for (const p of partes) {
      let a = 0, cx = 0, cy = 0;
      for (let i = 0; i < p.length; i++) {
        const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length];
        const f = x1 * y2 - x2 * y1;
        a += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f;
        minX = Math.min(minX, x1); maxX = Math.max(maxX, x1);
        minY = Math.min(minY, y1); maxY = Math.max(maxY, y1);
      }
      a /= 2;
      if (a < 0) { a = -a; cx = -cx; cy = -cy; }
      if (Math.abs(a) > 1e-6) { ax += cx / 6; ay += cy / 6; at += a; }
    }
    const d = partes.map((p) => "M" + p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L") + "Z").join("");
    GEO[id] = { d, cx: ax / at, cy: ay / at, box: { minX, maxX, minY, maxY } };
  }
  // Centroide más centrado para regiones muy alargadas
  GEO.magallanes.cy = py(51.6); GEO.magallanes.cx = px(72.6);
  GEO.aysen.cx = px(72.9);
  GEO.loslagos.cx = px(72.6); GEO.loslagos.cy = py(41.9);

  const MAP_RIGHT = px(66.8);
  const MAP_BOTTOM = py(56.2);

  function el(tag, attrs = {}, parent) {
    const n = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (parent) parent.appendChild(n);
    return n;
  }

  /**
   * Dibuja el mapa en un <svg>.
   * opts: { labels, highlight, onHover(id|null), onSelect(id), compact }
   */
  function renderChileMap(svg, opts = {}) {
    const { labels = true, highlight = null, onHover, onSelect, compact = false } = opts;
    svg.innerHTML = "";
    const width = labels ? MAP_RIGHT + 250 : MAP_RIGHT + 12;
    const minX = labels ? 0 : X0 - 2;
    svg.setAttribute("viewBox", `${minX} 0 ${width - minX} ${MAP_BOTTOM + 30}`);
    svg.classList.add("chile-map");
    if (compact) svg.classList.add("is-compact");

    const defs = el("defs", {}, svg);
    const grad = el("linearGradient", { id: "oceano", x1: "0", x2: "1", y1: "0", y2: "0" }, defs);
    el("stop", { offset: "0", "stop-color": "var(--ocean-1)" }, grad);
    el("stop", { offset: "1", "stop-color": "var(--ocean-2)", "stop-opacity": "0" }, grad);
    const sh = el("filter", { id: "sombra", x: "-20%", y: "-20%", width: "140%", height: "140%" }, defs);
    el("feDropShadow", { dx: "0", dy: "3", stdDeviation: "4", "flood-color": "#1b3a2b", "flood-opacity": ".28" }, sh);

    if (labels) {
      // Gratícula
      const g = el("g", { class: "graticula" }, svg);
      for (let lat = 20; lat <= 55; lat += 5) {
        el("line", { x1: 12, x2: MAP_RIGHT + 6, y1: py(lat), y2: py(lat) }, g);
        const t = el("text", { x: 12, y: py(lat) - 4 }, g);
        t.textContent = `${lat}°S`;
      }
      // Rótulos geográficos
      const geo = el("g", { class: "rotulos" }, svg);
      const oc = el("text", { x: px(76.0), y: py(45), transform: `rotate(-90 ${px(76.0)} ${py(45)})` }, geo);
      oc.textContent = "OCÉANO PACÍFICO";
      const vecinos = [["PERÚ", px(70.2), py(17.6) - 2], ["BOLIVIA", px(67.4), py(19.4)], ["ARGENTINA", px(67.6), py(33.5)]];
      for (const [n, x, y] of vecinos) { const t = el("text", { x, y, class: "vecino" }, geo); t.textContent = n; }
    }

    const gRegiones = el("g", { class: "regiones" }, svg);
    const gLineas = el("g", { class: "lineas" }, svg);
    const gLabels = el("g", { class: "etiquetas" }, svg);
    const nodos = {};

    REGIONES.forEach((r, i) => {
      const geo = GEO[r.id];
      const a = el("a", {
        href: urlRegion(r.id), class: "region", "data-id": r.id,
        "aria-label": `Región de ${r.nombre}`, tabindex: labels ? "0" : "-1"
      }, gRegiones);
      const path = el("path", { d: geo.d, style: `--c:${r.color}` }, a);
      const title = el("title", {}, a); title.textContent = r.nombre;
      nodos[r.id] = { a, path };
      if (highlight && highlight !== r.id) a.classList.add("is-dim");
      if (highlight === r.id) a.classList.add("is-active");
    });

    if (labels) {
      // Etiquetas a la derecha, sin solaparse
      const orden = REGIONES.map((r) => ({ r, cy: GEO[r.id].cy })).sort((a, b) => a.cy - b.cy);
      const GAP = 25;
      let last = -Infinity;
      for (const o of orden) { o.ly = Math.max(o.cy, last + GAP); last = o.ly; }
      // empujar hacia arriba si nos salimos por abajo
      let limit = MAP_BOTTOM;
      for (let i = orden.length - 1; i >= 0; i--) {
        if (orden[i].ly > limit) orden[i].ly = limit;
        limit = orden[i].ly - GAP;
      }
      const LX = MAP_RIGHT + 46;
      for (const { r, ly } of orden) {
        const g = GEO[r.id];
        const elbow = MAP_RIGHT + 14;
        const line = el("polyline", {
          points: `${g.cx.toFixed(1)},${g.cy.toFixed(1)} ${elbow},${g.cy.toFixed(1)} ${LX - 8},${ly.toFixed(1)}`,
          "data-id": r.id
        }, gLineas);
        el("circle", { cx: g.cx, cy: g.cy, r: 2.6, class: "punto", "data-id": r.id }, gLineas);
        const a = el("a", { href: urlRegion(r.id), class: "etiqueta", "data-id": r.id, tabindex: "-1" }, gLabels);
        el("rect", { x: LX - 4, y: ly - 11, rx: 11, width: 196, height: 22, class: "etq-bg" }, a);
        const num = el("text", { x: LX + 6, y: ly + 4, class: "etq-num" }, a);
        num.textContent = r.num;
        const t = el("text", { x: LX + 40, y: ly + 4.5, class: "etq-nom" }, a);
        t.textContent = r.nombre;
        nodos[r.id].label = a; nodos[r.id].line = line;
      }

      // Islas oceánicas (pertenecen a Valparaíso)
      const ins = el("g", { class: "insets" }, svg);
      const islas = [
        { n: "Archipiélago Juan Fernández", y: py(33.6), shape: "M-7,-2 L-2,-6 L6,-4 L8,1 L2,5 L-5,4Z" },
        { n: "Rapa Nui", y: py(27.1), shape: "M-8,5 L0,-7 L9,5Z" }
      ];
      for (const isl of islas) {
        const a = el("a", { href: urlRegion("valparaiso"), class: "inset", "data-id": "valparaiso" }, ins);
        el("circle", { cx: 40, cy: isl.y, r: 18, class: "inset-marco" }, a);
        el("path", { d: isl.shape, transform: `translate(40 ${isl.y})`, style: "--c:#7f9a52", class: "inset-isla" }, a);
        const t = el("text", { x: 40, y: isl.y + 32, class: "inset-txt" }, a);
        t.textContent = isl.n.length > 12 ? "Juan Fernández" : isl.n;
        el("line", { x1: 60, x2: px(71.8), y1: isl.y, y2: isl.y, class: "inset-linea" }, ins);
      }
      // Rosa de los vientos
      const rosa = el("g", { class: "rosa", transform: `translate(${40} ${py(52.5)})` }, svg);
      el("circle", { r: 20 }, rosa);
      el("path", { d: "M0,-17 L5,0 L0,17 L-5,0Z" }, rosa);
      const nt = el("text", { y: -24 }, rosa); nt.textContent = "N";
    }

    // Interacción
    let activo = null;
    function setActivo(id) {
      if (activo === id) return;
      if (activo && nodos[activo]) {
        for (const k of ["a", "label", "line"]) nodos[activo][k] && nodos[activo][k].classList.remove("is-hover");
        svg.querySelectorAll(`.punto[data-id="${activo}"], .inset[data-id="${activo}"]`).forEach((n) => n.classList.remove("is-hover"));
      }
      activo = id;
      if (id && nodos[id]) {
        for (const k of ["a", "label", "line"]) nodos[id][k] && nodos[id][k].classList.add("is-hover");
        svg.querySelectorAll(`.punto[data-id="${id}"], .inset[data-id="${id}"]`).forEach((n) => n.classList.add("is-hover"));
        // traer al frente
        nodos[id].a.parentNode.appendChild(nodos[id].a);
      }
      svg.classList.toggle("has-hover", !!id);
      onHover && onHover(id);
    }
    svg.addEventListener("pointerover", (e) => {
      const t = e.target.closest("[data-id]");
      if (t) setActivo(t.getAttribute("data-id"));
    });
    svg.addEventListener("pointerleave", () => setActivo(null));
    svg.addEventListener("focusin", (e) => {
      const t = e.target.closest("[data-id]");
      if (t) setActivo(t.getAttribute("data-id"));
    });
    svg.addEventListener("click", (e) => {
      const t = e.target.closest("[data-id]");
      if (t && onSelect) { e.preventDefault(); onSelect(t.getAttribute("data-id")); }
    });

    return { setActivo };
  }

  window.renderChileMap = renderChileMap;
})();
