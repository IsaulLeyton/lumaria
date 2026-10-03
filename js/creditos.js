/* =========================================================
   Lumaria — Página de créditos de las fotografías
   ========================================================= */

(async function () {
  const lista = document.getElementById("lista-creditos");
  const estado = document.getElementById("estado");

  // Pintamos la estructura de inmediato y completamos cada fila al llegar su crédito
  lista.innerHTML = REGIONES.map((r) => `
    <section class="creditos-region" style="--rc:${r.color}">
      <h3><a href="${urlRegion(r.id)}">${r.nombre}</a></h3>
      <ul>
        ${especiesDe(r).map((e) => `
          <li class="credito-fila" data-sci="${_esc(e.cientifico)}">
            <span class="credito-mini"></span>
            <span class="credito-especie"><b>${e.nombre}</b> <i>${e.cientifico}</i></span>
            <span class="credito-detalle">Cargando…</span>
          </li>`).join("")}
      </ul>
    </section>`).join("");

  let conFoto = 0, sinFoto = 0;
  const filas = [...lista.querySelectorAll(".credito-fila")];
  await Promise.all(filas.map(async (fila) => {
    const sci = fila.dataset.sci;
    const nombre = fila.querySelector("b").textContent;
    const info = await infoEspecie(sci, nombre);
    const detalle = fila.querySelector(".credito-detalle");
    if (info && info.img && info.credito) {
      conFoto++;
      fila.querySelector(".credito-mini").style.backgroundImage = `url("${info.img}")`;
      fila.querySelector(".credito-mini").style.backgroundPosition = focoDe(sci);
      detalle.innerHTML = htmlCredito(info.credito);
    } else {
      sinFoto++;
      detalle.textContent = "Sin fotografía (no hay una con licencia libre).";
    }
  }));

  estado.textContent = `${conFoto} especies con fotografía` +
    (sinFoto ? ` · ${sinFoto} sin fotografía disponible con licencia libre.` : ".");
})();
