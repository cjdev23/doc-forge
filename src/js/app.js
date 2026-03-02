/* ============================================
   APP.JS — Lógica principal de Doc Forge
   Controla: preview en tiempo real, zoom,
   conteo de caracteres y todas las
   interacciones del usuario.
   ============================================ */

/* ============================================
   1. REFERENCIAS AL DOM
   ============================================ */
const DOM = {
    // Editores
    htmlEditor:       document.getElementById('html-editor'),
    cssEditor:        document.getElementById('css-editor'),

    // Selectores
    pageSize:         document.getElementById('page-size'),

    // Preview
    previewPage:      document.getElementById('preview-page'),
    previewContainer: document.getElementById('preview-container'),

    // Zoom
    btnZoomIn:        document.getElementById('btn-zoom-in'),
    btnZoomOut:       document.getElementById('btn-zoom-out'),
    zoomLevel:        document.getElementById('zoom-level'),

    // Botones
    btnNew:           document.getElementById('btn-new'),
    btnSaveDraft:     document.getElementById('btn-save-draft'),
    btnClearHtml:     document.getElementById('btn-clear-html'),
    btnClearCss:      document.getElementById('btn-clear-css'),
    btnExportPdf:     document.getElementById('btn-export-pdf'),
    btnExportPng:     document.getElementById('btn-export-png'),

    // Info del footer
    charCount:        document.getElementById('char-count'),

    // Elemento <style> dinámico para inyectar CSS del usuario
    dynamicStyle:     null
};

/* ============================================
   2. ESTADO DE LA APLICACIÓN
   ============================================ */
const STATE = {
    zoomLevel: 100,
    zoomMin: 40,
    zoomMax: 150,
    zoomStep: 10
};

/* ============================================
   3. INICIALIZACIÓN
   ============================================ */
function initApp() {
    // Crear elemento <style> dinámico para inyectar CSS del usuario
    DOM.dynamicStyle = document.createElement('style');
    DOM.dynamicStyle.id = 'template-styles';
    document.head.appendChild(DOM.dynamicStyle);

    // Registrar todos los eventos
    registerEvents();

    // Actualizar el conteo de caracteres inicial
    updateCharCount();

    // Aplicar tamaño de página inicial
    updatePageSize();

    // Restaurar tema guardado
    var savedTheme = localStorage.getItem('docforge-theme');
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        var btnTheme = document.getElementById('btn-theme');
        if (btnTheme) btnTheme.textContent = '☾ Oscuro';
    }

    console.log('Doc Forge inicializado correctamente.');
}

/* ============================================
   4. APLICAR CSS DEL USUARIO
   ============================================ */
function applyCSS(css) {
    DOM.dynamicStyle.textContent = css;
}

/* ============================================
   5. PREVIEW EN TIEMPO REAL
   ============================================ */

/**
 * Actualiza el contenido HTML del preview.
 */
function updatePreview() {
    var rawHTML = DOM.htmlEditor.value.trim();

    if (rawHTML === '') {
        DOM.previewPage.innerHTML = '<p class="preview-placeholder">El documento aparecerá aquí cuando pegues el HTML...</p>';
    } else {
        var cleanHTML = sanitizeHTML(rawHTML);

        var backgroundHTML = '';
        var logoHTML = '';
        var headerHTML = '';
        var footerHTML = '';

        if (typeof generateBackgroundHTML === 'function') {
            backgroundHTML = generateBackgroundHTML();
        }
        if (typeof generateLogoHTML === 'function') {
            logoHTML = generateLogoHTML();
        }
        if (typeof generateHeaderHTML === 'function') {
            headerHTML = generateHeaderHTML();
        }
        if (typeof generateFooterHTML === 'function') {
            footerHTML = generateFooterHTML();
        }

        DOM.previewPage.innerHTML = backgroundHTML
            + logoHTML
            + headerHTML
            + '<div class="doc-body">' + cleanHTML + '</div>'
            + footerHTML;
    }

    updateCharCount();
}

/**
 * Sanitiza HTML eliminando elementos peligrosos.
 */
