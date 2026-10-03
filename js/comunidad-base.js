/* =========================================================
   Lumaria — Base de la comunidad (Supabase)
   Conexión, sesión, cuenta en la barra superior y utilidades.
   Requiere: config.js, supabase-js (CDN) y comun.js
   ========================================================= */

const sb = (window.supabase && LUMARIA_CONFIG.supabaseUrl && LUMARIA_CONFIG.supabaseAnonKey)
  ? window.supabase.createClient(LUMARIA_CONFIG.supabaseUrl, LUMARIA_CONFIG.supabaseAnonKey)
  : null;
const COMUNIDAD_ACTIVA = !!sb;

/* ---------- Sesión ---------- */
let _perfil = null;
const usuario = () => _perfil;
const esAdmin = () => !!(_perfil && _perfil.rol === "admin");

async function cargarSesion() {
  if (!sb) return null;
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { _perfil = null; return null; }
  const { data } = await sb.from("perfiles").select("*").eq("id", session.user.id).maybeSingle();
  _perfil = data ? { ...data, email: session.user.email } : null;
  return _perfil;
}

/** Ejecuta fn cada vez que cambia la sesión (y una vez al inicio). */
function alCambiarSesion(fn) {
  document.addEventListener("lumaria:sesion", () => fn(_perfil));
}

let _sesionLista = null;
function sesionLista() {
  if (!_sesionLista) _sesionLista = cargarSesion().then(() => {
    pintarCuenta();
    document.dispatchEvent(new Event("lumaria:sesion"));
    return _perfil;
  });
  return _sesionLista;
}

if (sb) {
  sb.auth.onAuthStateChange((evento) => {
    if (evento !== "SIGNED_IN" && evento !== "SIGNED_OUT") return;
    // fuera del callback para no bloquear al cliente de Supabase
    // Supabase repite "SIGNED_IN" al cargar la página o al volver a la pestaña:
    // solo avisamos si de verdad cambió quién está conectado.
    setTimeout(async () => {
      const antes = _perfil ? _perfil.id : null;
      await cargarSesion();
      if ((_perfil ? _perfil.id : null) === antes) return;
      pintarCuenta();
      document.dispatchEvent(new Event("lumaria:sesion"));
    }, 0);
  });
}

/* ---------- Avisos breves ---------- */
function avisar(texto, tipo = "ok") {
  let caja = document.getElementById("avisos");
  if (!caja) {
    caja = document.createElement("div");
    caja.id = "avisos";
    caja.className = "avisos";
    caja.setAttribute("aria-live", "polite");
    document.body.appendChild(caja);
  }
  const n = document.createElement("div");
  n.className = `aviso aviso-${tipo}`;
  n.textContent = texto;
  caja.appendChild(n);
  setTimeout(() => n.classList.add("saliendo"), 4200);
  setTimeout(() => n.remove(), 4700);
}

/** Convierte errores de Supabase en mensajes comprensibles. */
function mensajeError(e) {
  const m = (e && (e.message || e.error_description || e.error)) || String(e);
  if (/row-level security|permission denied|violates row-level/i.test(m))
    return "No tienes permiso para hacer esto. ¿Tu cuenta está bloqueada o se cerró la sesión?";
  if (/rate limit|too many/i.test(m)) return "Demasiados intentos. Espera unos minutos y vuelve a probar.";
  if (/check constraint/i.test(m)) return "Algún campo es demasiado corto o demasiado largo.";
  if (/Failed to fetch|NetworkError/i.test(m)) return "No hay conexión con el servidor.";
  return m;
}

/* ---------- Tiempo relativo ---------- */
const _rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
function haceTiempo(fecha) {
  const s = (new Date(fecha) - Date.now()) / 1000;
  const pasos = [[60, "second"], [3600, "minute"], [86400, "hour"], [2592000, "day"], [31536000, "month"], [Infinity, "year"]];
  const div = { second: 1, minute: 60, hour: 3600, day: 86400, month: 2592000, year: 31536000 };
  for (const [lim, u] of pasos) if (Math.abs(s) < lim) return _rtf.format(Math.round(s / div[u]), u);
}
const fechaCorta = (f) => new Date(f + (String(f).length === 10 ? "T12:00:00" : "")).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });

/* ---------- URLs de fotos (bucket privado → enlaces firmados) ---------- */
const _urls = new Map();
/** Enlaces temporales a fotos privadas. `bucket`: "fotos" (comunidad) o "especies" (especies propuestas). */
async function urlsFotos(rutas, bucket = "fotos") {
  const clave = (r) => bucket + ":" + r;
  const faltan = [...new Set(rutas)].filter((r) => r && !_urls.has(clave(r)));
  if (faltan.length) {
    const { data, error } = await sb.storage.from(bucket).createSignedUrls(faltan, 60 * 60 * 6);
    if (!error) data.forEach((d) => { if (d.signedUrl) _urls.set(clave(d.path), d.signedUrl); });
  }
  return rutas.map((r) => _urls.get(clave(r)) || null);
}

