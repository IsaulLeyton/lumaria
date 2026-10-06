/* =========================================================
   Lumaria — Panel de moderación
   (La seguridad real está en la base de datos: aunque alguien
   abra esta página, sin rol "admin" no puede leer ni cambiar nada.)
   ========================================================= */

(function () {
  // El panel no funciona dentro de un marco de otro sitio (protección contra «clickjacking»)
  if (window.top !== window.self) {
    document.body.innerHTML = "";
    window.top.location = window.self.location.href;
    return;
  }
  const $ = (id) => document.getElementById(id);
  const nombreRegion = (id) => (regionPorId(id) || {}).nombre || id;
  let tab = "pendientes";

  function bloquear(html) {
    $("admin-contenido").hidden = true;
    $("admin-bloqueo").hidden = false;
    $("admin-bloqueo").innerHTML = html;
  }

  /* ---------- Pestañas ---------- */
  function pintarTabs() {
    document.querySelectorAll("[data-tab]").forEach((b) => b.setAttribute("aria-selected", b.dataset.tab === tab));
    ["pendientes", "especies", "reportes", "bloqueados"].forEach((t) => ($("tab-" + t).hidden = t !== tab));
  }
  document.querySelector(".pestanas").addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-tab]");
    if (!b) return;
    tab = b.dataset.tab;
    pintarTabs();
    cargarTab();
  });
  function cargarTab() {
    if (tab === "pendientes") cargarPendientes();
    if (tab === "especies") cargarEspecies();
    if (tab === "reportes") cargarReportes();
    if (tab === "bloqueados") cargarBloqueados();
  }

  async function contar() {
    const [p, r, e] = await Promise.all([
      sb.from("fotos").select("id", { count: "exact", head: true }).eq("estado", "pendiente"),
      sb.from("reportes").select("id", { count: "exact", head: true }).eq("resuelto", false),
      sb.from("especies_propuestas").select("id", { count: "exact", head: true }).eq("estado", "pendiente")
    ]);
    $("n-pendientes").textContent = p.count || "";
    $("n-reportes").textContent = r.count || "";
    $("n-especies").textContent = e.count || "";
  }

  /* ---------- Especies propuestas ---------- */
  const ESTADOS_CONSERVACION = ["No evaluado", "Preocupación menor", "Casi amenazada", "Vulnerable", "En peligro",
    "En peligro crítico", "Extinta en estado silvestre"];
  const ORIGENES = [["", "No se sabe"], ["nativa", "Nativa"], ["endemica", "Endémica"], ["exotica", "Exótica"]];
  // Propuestas antiguas solo tenían «endemica» (sí/no)
  const origenDe = (p) => p.origen || (p.endemica === true ? "endemica" : p.endemica === false ? "nativa" : "");
  const opciones = (lista, actual) => lista.map(([v, t]) =>
    `<option value="${_esc(v)}" ${String(actual ?? "") === v ? "selected" : ""}>${_esc(t)}</option>`).join("");
  const enlaceSeguro = (texto) => /^https?:\/\//i.test(texto)
    ? `<a href="${_esc(texto)}" target="_blank" rel="noopener nofollow">${_esc(texto)}</a>` : _esc(texto);

  async function cargarEspecies() {
    const cont = $("tab-especies");
    cont.innerHTML = `<p class="cargando-texto">Cargando…</p>`;
    const { data, error } = await sb.from("especies_propuestas")
      .select("*, perfiles(id, nombre)").eq("estado", "pendiente").order("creado", { ascending: true }).limit(50);
    if (error) { cont.innerHTML = `<p class="vacio">${_esc(mensajeError(error))}</p>`; return; }
    if (!data.length) { cont.innerHTML = `<div class="vacio"><b>¡Todo al día!</b>No hay especies esperando revisión.</div>`; return; }
    const urls = await urlsFotos(data.map((p) => p.ruta_foto), "especies");

    cont.innerHTML = `<div class="lista-moderacion">${data.map((p, i) => {
      const r = regionPorId(p.region);
      const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
      const repetida = r && especiesDe(r).find((e) => norm(e.cientifico) === norm(p.cientifico) || norm(e.nombre) === norm(p.nombre));
      return `
      <article class="mod-item mod-especie" data-id="${p.id}" data-ruta="${_esc(p.ruta_foto)}">
        <button type="button" class="mod-img" data-ampliar="${_esc(urls[i] || "")}" style="background-image:url('${_esc(urls[i] || "")}')" aria-label="Ampliar foto"></button>
        <div class="mod-info">
          <small>Para <b>${_esc(r ? r.nombre : p.region)}</b> · propuesta por <b>${_esc(p.perfiles ? p.perfiles.nombre : "—")}</b> ${haceTiempo(p.creado)}</small>
          ${repetida ? `<span class="estado-mod rechazada">Ojo: «${_esc(repetida.nombre)}» ya está en esta región</span>` : ""}
          <div class="edicion">
            <label>Tipo<select name="tipo">${opciones([["flora", "Flora"], ["fauna", "Fauna"], ["fungi", "Funga"]], p.tipo)}</select></label>
            <label>Grupo (hongos)<select name="grupo">${opciones([["", "—"], ["Hongo", "Hongo"], ["Liquen", "Liquen"]], p.grupo || "")}</select></label>
            <label>Nombre común<input name="nombre" maxlength="60" value="${_esc(p.nombre)}"></label>
            <label>Nombre científico<input name="cientifico" maxlength="80" value="${_esc(p.cientifico)}"></label>
            <label class="ancho">Descripción<textarea name="descripcion" rows="3" maxlength="300">${_esc(p.descripcion)}</textarea></label>
            <label>Conservación<select name="estado_conservacion">${opciones([["", "Sin dato"], ...ESTADOS_CONSERVACION.map((x) => [x, x])], p.estado_conservacion || "")}</select></label>
            <label>Origen<select name="origen">${opciones(ORIGENES, origenDe(p))}</select></label>
          </div>
          <small><b>Fuente:</b> ${p.fuente ? enlaceSeguro(p.fuente) : "<i>no indicó</i>"}</small>
          ${p.lugar_foto ? `<small><b>Foto tomada en:</b> ${_esc(p.lugar_foto)}</small>` : ""}
        </div>
        <div class="mod-acciones">
          <button type="button" class="boton chico" data-aprobar-especie>Aprobar</button>
          <button type="button" class="boton chico claro" data-rechazar-especie>Rechazar</button>
          <button type="button" class="enlace-peligro" data-bloquear="${p.usuario_id}">Bloquear usuario</button>
        </div>
      </article>`;
    }).join("")}</div>`;
  }

  $("tab-especies").addEventListener("click", async (ev) => {
    const amp = ev.target.closest("[data-ampliar]");
    if (amp) { const d = $("dlg-ampliar"); d.querySelector("img").src = amp.dataset.ampliar; d.showModal(); return; }
    const item = ev.target.closest(".mod-item");
    if (!item) return;
    const id = Number(item.dataset.id);

    if (ev.target.closest("[data-aprobar-especie]")) {
      // Se envían los textos tal como quedaron, por si la moderación corrigió algo
      const campo = (n) => item.querySelector(`[name="${n}"]`).value.trim();
      const cambios = {
        tipo: campo("tipo"), grupo: campo("tipo") === "fungi" ? campo("grupo") : "",
        nombre: campo("nombre"), cientifico: campo("cientifico"), descripcion: campo("descripcion"),
        estado_conservacion: campo("estado_conservacion"),
        origen: campo("origen")
      };
      if (cambios.nombre.length < 2 || cambios.cientifico.length < 3 || cambios.descripcion.length < 20) {
        avisar("Revisa los textos: nombre, nombre científico y descripción (mínimo 20 letras) son obligatorios.", "error");
        return;
      }
      const { error } = await sb.rpc("moderar_especie", { p_id: id, p_estado: "aprobada", p_cambios: cambios });
      if (error) { avisar(mensajeError(error), "error"); return; }
      avisar("Especie aprobada: ya aparece en su región.");
      item.remove(); contar();
    }
    if (ev.target.closest("[data-rechazar-especie]")) {
      const motivo = await pedirTexto({
        titulo: "Rechazar especie",
        ayuda: "La persona verá este motivo. La foto se borrará del almacenamiento.",
        etiqueta: "Motivo", valor: "No pudimos confirmar que la información sea correcta.",
        largo: true, max: 300, boton: "Rechazar"
      });
      if (motivo === null) return;
      const { error } = await sb.rpc("moderar_especie", { p_id: id, p_estado: "rechazada", p_motivo: motivo });
      if (error) { avisar(mensajeError(error), "error"); return; }
      await sb.storage.from("especies").remove([item.dataset.ruta]);
      avisar("Especie rechazada.");
      item.remove(); contar();
    }
    const bloq = ev.target.closest("[data-bloquear]");
    if (bloq) await bloquearUsuario(bloq.dataset.bloquear);
  });

  /* ---------- Fotos por revisar ---------- */
  async function cargarPendientes() {
    const cont = $("tab-pendientes");
    cont.innerHTML = `<p class="cargando-texto">Cargando…</p>`;
    const { data, error } = await sb.from("fotos")
      .select("*, perfiles(id, nombre)")
      .eq("estado", "pendiente").order("creado", { ascending: true }).limit(50);
    if (error) { cont.innerHTML = `<p class="vacio">${_esc(mensajeError(error))}</p>`; return; }
    if (!data.length) { cont.innerHTML = `<div class="vacio"><b>¡Todo al día!</b>No hay fotos esperando revisión.</div>`; return; }
    const urls = await urlsFotos(data.map((f) => f.ruta));
    cont.innerHTML = `<div class="lista-moderacion">${data.map((f, i) => `
      <article class="mod-item" data-id="${f.id}">
        <button type="button" class="mod-img" data-ampliar="${_esc(urls[i] || "")}" style="background-image:url('${_esc(urls[i] || "")}')" aria-label="Ampliar foto"></button>
        <div class="mod-info">
          ${TIPOS[f.tipo] ? `<span class="estado-mod">${TIPOS[f.tipo].etiqueta}</span>` : ""}
          <b>${_esc(f.especie_nombre)}</b> ${f.especie_cientifico ? `<i>${_esc(f.especie_cientifico)}</i>` : `<span class="estado-mod pendiente">Especie escrita por el usuario</span>`}
          <small>${_esc(nombreRegion(f.region))} · ${_esc(f.lugar)}${f.fecha_foto ? " · " + fechaCorta(f.fecha_foto) : ""}</small>
          <small>Subida por <b>${_esc(f.perfiles ? f.perfiles.nombre : "—")}</b> ${haceTiempo(f.creado)}</small>
          ${f.descripcion ? `<p class="texto-usuario">${_esc(f.descripcion)}</p>` : ""}
        </div>
        <div class="mod-acciones">
          <button type="button" class="boton chico" data-aprobar>Aprobar</button>
          <button type="button" class="boton chico claro" data-rechazar data-ruta="${_esc(f.ruta)}">Rechazar</button>
          <button type="button" class="enlace-peligro" data-bloquear="${f.usuario_id}">Bloquear usuario</button>
        </div>
      </article>`).join("")}</div>`;
  }

  $("tab-pendientes").addEventListener("click", async (ev) => {
    const item = ev.target.closest(".mod-item");
    const amp = ev.target.closest("[data-ampliar]");
    if (amp) { const d = $("dlg-ampliar"); d.querySelector("img").src = amp.dataset.ampliar; d.showModal(); return; }
    if (!item) return;
    const id = Number(item.dataset.id);

    if (ev.target.closest("[data-aprobar]")) {
      const { error } = await sb.rpc("moderar_foto", { p_id: id, p_estado: "aprobada" });
      if (error) { avisar(mensajeError(error), "error"); return; }
      avisar("Foto aprobada y publicada.");
      item.remove(); contar();
    }
    const rech = ev.target.closest("[data-rechazar]");
    if (rech) {
      const motivo = await pedirTexto({
        titulo: "Rechazar foto",
        ayuda: "El autor verá este motivo. La foto se borrará del almacenamiento.",
        etiqueta: "Motivo", valor: "La foto no corresponde a una especie nativa o no se ve con claridad.",
        largo: true, max: 300, boton: "Rechazar"
      });
      if (motivo === null) return;
      const { error } = await sb.rpc("moderar_foto", { p_id: id, p_estado: "rechazada", p_motivo: motivo });
      if (error) { avisar(mensajeError(error), "error"); return; }
      await sb.storage.from("fotos").remove([rech.dataset.ruta]);
      avisar("Foto rechazada.");
      item.remove(); contar();
    }
    const bloq = ev.target.closest("[data-bloquear]");
    if (bloq) await bloquearUsuario(bloq.dataset.bloquear);
  });

  async function bloquearUsuario(uid) {
    if (!(await confirmar("¿Bloquear a este usuario?", "No podrá subir fotos, crear debates ni comentar. Puedes desbloquearlo después.", "Bloquear"))) return;
    const { error } = await sb.rpc("bloquear_usuario", { p_id: uid, p_bloqueado: true });
    if (error) { avisar(mensajeError(error), "error"); return; }
    avisar("Usuario bloqueado.");
  }

  /* ---------- Reportes ---------- */
  async function cargarReportes() {
    const cont = $("tab-reportes");
    cont.innerHTML = `<p class="cargando-texto">Cargando…</p>`;
    const { data, error } = await sb.from("reportes")
      .select("*, perfiles(nombre)").eq("resuelto", false).order("creado", { ascending: true }).limit(100);
    if (error) { cont.innerHTML = `<p class="vacio">${_esc(mensajeError(error))}</p>`; return; }
    if (!data.length) { cont.innerHTML = `<div class="vacio"><b>Sin reportes pendientes</b>La comunidad está tranquila.</div>`; return; }

    // Agrupar reportes por contenido
    const grupos = new Map();
    for (const r of data) {
      const k = r.tipo + ":" + r.objeto_id;
      if (!grupos.has(k)) grupos.set(k, { tipo: r.tipo, id: r.objeto_id, reportes: [] });
      grupos.get(k).reportes.push(r);
    }
    // Traer el contenido reportado
    const ids = (t) => [...grupos.values()].filter((g) => g.tipo === t).map((g) => g.id);
    const tablas = { foto: "fotos", hilo: "hilos", comentario: "comentarios" };
    const contenido = {};
    await Promise.all(Object.entries(tablas).map(async ([t, tabla]) => {
      if (!ids(t).length) return;
      const { data } = await sb.from(tabla).select("*, perfiles(nombre)").in("id", ids(t));
      (data || []).forEach((o) => (contenido[t + ":" + o.id] = o));
    }));
    const rutas = [...grupos.values()].filter((g) => g.tipo === "foto" && contenido["foto:" + g.id]).map((g) => contenido["foto:" + g.id].ruta);
    const urls = rutas.length ? await urlsFotos(rutas) : [];
    const urlDe = Object.fromEntries(rutas.map((r, i) => [r, urls[i]]));

    const etiquetas = { foto: "Foto", hilo: "Debate", comentario: "Comentario" };
    cont.innerHTML = `<div class="lista-moderacion">${[...grupos.values()].map((g) => {
      const o = contenido[g.tipo + ":" + g.id];
      let vista = `<p class="ayuda">Este contenido ya fue eliminado.</p>`;
      if (o && g.tipo === "foto") vista = `
        <button type="button" class="mod-img" data-ampliar="${_esc(urlDe[o.ruta] || "")}" style="background-image:url('${_esc(urlDe[o.ruta] || "")}')"></button>
        <div class="mod-info"><b>${_esc(o.especie_nombre)}</b><small>${_esc(nombreRegion(o.region))} · ${_esc(o.lugar)}</small></div>`;
      if (o && g.tipo === "hilo") vista = `<div class="mod-info"><b>${_esc(o.titulo)}</b><p class="texto-usuario">${_esc(o.cuerpo)}</p></div>`;
      if (o && g.tipo === "comentario") vista = `<div class="mod-info"><p class="texto-usuario">${_esc(o.cuerpo)}</p></div>`;
      return `
        <article class="mod-item reporte" data-tipo="${g.tipo}" data-id="${g.id}" ${o ? `data-autor="${o.usuario_id}"` : ""} ${o && o.ruta ? `data-ruta="${_esc(o.ruta)}"` : ""}>
          <div class="mod-cab">
            <span class="estado-mod rechazada">${etiquetas[g.tipo]} · ${g.reportes.length} reporte${g.reportes.length > 1 ? "s" : ""}</span>
            ${o ? `<small>Autor: <b>${_esc(o.perfiles ? o.perfiles.nombre : "—")}</b>${o.oculto ? " · ya oculto automáticamente" : ""}</small>` : ""}
          </div>
          ${vista}
          <ul class="motivos">${g.reportes.map((r) => `<li><b>${_esc(r.perfiles ? r.perfiles.nombre : "—")}:</b> ${_esc(r.motivo || "(sin motivo)")}</li>`).join("")}</ul>
          <div class="mod-acciones">
            ${o ? `<button type="button" class="boton chico peligro" data-quitar>${g.tipo === "foto" ? "Rechazar foto" : "Ocultar"}</button>` : ""}
            ${o && o.oculto ? `<button type="button" class="boton chico claro" data-restaurar>Restaurar</button>` : ""}
            <button type="button" class="boton chico claro" data-descartar>Descartar reporte</button>
            ${o ? `<button type="button" class="enlace-peligro" data-bloquear-autor>Bloquear autor</button>` : ""}
          </div>
        </article>`;
    }).join("")}</div>`;
  }

  $("tab-reportes").addEventListener("click", async (ev) => {
    const amp = ev.target.closest("[data-ampliar]");
    if (amp) { const d = $("dlg-ampliar"); d.querySelector("img").src = amp.dataset.ampliar; d.showModal(); return; }
    const item = ev.target.closest(".mod-item");
    if (!item) return;
    const tipo = item.dataset.tipo, id = Number(item.dataset.id);
    let error = null, hecho = false;

    if (ev.target.closest("[data-quitar]")) {
      if (tipo === "foto") {
        ({ error } = await sb.rpc("moderar_foto", { p_id: id, p_estado: "rechazada", p_motivo: "Retirada tras reportes de la comunidad." }));
        if (!error && item.dataset.ruta) await sb.storage.from("fotos").remove([item.dataset.ruta]);
      } else {
        ({ error } = await sb.rpc("ocultar_contenido", { p_tipo: tipo, p_id: id, p_oculto: true }));
      }
      hecho = true;
    }
    if (ev.target.closest("[data-restaurar]")) {
      ({ error } = await sb.rpc("ocultar_contenido", { p_tipo: tipo, p_id: id, p_oculto: false }));
      hecho = true;
    }
    if (ev.target.closest("[data-descartar]")) {
      ({ error } = await sb.from("reportes").update({ resuelto: true }).eq("tipo", tipo).eq("objeto_id", id));
      hecho = true;
    }
    if (ev.target.closest("[data-bloquear-autor]")) { await bloquearUsuario(item.dataset.autor); return; }
    if (!hecho) return;
    if (error) { avisar(mensajeError(error), "error"); return; }
    avisar("Listo.");
    item.remove(); contar();
  });

  /* ---------- Usuarios bloqueados ---------- */
  async function cargarBloqueados() {
    const cont = $("tab-bloqueados");
    // usuarios_bloqueados() es solo para el admin; si aún no existe, se usa la consulta antigua
    let { data, error } = await sb.rpc("usuarios_bloqueados");
    if (error && /function|could not find/i.test(error.message))
      ({ data, error } = await sb.from("perfiles").select("id, nombre, creado").eq("bloqueado", true).order("nombre"));
    if (error) { cont.innerHTML = `<p class="vacio">${_esc(mensajeError(error))}</p>`; return; }
    if (!data.length) { cont.innerHTML = `<div class="vacio"><b>Nadie bloqueado</b>Ojalá siga así.</div>`; return; }
    cont.innerHTML = `<div class="lista-moderacion">${data.map((p) => `
      <article class="mod-item fila" data-uid="${p.id}">
        <span class="avatar">${_esc(p.nombre.charAt(0).toUpperCase())}</span>
        <div class="mod-info"><b>${_esc(p.nombre)}</b><small>Registrado ${haceTiempo(p.creado)}</small></div>
        <div class="mod-acciones"><button type="button" class="boton chico claro" data-desbloquear>Desbloquear</button></div>
      </article>`).join("")}</div>`;
  }
  $("tab-bloqueados").addEventListener("click", async (ev) => {
    const item = ev.target.closest(".mod-item");
    if (!item || !ev.target.closest("[data-desbloquear]")) return;
    const { error } = await sb.rpc("bloquear_usuario", { p_id: item.dataset.uid, p_bloqueado: false });
    if (error) { avisar(mensajeError(error), "error"); return; }
    avisar("Usuario desbloqueado.");
    item.remove();
  });

  /* ---------- Arranque ---------- */
  function iniciar() {
    if (!COMUNIDAD_ACTIVA) {
      bloquear(`<b>La comunidad no está conectada</b>Sigue los pasos de <code>supabase/GUIA.md</code>.`);
      return;
    }
    const yo = usuario();
    if (!yo) {
      bloquear(`<b>Entra con tu correo de administración</b><button class="boton" type="button" id="btn-entrar-admin">Entrar</button>`);
      $("btn-entrar-admin").addEventListener("click", () => abrirEntrar());
      return;
    }
    if (!esAdmin()) {
      bloquear(`<b>No tienes acceso</b>Esta página es solo para la moderación de Lumaria.`);
      return;
    }
    $("admin-bloqueo").hidden = true;
    $("admin-contenido").hidden = false;
    pintarTabs();
    contar();
    cargarTab();
  }

  if (!COMUNIDAD_ACTIVA) { iniciar(); return; }
  sesionLista().then(iniciar);
  let primera = true;
  alCambiarSesion(() => { if (primera) { primera = false; return; } iniciar(); });
})();
