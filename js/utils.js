/* -----------------------------
   Shared State & Helpers
------------------------------ */
let imageList = [];

// NEW: Centralized state for the ISI container
window.isiState = {
  enabled: false,
  isCustom: false, // ADDED: Flag to track if user has saved custom ISI
  x: 0,
  y: 180,
  width: 299,
  height: 69
};

let activeDragTarget = {
  imgData: null,
  animIndex: null // null = base, 0+ = extraAnims
};

// Tooltip label element for selected image or animation
const previewArea = document.getElementById('previewArea');
let labelElement = document.createElement('div');
labelElement.className = 'preview-label';
previewArea.appendChild(labelElement);

/* -----------------------------
   Helper Functions
------------------------------ */

/**
 * Maps a preset name to GSAP `from` values. The `to` values are derived from the element's state.
 * @param {string} presetName - The name of the preset (e.g., 'fadeIn').
 * @param {object} el - The element data object from imageList.
 * @returns {object|null} - GSAP-compatible `from` object or null for 'custom'.
 */
function getPresetGsap(presetName, el) {
    const { width: bannerW, height: bannerH } = typeof getCurrentBannerSize === 'function' ? getCurrentBannerSize() : { width: 300, height: 250 };
    const from = {};

    // CORRECTED: Ensure width/height are numeric for calculations, providing a fallback.
    const numericWidth = parseInt(el.width);
    const fallbackWidth = isNaN(numericWidth) ? 200 : numericWidth; // Default to 200 if width is 'auto' or invalid

    const numericHeight = parseInt(el.height);
    const fallbackHeight = isNaN(numericHeight) ? 100 : numericHeight; // Default to 100 if height is 'auto' or invalid


    switch (presetName) {
        case 'fadeIn':
            from.opacity = 0;
            break;
        case 'slideInLeft':
            from.x = - (el.x + fallbackWidth); // Start fully off-screen left
            break;
        case 'slideInRight':
            from.x = bannerW; // Start fully off-screen right
            break;
        case 'slideInTop':
            from.y = - (el.y + fallbackHeight); // Start fully off-screen top
            break;
        case 'slideInBottom':
            from.y = bannerH; // Start fully off-screen bottom
            break;
        case 'zoomIn':
            from.scale = 0;
            from.opacity = 0;
            break;
        case 'bounce':
            from.y = -300; // Start high above the stage
            from.ease = 'bounce.out'; // This will be applied to the 'to' tween
            break;
        case 'pulse': // Special case, returns a 'to' object
             return { scale: '+=0.1', yoyo: true, repeat: 1, duration: 0.5 };
        // NOTE: fadeOut and zoomOut are handled directly in the animation logic, not here.
        default: // custom
            return null;
    }
    return from;
}


/**
 * Clamp a number between min and max.
 */
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/**
 * Snap value to nearest grid size.
 */
function snapToGrid(val, gridSize = 10) {
  return Math.round(val / gridSize) * gridSize;
}

/**
 * Find image/text data object by element ID.
 */
function getImageDataById(id) {
  return imageList.find(img => img.id === id) || null;
}

/**
 * Highlight a preview image by ID.
 */
function highlightPreview(id) {
  document.querySelectorAll('.preview').forEach(img => img.classList.remove('highlighted'));
  const el = document.getElementById(id);
  if (el) el.classList.add('highlighted');
}

/**
 * Highlight an extra animation block inside a wrapper.
 */
function highlightExtraAnim(wrapper, animIndex) {
  if (!wrapper) return;
  wrapper.querySelectorAll('.extra-anims .exit-controls').forEach((div, i) => {
    if (i === animIndex) {
      div.classList.add('selected');
    } else {
      div.classList.remove('selected');
    }
  });
}

/**
 * Get the final state of an image after all extra animations applied.
 */