/* ---------- Especies aportadas por la comunidad ---------- */
const CAMPOS_PROPUESTA = "id, region, tipo, grupo, nombre, cientifico, descripcion, estado_conservacion, endemica, ruta_foto, perfiles(nombre)";

/** Convierte una especie propuesta (fila de Supabase) al mismo formato que las especies de data.js. */
function especieDePropuesta(p) {
  return {
    nombre: p.nombre,
    cientifico: p.cientifico,
    desc: p.descripcion,
    estado: p.estado_conservacion || null,
    endemica: !!p.endemica,
    tipo: p.tipo,
    grupo: p.grupo || undefined,
    comunidad: { id: p.id, autor: p.perfiles ? p.perfiles.nombre : "la comunidad", ruta: p.ruta_foto }
  };
}

/** Reduce una foto a 1600 px y la convierte a JPG (esto además borra los datos GPS ocultos del archivo). */
async function prepararImagen(file) {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * k);
  canvas.height = Math.round(bmp.height * k);
  canvas.getContext("2d").drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.85));
}

/* ---------- Diálogos reutilizables ---------- */
function _dialogo(id, html) {
  let d = document.getElementById(id);
  if (!d) {
    d = document.createElement("dialog");
    d.id = id;
    d.className = "modal dialogo";
    document.body.appendChild(d);
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
  }
  d.innerHTML = `<button class="modal-cerrar" type="button" aria-label="Cerrar">×</button>${html}`;
  d.querySelector(".modal-cerrar").onclick = () => d.close();
  return d;
}

/** Pide un texto al usuario. Devuelve el texto o null si cancela. */
function pedirTexto({ titulo, ayuda = "", etiqueta = "", valor = "", largo = false, max = 300, boton = "Aceptar", requerido = true }) {
  return new Promise((resolve) => {
    const campo = largo
      ? `<textarea name="t" rows="4" maxlength="${max}" ${requerido ? "required" : ""}>${_esc(valor)}</textarea>`
      : `<input name="t" maxlength="${max}" value="${_esc(valor)}" ${requerido ? "required" : ""}>`;
    const d = _dialogo("dlg-texto", `
      <form class="formulario" method="dialog">
        <h2>${_esc(titulo)}</h2>
        ${ayuda ? `<p class="ayuda">${_esc(ayuda)}</p>` : ""}
        <label>${_esc(etiqueta)}${campo}</label>
        <div class="acciones">
          <button class="boton claro" type="button" data-cancelar>Cancelar</button>
          <button class="boton" type="submit">${_esc(boton)}</button>
        </div>
      </form>`);
    let resultado = null;
    d.querySelector("[data-cancelar]").onclick = () => d.close();
    d.querySelector("form").onsubmit = () => { resultado = d.querySelector("[name=t]").value.trim(); };
    d.addEventListener("close", () => resolve(resultado), { once: true });
    d.showModal();
    d.querySelector("[name=t]").focus();
  });
}

function confirmar(titulo, texto, boton = "Sí, continuar") {
  return new Promise((resolve) => {
    const d = _dialogo("dlg-confirmar", `
      <form class="formulario" method="dialog">
        <h2>${_esc(titulo)}</h2>
        <p class="ayuda">${_esc(texto)}</p>
        <div class="acciones">
          <button class="boton claro" value="no">Cancelar</button>
          <button class="boton peligro" value="si">${_esc(boton)}</button>
        </div>
      </form>`);
    d.addEventListener("close", () => resolve(d.returnValue === "si"), { once: true });
    d.returnValue = "";
    d.showModal();
  });
}

