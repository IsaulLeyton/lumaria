"""
Lumaria — Generador de páginas para buscadores (SEO)

Lee js/data.js y crea:
  • regiones/<region>.html  (una página real por región, con su texto ya escrito)
  • sitemap.xml y robots.txt
  • los datos para Google y redes sociales en index.html, comunidad.html y creditos.html

Uso (desde la carpeta Nativa):
    python herramientas/generar.py

Vuelve a ejecutarlo cada vez que cambies algo en js/data.js.
"""

import datetime
import html
import json
import re
from pathlib import Path

# Dirección pública del sitio (sin "/" al final). Cámbiala al publicar.
SITIO = "https://lumaria.cl"

RAIZ = Path(__file__).resolve().parent.parent
HOY = datetime.date.today().isoformat()
IMAGEN = f"{SITIO}/imagenes/compartir.png"

NOMBRE_OFICIAL = {
    "arica": "Región de Arica y Parinacota",
    "tarapaca": "Región de Tarapacá",
    "antofagasta": "Región de Antofagasta",
    "atacama": "Región de Atacama",
    "coquimbo": "Región de Coquimbo",
    "valparaiso": "Región de Valparaíso",
    "metropolitana": "Región Metropolitana de Santiago",
    "ohiggins": "Región de O'Higgins",
    "maule": "Región del Maule",
    "nuble": "Región de Ñuble",
    "biobio": "Región del Biobío",
    "araucania": "Región de La Araucanía",
    "losrios": "Región de Los Ríos",
    "loslagos": "Región de Los Lagos",
    "aysen": "Región de Aysén",
    "magallanes": "Región de Magallanes",
}
TIPOS = {"flora": "Flora", "fauna": "Fauna", "fungi": "Fungi"}
AMENAZADAS = {"Vulnerable", "En peligro", "En peligro crítico", "Extinta en estado silvestre"}
CLASE_ESTADO = {
    "Preocupación menor": "lc", "Casi amenazada": "nt", "Vulnerable": "vu",
    "En peligro": "en", "En peligro crítico": "cr", "Extinta en estado silvestre": "ew",
}

e = lambda s: html.escape(str(s), quote=True)


# ---------------------------------------------------------------
#  Lectura de js/data.js (objetos de JavaScript → Python)
# ---------------------------------------------------------------
def extraer_literal(texto, nombre):
    """Devuelve el texto del arreglo u objeto asignado a `const nombre = ...`."""
    m = re.search(r"const\s+" + nombre + r"\s*=\s*", texto)
    if not m:
        raise SystemExit(f"No encontré «const {nombre}» en js/data.js")
    i = m.end()
    profundidad, cadena, k = 0, None, i
    while k < len(texto):
        c = texto[k]
        if cadena:
            if c == "\\":
                k += 2
                continue
            if c == cadena:
                cadena = None
        elif c in "\"'`":
            cadena = c
        elif c in "[{":
            profundidad += 1
        elif c in "]}":
            profundidad -= 1
            if profundidad == 0:
                return texto[i:k + 1]
        k += 1
    raise SystemExit(f"«{nombre}» en js/data.js no está bien cerrado (revisa corchetes y llaves)")


def js_a_python(literal):
    """Convierte un literal de JavaScript (claves sin comillas, comas finales, comentarios) a JSON."""
    out, i, n = [], 0, len(literal)
    while i < n:
        c = literal[i]
        if c in "\"'":
            j = i + 1
            while literal[j] != c:
                j += 2 if literal[j] == "\\" else 1
            if c == "'":  # texto entre comillas simples → comillas dobles
                out.append(json.dumps(literal[i + 1:j].replace("\\'", "'"), ensure_ascii=False))
            else:
                out.append(literal[i:j + 1])
            i = j + 1
        elif literal.startswith("//", i):
            i = literal.find("\n", i)
            i = n if i < 0 else i
        elif literal.startswith("/*", i):
            i = literal.index("*/", i) + 2
        elif c == ",":
            resto = literal[i + 1:].lstrip()
            if not resto.startswith(("}", "]")):  # se ignoran las comas finales
                out.append(c)
            i += 1
        elif c.isalpha() or c == "_":
            palabra = re.match(r"[A-Za-z_]\w*", literal[i:]).group(0)
            despues = literal[i + len(palabra):].lstrip()
            es_clave = despues.startswith(":") and palabra not in ("true", "false", "null")
            out.append(f'"{palabra}"' if es_clave else palabra)
            i += len(palabra)
        else:
            out.append(c)
            i += 1
    return json.loads("".join(out))


