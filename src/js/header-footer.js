/* ============================================
   HEADER-FOOTER.JS — Doc Forge
   Gestiona el encabezado y pie de página
   del documento en el preview.
   ============================================ */

/* ============================================
   1. REFERENCIAS
   ============================================ */
const HF = {
    headerLeft:   null,
    headerCenter: null,
    headerRight:  null,
    footerLeft:   null,
    footerCenter: null,
    footerRight:  null,
    showLine:     null,
    btnToggle:    null,
    panel:        null
};

/* ============================================
   2. INICIALIZACIÓN
   ============================================ */
function initHeaderFooter() {
    HF.headerLeft   = document.getElementById('hf-header-left');
    HF.headerCenter = document.getElementById('hf-header-center');
    HF.headerRight  = document.getElementById('hf-header-right');
    HF.footerLeft   = document.getElementById('hf-footer-left');
    HF.footerCenter = document.getElementById('hf-footer-center');
    HF.footerRight  = document.getElementById('hf-footer-right');
    HF.showLine     = document.getElementById('hf-show-line');
    HF.btnToggle    = document.getElementById('btn-toggle-hf');
    HF.panel        = document.getElementById('header-footer-panel');

    registerHFEvents();
}

/* ============================================
   3. GENERAR HTML DEL ENCABEZADO
   ============================================ */
function generateHeaderHTML() {
    const left   = HF.headerLeft.value.trim();
    const center = HF.headerCenter.value.trim();
    const right  = HF.headerRight.value.trim();

    // Si todo está vacío, no mostrar encabezado
    if (!left && !center && !right) return '';

    const lineClass = HF.showLine.checked ? ' with-line' : '';

    return '<div class="doc-header' + lineClass + '">'
         + '<span class="doc-hf-left">' + sanitizeText(left) + '</span>'
         + '<span class="doc-hf-center">' + sanitizeText(center) + '</span>'
         + '<span class="doc-hf-right">' + sanitizeText(right) + '</span>'
         + '</div>';
}

/* ============================================
   4. GENERAR HTML DEL PIE DE PÁGINA
   ============================================ */
function generateFooterHTML() {
    const left   = HF.footerLeft.value.trim();
    const center = HF.footerCenter.value.trim();
    const right  = HF.footerRight.value.trim();

    if (!left && !center && !right) return '';

    const lineClass = HF.showLine.checked ? ' with-line' : '';

    return '<div class="doc-footer' + lineClass + '">'
         + '<span class="doc-hf-left">' + sanitizeText(left) + '</span>'
         + '<span class="doc-hf-center">' + sanitizeText(center) + '</span>'
         + '<span class="doc-hf-right">' + sanitizeText(right) + '</span>'
         + '</div>';
}

/* ============================================
   5. SANITIZAR TEXTO PLANO
   Solo permite texto, no HTML.
   ============================================ */
function sanitizeText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* ============================================
   6. APLICAR AL PREVIEW
   Modifica el contenido del preview para incluir
   encabezado y pie de página.
   ============================================ */
function applyHeaderFooter() {
    // Llamar a updatePreview de app.js
    // que ahora incorporará header/footer
    if (typeof updatePreview === 'function') {
        updatePreview();
    }
}

/* ============================================
   7. TOGGLE — Mostrar/ocultar panel
   ============================================ */
function toggleHFPanel() {
    const isVisible = !HF.panel.classList.contains('collapsed');

    if (isVisible) {
        HF.panel.classList.add('collapsed');
        HF.btnToggle.textContent = 'Mostrar';
    } else {
        HF.panel.classList.remove('collapsed');
        HF.btnToggle.textContent = 'Ocultar';
    }
}

/* ============================================
   8. REGISTRO DE EVENTOS
   ============================================ */
function registerHFEvents() {
    const inputs = [
        HF.headerLeft, HF.headerCenter, HF.headerRight,
        HF.footerLeft, HF.footerCenter, HF.footerRight,
        HF.showLine
    ];

    inputs.forEach(function(input) {
        if (input) {
            input.addEventListener('input', applyHeaderFooter);
            input.addEventListener('change', applyHeaderFooter);
        }
    });

    if (HF.btnToggle) {
        HF.btnToggle.addEventListener('click', toggleHFPanel);
    }
}

/* ============================================
   9. ARRANQUE
   ============================================ */
document.addEventListener('DOMContentLoaded', initHeaderFooter);