/* ---------- Entrar con enlace mágico ---------- */
function abrirEntrar(motivo = "") {
  if (!sb) { avisar("La comunidad aún no está conectada.", "error"); return; }
  const d = _dialogo("dlg-entrar", `
    <form class="formulario" id="form-entrar">
      <h2>Entrar a la comunidad</h2>
      <p class="ayuda">${_esc(motivo || "Escribe tu correo y te enviaremos un enlace para entrar. No necesitas contraseña.")}</p>
      <label>Correo electrónico<input type="email" name="email" required autocomplete="email" placeholder="tucorreo@ejemplo.cl"></label>
      <p class="ayuda">Al entrar aceptas las <a href="privacidad.html#normas" target="_blank">normas de la comunidad</a>
        y la <a href="privacidad.html" target="_blank">política de privacidad</a>. Tu correo nunca se muestra a otras personas.</p>
      <div class="acciones"><button class="boton" type="submit">Enviarme el enlace</button></div>
    </form>`);
  d.querySelector("form").onsubmit = async (ev) => {
    ev.preventDefault();
    const btn = d.querySelector("button[type=submit]");
    btn.disabled = true; btn.textContent = "Enviando…";
    const email = d.querySelector("[name=email]").value.trim();
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: location.origin + location.pathname + location.search }
    });
    if (error) {
      btn.disabled = false; btn.textContent = "Enviarme el enlace";
      avisar(mensajeError(error), "error");
      return;
    }
    d.querySelector("form").innerHTML = `
      <h2>Revisa tu correo</h2>
      <p class="ayuda">Te enviamos un enlace a <b>${_esc(email)}</b>. Ábrelo en este mismo navegador para entrar.
      Si no llega en unos minutos, revisa la carpeta de spam.</p>
      <div class="acciones"><button class="boton" type="button" onclick="this.closest('dialog').close()">Entendido</button></div>`;
  };
  d.showModal();
}

/** Devuelve true si hay sesión; si no, abre el diálogo para entrar. */
function exigirSesion(motivo) {
  if (_perfil) {
    if (_perfil.bloqueado) { avisar("Tu cuenta está bloqueada por la moderación.", "error"); return false; }
    return true;
  }
  abrirEntrar(motivo);
  return false;
}

async function cambiarNombre() {
  const nombre = await pedirTexto({
    titulo: "Tu nombre en la comunidad",
    ayuda: "Así aparecerás como autor de tus fotos y mensajes. Puede ser un apodo.",
    etiqueta: "Nombre", valor: _perfil.nombre, max: 40, boton: "Guardar"
  });
  if (!nombre || nombre === _perfil.nombre) return;
  if (nombre.length < 2) { avisar("El nombre debe tener al menos 2 letras.", "error"); return; }
  const { error } = await sb.from("perfiles").update({ nombre }).eq("id", _perfil.id);
  if (error) { avisar(mensajeError(error), "error"); return; }
  _perfil.nombre = nombre;
  pintarCuenta();
  document.dispatchEvent(new Event("lumaria:sesion"));
  avisar("Nombre actualizado.");
}

/* ---------- Cuenta en la barra superior ---------- */
function pintarCuenta() {
  const cont = document.getElementById("cuenta");
  if (!cont || !sb) return;
  if (!_perfil) {
    cont.innerHTML = `<button class="boton chico" type="button" id="btn-entrar">Entrar</button>`;
    cont.querySelector("#btn-entrar").onclick = () => abrirEntrar();
    return;
  }
  const inicial = _perfil.nombre.trim().charAt(0).toUpperCase();
  cont.innerHTML = `
    <details class="menu-cuenta">
      <summary aria-label="Mi cuenta"><span class="avatar">${_esc(inicial)}</span><span class="nombre-cuenta">${_esc(_perfil.nombre)}</span></summary>
      <div class="menu-cuenta-lista">
        <small>${_esc(_perfil.email || "")}</small>
        <button type="button" data-accion="nombre">Cambiar mi nombre</button>
        <a href="comunidad.html?mias=1">Mis fotos</a>
        ${esAdmin() ? `<a href="admin.html">Panel de moderación</a>` : ""}
        <button type="button" data-accion="salir">Salir</button>
      </div>
    </details>`;
  cont.querySelector('[data-accion="nombre"]').onclick = cambiarNombre;
  cont.querySelector('[data-accion="salir"]').onclick = async () => { await sb.auth.signOut(); avisar("Sesión cerrada."); };
}

/* ---------- Reportar contenido ---------- */
async function reportar(tipo, id) {
  if (!exigirSesion("Para reportar contenido necesitas entrar con tu correo.")) return;
  const motivo = await pedirTexto({
    titulo: "Reportar contenido",
    ayuda: "Cuéntanos qué tiene de malo (ofensivo, spam, foto que no corresponde, etc.). La moderación lo revisará.",
    etiqueta: "Motivo", largo: true, max: 300, boton: "Enviar reporte"
  });
  if (motivo === null) return;
  const { error } = await sb.from("reportes").insert({ tipo, objeto_id: id, motivo });
  if (error && /duplicate|unique/i.test(error.message)) { avisar("Ya habías reportado esto. Gracias."); return; }
  if (error) { avisar(mensajeError(error), "error"); return; }
  avisar("Gracias. La moderación revisará el reporte.");
}

document.addEventListener("DOMContentLoaded", () => { if (sb) sesionLista(); });
