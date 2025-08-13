/* -----------------------------
   Shared State
------------------------------ */
let imageList = [];

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
 * Find image data object by element ID.
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
