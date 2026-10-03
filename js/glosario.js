/* =========================================================
   Lumaria — Glosario: fotos de ejemplo desde Wikimedia
   Cada <figure class="g-foto"> recibe su foto y el crédito de su autor:
     data-wiki="Título o nombre científico"  → la foto del artículo de Wikipedia
     data-archivo="Nombre de archivo.jpg"    → una foto concreta de Wikimedia Commons
   ========================================================= */

(function () {
  const figuras = [...document.querySelectorAll(".g-foto[data-wiki], .g-foto[data-archivo]")];

  /** Foto concreta de Commons, con su autor y licencia (se guarda en el navegador). */
  async function infoArchivo(archivo) {
    const clave = "lumaria:v4:archivo:" + archivo;
    try { const c = localStorage.getItem(clave); if (c) return JSON.parse(c); } catch (e) { /* sin almacenamiento */ }
    const res = await fetch(`${_API_COMMONS}&prop=imageinfo&iiprop=url|extmetadata|user&iiurlwidth=640` +
      `&titles=${encodeURIComponent("File:" + archivo)}`);
    if (!res.ok) return null;
    const pag = Object.values((await res.json()).query.pages)[0];
    const ii = pag && pag.imageinfo && pag.imageinfo[0];
    const credito = ii && _creditoDesdeImageinfo(pag.title, ii);
    if (!credito) return null;  // solo fotos con autor y licencia conocidos
    const info = { img: ii.thumburl, imgGrande: ii.thumburl, credito };
    try { localStorage.setItem(clave, JSON.stringify(info)); } catch (e) { /* sin almacenamiento */ }
    return info;
  }

  figuras.forEach((fig) => {
    fig.innerHTML = `<div class="foto-vacia cargando">${ICONOS.hoja}</div>`;
  });

  // Se cargan cuando están por aparecer en pantalla, para no pedir todas al abrir la página
  const cargar = (fig) => {
    const pedido = fig.dataset.archivo ? infoArchivo(fig.dataset.archivo) : infoEspecie(fig.dataset.wiki, fig.dataset.nombre);
    pedido.catch(() => null).then((info) => {
      const vacia = fig.querySelector(".foto-vacia");
      if (!info || !info.img) { vacia && vacia.classList.remove("cargando"); return; }
      const img = new Image();
      img.alt = fig.dataset.nombre || fig.dataset.wiki;
      img.decoding = "async";
      if (fig.dataset.wiki) img.style.objectPosition = focoDe(fig.dataset.wiki);
      img.onload = () => {
        vacia && vacia.remove();
        img.classList.add("cargada");
        if (info.credito) {
          const pie = document.createElement("figcaption");
          pie.innerHTML = htmlCredito(info.credito);
          fig.appendChild(pie);
        }
      };
      img.onerror = () => { vacia && vacia.classList.remove("cargando"); img.remove(); };
      img.src = info.img;
      fig.prepend(img);
    });
  };

  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => { if (en.isIntersecting) { cargar(en.target); obs.unobserve(en.target); } });
    }, { rootMargin: "300px" });
    figuras.forEach((f) => obs.observe(f));
  } else {
    figuras.forEach(cargar);
  }
})();
