/* =========================================================
   Lumaria — utilidades compartidas
   ========================================================= */

const AMENAZADAS = ["Vulnerable", "En peligro", "En peligro crítico", "Extinta en estado silvestre"];

function claseEstado(estado) {
  if (!estado) return "";
  return {
    "Preocupación menor": "lc",
    "Casi amenazada": "nt",
    "Vulnerable": "vu",
    "En peligro": "en",
    "En peligro crítico": "cr",
    "Extinta en estado silvestre": "ew"
  }[estado] || "";
}

/* ---------- Flora, Fauna y Funga (el código interno "fungi" se mantiene) ---------- */
const TIPOS = {
  flora: { etiqueta: "Flora", icono: "hoja" },
  fauna: { etiqueta: "Fauna", icono: "huella" },
  fungi: { etiqueta: "Funga", icono: "hongo" }
};
const iconoTipo = (tipo) => ICONOS[TIPOS[tipo].icono];

/** Todas las especies de una región, con su tipo. */
function especiesDe(r) {
  return ["flora", "fauna", "fungi"].flatMap((tipo) => (r[tipo] || []).map((e) => ({ ...e, tipo })));
}

/** Punto de enfoque del recorte de la foto (ver FOCOS en data.js). */
function focoDe(cientifico) {
  return (typeof FOCOS !== "undefined" && FOCOS[cientifico]) || "50% 50%";
}

/** Dirección de la página de una región (páginas generadas por herramientas/generar.py). */
function urlRegion(id, extra = "") {
  return `regiones/${id}.html${extra ? "?" + extra : ""}`;
}

function regionPorId(id) {
  return REGIONES.find((r) => r.id === id);
}

/* ---------- Fotos desde Wikipedia (con caché local) ---------- */
const _memoria = {};

function _leerCache(k) {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; }
}
function _guardarCache(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ }
}

async function _resumen(lang, titulo) {
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(titulo.replace(/ /g, "_"))}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const j = await res.json();
  if (j.type === "disambiguation") return null;
  return {
    img: j.thumbnail ? j.thumbnail.source : null,
    imgGrande: j.originalimage ? j.originalimage.source : (j.thumbnail ? j.thumbnail.source : null),
    extracto: j.extract || "",
    url: j.content_urls && j.content_urls.desktop ? j.content_urls.desktop.page : null,
    lang
  };
}

/* ---------- Créditos de las fotos (licencias de Wikimedia Commons) ---------- */

const _API_COMMONS = "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*";

function _textoPlano(html) {
  const d = document.createElement("div");
  d.innerHTML = html || "";
  return d.textContent.replace(/\s+/g, " ").trim();
}

