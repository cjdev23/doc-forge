/* ============================================
   VISUAL-EDITOR.JS — Doc Forge
   Controles de tipografía y espaciado.
   Genera CSS que se inyecta como override
   sobre los estilos del usuario.
   ============================================ */

/* ============================================
   1. REFERENCIAS A LOS CONTROLES
   ============================================ */
const VISUAL = {
    // Fuentes
    fontBody:         null,
    fontHeadings:     null,

    // Espaciado
    lineHeight:       null,
    margin:           null,

    // Valores mostrados
    lineHeightVal:    null,
    marginVal:        null,

    // Toggle
    btnToggle:        null,
    panel:            null,

    // Elemento <style> para overrides visuales
    overrideStyle:    null
};

/* ============================================
   2. INICIALIZACIÓN
   ============================================ */
function initVisualEditor() {
    VISUAL.fontBody      = document.getElementById('ve-font-body');
    VISUAL.fontHeadings  = document.getElementById('ve-font-headings');
    VISUAL.lineHeight    = document.getElementById('ve-line-height');
    VISUAL.margin        = document.getElementById('ve-margin');
    VISUAL.lineHeightVal = document.getElementById('ve-line-height-val');
    VISUAL.marginVal     = document.getElementById('ve-margin-val');
    VISUAL.btnToggle     = document.getElementById('btn-toggle-visual');
    VISUAL.panel         = document.getElementById('visual-editor');

    // Crear elemento <style> para overrides
    VISUAL.overrideStyle = document.createElement('style');
    VISUAL.overrideStyle.id = 'visual-overrides';
    document.head.appendChild(VISUAL.overrideStyle);

    registerVisualEvents();
}

/* ============================================
   3. GENERAR CSS DESDE LOS CONTROLES
   ============================================ */
function generateVisualCSS() {
    return `
        /* === Overrides de Tipografía y Espaciado === */
        .page-content {
            font-family: ${VISUAL.fontBody.value} !important;
            line-height: ${VISUAL.lineHeight.value} !important;
            padding: ${VISUAL.margin.value}mm !important;
        }

        .page-content h1,
        .page-content h2,
        .page-content h3,
        .page-content h4 {
            font-family: ${VISUAL.fontHeadings.value} !important;
        }
    `;
}

/* ============================================
   4. APLICAR CAMBIOS VISUALES
   ============================================ */
function applyVisualChanges() {
    // Actualizar valores mostrados
    VISUAL.lineHeightVal.textContent = VISUAL.lineHeight.value;
    VISUAL.marginVal.textContent     = VISUAL.margin.value;

    // Generar e inyectar CSS
    VISUAL.overrideStyle.textContent = generateVisualCSS();
}

/* ============================================
   5. TOGGLE — Mostrar/ocultar panel
   ============================================ */
function toggleVisualEditor() {
    var isVisible = !VISUAL.panel.classList.contains('collapsed');

    if (isVisible) {
        VISUAL.panel.classList.add('collapsed');
        VISUAL.btnToggle.textContent = 'Mostrar';
    } else {
        VISUAL.panel.classList.remove('collapsed');
        VISUAL.btnToggle.textContent = 'Ocultar';
    }
}

/* ============================================
   6. REGISTRO DE EVENTOS
   ============================================ */
function registerVisualEvents() {
    var inputs = [
        VISUAL.fontBody, VISUAL.fontHeadings,
        VISUAL.lineHeight, VISUAL.margin
    ];

    inputs.forEach(function(input) {
        if (input) {
            input.addEventListener('input', applyVisualChanges);
            input.addEventListener('change', applyVisualChanges);
        }
    });

    if (VISUAL.btnToggle) {
        VISUAL.btnToggle.addEventListener('click', toggleVisualEditor);
    }
}

/* ============================================
   7. ARRANQUE
   ============================================ */
document.addEventListener('DOMContentLoaded', initVisualEditor);