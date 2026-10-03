/* =========================================================
   Lumaria — Glosario: fotos de ejemplo desde Wikimedia
   Cada <figure class="g-foto"> recibe su foto y el crédito de su autor:
     data-wiki="Título o nombre científico"  → la foto del artículo de Wikipedia
     data-archivo="Nombre de archivo.jpg"    → una foto concreta de Wikimedia Commons
   ========================================================= */

(function () {
  const figuras = [...document.querySelectorAll(".g-foto[data-wiki], .g-foto[data-archivo]")];


  figuras.forEach((fig) => {
    fig.innerHTML = `<div class="foto-vacia cargando">${ICONOS.hoja}</div>`;
  });

  // Se cargan cuando están por aparecer en pantalla, para no pedir todas al abrir la página
  const cargar = (fig) => {
    const pedido = fig.dataset.archivo ? fotoDeCommons(fig.dataset.archivo) : infoEspecie(fig.dataset.wiki, fig.dataset.nombre);
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
