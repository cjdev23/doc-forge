/* ============================================
   PDF-EXPORT.JS — Doc Forge
   Exportación a PDF y PNG con renderizado
   multipágina. Cada página tiene su propio
   fondo, encabezado y pie de página.

   Dependencias: html2canvas, jsPDF
   ============================================ */

const PAGE_SIZES = {
    letter: { width: 215.9, height: 279.4 },
    a4:     { width: 210,   height: 297 },
    legal:  { width: 215.9, height: 355.6 }
};

function mmToPx(mm) { return mm * 96 / 25.4; }

function getTimestamp() {
    var d = new Date();
    return d.getFullYear() + '-'
        + String(d.getMonth()+1).padStart(2,'0') + '-'
        + String(d.getDate()).padStart(2,'0') + '_'
        + String(d.getHours()).padStart(2,'0') + '-'
        + String(d.getMinutes()).padStart(2,'0') + '-'
        + String(d.getSeconds()).padStart(2,'0');
}

function pause(ms) {
    return new Promise(function(r) { setTimeout(r, ms); });
}

/* ============================================
   CONGELAR / DESCONGELAR PREVIEW
   Evita reflows visuales durante la exportación.
   ============================================ */
function freezePreview() {
    var preview = document.getElementById('preview-page');
    if (!preview) return null;
    var parent = preview.parentElement;
    var rect = parent.getBoundingClientRect();
    parent.style.width  = rect.width  + 'px';
    parent.style.height = rect.height + 'px';
    parent.style.overflow = 'hidden';
    return parent;
}

function unfreezePreview(parent) {
    if (!parent) return;
    parent.style.width  = '';
    parent.style.height = '';
    parent.style.overflow = '';
}

/* ============================================
   CSS SCOPED PARA EXPORTACIÓN
   Los selectores están prefijados con #scopeId
   para que SOLO afecten el contenedor off-screen,
   nunca el preview visible.
   ============================================ */
function getScopedExportCSS(colors, scopeId) {
    var s = '#' + scopeId;
    return s + ' {'
        + '  --doc-color-primary: '   + colors.primary   + ';'
        + '  --doc-color-secondary: ' + colors.secondary + ';'
        + '}'
        + s + ' .page-content {'
        + '  box-shadow: none !important;'
        + '  border-radius: 0 !important;'
        + '  border: none !important;'
        + '  width: 100% !important;'
        + '  min-height: auto !important;'
        + '  padding: 0 !important;'
        + '  margin: 0 !important;'
        + '  overflow: visible !important;'
        + '  transform: none !important;'
        + '  display: block !important;'
        + '  position: static !important;'
        + '  background: transparent !important;'
        + '}'
        + s + ' .page-content::before {'
        + '  display: none !important;'
        + '  content: none !important;'
        + '}'
        /* Fix html2canvas: radial-gradient patterns → createPattern height 0 error */
        + s + ' .bg-dots,'
        + s + ' .bg-corner-accent {'
        + '  background-image: none !important;'
        + '}'
        /* Fix html2canvas: sub-pixel height elements with gradient → canvas height 0 */
        + s + ' .bg-bottom-line,'
        + s + ' .bg-line-top {'
        + '  height: 1px !important;'
        + '}'
        /* Fix html2canvas: sub-pixel dimensions (solid color, safe to round up) */
        + s + ' .bg-line-1,'
        + s + ' .bg-line-2 {'
        + '  min-height: 1px !important;'
        + '}'
        + s + ' .bg-vertical-l,'
        + s + ' .bg-vertical-r {'
        + '  min-width: 1px !important;'
        + '}'
        + s + ' .doc-background {'
        + '  position: absolute !important;'
        + '  top: 0 !important; left: 0 !important;'
        + '  width: 100% !important; height: 100% !important;'
        + '  pointer-events: none !important;'
        + '}';
}

function addScopedStyle(scopeId, colors) {
    var style = document.createElement('style');
    style.setAttribute('data-export-scope', scopeId);
    style.textContent = getScopedExportCSS(colors, scopeId);
    document.head.appendChild(style);
}

function removeScopedStyle(scopeId) {
    var style = document.querySelector('style[data-export-scope="' + scopeId + '"]');
    if (style && style.parentNode) {
        style.parentNode.removeChild(style);
    }
}

/* ============================================
   CONSTRUIR HTML DE UNA PÁGINA
   ============================================ */
