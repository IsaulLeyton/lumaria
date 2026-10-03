# Cómo activar la comunidad de Lumaria

La comunidad (fotos, debates y moderación) guarda los datos en **Supabase**, un servicio gratuito.
Esto se hace **una sola vez** y toma unos 15 minutos.

---

## 1. Crear el proyecto

1. Entra a <https://supabase.com> y crea una cuenta (puedes usar tu cuenta de GitHub o tu correo).
2. Presiona **New project**:
   - **Name:** `lumaria`
   - **Database password:** inventa una contraseña segura y **guárdala** (no la vas a necesitar en la página).
   - **Region:** *South America (São Paulo)*, que es la más cercana a Chile.
3. Espera 1–2 minutos a que el proyecto termine de crearse.

## 2. Crear las tablas y las reglas de seguridad

1. En el menú izquierdo entra a **SQL Editor** → **New query**.
2. Abre el archivo `supabase/esquema.sql`, copia **todo** su contenido y pégalo.
3. Presiona **Run**. Debe aparecer *"Success. No rows returned"*.

Esto crea las tablas, el almacenamiento privado de fotos, los límites anti‑spam y las reglas que impiden
que alguien vea fotos no aprobadas o se salte la moderación.

## 3. Indicar dónde vive la página

En **Authentication → URL Configuration**:

- **Site URL:** `http://localhost:8765` (mientras pruebas en tu computador).
- **Redirect URLs** → *Add URL*: `http://localhost:8765/**`

Cuando publiques la página (por ejemplo en GitHub Pages), agrega también su dirección,
por ejemplo `https://tuusuario.github.io/lumaria/**`, y cambia la *Site URL* a esa dirección.

> El enlace mágico **no funciona** si abres la página con doble clic (`file://`).
> Ábrela siempre con el servidor local: `python -m http.server 8765` dentro de la carpeta `Nativa`.

## 4. (Recomendado) Correo de acceso en español

En **Authentication → Emails → Magic Link**, cambia el asunto y el mensaje:

- **Subject:** `Tu enlace para entrar a Lumaria`
- **Message body:**

```html
<h2>Hola 🌿</h2>
<p>Presiona el enlace para entrar a la comunidad de Lumaria:</p>
<p><a href="{{ .ConfirmationURL }}">Entrar a Lumaria</a></p>
<p>Si no pediste este correo, puedes ignorarlo.</p>
```

Haz lo mismo en la plantilla **Confirm signup**, que es la que reciben las personas la primera vez.

## 5. Conectar la página

En **Project Settings → API** (o **Data API**) copia:

- **Project URL** (algo como `https://abcdefgh.supabase.co`)
- **anon public** key (un texto largo que empieza con `eyJ…`, o una *publishable key* que empieza con `sb_publishable_…`)

Pégalos en `js/config.js`, o pásamelos y lo hago yo.
La clave *anon/publishable* está hecha para ir en la página: es pública y está protegida por las reglas del paso 2.

> ⚠️ **Nunca** pegues la clave **service_role** (o *secret*): esa da acceso total a la base de datos.

## 6. Convertirte en administrador

1. Abre `http://localhost:8765/comunidad.html`, presiona **Entrar** y escribe tu correo.
2. Abre el enlace que te llega al correo. Ya estás dentro.
3. Vuelve a Supabase → **SQL Editor** y ejecuta (cambiando el correo por el tuyo):

```sql
update public.perfiles
set rol = 'admin'
where id = (select id from auth.users where email = 'TU_CORREO@ejemplo.com');
```

4. Recarga la página: en tu menú de cuenta aparecerá **Panel de moderación** (`admin.html`).

Ahí verás las fotos por aprobar, los reportes y los usuarios bloqueados.

---

## Cosas importantes que debes saber

- **Límite de correos.** El correo que trae Supabase de fábrica solo envía unos pocos mensajes por hora
  y es para pruebas. Antes de abrir la comunidad al público, configura un servicio de correo propio en
  **Authentication → Emails → SMTP Settings**. [Resend](https://resend.com) es gratuito hasta 3.000 correos al mes.
- **Pausa por inactividad.** En el plan gratuito, si el proyecto pasa 7 días sin visitas se pausa.
  Se reactiva con un clic desde el panel de Supabase, y no se pierde nada.
- **Espacio.** El plan gratuito incluye 1 GB para fotos. La página reduce cada foto a 1600 px
  (unos 300 KB), así que caben alrededor de 3.000 fotos.
- **Privacidad.** Al subir una foto se borran sus datos ocultos (incluida la ubicación GPS del celular),
  y el punto del mapa se guarda aproximado: a ~1 km, o a ~10 km si la especie está amenazada,
  para no ayudar a cazadores ni a recolectores ilegales.
- **Bloquear y ocultar.** Con 3 reportes de personas distintas, un mensaje se oculta solo y una foto
  vuelve a revisión hasta que tú decidas.
