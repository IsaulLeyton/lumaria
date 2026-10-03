"""
Lumaria — Servidor local para probar la página en tu computador.

Se comporta como GitHub Pages: /glosario muestra glosario.html,
/regiones/maule muestra regiones/maule.html y las direcciones que no
existen muestran 404.html.

Uso (desde la carpeta Nativa):
    python herramientas/servidor.py          → http://localhost:8765
"""

import http.server
import os
import sys
from pathlib import Path
from urllib.parse import urlsplit

RAIZ = Path(__file__).resolve().parent.parent
PUERTO = int(sys.argv[1]) if len(sys.argv) > 1 else 8765


class Manejador(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(RAIZ), **kwargs)

    def send_head(self):
        partes = urlsplit(self.path)
        ruta = partes.path
        local = Path(self.translate_path(ruta))
        # /glosario → glosario.html (como GitHub Pages)
        if not local.exists() and not Path(ruta).suffix and Path(str(local) + ".html").is_file():
            self.path = ruta + ".html" + (("?" + partes.query) if partes.query else "")
        elif not local.exists():
            # Página no encontrada: se muestra 404.html con su código 404
            pagina = RAIZ / "404.html"
            contenido = pagina.read_bytes()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(contenido)))
            self.end_headers()
            self.wfile.write(contenido)
            return None
        return super().send_head()

    def end_headers(self):
        # Sin caché: así siempre se ve la última versión de los archivos al probar
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    os.chdir(RAIZ)
    print(f"Lumaria en http://localhost:{PUERTO}  (Ctrl + C para detener)")
    http.server.ThreadingHTTPServer(("127.0.0.1", PUERTO), Manejador).serve_forever()