function buildPageHTML(opt) {
    var html = '';

    // Fondo decorativo
    if (opt.bgHTML) {
        html += '<div style="position:absolute; top:0; left:0; right:0; bottom:0; '
            + 'width:' + opt.pageW + 'px; height:' + opt.pageH + 'px; '
            + 'pointer-events:none; z-index:0; overflow:hidden;">'
            + opt.bgHTML + '</div>';
    }

    // Logo (solo primera página)
    if (opt.isFirstPage && opt.logoHTML) {
        html += '<div style="position:absolute; top:0; left:0; right:0; z-index:2;">'
            + opt.logoHTML + '</div>';
    }

    // Área con márgenes — header siempre a 32mm del borde cuando hay logo en pág. 1
    var topPad = (opt.isFirstPage && opt.logoHTML) ? mmToPx(32) : opt.marginPx;

    html += '<div style="position:absolute; z-index:1; box-sizing:border-box; '
        + 'top:0; left:0; width:' + opt.pageW + 'px; height:' + opt.pageH + 'px; '
        + 'padding:' + topPad + 'px ' + opt.marginPx + 'px ' + opt.marginPx + 'px ' + opt.marginPx + 'px; '
        + 'display:flex; flex-direction:column;">';

    // Header
    if (opt.headerHTML) {
        html += '<div style="flex-shrink:0; margin-bottom:8px;">'
            + opt.headerHTML + '</div>';
    }

    // Contenido: max-height limita exactamente al slice de esta página,
    // evitando que contenido de la página siguiente sea visible.
    var contentH = opt.sliceEnd - opt.contentOffset;
    html += '<div style="flex:1; max-height:' + contentH + 'px; overflow:hidden;">'
        + '<div style="margin-top:-' + opt.contentOffset + 'px;">'
        + '<div class="page-content">' + opt.contentHTML + '</div>'
        + '</div></div>';

    // Footer
    if (opt.footerHTML) {
        html += '<div style="flex-shrink:0; margin-top:auto; padding-top:8px;">'
            + opt.footerHTML + '</div>';
    }

    html += '</div>';
    return html;
}

/* ============================================
   RENDERIZAR OFF-SCREEN Y CAPTURAR
   El contenedor tiene un ID único. El CSS de
   exportación está scoped a ese ID en el <head>,
   por lo que NO afecta el preview visible.
   ============================================ */
async function renderAndCapture(htmlContent, widthPx, heightPx, colors) {
    var scopeId = 'export-render-' + Date.now();

    var container = document.createElement('div');
    container.id = scopeId;
    container.style.cssText = 'position:fixed; left:-9999px; top:0; '
        + 'width:' + widthPx + 'px; height:' + heightPx + 'px; '
        + 'background:#FFFFFF; overflow:hidden;';

    var inner = document.createElement('div');
    inner.style.cssText = 'position:relative; width:' + widthPx + 'px; height:' + heightPx + 'px; overflow:hidden; background:#FFFFFF;';
    inner.innerHTML = htmlContent;
    container.appendChild(inner);

    // Scoped CSS en <head>: afecta solo #scopeId, no el preview
    addScopedStyle(scopeId, colors);
    document.body.appendChild(container);

    try {
        await pause(300);

        var canvas = await html2canvas(inner, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#FFFFFF',
            logging: false,
            width:  Math.round(widthPx),
            height: Math.round(heightPx)
        });

        return canvas;
    } finally {
        if (container.parentNode) {
            document.body.removeChild(container);
        }
        removeScopedStyle(scopeId);
    }
}

/* ============================================
   EXPORTAR A PDF
   ============================================ */