def cargar_datos():
    texto = (RAIZ / "js" / "data.js").read_text(encoding="utf-8")
    regiones = js_a_python(extraer_literal(texto, "REGIONES"))
    fungi = js_a_python(extraer_literal(texto, "FUNGI"))
    for r in regiones:
        r["fungi"] = fungi.get(r["id"], [])
    return regiones


def especies_de(r):
    return [dict(x, tipo=t) for t in ("flora", "fauna", "fungi") for x in r.get(t, [])]


def recortar(texto, largo=158):
    return texto if len(texto) <= largo else texto[:largo - 1].rsplit(" ", 1)[0] + "…"


# ---------------------------------------------------------------
#  Páginas de región
# ---------------------------------------------------------------
def url_region(rid):
    return f"{SITIO}/regiones/{rid}.html"


def tarjeta_estatica(x):
    estado = (f'<span class="estado {CLASE_ESTADO.get(x["estado"], "")}">{e(x["estado"])}</span>'
              if x.get("estado") else "")
    grupo = f' · {e(x["grupo"])}' if x.get("grupo") else ""
    endemica = '<span class="endemica">Endémica</span>' if x.get("endemica") else ""
    return f"""
          <article class="especie" data-sci="{e(x["cientifico"])}">
            <div class="foto"><span class="tipo">{TIPOS[x["tipo"]]}{grupo}</span>{endemica}<div class="foto-vacia"></div></div>
            <div class="cuerpo">
              <h3>{e(x["nombre"])}</h3>
              <span class="cientifico">{e(x["cientifico"])}</span>
              <p>{e(x["desc"])}</p>
              {estado}
            </div>
          </article>"""


def json_ld_region(r, oficial, titulo, descripcion, especies):
    datos = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Lumaria", "item": f"{SITIO}/"},
                    {"@type": "ListItem", "position": 2, "name": oficial, "item": url_region(r["id"])},
                ],
            },
            {
                "@type": "WebPage",
                "@id": url_region(r["id"]),
                "url": url_region(r["id"]),
                "name": titulo,
                "description": descripcion,
                "inLanguage": "es-CL",
                "isPartOf": {"@type": "WebSite", "name": "Lumaria", "url": f"{SITIO}/"},
                "about": {
                    "@type": "AdministrativeArea",
                    "name": oficial,
                    "containedInPlace": {"@type": "Country", "name": "Chile"},
                },
                "mainEntity": {
                    "@type": "ItemList",
                    "name": f"Especies nativas de la {oficial}",
                    "numberOfItems": len(especies),
                    "itemListElement": [
                        {
                            "@type": "ListItem",
                            "position": i + 1,
                            "item": {
                                "@type": "Taxon",
                                "name": x["cientifico"],
                                "alternateName": x["nombre"],
                                "description": x["desc"],
                            },
                        }
                        for i, x in enumerate(especies)
                    ],
                },
            },
        ],
    }
    # "</" no debe aparecer dentro de <script>
    return json.dumps(datos, ensure_ascii=False, indent=2).replace("</", "<\\/")


