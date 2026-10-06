/* =========================================================
   Lumaria — Conexión con Supabase
   Copia aquí los datos de tu proyecto:
   Supabase → Project Settings → API (o "Data API").
   La "anon public key" está hecha para ir en la página: es pública.
   NUNCA pegues aquí la "service_role key" (esa es secreta).
   ========================================================= */
const LUMARIA_CONFIG = {
  supabaseUrl: "https://oexvgktopvhaibgwvukw.supabase.co",
  supabaseAnonKey: "sb_publishable_lDE5mvpTcz-sf4ToBgPK2g_aKjUd5Rn",  // clave publicable (pública)
  // Cloudflare Turnstile (verificación anti-robots al entrar). La «Site Key» es pública.
  // La «Secret Key» NUNCA va aquí: se pega en Supabase → Authentication → Attack Protection.
  turnstileSiteKey: ""
};