async function exportToPDF() {
    var previewPage = document.getElementById('preview-page');

    if (previewPage.querySelector('.preview-placeholder')) {
        showNotification('No hay contenido para exportar');
        return;
    }

    showNotification('Generando PDF...');

    var frozenParent   = null;
    var measureDiv     = null;
    var measureScopeId = null;

    try {
        frozenParent = freezePreview();

        var pageSizeKey = document.getElementById('page-size').value;
        var pc          = PAGE_SIZES[pageSizeKey] || PAGE_SIZES.letter;
        var pageWpx     = mmToPx(pc.width);
        var pageHpx     = mmToPx(pc.height);

        var mEl       = document.getElementById('ve-margin');
        var marginMM  = mEl ? parseFloat(mEl.value) : 25;
        var marginPx  = mmToPx(marginMM);

        var rawHTML     = document.getElementById('html-editor').value.trim();
        var contentHTML = sanitizeHTML(rawHTML);

        var bgHTML     = (typeof generateBackgroundHTML === 'function') ? generateBackgroundHTML() : '';
        var logoHTML   = (typeof generateLogoHTML       === 'function') ? generateLogoHTML()       : '';
        var headerHTML = (typeof generateHeaderHTML     === 'function') ? generateHeaderHTML()     : '';
        var footerHTML = (typeof generateFooterHTML     === 'function') ? generateFooterHTML()     : '';

        var colors = { primary: '#8B5CF6', secondary: '#0AE98A' };
        var pEl = document.getElementById('bg-color-primary');
        var sEl = document.getElementById('bg-color-secondary');
        if (pEl) colors.primary   = pEl.value;
        if (sEl) colors.secondary = sEl.value;

        // ==========================================
        // PASO 1: Medir contenido
        // ==========================================
        var contentAreaW = pageWpx - (marginPx * 2);

        measureScopeId = 'export-measure-' + Date.now();
        measureDiv = document.createElement('div');
        measureDiv.id = measureScopeId;
        measureDiv.style.cssText = 'position:fixed; left:-9999px; top:0; z-index:-1; '
            + 'width:' + contentAreaW + 'px; background:#FFFFFF;';

        var contentWrapper = document.createElement('div');
        contentWrapper.className = 'page-content';
        contentWrapper.innerHTML = contentHTML;
        measureDiv.appendChild(contentWrapper);

        // Scoped CSS para medición (no afecta el preview)
        addScopedStyle(measureScopeId, colors);
        document.body.appendChild(measureDiv);
        await pause(200);

        var headerH = 0, footerH = 0;

        if (headerHTML) {
            var hM = document.createElement('div');
            hM.style.cssText = 'width:' + contentAreaW + 'px;';
            hM.innerHTML = headerHTML;
            measureDiv.appendChild(hM);
            await pause(50);
            headerH = hM.offsetHeight + 12;
            measureDiv.removeChild(hM);
        }

        if (footerHTML) {
            var fM = document.createElement('div');
            fM.style.cssText = 'width:' + contentAreaW + 'px;';
            fM.innerHTML = footerHTML;
            measureDiv.appendChild(fM);
            await pause(50);
            footerH = fM.offsetHeight + 12;
            measureDiv.removeChild(fM);
        }

        // Top padding de la primera página: 32mm si hay logo, margen normal si no
        var firstPageTopPad = logoHTML ? mmToPx(32) : marginPx;
        var firstPageH = pageHpx - firstPageTopPad - marginPx - headerH - footerH;
        var otherPageH = pageHpx - (marginPx * 2) - headerH - footerH;

        // Puntos de corte
        var children     = contentWrapper.children;
        var breakPoints  = [0];
        var currentLimit = firstPageH;
        var lastBreak    = 0;

        for (var i = 0; i < children.length; i++) {
            var child       = children[i];
            var childBottom = child.offsetTop + child.offsetHeight;

            if (childBottom - lastBreak > currentLimit) {
                var breakAt = child.offsetTop;
                if (breakAt > lastBreak) {
                    breakPoints.push(breakAt);
                    lastBreak    = breakAt;
                    currentLimit = otherPageH;
                }
            }
        }

        var totalContentH = contentWrapper.scrollHeight;
        var slices = [];
        for (var si = 0; si < breakPoints.length; si++) {
            var start = breakPoints[si];
            var end   = (si + 1 < breakPoints.length) ? breakPoints[si + 1] : totalContentH;
            slices.push({ start: start, end: end });
        }

        // Limpiar measureDiv
        document.body.removeChild(measureDiv);
        removeScopedStyle(measureScopeId);
        measureDiv     = null;
        measureScopeId = null;

        // ==========================================
        // PASO 2: Renderizar cada página
        // ==========================================
        var { jsPDF } = window.jspdf;
        var pdf = new jsPDF({
            orientation: 'portrait',
            unit:        'mm',
            format:      [pc.width, pc.height]
        });

        for (var p = 0; p < slices.length; p++) {
            if (p > 0) pdf.addPage([pc.width, pc.height]);

            var pageHTML = buildPageHTML({
                bgHTML:        bgHTML,
                logoHTML:      logoHTML,
                headerHTML:    headerHTML,
                footerHTML:    footerHTML,
                contentHTML:   contentHTML,
                contentOffset: slices[p].start,
                sliceEnd:      slices[p].end,
                marginPx:      marginPx,
                pageW:         pageWpx,
                pageH:         pageHpx,
                isFirstPage:   (p === 0)
            });

            var canvas = await renderAndCapture(pageHTML, pageWpx, pageHpx, colors);

            if (canvas && canvas.width > 0 && canvas.height > 0) {
                pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, pc.width, pc.height);
            }
        }

        pdf.save('documento-' + getTimestamp() + '.pdf');
        showNotification('PDF exportado (' + slices.length + ' página' + (slices.length > 1 ? 's' : '') + ')');

    } catch (error) {
        console.error('Error al exportar PDF:', error);
        showNotification('Error al generar el PDF');
    } finally {
        // Garantizar limpieza aunque ocurra un error
        if (measureDiv && measureDiv.parentNode) {
            document.body.removeChild(measureDiv);
        }
        if (measureScopeId) {
            removeScopedStyle(measureScopeId);
        }
        unfreezePreview(frozenParent);
    }
}