def generar_regiones(regiones):
    plantilla = (RAIZ / "herramientas" / "plantilla-region.html").read_text(encoding="utf-8")
    carpeta = RAIZ / "regiones"
    carpeta.mkdir(exist_ok=True)

    for idx, r in enumerate(regiones):
        oficial = NOMBRE_OFICIAL.get(r["id"], f"Región de {r['nombre']}")
        especies = especies_de(r)
        n_end = sum(1 for x in especies if x.get("endemica"))
        n_ame = sum(1 for x in especies if x.get("estado") in AMENAZADAS)

        titulo = f"Flora y fauna nativa de la {oficial} | Lumaria"
        titulo_social = f"Flora y fauna nativa de la {oficial}"
        # Ejemplos para la descripción, en minúscula inicial: "huemul, roble, pudú y digüeñe"
        ejemplos = [x["nombre"][0].lower() + x["nombre"][1:] for x in
                    (r["fauna"][:1] + r["flora"][:1] + r["fauna"][1:2] + r["fungi"][:1])]
        descripcion = recortar(
            f"{len(especies)} especies nativas de la {oficial}: {', '.join(ejemplos)} y más. "
            f"Flora, fauna y hongos con fotos, estado de conservación y especies endémicas."
        )

        ant = regiones[idx - 1]
        sig = regiones[(idx + 1) % len(regiones)]
        reemplazos = {
            "TITULO": e(titulo),
            "TITULO_SOCIAL": e(titulo_social),
            "DESCRIPCION": e(descripcion),
            "URL": url_region(r["id"]),
            "IMAGEN": IMAGEN,
            "COLOR": e(r["color"]),
            "ID": e(r["id"]),
            "NOMBRE": e(r["nombre"]),
            "KICKER": e(f"Región {r['num']} · Capital: {r['capital']}"),
            "LEMA": e(r["lema"]),
            "DESC": e(r["desc"]),
            "CHIPS": "".join(f'<span class="chip">{e(c)}</span>' for c in r["ecosistemas"]),
            "DATOS": (
                f'<div><b>{len(r["flora"])}</b><span>especies de flora</span></div>'
                f'<div><b>{len(r["fauna"])}</b><span>especies de fauna</span></div>'
                f'<div><b>{len(r["fungi"])}</b><span>hongos y líquenes</span></div>'
                f'<div><b>{n_end}</b><span>endémicas</span></div>'
                f'<div><b>{n_ame}</b><span>amenazadas</span></div>'
            ),
            "H2": e(f"Especies nativas de la {oficial}"),
            "ESPECIES": "".join(tarjeta_estatica(x) for x in especies),
            "NAV": (
                f'<a class="nav-region" href="regiones/{ant["id"]}.html"><small>← Hacia el norte</small><b>{e(ant["nombre"])}</b></a>'
                f'<a class="nav-region sig" href="regiones/{sig["id"]}.html"><small>Hacia el sur →</small><b>{e(sig["nombre"])}</b></a>'
            ),
            "JSONLD": json_ld_region(r, oficial, titulo, descripcion, especies),
        }
        pagina = plantilla
        for clave, valor in reemplazos.items():
            pagina = pagina.replace("{{" + clave + "}}", valor)
        sobrantes = re.findall(r"\{\{[A-Z_]+\}\}", pagina)
        if sobrantes:
            raise SystemExit(f"La plantilla tiene campos sin rellenar: {sobrantes}")
        (carpeta / f"{r['id']}.html").write_text(pagina, encoding="utf-8", newline="\n")
    print(f"  ✓ {len(regiones)} páginas en regiones/")


# ---------------------------------------------------------------
#  Datos SEO en las páginas principales (entre marcadores)
# ---------------------------------------------------------------
def bloque_seo(ruta, titulo, descripcion, extra_jsonld=None):
    url = f"{SITIO}/{ruta}" if ruta != "index.html" else f"{SITIO}/"
    lineas = [
        f'<link rel="canonical" href="{url}">',
        '<meta property="og:type" content="website">',
        '<meta property="og:locale" content="es_CL">',
        '<meta property="og:site_name" content="Lumaria">',
        f'<meta property="og:title" content="{e(titulo)}">',
        f'<meta property="og:description" content="{e(descripcion)}">',
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:image" content="{IMAGEN}">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{e(titulo)}">',
        f'<meta name="twitter:description" content="{e(descripcion)}">',
        f'<meta name="twitter:image" content="{IMAGEN}">',
    ]
    if extra_jsonld:
        texto = json.dumps(extra_jsonld, ensure_ascii=False, indent=2).replace("</", "<\\/")
        lineas.append(f'<script type="application/ld+json">\n{texto}\n  </script>')
    return "\n  ".join(lineas)


def reemplazar_entre(texto, marcador, contenido, archivo):
    patron = re.compile(rf"(<!-- {marcador}:INICIO -->)(.*?)(<!-- {marcador}:FIN -->)", re.S)
    if not patron.search(texto):
        raise SystemExit(f"Falta el marcador «{marcador}» en {archivo}")
    return patron.sub(lambda m: f"{m.group(1)}\n  {contenido}\n  {m.group(3)}", texto)


