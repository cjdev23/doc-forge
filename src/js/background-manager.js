/* ============================================
   BACKGROUND-MANAGER.JS — Doc Forge
   Gestiona fondos decorativos del documento
   y el logo / marca personal.
   ============================================ */

/* ============================================
   1. REFERENCIAS
   ============================================ */
const BG = {
    selector:       null,
    colorPrimary:   null,
    colorSecondary: null,
    logoUpload:     null,
    logoPreviewBox: null,
    logoPreviewImg: null,
    logoPlaceholder:null,
    logoPosition:   null,
    logoSize:       null,
    logoSizeVal:    null,
    brandName:      null,
    brandShow:      null,
    logoRemove:     null,
    btnToggle:      null,
    panel:          null,

    // Datos del logo
    logoData:       null  // base64 de la imagen
};

/* ============================================
   2. INICIALIZACIÓN
   ============================================ */
function initBackgroundManager() {
    BG.selector       = document.getElementById('bg-selector');
    BG.colorPrimary   = document.getElementById('bg-color-primary');
    BG.colorSecondary  = document.getElementById('bg-color-secondary');
    BG.logoUpload      = document.getElementById('logo-upload');
    BG.logoPreviewBox  = document.getElementById('logo-preview-box');
    BG.logoPreviewImg  = document.getElementById('logo-preview-img');
    BG.logoPlaceholder = document.getElementById('logo-placeholder');
    BG.logoPosition    = document.getElementById('logo-position');
    BG.logoSize        = document.getElementById('logo-size');
    BG.logoSizeVal     = document.getElementById('logo-size-val');
    BG.brandName       = document.getElementById('brand-name');
    BG.brandShow       = document.getElementById('brand-show');
    BG.logoRemove      = document.getElementById('logo-remove');
    BG.btnToggle       = document.getElementById('btn-toggle-bg');
    BG.panel           = document.getElementById('bg-panel');

    registerBGEvents();

    // Cargar logo guardado
    loadSavedLogo();
}

/* ============================================
   3. GENERAR HTML DEL FONDO
   ============================================ */
function generateBackgroundHTML() {
    var bgType = BG.selector.value;
    if (bgType === 'none') return '';

    var html = '';

    if (bgType === 'profesional') {
        html = '<div class="doc-background bg-profesional">'
             + '<div class="bg-top-bar"></div>'
             + '<div class="bg-top-bar-shadow"></div>'
             
             + '<div class="bg-diamond-tr"></div>'
             + '<div class="bg-diamond-tr-inner"></div>'
             + '<div class="bg-line-1"></div>'
             + '<div class="bg-line-2"></div>'
             + '<div class="bg-circle-bl"></div>'
             + '<div class="bg-circle-bl-2"></div>'
             + '<div class="bg-bottom-line"></div>'
             + '<div class="bg-corner-accent"></div>'
             + '</div>';
    }

    if (bgType === 'educativo') {
        html = '<div class="doc-background bg-educativo">'
             + '<div class="bg-sidebar"></div>'
             + '<div class="bg-sidebar-shadow"></div>'
             
             + '<div class="bg-dots"></div>'
             + '<div class="bg-triangle-tr"></div>'
             + '<div class="bg-circle-tr"></div>'
             + '<div class="bg-circle-tr-fill"></div>'
             + '<div class="bg-square-br"></div>'
             + '<div class="bg-hex-l"></div>'
             + '<div class="bg-star-r">✦</div>'
             + '<div class="bg-cross-1">+</div>'
             + '<div class="bg-cross-2">+</div>'
             + '<div class="bg-bottom-band"></div>'
             + '</div>';
    }

    if (bgType === 'elegante') {
        html = '<div class="doc-background bg-elegante">'
             + '<div class="bg-frame-outer"></div>'
             + '<div class="bg-frame-inner"></div>'
             + '<div class="bg-corner-tl"></div>'
             + '<div class="bg-corner-tr"></div>'
             + '<div class="bg-corner-bl"></div>'
             + '<div class="bg-corner-br"></div>'
             + '<div class="bg-corner-diamond-tl"></div>'
             + '<div class="bg-corner-diamond-tr"></div>'
             + '<div class="bg-corner-diamond-bl"></div>'
             + '<div class="bg-corner-diamond-br"></div>'
             + '<div class="bg-ornament-top">— ◆ —</div>'
             + '<div class="bg-line-top"></div>'
             + '<div class="bg-vertical-l"></div>'
             + '<div class="bg-vertical-r"></div>'
             + '<div class="bg-medallion"></div>'
             + '<div class="bg-medallion-inner"></div>'
             + '<div class="bg-medallion-diamond"></div>'
             + '<div class="bg-center-ornament">◆ ◆ ◆</div>'
             + '</div>';
    }

    return html;
}

/* ============================================
   4. GENERAR HTML DEL LOGO
   ============================================ */