/* ============================================
   EXPORTAR A PNG
   ============================================ */
async function exportToPNG() {
    var previewPage = document.getElementById('preview-page');

    if (previewPage.querySelector('.preview-placeholder')) {
        showNotification('No hay contenido para exportar');
        return;
    }

    showNotification('Generando imagen...');

    var pageSizeKey = document.getElementById('page-size').value;
    var pc          = PAGE_SIZES[pageSizeKey] || PAGE_SIZES.letter;

    var origT = previewPage.style.transform;
    var origW = previewPage.style.width;
    var origO = previewPage.style.overflow;

    // bgFixups declarado fuera del try para que finally siempre pueda restaurar
    var bgFixups = [];
    var origBg = previewPage.style.backgroundColor;

    try {
        previewPage.style.transform       = 'scale(1)';
        previewPage.style.width           = pc.width + 'mm';
        previewPage.style.overflow        = 'visible';
        previewPage.style.backgroundColor = '#FFFFFF';

        await pause(150);

        // Fix html2canvas: neutralizar SOLO los elementos problemáticos.
        // Se hace DESPUÉS del reset para que getBoundingClientRect sea exacto.
        //   - Elementos sub-pixel (height/width < 1px) → error "canvas height 0"
        //   - Patrones radial-gradient (bg-dots) → error "createPattern"
        // Los gradientes lineales visibles (bg-top-bar, bg-sidebar, etc.)
        // tienen dimensiones normales y NO se tocan: aparecen en el PNG.
        var bgRoot = previewPage.querySelector('.doc-background');
        if (bgRoot) {
            bgRoot.querySelectorAll('*').forEach(function(el) {
                var computed = window.getComputedStyle(el);
                var bgImg    = computed.backgroundImage;
                if (bgImg && bgImg !== 'none') {
                    var rect       = el.getBoundingClientRect();
                    var isSubPixel = rect.height < 1 || rect.width < 1;
                    var isRadial   = bgImg.indexOf('radial-gradient') !== -1;
                    if (isSubPixel || isRadial) {
                        bgFixups.push({ el: el, saved: el.style.backgroundImage });
                        el.style.backgroundImage = 'none';
                    }
                }
            });
        }

        var canvas = await html2canvas(previewPage, {
            scale:           2,
            useCORS:         true,
            allowTaint:      true,
            backgroundColor: '#FFFFFF',
            logging:         false,
            width:           previewPage.scrollWidth,
            height:          previewPage.scrollHeight
        });

        var link      = document.createElement('a');
        link.download = 'documento-' + getTimestamp() + '.png';
        link.href     = canvas.toDataURL('image/png', 1.0);
        link.click();

        showNotification('PNG exportado correctamente');

    } catch (error) {
        console.error('Error al exportar PNG:', error);
        showNotification('Error al generar la imagen');
    } finally {
        // Siempre restaurar el preview, incluso si html2canvas falla
        previewPage.style.transform       = origT;
        previewPage.style.width           = origW;
        previewPage.style.overflow        = origO;
        previewPage.style.backgroundColor = origBg;

        bgFixups.forEach(function(f) {
            f.el.style.backgroundImage = f.saved;
        });
    }
}

/* ============================================
   CONECTAR BOTONES
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
    var btnPDF = document.getElementById('btn-export-pdf');
    var btnPNG = document.getElementById('btn-export-png');
    if (btnPDF) btnPDF.addEventListener('click', exportToPDF);
    if (btnPNG) btnPNG.addEventListener('click', exportToPNG);
});