function sanitizeHTML(html) {
    var clean = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^>]*>.*?<\/iframe>/gi, '')
        .replace(/<object\b[^>]*>.*?<\/object>/gi, '')
        .replace(/<embed\b[^>]*\/?>/gi, '')
        .replace(/<link\b[^>]*>/gi, '')
        .replace(/<meta\b[^>]*>/gi, '');

    clean = clean.replace(/\s+on\w+\s*=\s*(['"])[^'"]*\1/gi, '');
    clean = clean.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '');

    clean = clean.replace(/href\s*=\s*(['"])javascript:[^'"]*\1/gi, 'href="#"');
    clean = clean.replace(/src\s*=\s*(['"])javascript:[^'"]*\1/gi, 'src=""');

    return clean;
}

/**
 * Actualiza los estilos CSS del preview en tiempo real.
 */
function updateCSS() {
    applyCSS(DOM.cssEditor.value);
}

/* ============================================
   6. SISTEMA DE ZOOM
   ============================================ */
function zoomIn() {
    if (STATE.zoomLevel < STATE.zoomMax) {
        STATE.zoomLevel += STATE.zoomStep;
        applyZoom();
    }
}

function zoomOut() {
    if (STATE.zoomLevel > STATE.zoomMin) {
        STATE.zoomLevel -= STATE.zoomStep;
        applyZoom();
    }
}

function applyZoom() {
    var scale = STATE.zoomLevel / 100;
    DOM.previewPage.style.transform = 'scale(' + scale + ')';
    DOM.zoomLevel.textContent = STATE.zoomLevel + '%';
}

/* ============================================
   7. TAMAÑO DE PÁGINA
   ============================================ */
function updatePageSize() {
    var size = DOM.pageSize.value;

    var sizes = {
        letter: { width: '216mm', height: '279mm' },
        a4:     { width: '210mm', height: '297mm' },
        legal:  { width: '216mm', height: '356mm' }
    };

    var selected = sizes[size] || sizes.letter;
    DOM.previewPage.style.width = selected.width;
    DOM.previewPage.style.minHeight = selected.height;
}

/* ============================================
   8. UTILIDADES
   ============================================ */

function updateCharCount() {
    var count = DOM.htmlEditor.value.length;
    DOM.charCount.textContent = count + ' caracteres';
}

function newDocument() {
    if (DOM.htmlEditor.value.trim() !== '' || DOM.cssEditor.value.trim() !== '') {
        if (!window.confirm('¿Estás seguro? Se perderá el contenido actual.')) return;
    }

    DOM.htmlEditor.value = '';
    DOM.cssEditor.value = '';
    applyCSS('');
    updatePreview();
}

function clearHTML() {
    DOM.htmlEditor.value = '';
    updatePreview();
}

function clearCSS() {
    DOM.cssEditor.value = '';
    applyCSS('');
}

/**
 * Guarda un borrador en localStorage.
 */
function saveDraft() {
    var draft = {
        html: DOM.htmlEditor.value,
        css: DOM.cssEditor.value,
        pageSize: DOM.pageSize.value,
        savedAt: new Date().toISOString(),
        // Tipografía y espaciado
        visual: {
            fontBody: document.getElementById('ve-font-body').value,
            fontHeadings: document.getElementById('ve-font-headings').value,
            lineHeight: document.getElementById('ve-line-height').value,
            margin: document.getElementById('ve-margin').value
        },
        // Encabezado y pie de página
        headerFooter: {
            headerLeft: document.getElementById('hf-header-left').value,
            headerCenter: document.getElementById('hf-header-center').value,
            headerRight: document.getElementById('hf-header-right').value,
            footerLeft: document.getElementById('hf-footer-left').value,
            footerCenter: document.getElementById('hf-footer-center').value,
            footerRight: document.getElementById('hf-footer-right').value,
            showLine: document.getElementById('hf-show-line').checked
        },
        // Fondo y marca
        background: {
            type: document.getElementById('bg-selector').value,
            colorPrimary: document.getElementById('bg-color-primary').value,
            colorSecondary: document.getElementById('bg-color-secondary').value,
            logoPosition: document.getElementById('logo-position').value,
            logoSize: document.getElementById('logo-size').value,
            brandName: document.getElementById('brand-name').value,
            brandShow: document.getElementById('brand-show').checked
        }
    };

    try {
        localStorage.setItem('docforge-draft', JSON.stringify(draft));
        showNotification('Borrador guardado correctamente');
    } catch (e) {
        showNotification('Error al guardar el borrador');
        console.error('Error guardando borrador:', e);
    }
}

/**
 * Carga un borrador desde localStorage.
 */
function loadDraft() {
    try {
        var saved = localStorage.getItem('docforge-draft');
        if (saved) {
            var draft = JSON.parse(saved);

            // Restaurar tamaño de página
            if (draft.pageSize) {
                DOM.pageSize.value = draft.pageSize;
                updatePageSize();
            }

            // Restaurar contenido
            if (draft.html) {
                DOM.htmlEditor.value = draft.html;
            }

            // Restaurar CSS
            if (draft.css) {
                DOM.cssEditor.value = draft.css;
                applyCSS(draft.css);
            }

            // Restaurar tipografía y espaciado
            if (draft.visual) {
                var v = draft.visual;
                document.getElementById('ve-font-body').value = v.fontBody || "'DM Sans', sans-serif";
                document.getElementById('ve-font-headings').value = v.fontHeadings || "'DM Sans', sans-serif";
                document.getElementById('ve-line-height').value = v.lineHeight || 1.7;
                document.getElementById('ve-margin').value = v.margin || 25;
                document.getElementById('ve-line-height-val').textContent = v.lineHeight || 1.7;
                document.getElementById('ve-margin-val').textContent = v.margin || 25;
                if (typeof applyVisualChanges === 'function') {
                    applyVisualChanges();
                }
            }

            // Restaurar encabezado y pie de página
            if (draft.headerFooter) {
                var hf = draft.headerFooter;
                document.getElementById('hf-header-left').value = hf.headerLeft || '';
                document.getElementById('hf-header-center').value = hf.headerCenter || '';
                document.getElementById('hf-header-right').value = hf.headerRight || '';
                document.getElementById('hf-footer-left').value = hf.footerLeft || '';
                document.getElementById('hf-footer-center').value = hf.footerCenter || '';
                document.getElementById('hf-footer-right').value = hf.footerRight || '';
                document.getElementById('hf-show-line').checked = hf.showLine !== false;
            }

            // Restaurar fondo y marca
            if (draft.background) {
                var bg = draft.background;
                document.getElementById('bg-selector').value = bg.type || 'none';
                document.getElementById('bg-color-primary').value = bg.colorPrimary || '#8B5CF6';
                document.getElementById('bg-color-secondary').value = bg.colorSecondary || '#0AE98A';
                document.getElementById('logo-position').value = bg.logoPosition || 'top-left';
                document.getElementById('logo-size').value = bg.logoSize || 40;
                document.getElementById('logo-size-val').textContent = bg.logoSize || 40;
                document.getElementById('brand-name').value = bg.brandName || '';
                document.getElementById('brand-show').checked = bg.brandShow !== false;
                if (typeof applyBackground === 'function') {
                    applyBackground();
                }
            }

            updatePreview();
            console.log('Borrador restaurado del', draft.savedAt);
        }
    } catch (e) {
        console.error('Error cargando borrador:', e);
    }
}

/**
 * Muestra una notificación temporal.
 */
function showNotification(message) {
    var existing = document.querySelector('.app-notification');
    if (existing) existing.remove();

    var notification = document.createElement('div');
    notification.className = 'app-notification';
    notification.textContent = message;

    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '70px',
        right: '20px',
        padding: '10px 18px',
        background: 'rgba(10, 233, 138, 0.15)',
        color: '#0AE98A',
        border: '1px solid rgba(10, 233, 138, 0.3)',
        borderRadius: '10px',
        fontSize: '0.82rem',
        fontFamily: 'var(--font-body)',
        backdropFilter: 'blur(12px)',
        zIndex: '9999',
        opacity: '0',
        transform: 'translateY(10px)',
        transition: 'all 0.3s ease'
    });

    document.body.appendChild(notification);

    requestAnimationFrame(function() {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    });

    setTimeout(function() {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(10px)';
        setTimeout(function() { notification.remove(); }, 300);
    }, 2500);
}

/* ============================================
   9. REGISTRO DE EVENTOS
   ============================================ */
function registerEvents() {
    // Preview en tiempo real al escribir
    DOM.htmlEditor.addEventListener('input', updatePreview);
    DOM.cssEditor.addEventListener('input', updateCSS);

    // Cambio de tamaño de página
    DOM.pageSize.addEventListener('change', updatePageSize);

    // Zoom
    DOM.btnZoomIn.addEventListener('click', zoomIn);
    DOM.btnZoomOut.addEventListener('click', zoomOut);

    // Botones de acción
    DOM.btnNew.addEventListener('click', newDocument);
    DOM.btnClearHtml.addEventListener('click', clearHTML);
    DOM.btnClearCss.addEventListener('click', clearCSS);
    DOM.btnSaveDraft.addEventListener('click', saveDraft);

    // Toggle de tema claro/oscuro
    DOM.btnTheme = document.getElementById('btn-theme');
    if (DOM.btnTheme) {
        DOM.btnTheme.addEventListener('click', toggleTheme);
    }

    // Intentar cargar borrador al iniciar
    loadDraft();
}

/**
 * Cambia entre tema oscuro y claro.
 */
function toggleTheme() {
    var html = document.documentElement;
    var currentTheme = html.getAttribute('data-theme');

    if (currentTheme === 'light') {
        html.removeAttribute('data-theme');
        DOM.btnTheme.textContent = '☀ Claro';
        localStorage.setItem('docforge-theme', 'dark');
    } else {
        html.setAttribute('data-theme', 'light');
        DOM.btnTheme.textContent = '☾ Oscuro';
        localStorage.setItem('docforge-theme', 'light');
    }
}

/* ============================================
   10. ARRANQUE
   ============================================ */
document.addEventListener('DOMContentLoaded', initApp);

/* ============================================
   11. REGISTRO DEL SERVICE WORKER (PWA)
   ============================================ */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('./sw.js')
            .then(function(registration) {
                console.log('Service Worker registrado:', registration.scope);
            })
            .catch(function(error) {
                console.log('Error registrando Service Worker:', error);
            });
    });
}