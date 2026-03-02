# Doc Forge

Generador de documentos PDF desde HTML y CSS personalizado. Aplicación web progresiva (PWA) que funciona completamente offline.

## Funcionalidades

**Editor de contenido** — Escribe o pega HTML directamente. El contenido se renderiza en tiempo real en la vista previa con aspecto de hoja de papel.

**Estilos CSS personalizados** — Editor CSS libre para dar estilo completo al documento. Colores, fuentes, tablas, grids, tarjetas: todo se controla desde CSS.

**Controles de tipografía y espaciado** — Selectores rápidos para fuente de títulos, fuente de párrafos, interlineado y márgenes de página sin necesidad de escribir CSS.

**Encabezado y pie de página** — Tres campos por zona (izquierda, centro, derecha) con línea separadora opcional. Se repiten en cada página del PDF exportado.

**Fondos decorativos** — Cuatro diseños: sin fondo, profesional, educativo y elegante. Cada uno con colores primario y secundario personalizables.

**Logo y marca personal** — Sube un logo (PNG, JPG, SVG, WebP), elige posición (arriba izquierda, centro o derecha), tamaño y nombre de marca visible.

**Tamaño de papel** — Carta (216 × 279 mm), A4 (210 × 297 mm) y Oficio (216 × 356 mm).

**Exportación PDF multipágina** — Genera PDFs con paginación inteligente que respeta los límites de elementos y divide tablas entre filas cuando es necesario, sin cortar contenido. Cada página incluye fondo decorativo, encabezado y pie de página.

**Exportación PNG** — Imagen completa del documento en alta resolución (escala 2x).

**PWA offline** — Service Worker cachea todos los recursos. Funciona sin conexión después de la primera carga. Instalable en escritorio y móvil.

**Tema claro y oscuro** — Interfaz con diseño Liquid Glass. El tema se guarda en localStorage.

**Borradores** — Guarda y restaura el estado completo del documento (contenido, estilos, configuración visual, encabezado/pie, fondo y logo).

## Estructura del proyecto
```
doc-forge/
├── index.html                  Interfaz principal
├── sw.js                       Service Worker (cache v4)
├── manifest.json               Configuración PWA
├── package.json
└── src/
    ├── css/
    │   └── app.css             Estilos de la interfaz (Liquid Glass)
    ├── js/
    │   ├── app.js              Lógica principal, preview, zoom, borradores
    │   ├── visual-editor.js    Controles de tipografía y espaciado
    │   ├── header-footer.js    Encabezado y pie de página
    │   ├── background-manager.js   Fondos decorativos y logo
    │   ├── pdf-export.js       Exportación PDF/PNG multipágina
    │   ├── html2canvas.min.js  Librería de captura
    │   └── jspdf.umd.min.js   Librería de generación PDF
    └── fonts/
        ├── dm-sans-latin-*.woff2
        └── jetbrains-mono-latin-*.woff2
```

## Uso

Abrir `index.html` con un servidor local:
```bash
npx live-server
```

O con cualquier servidor estático (VS Code Live Server, Python `http.server`, etc.).

## Tecnologías

HTML, CSS y JavaScript vanilla. Sin frameworks ni dependencias de build. Las únicas librerías externas son html2canvas y jsPDF, incluidas localmente para funcionamiento offline. Fuentes DM Sans y JetBrains Mono servidas como archivos .woff2 locales.

## Licencia

Este proyecto está licenciado bajo la [GNU General Public License v3.0](LICENSE).

## Autor

**Jader Castro (cjdev23)** — [@cjdev23](https://github.com/cjdev23)