def actualizar_paginas(regiones):
    total = len({x["cientifico"] for r in regiones for x in especies_de(r)})
    paginas = {
        "index.html": (
            "Lumaria · Flora, fauna y fungi nativos de Chile",
            f"Atlas interactivo de la naturaleza de Chile: {total} especies nativas de flora, fauna y hongos, "
            "región por región, con fotos, especies endémicas y estado de conservación.",
            {
                "@context": "https://schema.org",
                "@graph": [
                    {"@type": "WebSite", "name": "Lumaria", "url": f"{SITIO}/", "inLanguage": "es-CL",
                     "description": "Atlas de la flora, fauna y fungi nativos de Chile, región por región."},
                    {"@type": "Organization", "name": "Lumaria", "url": f"{SITIO}/",
                     "logo": f"{SITIO}/imagenes/compartir.png"},
                ],
            },
        ),
        "comunidad.html": (
            "Comunidad · Lumaria",
            "Comparte tus fotos de la flora, fauna y fungi nativos de Chile, cuenta dónde las tomaste "
            "y conversa con otras personas que aman la naturaleza.",
            None,
        ),
        "creditos.html": (
            "Créditos de las fotografías · Lumaria",
            "Autores y licencias de las fotografías de especies nativas de Chile usadas en Lumaria.",
            None,
        ),
        "privacidad.html": (
            "Privacidad y normas de la comunidad · Lumaria",
            "Qué datos guarda Lumaria, para qué se usan, cómo pedir que se borren, "
            "y las normas para participar en la comunidad.",
            None,
        ),
    }
    for archivo, (titulo, descripcion, jsonld) in paginas.items():
        ruta = RAIZ / archivo
        texto = ruta.read_text(encoding="utf-8")
        texto = reemplazar_entre(texto, "SEO", bloque_seo(archivo, titulo, descripcion, jsonld), archivo)
        if archivo == "index.html":
            tarjetas = "".join(
                f'<a class="tarjeta-region" href="regiones/{r["id"]}.html" style="--rc:{e(r["color"])}">'
                f'<span class="num">REGIÓN {e(r["num"])}</span><h3>{e(r["nombre"])}</h3><p>{e(r["lema"])}</p></a>'
                for r in regiones
            )
            texto = reemplazar_entre(texto, "REGIONES", tarjetas, archivo)
        ruta.write_text(texto, encoding="utf-8", newline="\n")
    print("  ✓ datos para buscadores y redes en index, comunidad, créditos y privacidad")


# ---------------------------------------------------------------
#  sitemap.xml y robots.txt
# ---------------------------------------------------------------
def generar_sitemap(regiones):
    urls = [(f"{SITIO}/", "1.0"), (f"{SITIO}/comunidad.html", "0.8"),
            (f"{SITIO}/creditos.html", "0.3"), (f"{SITIO}/privacidad.html", "0.3")]
    urls += [(url_region(r["id"]), "0.9") for r in regiones]
    cuerpo = "\n".join(
        f"  <url>\n    <loc>{u}</loc>\n    <lastmod>{HOY}</lastmod>\n    <priority>{p}</priority>\n  </url>"
        for u, p in urls
    )
    (RAIZ / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{cuerpo}\n</urlset>\n",
        encoding="utf-8", newline="\n",
    )
    (RAIZ / "robots.txt").write_text(
        "User-agent: *\n"
        "Allow: /\n"
        "Disallow: /admin.html\n"
        "Disallow: /herramientas/\n"
        "Disallow: /supabase/\n"
        f"\nSitemap: {SITIO}/sitemap.xml\n",
        encoding="utf-8", newline="\n",
    )
    print(f"  ✓ sitemap.xml ({len(urls)} direcciones) y robots.txt")


if __name__ == "__main__":
    print(f"Generando Lumaria para {SITIO} …")
    regiones = cargar_datos()
    generar_regiones(regiones)
    actualizar_paginas(regiones)
    generar_sitemap(regiones)
    print("Listo.")
