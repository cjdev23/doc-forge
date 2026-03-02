# Doc Forge

Generador de documentos PDF con plantillas personalizables, vista previa en tiempo real e interfaz Liquid Glass. Funciona 100% offline como PWA.

## Características

- 5 plantillas prediseñadas (Clásica, Moderna, Elegante, Creativa, Académica)
- Vista previa en tiempo real mientras editas
- Editor de HTML y CSS integrado
- Editor visual (color pickers, fuentes, sliders) sin tocar código
- Encabezado y pie de página personalizables
- Exportación a PDF y PNG
- Soporte para tamaños Carta, A4 y Oficio
- Modo claro y oscuro
- Guardado automático de borradores
- Funciona 100% offline (PWA instalable)
- Interfaz Liquid Glass inspirada en macOS Tahoe

## Tecnologías

- HTML5, CSS3, JavaScript (vanilla)
- Service Worker + manifest.json (PWA)
- html2canvas — Captura de HTML a imagen
- jsPDF — Generación de archivos PDF

## Instalación local
```bash
git clone git@github.com:cjdev23/doc-forge.git
cd doc-forge
npm install
```

Abre `index.html` en tu navegador o usa un servidor local:
```bash
npx serve .
```

## Instalación como app de escritorio

1. Abre la app en Chrome
2. Haz clic en el ícono de instalación en la barra de direcciones
3. La app se instala y funciona sin internet

## Seguridad

- Content Security Policy (CSP) restrictivo
- Sanitización de HTML para prevenir XSS
- Fuentes cargadas localmente (sin dependencias externas)
- No requiere servidor ni conexión a internet

## Licencia

Este proyecto está bajo licencia [GPL-3.0](LICENSE).

Uso educativo y personal permitido. No se autoriza su uso comercial sin consentimiento previo del autor.