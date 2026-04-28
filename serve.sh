#!/bin/bash
# Sirve el frontend en http://localhost:4200
# La API (localhost:8080) tiene CORS configurado para aceptar exactamente este origen.
# Abre el navegador en: http://localhost:4200/page/index.html

ROOT="$(cd "$(dirname "$0")" && pwd)"

if command -v python3 &>/dev/null; then
    echo "Servidor iniciado en http://localhost:4200"
    echo "Abre: http://localhost:4200/page/index.html"
    echo "Presiona Ctrl+C para detener."
    python3 -m http.server 4200 --directory "$ROOT"
elif command -v npx &>/dev/null; then
    echo "Servidor iniciado en http://localhost:4200"
    echo "Abre: http://localhost:4200/page/index.html"
    npx serve "$ROOT" -p 4200
else
    echo "Error: necesitas Python 3 o Node.js instalado para ejecutar este servidor."
    exit 1
fi
