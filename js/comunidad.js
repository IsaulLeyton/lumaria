/* =========================================================
   Lumaria — Página de comunidad: fotos y debates por región
   ========================================================= */

(function () {
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const POR_PAGINA = 24;

  // Capitales regionales: centro inicial del mapa al subir una foto
  const CENTROS = {
    arica: [-18.48, -70.31], tarapaca: [-20.21, -70.15], antofagasta: [-23.65, -70.4],
    atacama: [-27.37, -70.33], coquimbo: [-29.9, -71.25], valparaiso: [-33.05, -71.62],
    metropolitana: [-33.45, -70.67], ohiggins: [-34.17, -70.74], maule: [-35.43, -71.66],
    nuble: [-36.61, -72.1], biobio: [-36.83, -73.05], araucania: [-38.74, -72.6],
    losrios: [-39.81, -73.25], loslagos: [-41.47, -72.94], aysen: [-45.57, -72.07],
    magallanes: [-53.16, -70.92]
  };

  const estado = {
    region: regionPorId(params.get("region")) ? params.get("region") : "todas",
    vista: params.get("vista") === "debates" || params.get("hilo") ? "debates" : "fotos",
    hilo: params.get("hilo") ? Number(params.get("hilo")) : null,
    especie: params.get("especie") || "",
    mias: params.has("mias"),
    pagina: 0
  };

  function actualizarURL() {
    const p = new URLSearchParams();
    if (estado.region !== "todas") p.set("region", estado.region);
    if (estado.vista === "debates") p.set("vista", "debates");
    if (estado.hilo) p.set("hilo", estado.hilo);
    if (estado.especie) p.set("especie", estado.especie);
    if (estado.mias) p.set("mias", "1");
    history.replaceState(null, "", "comunidad.html" + (p.toString() ? "?" + p : ""));
  }

  const nombreRegion = (id) => (regionPorId(id) || {}).nombre || id;
  const colorRegion = (id) => (regionPorId(id) || {}).color || "var(--forest)";

  /* ---------- Chips de región y pestañas ---------- */
  function pintarChips() {
    const chips = [{ id: "todas", nombre: "Todo Chile", color: "var(--forest)" }, ...REGIONES];
    $("chips-regiones").innerHTML = chips.map((r) => `
      <button type="button" role="tab" class="chip-region" data-region="${r.id}"
        aria-selected="${r.id === estado.region}" style="--rc:${r.color}">${_esc(r.nombre)}</button>`).join("");
  }
  $("chips-regiones").addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-region]");
    if (!b) return;
    estado.region = b.dataset.region;
    estado.especie = "";
    estado.hilo = null;
    pintarChips();
    pintarFiltroEspecie();
    recargar();
  });

  function pintarPestanas() {
    document.querySelectorAll(".pestanas [data-vista]").forEach((b) =>
      b.setAttribute("aria-selected", b.dataset.vista === estado.vista));
    $("panel-fotos").hidden = estado.vista !== "fotos";
    $("panel-debates").hidden = estado.vista !== "debates";
  }
  document.querySelector(".pestanas").addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-vista]");
    if (!b) return;
    estado.vista = b.dataset.vista;
    estado.hilo = null;
    recargar();
  });

  /* ---------- Especies (para filtros y formulario) ---------- */
  function opcionesEspecies(regionId, conOtra) {
    const r = regionPorId(regionId);
    const grupos = r ? [["flora", "Flora"], ["fauna", "Fauna"], ["fungi", "Fungi"]].map(([t, et]) =>
      `<optgroup label="${et}">${r[t].map((e) => `<option value="${_esc(e.cientifico)}">${_esc(e.nombre)}</option>`).join("")}</optgroup>`
    ).join("") : "";
    return grupos + (conOtra ? `<option value="__otra">Otra especie / no estoy seguro</option>` : "");
  }

  function pintarFiltroEspecie() {
    const sel = $("filtro-especie");
    sel.innerHTML = `<option value="">Todas las especies</option>` +
      (estado.region === "todas" ? "" : opcionesEspecies(estado.region, false));
    sel.value = estado.especie;
    sel.closest("label").hidden = estado.region === "todas";
  }
  $("filtro-especie").addEventListener("change", (ev) => {
    estado.especie = ev.target.value;
    recargar();
  });

  /* ---------- Fotos ---------- */
  // Si se pide una carga nueva mientras otra está en curso, la anterior se descarta
  // (si no, ambas agregarían sus fotos y aparecerían duplicadas).
  let cargaFotos = 0;
  async function cargarFotos(reiniciar) {
    const miCarga = ++cargaFotos;
    const grid = $("grid-fotos");
    if (reiniciar) { estado.pagina = 0; grid.innerHTML = `<p class="cargando-texto">Cargando fotos…</p>`; }
    const desde = estado.pagina * POR_PAGINA;
    let q = sb.from("fotos")
      .select("id, region, especie_nombre, especie_cientifico, lugar, ruta, creado, perfiles(nombre), comentarios(count)")
      .eq("estado", "aprobada")
      .order("creado", { ascending: false })
      .range(desde, desde + POR_PAGINA - 1);
    if (estado.region !== "todas") q = q.eq("region", estado.region);
    if (estado.especie) q = q.eq("especie_cientifico", estado.especie);
    const { data, error } = await q;
    if (miCarga !== cargaFotos) return;
    if (error) { grid.innerHTML = `<p class="vacio">${_esc(mensajeError(error))}</p>`; return; }
    const urls = await urlsFotos(data.map((f) => f.ruta));
    if (miCarga !== cargaFotos) return;
    if (reiniciar) grid.innerHTML = "";

    if (reiniciar && !data.length) {
      grid.innerHTML = `
        <div class="vacio">
          <b>Aún no hay fotos ${estado.region === "todas" ? "" : "de " + _esc(nombreRegion(estado.region))}</b>
          ¡Sé la primera persona en compartir una!
        </div>`;
    }
    grid.insertAdjacentHTML("beforeend", data.map((f, i) => tarjetaFoto(f, urls[i])).join(""));
    $("mas-fotos").hidden = data.length < POR_PAGINA;
    estado.pagina++;
  }

  function tarjetaFoto(f, url) {
    const n = (f.comentarios && f.comentarios[0] && f.comentarios[0].count) || 0;
    return `
      <button type="button" class="foto-comunidad" data-foto="${f.id}" style="--rc:${colorRegion(f.region)}">
        <span class="fc-img">${url ? `<img src="${_esc(url)}" alt="${_esc(f.especie_nombre)}" loading="lazy">` : ""}</span>
        <span class="fc-info">
          <b>${_esc(f.especie_nombre)}</b>
          <small>${_esc(f.lugar)} · ${_esc(nombreRegion(f.region))}</small>
          <span class="fc-pie"><span>por ${_esc(f.perfiles ? f.perfiles.nombre : "—")}</span><span>💬 ${n}</span></span>
        </span>
      </button>`;
  }

  $("grid-fotos").addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-foto]");
    if (b) abrirFoto(Number(b.dataset.foto));
  });
  $("mas-fotos").addEventListener("click", () => cargarFotos(false));

  /* ---------- Mis fotos (estado de revisión) ---------- */
  async function pintarMias() {
    const panel = $("panel-mias");
    const yo = usuario();
    if (!yo) { panel.innerHTML = ""; return; }
    let q = sb.from("fotos").select("id, especie_nombre, region, estado, motivo_rechazo, creado, ruta")
      .eq("usuario_id", yo.id).order("creado", { ascending: false }).limit(50);
    if (!estado.mias) q = q.neq("estado", "aprobada");
    const { data, error } = await q;
    if (error || !data.length) {
      panel.innerHTML = estado.mias ? `<div class="panel-mias"><b>Mis fotos</b><p class="ayuda">Todavía no has subido fotos.</p></div>` : "";
      return;
    }
    const urls = await urlsFotos(data.map((f) => f.ruta));
    const etiqueta = { pendiente: "En revisión", aprobada: "Publicada", rechazada: "No aprobada" };
    panel.innerHTML = `
      <div class="panel-mias">
        <b>${estado.mias ? "Mis fotos" : "Tus fotos en revisión"}</b>
        <div class="lista-mias">
          ${data.map((f, i) => `
            <div class="mia">
              <span class="mia-img" style="background-image:url('${_esc(urls[i] || "")}')"></span>
              <span>
                <b>${_esc(f.especie_nombre)}</b>
                <small>${_esc(nombreRegion(f.region))} · ${haceTiempo(f.creado)}</small>
                <span class="estado-mod ${f.estado}">${etiqueta[f.estado]}</span>
                ${f.estado === "rechazada" && f.motivo_rechazo ? `<small class="motivo">Motivo: ${_esc(f.motivo_rechazo)}</small>` : ""}
              </span>
              <button type="button" class="enlace-peligro" data-borrar-mia="${f.id}" data-ruta="${_esc(f.ruta)}">Eliminar</button>
            </div>`).join("")}
        </div>
      </div>`;
  }
  $("panel-mias").addEventListener("click", async (ev) => {
    const b = ev.target.closest("[data-borrar-mia]");
    if (!b) return;
    if (!(await confirmar("¿Eliminar esta foto?", "Se borrará definitivamente, junto con sus comentarios.", "Eliminar"))) return;
    await borrarFoto(Number(b.dataset.borrarMia), b.dataset.ruta);
    pintarMias();
  });

  async function borrarFoto(id, ruta) {
    const { error } = await sb.from("fotos").delete().eq("id", id);
    if (error) { avisar(mensajeError(error), "error"); return false; }
    await sb.storage.from("fotos").remove([ruta]);
    avisar("Foto eliminada.");
    return true;
  }

  /* ---------- Ver una foto ---------- */
  const dlgFoto = $("dlg-foto");
  dlgFoto.querySelector(".modal-cerrar").onclick = () => dlgFoto.close();
  dlgFoto.addEventListener("click", (e) => { if (e.target === dlgFoto) dlgFoto.close(); });
  let mapaFoto = null;

  async function abrirFoto(id) {
    const cont = $("dlg-foto-contenido");
    cont.innerHTML = `<p class="cargando-texto" style="padding:40px">Cargando…</p>`;
    dlgFoto.showModal();
    const { data: f, error } = await sb.from("fotos")
      .select("*, perfiles(nombre)").eq("id", id).maybeSingle();
    if (error || !f) { cont.innerHTML = `<p class="vacio">No encontramos esta foto.</p>`; return; }
    const [url] = await urlsFotos([f.ruta]);
    const yo = usuario();
    const puedeBorrar = yo && (yo.id === f.usuario_id || esAdmin());
    const r = regionPorId(f.region);
    const ficha = f.especie_cientifico && r
      ? `<a href="${urlRegion(f.region, "especie=" + encodeURIComponent(f.especie_cientifico))}">Ver ficha de la especie →</a>` : "";

    cont.innerHTML = `
      <div class="modal-foto" style="--fondo:url('${_esc(url || "")}')">${url ? `<img src="${_esc(url)}" alt="${_esc(f.especie_nombre)}">` : ""}</div>
      <div class="modal-credito">Foto: <b>${_esc(f.perfiles ? f.perfiles.nombre : "—")}</b> · Todos los derechos reservados por su autor</div>
      <div class="modal-cuerpo">
        <span class="kicker">${_esc(nombreRegion(f.region))}</span>
        <h2 style="margin-top:10px">${_esc(f.especie_nombre)}</h2>
        ${f.especie_cientifico ? `<div class="cientifico">${_esc(f.especie_cientifico)}</div>` : ""}
        <ul class="datos-foto">
          <li><b>Lugar:</b> ${_esc(f.lugar)}</li>
          ${f.fecha_foto ? `<li><b>Fecha:</b> ${fechaCorta(f.fecha_foto)}</li>` : ""}
          <li><b>Publicada:</b> ${haceTiempo(f.creado)}</li>
        </ul>
        ${f.descripcion ? `<p class="texto-usuario">${_esc(f.descripcion)}</p>` : ""}
        ${f.lat != null ? `<div id="mapa-foto" class="mapa-leaflet chico"></div><small class="ayuda">Ubicación aproximada.</small>` : ""}
        <div class="acciones-contenido">
          ${ficha}
          <button type="button" class="enlace" data-reportar>Reportar</button>
          ${puedeBorrar ? `<button type="button" class="enlace-peligro" data-borrar>Eliminar</button>` : ""}
        </div>
        <h3 class="titulo-comentarios">Comentarios</h3>
        <div id="comentarios-foto"></div>
      </div>`;

    cont.querySelector("[data-reportar]").onclick = () => reportar("foto", f.id);
    const bb = cont.querySelector("[data-borrar]");
    if (bb) bb.onclick = async () => {
      if (!(await confirmar("¿Eliminar esta foto?", "Se borrará definitivamente, junto con sus comentarios.", "Eliminar"))) return;
      if (await borrarFoto(f.id, f.ruta)) { dlgFoto.close(); cargarFotos(true); }
    };

    if (f.lat != null && window.L) {
      if (mapaFoto) { mapaFoto.remove(); mapaFoto = null; }
      mapaFoto = L.map("mapa-foto", { scrollWheelZoom: false }).setView([f.lat, f.lng], 9);
      capaBase().addTo(mapaFoto);
      L.circle([f.lat, f.lng], { radius: 2500, color: "#c3283d", fillOpacity: 0.25 }).addTo(mapaFoto);
      setTimeout(() => mapaFoto.invalidateSize(), 50);
    }
    cargarComentarios($("comentarios-foto"), { foto_id: f.id });
  }

  const capaBase = () => L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18, attribution: "© colaboradores de OpenStreetMap"
  });

  /* ---------- Comentarios (fotos y debates) ---------- */
  async function cargarComentarios(cont, filtro) {
    const campo = filtro.foto_id ? "foto_id" : "hilo_id";
    const { data, error } = await sb.from("comentarios")
      .select("id, cuerpo, creado, oculto, usuario_id, perfiles(nombre)")
      .eq(campo, filtro[campo]).order("creado", { ascending: true });
    const yo = usuario();
    const lista = error ? [] : data;
    cont.innerHTML = `
      <div class="comentarios">
        ${lista.length ? lista.map((c) => `
          <div class="comentario ${c.oculto ? "oculto" : ""}">
            <span class="avatar">${_esc((c.perfiles ? c.perfiles.nombre : "?").charAt(0).toUpperCase())}</span>
            <div>
              <div class="comentario-cab"><b>${_esc(c.perfiles ? c.perfiles.nombre : "—")}</b> <small>${haceTiempo(c.creado)}</small>
                ${c.oculto ? `<small class="estado-mod rechazada">Oculto por moderación</small>` : ""}</div>
              <p class="texto-usuario">${_esc(c.cuerpo)}</p>
              <div class="comentario-acciones">
                <button type="button" class="enlace" data-rep-com="${c.id}">Reportar</button>
                ${yo && (yo.id === c.usuario_id || esAdmin()) ? `<button type="button" class="enlace-peligro" data-borrar-com="${c.id}">Eliminar</button>` : ""}
              </div>
            </div>
          </div>`).join("") : `<p class="ayuda">Todavía no hay comentarios.</p>`}
      </div>
      ${yo ? `
        <form class="form-comentario">
          <textarea name="cuerpo" rows="2" maxlength="2000" required placeholder="Escribe un comentario…"></textarea>
          <button class="boton chico" type="submit">Comentar</button>
        </form>` : `<p class="ayuda"><button type="button" class="enlace" data-entrar>Entra con tu correo</button> para comentar.</p>`}`;

    cont.onclick = async (ev) => {
      const rep = ev.target.closest("[data-rep-com]");
      const bor = ev.target.closest("[data-borrar-com]");
      if (ev.target.closest("[data-entrar]")) abrirEntrar("Entra con tu correo para participar en la conversación.");
      if (rep) reportar("comentario", Number(rep.dataset.repCom));
      if (bor) {
        if (!(await confirmar("¿Eliminar este comentario?", "No se puede deshacer.", "Eliminar"))) return;
        const { error } = await sb.from("comentarios").delete().eq("id", Number(bor.dataset.borrarCom));
        if (error) avisar(mensajeError(error), "error"); else cargarComentarios(cont, filtro);
      }
    };
    const form = cont.querySelector(".form-comentario");
    if (form) form.onsubmit = async (ev) => {
      ev.preventDefault();
      if (!exigirSesion()) return;
      const cuerpo = form.cuerpo.value.trim();
      if (!cuerpo) return;
      form.querySelector("button").disabled = true;
      const { error } = await sb.from("comentarios").insert({ ...filtro, cuerpo });
      if (error) { avisar(mensajeError(error), "error"); form.querySelector("button").disabled = false; return; }
      cargarComentarios(cont, filtro);
    };
  }

  /* ---------- Debates ---------- */
  async function cargarDebates() {
    const panel = $("panel-debates");
    if (estado.hilo) return abrirHilo(estado.hilo);
    panel.innerHTML = `<p class="cargando-texto">Cargando debates…</p>`;
    let q = sb.from("hilos")
      .select("id, region, titulo, cuerpo, creado, oculto, perfiles(nombre), comentarios(count)")
      .order("creado", { ascending: false }).limit(60);
    if (estado.region !== "todas") q = q.eq("region", estado.region);
    const { data, error } = await q;
    if (error) { panel.innerHTML = `<p class="vacio">${_esc(mensajeError(error))}</p>`; return; }
    if (!data.length) {
      panel.innerHTML = `<div class="vacio"><b>Aún no hay debates${estado.region === "todas" ? "" : " en " + _esc(nombreRegion(estado.region))}</b>
        Inicia la primera conversación.</div>`;
      return;
    }
    panel.innerHTML = `<div class="lista-hilos">${data.map((h) => {
      const n = (h.comentarios && h.comentarios[0] && h.comentarios[0].count) || 0;
      return `
        <button type="button" class="hilo" data-hilo="${h.id}" style="--rc:${colorRegion(h.region)}">
          <span class="hilo-region">${_esc(nombreRegion(h.region))}</span>
          <b>${_esc(h.titulo)}</b>
          <span class="hilo-extracto">${_esc(h.cuerpo.slice(0, 160))}${h.cuerpo.length > 160 ? "…" : ""}</span>
          <small>por ${_esc(h.perfiles ? h.perfiles.nombre : "—")} · ${haceTiempo(h.creado)} · 💬 ${n}
            ${h.oculto ? ` · <span class="estado-mod rechazada">Oculto</span>` : ""}</small>
        </button>`;
    }).join("")}</div>`;
  }
  $("panel-debates").addEventListener("click", (ev) => {
    const h = ev.target.closest("[data-hilo]");
    if (h) { estado.hilo = Number(h.dataset.hilo); actualizarURL(); abrirHilo(estado.hilo); }
    if (ev.target.closest("[data-volver]")) { estado.hilo = null; actualizarURL(); cargarDebates(); }
  });

  async function abrirHilo(id) {
    const panel = $("panel-debates");
    panel.innerHTML = `<p class="cargando-texto">Cargando…</p>`;
    const { data: h, error } = await sb.from("hilos").select("*, perfiles(nombre)").eq("id", id).maybeSingle();
    if (error || !h) {
      panel.innerHTML = `<button type="button" class="enlace" data-volver>← Volver a los debates</button><p class="vacio">Este debate no existe o fue ocultado.</p>`;
      return;
    }
    const yo = usuario();
    panel.innerHTML = `
      <button type="button" class="enlace" data-volver>← Volver a los debates</button>
      <article class="hilo-detalle" style="--rc:${colorRegion(h.region)}">
        <span class="hilo-region">${_esc(nombreRegion(h.region))}</span>
        <h2>${_esc(h.titulo)}</h2>
        <small>por <b>${_esc(h.perfiles ? h.perfiles.nombre : "—")}</b> · ${haceTiempo(h.creado)}
          ${h.oculto ? ` · <span class="estado-mod rechazada">Oculto por moderación</span>` : ""}</small>
        <p class="texto-usuario">${_esc(h.cuerpo)}</p>
        <div class="acciones-contenido">
          <button type="button" class="enlace" data-rep-hilo>Reportar</button>
          ${yo && (yo.id === h.usuario_id || esAdmin()) ? `<button type="button" class="enlace-peligro" data-borrar-hilo>Eliminar debate</button>` : ""}
        </div>
      </article>
      <h3 class="titulo-comentarios">Respuestas</h3>
      <div id="comentarios-hilo"></div>`;
    panel.querySelector("[data-rep-hilo]").onclick = () => reportar("hilo", h.id);
    const bb = panel.querySelector("[data-borrar-hilo]");
    if (bb) bb.onclick = async () => {
      if (!(await confirmar("¿Eliminar este debate?", "Se borrarán también todas sus respuestas.", "Eliminar"))) return;
      const { error } = await sb.from("hilos").delete().eq("id", h.id);
      if (error) { avisar(mensajeError(error), "error"); return; }
      avisar("Debate eliminado.");
      estado.hilo = null; actualizarURL(); cargarDebates();
    };
    cargarComentarios($("comentarios-hilo"), { hilo_id: h.id });
  }

  /* ---------- Formularios: utilidades ---------- */
  function opcionesRegiones(sel) {
    return REGIONES.map((r) => `<option value="${r.id}" ${r.id === sel ? "selected" : ""}>${_esc(r.nombre)}</option>`).join("");
  }
  document.querySelectorAll("dialog [data-cerrar], #dlg-subir .modal-cerrar, #dlg-hilo .modal-cerrar").forEach((b) =>
    b.addEventListener("click", () => b.closest("dialog").close()));

  /* ---------- Nuevo debate ---------- */
  const dlgHilo = $("dlg-hilo");
  const formHilo = $("form-hilo");
  $("btn-nuevo-hilo").addEventListener("click", () => {
    if (!COMUNIDAD_ACTIVA) { avisar("La comunidad aún no está conectada.", "error"); return; }
    if (!exigirSesion("Para iniciar un debate necesitas entrar con tu correo.")) return;
    formHilo.reset();
    formHilo.region.innerHTML = opcionesRegiones(estado.region === "todas" ? "" : estado.region);
    dlgHilo.showModal();
  });
  formHilo.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const btn = formHilo.querySelector("button[type=submit]");
    btn.disabled = true;
    const { data, error } = await sb.from("hilos").insert({
      region: formHilo.region.value,
      titulo: formHilo.titulo.value.trim(),
      cuerpo: formHilo.cuerpo.value.trim()
    }).select("id, region").single();
    btn.disabled = false;
    if (error) { avisar(mensajeError(error), "error"); return; }
    dlgHilo.close();
    avisar("¡Debate publicado!");
    estado.vista = "debates"; estado.region = data.region; estado.hilo = data.id;
    pintarChips(); pintarFiltroEspecie(); recargar();
  });

  /* ---------- Subir una foto ---------- */
  const dlgSubir = $("dlg-subir");
  const formSubir = $("form-subir");
  let mapaSubir = null, marcador = null, punto = null;

  function prepararFormularioSubir() {
    formSubir.reset();
    punto = null;
    const region = estado.region === "todas" ? "" : estado.region;
    formSubir.region.innerHTML = `<option value="" disabled ${region ? "" : "selected"}>Elige una región</option>` + opcionesRegiones(region);
    actualizarEspeciesForm();
    if (estado.especie) formSubir.especie.value = estado.especie;
    const img = $("campo-foto").querySelector("img");
    img.hidden = true; img.removeAttribute("src");
    $("campo-foto").classList.remove("con-foto");
    $("campo-otra").hidden = true;
    formSubir.fecha_foto.max = new Date().toISOString().slice(0, 10);
    actualizarNotaUbicacion();
  }

  function actualizarEspeciesForm() {
    const reg = formSubir.region.value;
    formSubir.especie.innerHTML = reg
      ? `<option value="" disabled selected>Elige la especie</option>` + opcionesEspecies(reg, true)
      : `<option value="" disabled selected>Primero elige la región</option>`;
    $("campo-otra").hidden = true;
  }

  function especieElegida() {
    const r = regionPorId(formSubir.region.value);
    return r ? especiesDe(r).find((e) => e.cientifico === formSubir.especie.value) : null;
  }

  // Para no exponer especies amenazadas, la ubicación se guarda aproximada
  function decimalesUbicacion() {
    const e = especieElegida();
    return e && AMENAZADAS.includes(e.estado) ? 1 : 2;
  }
  function actualizarNotaUbicacion() {
    const nota = $("nota-ubicacion");
    if (!punto) { nota.textContent = "Haz clic en el mapa para marcar el lugar."; return; }
    nota.textContent = decimalesUbicacion() === 1
      ? "Esta especie está amenazada: para protegerla, solo se mostrará la zona aproximada (unos 10 km)."
      : "Se mostrará la ubicación aproximada (alrededor de 1 km).";
  }

  formSubir.region.addEventListener("change", () => {
    actualizarEspeciesForm();
    const c = CENTROS[formSubir.region.value];
    if (mapaSubir && c) mapaSubir.setView(c, 8);
  });
  formSubir.especie.addEventListener("change", () => {
    $("campo-otra").hidden = formSubir.especie.value !== "__otra";
    formSubir.especie_otra.required = formSubir.especie.value === "__otra";
    actualizarNotaUbicacion();
  });
  formSubir.archivo.addEventListener("change", () => {
    const file = formSubir.archivo.files[0];
    const img = $("campo-foto").querySelector("img");
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { avisar("La foto es demasiado grande (máximo 25 MB).", "error"); formSubir.archivo.value = ""; return; }
    img.src = URL.createObjectURL(file);
    img.hidden = false;
    $("campo-foto").classList.add("con-foto");
  });

  function iniciarMapaSubir() {
    if (!window.L) return;
    const c = CENTROS[formSubir.region.value] || [-35.5, -71.5];
    if (!mapaSubir) {
      mapaSubir = L.map("mapa-subir").setView(c, formSubir.region.value ? 8 : 4);
      capaBase().addTo(mapaSubir);
      mapaSubir.on("click", (e) => {
        punto = e.latlng;
        if (marcador) marcador.setLatLng(punto); else marcador = L.marker(punto).addTo(mapaSubir);
        actualizarNotaUbicacion();
      });
    } else {
      mapaSubir.setView(c, formSubir.region.value ? 8 : 4);
      if (marcador) { marcador.remove(); marcador = null; }
    }
    setTimeout(() => mapaSubir.invalidateSize(), 60);
  }

  /** Reduce la foto a 1600 px y la convierte a JPG (esto además borra los datos GPS ocultos del archivo). */
  async function prepararImagen(file) {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * k);
    canvas.height = Math.round(bmp.height * k);
    canvas.getContext("2d").drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.85));
  }

  function abrirSubir() {
    if (!COMUNIDAD_ACTIVA) { avisar("La comunidad aún no está conectada.", "error"); return; }
    if (!exigirSesion("Para subir fotos necesitas entrar con tu correo.")) return;
    prepararFormularioSubir();
    dlgSubir.showModal();
    iniciarMapaSubir();
  }
  $("btn-subir").addEventListener("click", abrirSubir);

  formSubir.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const yo = usuario();
    if (!yo) return;
    const btn = formSubir.querySelector("button[type=submit]");
    btn.disabled = true; btn.textContent = "Subiendo…";
    try {
      const blob = await prepararImagen(formSubir.archivo.files[0]);
      if (!blob) throw new Error("No pudimos leer la imagen. Prueba con otra foto.");
      const ruta = `${yo.id}/${crypto.randomUUID()}.jpg`;
      const subida = await sb.storage.from("fotos").upload(ruta, blob, { contentType: "image/jpeg" });
      if (subida.error) throw subida.error;

      const e = especieElegida();
      const d = decimalesUbicacion();
      const redondear = (x) => Math.round(x * 10 ** d) / 10 ** d;
      const { error } = await sb.from("fotos").insert({
        region: formSubir.region.value,
        especie_cientifico: e ? e.cientifico : null,
        especie_nombre: e ? e.nombre : formSubir.especie_otra.value.trim(),
        lugar: formSubir.lugar.value.trim(),
        lat: punto ? redondear(punto.lat) : null,
        lng: punto ? redondear(punto.lng) : null,
        fecha_foto: formSubir.fecha_foto.value || null,
        descripcion: formSubir.descripcion.value.trim() || null,
        ruta
      });
      if (error) { await sb.storage.from("fotos").remove([ruta]); throw error; }

      dlgSubir.close();
      avisar("¡Gracias! Tu foto quedó en revisión y se publicará cuando sea aprobada.");
      pintarMias();
    } catch (err) {
      avisar(mensajeError(err), "error");
    } finally {
      btn.disabled = false; btn.textContent = "Enviar a revisión";
    }
  });

  /* ---------- Arranque ---------- */
  function recargar() {
    actualizarURL();
    pintarPestanas();
    if (!COMUNIDAD_ACTIVA) return;
    if (estado.vista === "fotos") cargarFotos(true); else cargarDebates();
  }

  pintarChips();
  pintarFiltroEspecie();
  pintarPestanas();

  if (!COMUNIDAD_ACTIVA) {
    $("aviso-config").hidden = false;
    $("grid-fotos").innerHTML = `<div class="vacio"><b>Aquí aparecerán las fotos de la comunidad</b>cuando la base de datos esté conectada.</div>`;
    $("panel-debates").innerHTML = `<div class="vacio"><b>Aquí aparecerán los debates</b>cuando la base de datos esté conectada.</div>`;
    return;
  }

  sesionLista().then(() => {
    recargar();
    pintarMias();
    if (params.has("subir")) abrirSubir();
    if (estado.mias) $("panel-mias").scrollIntoView({ behavior: "smooth" });
  });
  // Al entrar o salir, refrescar lo que depende del usuario
  let primera = true;
  alCambiarSesion(() => {
    if (primera) { primera = false; return; }
    pintarMias();
    recargar();
  });
})();