function generateLogoHTML() {
    if (!BG.logoData && !BG.brandShow.checked) return '';

    var position = BG.logoPosition.value;
    var size = BG.logoSize.value;
    var brandName = BG.brandName.value.trim();
    var showBrand = BG.brandShow.checked;
    var primaryColor = BG.colorPrimary.value;

    var html = '<div class="doc-logo-area pos-' + position + '">';

    if (BG.logoData) {
        html += '<img src="' + BG.logoData + '" '
             +  'style="height:' + size + 'px;" '
             +  'alt="Logo">';
    }

    if (showBrand && brandName) {
        var fontSize = Math.max(Math.round(parseInt(size) * 0.35), 10);
        html += '<span class="doc-brand-name" '
             +  'style="font-size:' + fontSize + 'pt; color:' + primaryColor + ';">'
             +  sanitizeText(brandName)
             +  '</span>';
    }

    html += '</div>';

    // Si no hay logo ni nombre visible, no mostrar nada
    if (!BG.logoData && (!showBrand || !brandName)) return '';

    return html;
}

/* ============================================
   5. GENERAR CSS DE COLORES DEL FONDO
   Inyecta los colores seleccionados como
   variables CSS en la hoja del documento.
   ============================================ */
function generateBackgroundCSS() {
    var primary = BG.colorPrimary.value;
    var secondary = BG.colorSecondary.value;

    return '.page-content {'
         + '  --doc-color-primary: ' + primary + ';'
         + '  --doc-color-secondary: ' + secondary + ';'
         + '}';
}

/* ============================================
   6. APLICAR CAMBIOS AL PREVIEW
   ============================================ */
function applyBackground() {
    // Inyectar CSS de colores
    var styleEl = document.getElementById('bg-colors-style');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'bg-colors-style';
        document.head.appendChild(styleEl);
    }
    styleEl.textContent = generateBackgroundCSS();

    // Actualizar valor del slider
    BG.logoSizeVal.textContent = BG.logoSize.value;

    // Actualizar preview
    if (typeof updatePreview === 'function') {
        updatePreview();
    }
}

/* ============================================
   7. MANEJO DEL LOGO — Subida de imagen
   ============================================ */
function handleLogoUpload(event) {
    var file = event.target.files[0];
    if (!file) return;

    // Validar tipo
    var validTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
    if (validTypes.indexOf(file.type) === -1) {
        showNotification('Formato no soportado. Usa PNG, JPG, SVG o WebP');
        return;
    }

    // Validar tamaño (máximo 500KB)
    if (file.size > 500 * 1024) {
        showNotification('El logo debe pesar menos de 500KB');
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
        BG.logoData = e.target.result;

        // Mostrar preview
        BG.logoPreviewImg.src = BG.logoData;
        BG.logoPreviewImg.classList.add('visible');
        BG.logoPlaceholder.style.display = 'none';

        // Guardar en localStorage
        saveLogo();

        // Actualizar documento
        applyBackground();
    };
    reader.readAsDataURL(file);
}

function removeLogo() {
    BG.logoData = null;
    BG.logoPreviewImg.src = '';
    BG.logoPreviewImg.classList.remove('visible');
    BG.logoPlaceholder.style.display = '';
    BG.logoUpload.value = '';

    localStorage.removeItem('docforge-logo');
    applyBackground();
}

function saveLogo() {
    if (BG.logoData) {
        try {
            localStorage.setItem('docforge-logo', BG.logoData);
        } catch (e) {
            console.warn('Logo muy grande para localStorage');
        }
    }
}

function loadSavedLogo() {
    var saved = localStorage.getItem('docforge-logo');
    if (saved) {
        BG.logoData = saved;
        BG.logoPreviewImg.src = saved;
        BG.logoPreviewImg.classList.add('visible');
        BG.logoPlaceholder.style.display = 'none';
    }
}

/* ============================================
   8. TOGGLE — Mostrar/ocultar panel
   ============================================ */
function toggleBGPanel() {
    var isVisible = !BG.panel.classList.contains('collapsed');
    if (isVisible) {
        BG.panel.classList.add('collapsed');
        BG.btnToggle.textContent = 'Mostrar';
    } else {
        BG.panel.classList.remove('collapsed');
        BG.btnToggle.textContent = 'Ocultar';
    }
}

/* ============================================
   9. REGISTRO DE EVENTOS
   ============================================ */
function registerBGEvents() {
    // Cambios en controles
    var inputs = [
        BG.selector, BG.colorPrimary, BG.colorSecondary,
        BG.logoPosition, BG.logoSize, BG.brandName, BG.brandShow
    ];

    inputs.forEach(function(input) {
        if (input) {
            input.addEventListener('input', applyBackground);
            input.addEventListener('change', applyBackground);
        }
    });

    // Subida de logo
    BG.logoPreviewBox.addEventListener('click', function() {
        BG.logoUpload.click();
    });
    BG.logoUpload.addEventListener('change', handleLogoUpload);

    // Quitar logo
    BG.logoRemove.addEventListener('click', removeLogo);

    // Toggle panel
    BG.btnToggle.addEventListener('click', toggleBGPanel);
}

/* ============================================
   10. ARRANQUE
   ============================================ */
document.addEventListener('DOMContentLoaded', initBackgroundManager);