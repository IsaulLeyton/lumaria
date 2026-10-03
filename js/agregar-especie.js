/* =========================================================
   Lumaria — Proponer una especie para el atlas
   ========================================================= */

(function () {
  const $ = (id) => document.getElementById(id);
  const form = $("form-especie");
  const params = new URLSearchParams(location.search);
  const normalizar = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/\s+spp?\.?$/, "").replace(/\s+/g, " ").trim();
  let fotoPrevia = null;

  /* ---------- Opciones ---------- */
  const regionInicial = regionPorId(params.get("region")) ? params.get("region") : "";
  form.region.innerHTML = `<option value="" disabled ${regionInicial ? "" : "selected"}>Elige una región</option>` +
    REGIONES.map((r) => `<option value="${r.id}" ${r.id === regionInicial ? "selected" : ""}>${_esc(r.nombre)}</option>`).join("");

  const valor = (nombre) => (form.elements[nombre] && form.elements[nombre].value || "").trim();

  /* ---------- Vista previa de la tarjeta ---------- */
  function pintarVistaPrevia() {
    const tipo = valor("tipo");
    const r = regionPorId(valor("region"));
    const estado = valor("estado_conservacion");
    const grupo = tipo === "fungi" ? valor("grupo") : "";
    const etiquetaTipo = tipo ? `${iconoTipo(tipo)}${TIPOS[tipo].etiqueta}${grupo ? " · " + _esc(grupo) : ""}` : "¿Flora, fauna o fungi?";
    $("tarjeta-previa").innerHTML = `
      <article class="especie previa" style="--rc:${r ? r.color : "var(--forest)"}">
        <div class="foto">
          <span class="tipo">${etiquetaTipo}</span>
          ${valor("endemica") === "true" ? `<span class="endemica">${ICONOS.estrella}Endémica</span>` : ""}
          ${fotoPrevia ? `<img class="cargada" src="${fotoPrevia}" alt="">` : `<div class="foto-vacia">${tipo ? iconoTipo(tipo) : ICONOS.hoja}</div>`}
        </div>
        <div class="cuerpo">
          <span class="aporte-comunidad">Aporte de la comunidad</span>
          <h3>${_esc(valor("nombre") || "Nombre común")}</h3>
          <span class="cientifico">${_esc(valor("cientifico") || "Nombre científico")}</span>
          <p>${_esc(valor("descripcion") || "Aquí aparecerá la descripción que escribas.")}</p>
          ${estado ? `<span class="estado ${claseEstado(estado)}">${_esc(estado)}</span>` : ""}
        </div>
      </article>`;
    $("contador-desc").textContent = `${valor("descripcion").length} / 300`;
  }

  /* ---------- ¿Ya existe? ---------- */
  function revisarDuplicado() {
    const pista = $("pista-duplicado");
    const r = regionPorId(valor("region"));
    const sci = normalizar(valor("cientifico")), nom = normalizar(valor("nombre"));
    pista.className = "pista-especie";
    pista.textContent = "";
    if (!sci && !nom) return null;
    const coincide = (e) => (sci && normalizar(e.cientifico) === sci) || (nom && normalizar(e.nombre) === nom);
    const enRegion = r && especiesDe(r).find(coincide);
    if (enRegion) {
      pista.classList.add("alerta");
      pista.textContent = `«${enRegion.nombre}» ya está en la ficha de ${r.nombre}. No hace falta agregarla.`;
      return enRegion;
    }
    const otra = REGIONES.find((x) => x !== r && especiesDe(x).some(coincide));
    if (otra) pista.textContent = `Esta especie ya aparece en ${otra.nombre}. Puedes agregarla a esta región si también vive aquí.`;
    return null;
  }

  /* ---------- Eventos del formulario ---------- */
  form.addEventListener("input", () => { pintarVistaPrevia(); revisarDuplicado(); });
  form.addEventListener("change", () => {
    const esFungi = valor("tipo") === "fungi";
    $("campo-grupo").hidden = !esFungi;
    form.querySelectorAll('input[name="grupo"]').forEach((g) => { g.required = esFungi; if (!esFungi) g.checked = false; });
    pintarVistaPrevia();
    revisarDuplicado();
  });
  form.archivo.addEventListener("change", () => {
    const file = form.archivo.files[0];
    const img = $("campo-foto").querySelector("img");
    if (fotoPrevia) URL.revokeObjectURL(fotoPrevia);
    fotoPrevia = null;
    if (file && file.size > 25 * 1024 * 1024) {
      avisar("La foto es demasiado grande (máximo 25 MB).", "error");
      form.archivo.value = "";
    } else if (file) {
      fotoPrevia = URL.createObjectURL(file);
    }
    img.hidden = !fotoPrevia;
    if (fotoPrevia) img.src = fotoPrevia; else img.removeAttribute("src");
    $("campo-foto").classList.toggle("con-foto", !!fotoPrevia);
    pintarVistaPrevia();
  });

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (!form.reportValidity()) return;
    const yo = usuario();
    if (!yo) { abrirEntrar(); return; }
    if (revisarDuplicado()) { avisar("Esa especie ya está en la región elegida.", "error"); return; }

    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true; btn.textContent = "Enviando…";
    try {
      const blob = await prepararImagen(form.archivo.files[0]);
      if (!blob) throw new Error("No pudimos leer la imagen. Prueba con otra foto.");
      const ruta = `${yo.id}/${crypto.randomUUID()}.jpg`;
      const subida = await sb.storage.from("especies").upload(ruta, blob, { contentType: "image/jpeg" });
      if (subida.error) throw subida.error;

      const { error } = await sb.from("especies_propuestas").insert({
        region: valor("region"),
        tipo: valor("tipo"),
        grupo: valor("tipo") === "fungi" ? valor("grupo") || null : null,
        nombre: valor("nombre"),
        cientifico: valor("cientifico"),
        descripcion: valor("descripcion"),
        estado_conservacion: valor("estado_conservacion") || null,
        endemica: valor("endemica") === "" ? null : valor("endemica") === "true",
        fuente: valor("fuente") || null,
        lugar_foto: valor("lugar_foto") || null,
        ruta_foto: ruta
      });
      if (error) { await sb.storage.from("especies").remove([ruta]); throw error; }

      avisar("¡Gracias! Tu especie quedó en revisión. Te mostraremos aquí cuando sea aprobada.");
      const region = valor("region");
      form.reset();
      form.region.value = region;
      $("campo-foto").querySelector("img").hidden = true;
      $("campo-foto").classList.remove("con-foto");
      $("campo-grupo").hidden = true;
      if (fotoPrevia) URL.revokeObjectURL(fotoPrevia);
      fotoPrevia = null;
      pintarVistaPrevia();
      revisarDuplicado();
      await pintarMisPropuestas();
      $("mis-propuestas").scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      avisar(mensajeError(err), "error");
    } finally {
      btn.disabled = false; btn.textContent = "Enviar a revisión";
    }
  });

  /* ---------- Mis propuestas ---------- */
  async function pintarMisPropuestas() {
    const panel = $("mis-propuestas");
    const yo = usuario();
    if (!yo) { panel.innerHTML = ""; return; }
    const { data, error } = await sb.from("especies_propuestas")
      .select("id, nombre, cientifico, region, estado, motivo_rechazo, creado, ruta_foto")
      .eq("usuario_id", yo.id).order("creado", { ascending: false }).limit(50);
    if (error || !data.length) { panel.innerHTML = ""; return; }
    const urls = await urlsFotos(data.map((p) => p.ruta_foto), "especies");
    const etiqueta = { pendiente: "En revisión", aprobada: "Publicada en el atlas", rechazada: "No aprobada" };
    panel.innerHTML = `
      <div class="panel-mias">
        <b>Tus especies propuestas</b>
        <div class="lista-mias">
          ${data.map((p, i) => {
            const r = regionPorId(p.region);
            return `
            <div class="mia">
              <span class="mia-img" style="background-image:url('${_esc(urls[i] || "")}')"></span>
              <span>
                <b>${_esc(p.nombre)}</b> <i class="cientifico">${_esc(p.cientifico)}</i>
                <small>${_esc(r ? r.nombre : p.region)} · ${haceTiempo(p.creado)}</small>
                <span class="estado-mod ${p.estado}">${etiqueta[p.estado]}</span>
                ${p.estado === "aprobada" && r ? `<a class="enlace" href="${urlRegion(p.region, "especie=" + encodeURIComponent(p.cientifico))}">Ver en ${_esc(r.nombre)} →</a>` : ""}
                ${p.estado === "rechazada" && p.motivo_rechazo ? `<small class="motivo">Motivo: ${_esc(p.motivo_rechazo)}</small>` : ""}
              </span>
              <button type="button" class="enlace-peligro" data-retirar="${p.id}" data-ruta="${_esc(p.ruta_foto)}">${p.estado === "aprobada" ? "Retirar" : "Eliminar"}</button>
            </div>`;
          }).join("")}
        </div>
      </div>`;
  }
  $("mis-propuestas").addEventListener("click", async (ev) => {
    const b = ev.target.closest("[data-retirar]");
    if (!b) return;
    if (!(await confirmar("¿Retirar esta especie?", "Se borrará la propuesta y su foto. Si ya estaba publicada, dejará de aparecer en la región.", "Retirar"))) return;
    const { error } = await sb.from("especies_propuestas").delete().eq("id", Number(b.dataset.retirar));
    if (error) { avisar(mensajeError(error), "error"); return; }
    await sb.storage.from("especies").remove([b.dataset.ruta]);
    avisar("Propuesta retirada.");
    pintarMisPropuestas();
  });

  /* ---------- Arranque según la sesión ---------- */
  function mostrarSegunSesion() {
    const yo = usuario();
    $("pedir-sesion").hidden = !!yo;
    $("agregar-grid").hidden = !yo;
    if (yo) pintarMisPropuestas(); else $("mis-propuestas").innerHTML = "";
  }

  pintarVistaPrevia();
  if (!COMUNIDAD_ACTIVA) { $("aviso-config").hidden = false; return; }
  $("btn-entrar-especie").addEventListener("click", () => abrirEntrar("Entra con tu correo para proponer una especie."));
  sesionLista().then(mostrarSegunSesion);
  alCambiarSesion(mostrarSegunSesion);
})();