function getFinalImageState(img) {
  let state = {
    x: img.x,
    y: img.y,
    scale: img.scale,
    opacity: img.opacity,
    width: img.width,
    height: img.height
  };

  for (const anim of img.extraAnims) {
    state.x += anim.x;
    state.y += anim.y;
    state.opacity = anim.opacity;
    state.scale *= anim.scale;
  }

  return state;
}

/* -----------------------------
   Id helpers: sanitize & uniqueness
------------------------------ */

/**
 * sanitizeId(name)
 * - converts a file name or user string into a safe HTML id
 * - rules:
 *   - lowercases
 *   - replaces spaces and invalid chars with underscore
 *   - strips file extension if present
 *   - ensures id doesn't start with a digit (prefix 'id_' if so)
 */
function sanitizeId(name) {
  if (!name) return '';
  // remove path and keep basename
  const base = name.split(/[\\/]/).pop();
  // remove extension
  const withoutExt = base.replace(/\.[^/.]+$/, '');
  // replace invalid chars with underscore; allow letters, numbers, -, _
  let s = withoutExt.toString().trim().toLowerCase();
  s = s.replace(/[^a-z0-9\-_]+/g, '_'); // replace groups of invalid chars with underscore
  s = s.replace(/^_+|_+$/g, ''); // trim leading/trailing underscores
  if (!s) s = 'id';
  // if starts with digit, prefix
  if (/^[0-9]/.test(s)) s = 'id_' + s;
  return s;
}

/**
 * ensureUniqueId(candidate)
 * - ensures candidate id isn't used by other elements in imageList
 * - if it is, appends _2, _3 etc until unique
 */
function ensureUniqueId(candidate) {
  if (!candidate) candidate = 'id';
  let id = candidate;
  let counter = 1;
  while (imageList.some(el => el.id === id)) {
    counter++;
    id = `${candidate}_${counter}`;
  }
  return id;
}

/**
 * setElementId(imgData, newId)
 * - centralized helper to rename an element's id safely
 * - updates:
 *    - imgData.id
 *    - wrapper.dataset.imgId (if present)
 *    - preview DOM element id (if present in previewArea)
 *    - extraAnims ids (anim.id prefixed)
 *    - layer DOM nodes (layersList dataset)
 * - returns newId
 */
function setElementId(imgData, newId) {
  if (!imgData || !newId) return null;
  const sanitized = sanitizeId(newId);
  const unique = ensureUniqueId(sanitized);

  const oldId = imgData.id;
  imgData.id = unique;

  // update wrapper dataset attribute if available
  try {
    if (imgData.wrapper) imgData.wrapper.dataset.imgId = unique;
    // update any strong label inside wrapper (if you want to show it)
    const strong = imgData.wrapper && imgData.wrapper.querySelector && imgData.wrapper.querySelector('strong');
    if (strong) {
      // keep displayed title as "Image N" or "Text N" — do not overwrite
      // but if fileName exists we leave fileName visible separately
    }
  } catch (err) {
    // ignore
  }

  // update preview DOM element id (if exists)
  const prevEl = document.getElementById(oldId);
  if (prevEl) {
    prevEl.id = unique;
  }

  // update any entries in layers list DOM
  const layerItems = document.querySelectorAll('#layersList .layer-item');
  layerItems.forEach(it => {
    if (it.dataset.imgId === oldId) it.dataset.imgId = unique;
  });

  // update extraAnims ids so they follow new prefix
  if (Array.isArray(imgData.extraAnims)) {
    imgData.extraAnims.forEach((anim, i) => {
      anim.id = `${unique}_anim_${i}`;
    });
  }

  return unique;
}

// expose utils to other modules (they are global functions in this simple app)
window.getPresetGsap = getPresetGsap; // NEW
window.sanitizeId = sanitizeId;
window.ensureUniqueId = ensureUniqueId;
window.setElementId = setElementId;
window.getImageDataById = getImageDataById;
window.snapToGrid = snapToGrid;
window.clamp = clamp;
window.highlightPreview = highlightPreview;
window.highlightExtraAnim = highlightExtraAnim;
window.getFinalImageState = getFinalImageState;