/** Extrae el nombre del archivo de una URL de upload.wikimedia.org */
function archivoDeUrl(url) {
  const limpia = url.split("?")[0];
  const m = limpia.match(/\/wikipedia\/[a-z]+\/thumb\/[0-9a-f]\/[0-9a-f]{2}\/([^/]+)\//) ||
            limpia.match(/\/wikipedia\/[a-z]+\/[0-9a-f]\/[0-9a-f]{2}\/([^/]+)$/);
  return m ? decodeURIComponent(m[1]) : null;
}

function _creditoDesdeImageinfo(titulo, ii) {
  const m = (ii && ii.extmetadata) || {};
  const v = (k) => (m[k] && m[k].value) || "";
  const licencia = _textoPlano(v("LicenseShortName"));
  if (!licencia) return null;
  let autor = _textoPlano(v("Artist"));
  const supuesto = autor.match(/No machine-readable author provided\.\s*(.+?) assumed/i);
  if (supuesto) autor = supuesto[1];
  // "This image was created by user X (x) at Mushroom Observer, ..." → "X (x), Mushroom Observer"
  const mo = autor.match(/created by user (.+?) at Mushroom Observer/i);
  if (mo) autor = `${mo[1]}, Mushroom Observer`;
  if (!autor) autor = _textoPlano(v("Credit"));
  if (!autor && ii.user) autor = `${ii.user} (usuario de Wikimedia Commons)`;
  if (!autor) autor = "Autor desconocido";
  if (autor.length > 90) autor = autor.slice(0, 87) + "…";
  return {
    archivo: titulo.replace(/^File:/, ""),
    autor,
    licencia,
    licenciaUrl: v("LicenseUrl") || null,
    fuente: ii.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(titulo.replace(/ /g, "_"))}`,
    requiereCredito: v("AttributionRequired") === "true"
  };
}

/** Autor y licencia de una foto a partir de su URL. Devuelve null si no tiene licencia conocida. */
async function creditoFoto(url) {
  const archivo = archivoDeUrl(url);
  if (!archivo) return null;
  const titulo = "File:" + archivo;
  const res = await fetch(`${_API_COMMONS}&prop=imageinfo&iiprop=extmetadata|url|user&titles=${encodeURIComponent(titulo)}`);
  if (!res.ok) return null;
  const j = await res.json();
  const pag = j.query && Object.values(j.query.pages)[0];
  if (!pag || !pag.imageinfo) return null;
  return _creditoDesdeImageinfo(pag.title, pag.imageinfo[0]);
}

/** Busca en Commons una fotografía (no mapas ni diagramas) con licencia conocida. */
async function _fotoCommons(termino) {
  const url = `${_API_COMMONS}&generator=search&gsrnamespace=6&gsrlimit=8` +
    "&prop=imageinfo&iiprop=url|extmetadata|mime|user&iiurlwidth=640" +
    "&gsrsearch=" + encodeURIComponent(termino + " filetype:bitmap");
  const res = await fetch(url);
  if (!res.ok) return null;
  const j = await res.json();
  const paginas = j.query ? Object.values(j.query.pages).sort((a, b) => a.index - b.index) : [];
  for (const p of paginas) {
    const ii = p.imageinfo && p.imageinfo[0];
    if (!ii || ii.mime !== "image/jpeg") continue;
    if (/range|map|mapa|distribu/i.test(p.title)) continue;
    const credito = _creditoDesdeImageinfo(p.title, ii);
    if (credito) return { img: ii.thumburl, imgGrande: ii.thumburl, credito };
  }
  return null;
}

/** Busca foto, resumen y crédito de una especie.
 *  Devuelve {img, imgGrande, credito, extracto, url, lang} o null. */
function infoEspecie(cientifico, nombreComun) {
  const key = "lumaria:v4:" + cientifico;
  if (_memoria[key]) return _memoria[key];
  const cache = _leerCache(key);
  if (cache) return (_memoria[key] = Promise.resolve(cache));

  // "Usnea spp." → buscamos el género "Usnea"
  const base = cientifico.replace(/\s+spp?\.$/, "");
  const binomio = base.split(" ").slice(0, 2).join(" ");
  const intentos = [["es", base], ["en", base]];
  if (binomio !== base) intentos.push(["es", binomio], ["en", binomio]);
  if (nombreComun) intentos.push(["es", nombreComun]);

  const p = (async () => {
    let mejor = null, errorDeRed = false;
    for (const [lang, t] of intentos) {
      try {
        const r = await _resumen(lang, t);
        if (r && r.img) {
          // si ya había un texto en español sin foto, lo conservamos y añadimos la foto
          mejor = mejor && mejor.extracto ? { ...mejor, img: r.img, imgGrande: r.imgGrande } : r;
          break;
        }
        if (r && !mejor) mejor = r;
      } catch (e) { /* sin conexión: seguimos */ }
    }
    // Solo usamos fotos cuyo autor y licencia conocemos
    if (mejor && mejor.img) {
      try { mejor.credito = await creditoFoto(mejor.img); } catch (e) { mejor.credito = null; errorDeRed = true; }
      if (!mejor.credito) { mejor.img = mejor.imgGrande = null; }
    }
    if (!mejor || !mejor.img) {
      try {
        const foto = await _fotoCommons(base);
        if (foto) mejor = { ...(mejor || { extracto: "", url: null, lang: "es" }), ...foto };
      } catch (e) { /* sin conexión */ }
    }
    if (mejor && !errorDeRed) _guardarCache(key, mejor);
    return mejor;
  })();
  return (_memoria[key] = p);
}

function _esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/** Texto plano del crédito, para tooltips. */
function textoCredito(c) {
  return c ? `Foto: ${c.autor} · ${c.licencia} · Wikimedia Commons` : "";
}

/** Crédito con enlaces al original y a la licencia. */
function htmlCredito(c) {
  if (!c) return "";
  const lic = c.licenciaUrl
    ? `<a href="${_esc(c.licenciaUrl)}" target="_blank" rel="noopener license">${_esc(c.licencia)}</a>`
    : _esc(c.licencia);
  return `Foto: <a href="${_esc(c.fuente)}" target="_blank" rel="noopener">${_esc(c.autor)}</a> · ${lic} · ` +
    `<a href="${_esc(c.fuente)}" target="_blank" rel="noopener">Ver original</a>`;
}

/* ---------- Iconos ---------- */
const ICONOS = {
  hoja: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M5 19 14 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  huella: '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="16" rx="4.2" ry="3.6" fill="currentColor"/><circle cx="6" cy="10.5" r="1.9" fill="currentColor"/><circle cx="9.5" cy="6.8" r="1.9" fill="currentColor"/><circle cx="14.5" cy="6.8" r="1.9" fill="currentColor"/><circle cx="18" cy="10.5" r="1.9" fill="currentColor"/></svg>',
  hongo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12.5C3.5 7.5 7.3 4 12 4s8.5 3.5 8.5 8.5Z" fill="currentColor"/><path d="M9.5 12.5v5.2a2.5 2.5 0 0 0 5 0v-5.2" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
  flecha: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  estrella: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7Z" fill="currentColor"/></svg>'
};

const LOGO_SVG = `
<svg class="logo-mark" viewBox="0 0 40 40" aria-hidden="true">
  <circle cx="20" cy="20" r="19" fill="var(--forest)"/>
  <path d="M12 29c0-9 5-15 16-17-1 11-7 16-16 17Z" fill="var(--sprout)"/>
  <path d="M12 29 22 18" stroke="var(--forest)" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="27.5" cy="27" r="2.6" fill="var(--copihue)"/>
</svg>`;

function pintarLogos() {
  document.querySelectorAll("[data-logo]").forEach((n) => (n.innerHTML = LOGO_SVG));
}
document.addEventListener("DOMContentLoaded", pintarLogos);
