/* -----------------------------
   UI Controls: Create and Manage Image Blocks + Text Blocks
   (Extra-animation lock moved to Layers icons; no lock checkbox in control blocks)
   UPDATED: added Remove button for base Image/Text, reindexing after removal,
   and text element style toggles: italic, underline, bold.
   NEW: per-layer click tag UI & model fields (hasClickTag, clickTagUrl)
   NEW: Animation presets dropdown
   MODIFIED: Preset dropdowns for extra animations are now dynamic, enforcing an in/out sequence.
------------------------------ */

/* NOTE: this file expects utils.js to expose:
   sanitizeId, ensureUniqueId, setElementId, imageList, activeDragTarget, previewArea,
   updatePreviewAndCode, renderLayers (renderLayers defined below)
*/


/**
 * Helper to generate the HTML for preset animation options.
 * MODIFIED: Now accepts a context to filter for "in" or "out" animations.
 * @param {string} context - 'all', 'require-in', or 'require-out'.
 * @returns {string} HTML string of <option> elements.
 */
 function getPresetOptionsHTML(context = 'all') {
  const neutralOptions = `
      <option value="custom">Custom</option>
      <option value="pulse">Pulse</option>
  `;

  const inOptions = `
      <option value="fadeIn">Fade In</option>
      <option value="slideInLeft">Slide In From Left</option>
      <option value="slideInRight">Slide In From Right</option>
      <option value="slideInTop">Slide In From Top</option>
      <option value="slideInBottom">Slide In From Bottom</option>
      <option value="zoomIn">Zoom In</option>
      <option value="bounce">Bounce In</option>
  `;

  const outOptions = `
      <option value="fadeOut">Fade Out</option>
      <option value="zoomOut">Zoom Out</option>
      <option value="slideOutLeft">Slide Out To Left</option>
      <option value="slideOutRight">Slide Out To Right</option>
      <option value="slideOutTop">Slide Out To Top</option>
      <option value="slideOutBottom">Slide Out To Bottom</option>
  `;

  switch (context) {
      case 'require-in':
          return neutralOptions + inOptions;
      case 'require-out':
          return neutralOptions + outOptions;
      case 'all':
      default:
          return neutralOptions + inOptions + outOptions;
  }
}


/* -----------------------------
 Helpers
------------------------------ */

/**
* getSelectedLayerData()
* - prefer activeDragTarget.imgData, else find .layer-item.selected, else fallback to last item
*/
function getSelectedLayerData() {
if (activeDragTarget && activeDragTarget.imgData) return activeDragTarget.imgData;
const sel = document.querySelector('#layersList .layer-item.selected');
if (sel) {
  const id = sel.dataset.imgId;
  const found = imageList.find(i => i.id === id);
  if (found) return found;
}
// fallback to last (most recently added) element so duplicate still works
if (imageList.length) return imageList[imageList.length - 1];
return null;
}

/* -----------------------------
 Click Tag helpers (new)
------------------------------ */

const CLICKTAG_URL_RE = /^https?:\/\/.+/i;

function createClickTagForm(wrapper, imgData) {
// find container
let container = wrapper.querySelector('.click-tag-container');
if (!container) {
  container = document.createElement('div');
  container.className = 'click-tag-container';
  wrapper.appendChild(container);
}
container.innerHTML = ''; // clear

const form = document.createElement('div');
form.className = 'click-tag-form';
form.innerHTML = `
  <input type="text" class="clickTagUrlInput" placeholder="https://example.com" />
  <button type="button" class="save-clicktag"><i class="fa-solid fa-check"></i></button>
  <button type="button" class="remove-clicktag" title="Remove click tag"><i class="fa-solid fa-trash"></i></button>
`;

container.appendChild(form);

const urlInput = form.querySelector('.clickTagUrlInput');
const saveBtn = form.querySelector('.save-clicktag');
const removeBtn = form.querySelector('.remove-clicktag');

// prefill if present
urlInput.value = imgData.clickTagUrl || '';

saveBtn.addEventListener('click', (ev) => {
  ev.stopPropagation();
  const val = urlInput.value.trim();
  if (!val) {
    alert('Please enter a URL starting with http:// or https:// or click Remove to clear.');
    return;
  }
  if (!CLICKTAG_URL_RE.test(val)) {
    alert('URL must start with http:// or https://');
    return;
  }
  imgData.hasClickTag = true;
  imgData.clickTagUrl = val;
  // visual marker
  wrapper.classList.add('layer-has-clicktag');
  updatePreviewAndCode();
  renderLayers();
});

removeBtn.addEventListener('click', (ev) => {
  ev.stopPropagation();
  imgData.hasClickTag = false;
  imgData.clickTagUrl = '';
  // remove form entirely and hide container
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
  // remove visual marker on wrapper if exists
  wrapper.classList.remove('layer-has-clicktag');
  updatePreviewAndCode();
  renderLayers();
});
}

/**
* ensureClickTagUI(wrapper, imgData)
* - Creates "Add Click Tag" button if not present and sets up behavior.
*/
function ensureClickTagUI(wrapper, imgData) {
// add area for click-tag controls near bottom of wrapper
let ctl = wrapper.querySelector('.click-tag-ctl');
if (!ctl) {
  ctl = document.createElement('div');
  ctl.className = 'click-tag-ctl';
  ctl.style.marginTop = '8px';
  wrapper.appendChild(ctl);
}

// If button already there, skip adding duplicate
if (!ctl.querySelector('.addClickTag')) {
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'addClickTag';
  addBtn.textContent = imgData.hasClickTag ? 'Edit Click Tag' : 'Add Click Tag';
  addBtn.style.marginRight = '8px';

  addBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    // Toggle/show the clickTag form
    const existing = wrapper.querySelector('.click-tag-container');
    if (existing) {
      // toggle visibility: remove if visible
      existing.parentNode.removeChild(existing);
      addBtn.textContent = imgData.hasClickTag ? 'Edit Click Tag' : 'Add Click Tag';
      return;
    }
    // create form and open
    createClickTagForm(wrapper, imgData);
    addBtn.textContent = 'Close';
    // ensure the input is focused
    setTimeout(() => {
      const inp = wrapper.querySelector('.clickTagUrlInput');
      if (inp) inp.focus();
    }, 30);
  });

  ctl.appendChild(addBtn);
}

// add hidden visual marker for hasClickTag (class applied when active)
if (imgData.hasClickTag) wrapper.classList.add('layer-has-clicktag');
else wrapper.classList.remove('layer-has-clicktag');
}

/* -----------------------------
 Helpers for locks/animation locks ------------------------------ */

function applyLockStateToWrapper(imgData) {
if (!imgData || !imgData.wrapper) return;
const wrapper = imgData.wrapper;
const posX = wrapper.querySelector('.posX');
const posY = wrapper.querySelector('.posY');
if (posX) posX.disabled = !!imgData.locked;
if (posY) posY.disabled = !!imgData.locked;

if (imgData.locked) wrapper.classList.add('locked-block');
else wrapper.classList.remove('locked-block');
}

/**
* applyAnimLockStateToWrapper(imgData, animIndex)
* - disables/enables animX/animY inputs inside the control block for the given anim index
*/
function applyAnimLockStateToWrapper(imgData, animIndex) {
if (!imgData || !imgData.wrapper) return;
const animDiv = imgData.wrapper.querySelectorAll('.extra-anims .exit-controls')[animIndex];
if (!animDiv) return;

const xInput = animDiv.querySelector('.animX');
const yInput = animDiv.querySelector('.animY');
if (xInput) xInput.disabled = !!(imgData.extraAnims[animIndex]?.locked);
if (yInput) yInput.disabled = !!(imgData.extraAnims[animIndex]?.locked);

// small visual indicator on the animDiv when locked
if (imgData.extraAnims[animIndex]?.locked) animDiv.classList.add('anim-locked');
else animDiv.classList.remove('anim-locked');
}

/**
* applyAllAnimLocksForWrapper(imgData)
* - ensures every anim control block matches its anim.locked state
*/
function applyAllAnimLocksForWrapper(imgData) {
if (!imgData || !imgData.wrapper) return;
imgData.extraAnims.forEach((a, ai) => {
  applyAnimLockStateToWrapper(imgData, ai);
});
}

/* -----------------------------
 Removal / Reindex helpers
------------------------------ */

/**
* removeLayerAtIndex(index)
* - remove model from imageList, preview, wrapper DOM
* - reindex remaining layers for friendly names and anim ids
* - preserve preview DOM ids (don't rename) to avoid breaking exports
*/
function removeLayerAtIndex(index) {
if (typeof index !== 'number' || index < 0 || index >= imageList.length) return;

const removed = imageList.splice(index, 1)[0];
if (!removed) return;

// remove preview node if present
try {
  if (removed.previewImg && removed.previewImg.parentNode === previewArea) {
    previewArea.removeChild(removed.previewImg);
  }
} catch (err) {}

// remove wrapper DOM
try {
  if (removed.wrapper && removed.wrapper.parentNode) {
    removed.wrapper.parentNode.removeChild(removed.wrapper);
  }
} catch (err) {}

// if selection pointed to removed item, move selection to nearest item
if (activeDragTarget && activeDragTarget.imgData === removed) {
  const newSelection = imageList[index] || imageList[index - 1] || null;
  activeDragTarget = newSelection ? { imgData: newSelection, animIndex: null } : { imgData: null, animIndex: null };
}

// reindex friendly names and rebuild extra anim ids/DOM
reindexAfterRemoval();

// re-render layers and preview code
renderLayers();
updatePreviewAndCode();
}

/**
* reindexAfterRemoval()
* - updates layerName, wrapper strong label, wrapper.dataset.imgId (keeps imageData.id unchanged)
* - regenerates anim.id values to follow the pattern `${imageData.id}_anim_<i>`
* - rebuilds extra animations DOM so labels and inputs are sequential
*/
function reindexAfterRemoval() {
for (let i = 0; i < imageList.length; i++) {
  const img = imageList[i];

  // Friendly layer name: keep "Image N" / "Text N"
  const friendly = img.type === 'text' ? `Text ${i + 1}` : `Image ${i + 1}`;
  img.layerName = friendly;

  // Update wrapper header and dataset
  if (img.wrapper) {
    try {
      const strong = img.wrapper.querySelector('strong');
      if (strong) strong.textContent = friendly;
      // keep wrapper.dataset.imgId mapped to img.id (not renumbered)
      img.wrapper.dataset.imgId = img.id;
    } catch (e) {}
  }

  // Re-generate extra anim ids and rebuild controls
  if (Array.isArray(img.extraAnims)) {
    img.extraAnims.forEach((anim, ai) => {
      anim.id = `${img.id}_anim_${ai}`;
    });
    if (img.wrapper) rebuildExtraAnimBlocks(img.wrapper, img);
  }
}
}

/* -----------------------------
 Duplicate functionality
 - duplicateLayer(img) duplicates the given model
 - global duplicate button (#duplicateLayerBtn) will duplicate currently selected layer
------------------------------ */

function duplicateLayer(img) {
if (!img) return;

const isText = img.type === 'text';
const isImage = img.type === 'image';

// clone model (deep copy) but remove DOM references
const cloneModel = JSON.parse(JSON.stringify(img));
delete cloneModel.wrapper;
delete cloneModel.previewImg;

const baseName = (cloneModel.fileName || cloneModel.layerName || cloneModel.id || (isText ? 'text' : 'img')).toString();
const sanitized = sanitizeId(baseName);
const newIdCandidate = ensureUniqueId(sanitized);

// create fresh control block (this sets a sensible layerName like "Image N")
if (isText) {
  createTextControlBlock(imageList.length);
} else {
  createControlBlock(imageList.length);
}

// newly-created model is appended by create*ControlBlock
const newData = imageList[imageList.length - 1];
const wrapper = newData.wrapper;

// Copy over fields (DO NOT overwrite newData.layerName produced by create*ControlBlock)
newData.type = cloneModel.type;
newData.visible = !!cloneModel.visible;
newData.preset = cloneModel.preset || 'custom'; // DUPLICATE PRESET
newData.fileName = cloneModel.fileName || '';
newData.src = cloneModel.src || '';
newData.text = cloneModel.text || '';
newData.fontFamily = cloneModel.fontFamily || newData.fontFamily;
newData.fontSize = cloneModel.fontSize || newData.fontSize;
newData.color = cloneModel.color || newData.color;

// new: copy italic/underline/bold flags for text
if (isText) {
  newData.italic = !!cloneModel.italic;
  newData.underline = !!cloneModel.underline;
  newData.bold = !!cloneModel.bold;
}

// copy clickTag fields (new)
newData.hasClickTag = !!cloneModel.hasClickTag;
newData.clickTagUrl = cloneModel.clickTagUrl || '';

newData.x = Number(cloneModel.x) || 0;
newData.y = Number(cloneModel.y) || 0;
newData.width = cloneModel.width || (isImage ? 100 : 'auto');
newData.height = cloneModel.height || 'auto';
newData.opacity = typeof cloneModel.opacity === 'number' ? cloneModel.opacity : 1;
newData.scale = typeof cloneModel.scale === 'number' ? cloneModel.scale : 1;
newData.delay = typeof cloneModel.delay === 'number' ? cloneModel.delay : 0;
newData.breakpoint = !!cloneModel.breakpoint;
newData.locked = false;

// assign id (keeps preview DOM id consistent)
setElementId(newData, newIdCandidate);

// sync the control block header (<strong>) to the friendly layerName (Image N / Text N)
try {
  const strong = wrapper.querySelector('strong');
  if (strong) strong.textContent = newData.layerName || (isText ? `Text ${imageList.length}` : `Image ${imageList.length}`);
} catch (e) {}

// propagate input values into wrapper controls
const setVal = (sel, val) => {
  const el = wrapper.querySelector(sel);
  if (!el) return;
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') el.value = val;
  else el.textContent = val;
};
setVal('.posX', newData.x);
setVal('.posY', newData.y);
setVal('.imgWidth', newData.width);
setVal('.opacity', newData.opacity);
setVal('.scale', newData.scale);
setVal('.delay', newData.delay);

// UPDATE UI FOR PRESET
const presetSelect = wrapper.querySelector('.preset-select');
const customControls = wrapper.querySelector('.custom-controls');
if (presetSelect) presetSelect.value = newData.preset;
if(customControls) customControls.style.display = newData.preset === 'custom' ? 'block' : 'none';


if (isImage) {
  const fn = wrapper.querySelector('.fileNameDisplay');
  if (fn) fn.textContent = newData.fileName || '';

  if (newData.src) {
    const previewImg = document.createElement('img');
    previewImg.src = newData.src;
    previewImg.id = newData.id;
    previewImg.classList.add('preview');
    previewArea.appendChild(previewImg);
    newData.previewImg = previewImg;
  }
} else if (isText) {
  const ta = wrapper.querySelector('.textContent');
  if (ta) ta.value = cloneModel.text || '';
  setVal('.fontSize', cloneModel.fontSize || newData.fontSize);
  const col = wrapper.querySelector('.fontColor');
  if (col) col.value = cloneModel.color || newData.color;

  // new: wire italic/underline/bold checkboxes for duplicate
  const italicCheckbox = wrapper.querySelector('.fontItalic');
  const underlineCheckbox = wrapper.querySelector('.fontUnderline');
  const boldCheckbox = wrapper.querySelector('.fontBold');
  newData.italic = !!cloneModel.italic;
  newData.underline = !!cloneModel.underline;
  newData.bold = !!cloneModel.bold;
  if (italicCheckbox) italicCheckbox.checked = !!newData.italic;
  if (underlineCheckbox) underlineCheckbox.checked = !!newData.underline;
  if (boldCheckbox) boldCheckbox.checked = !!newData.bold;

  const textEl = document.createElement('div');
  textEl.className = 'banner-text preview';
  textEl.id = newData.id;
  textEl.textContent = cloneModel.text || '';
  textEl.style.left = (newData.x || 0) + 'px';
  textEl.style.top = (newData.y || 0) + 'px';
  textEl.style.fontSize = (newData.fontSize || cloneModel.fontSize || 14) + 'px';
  textEl.style.color = cloneModel.color || '#000';
  textEl.style.fontStyle = newData.italic ? 'italic' : 'normal';
  textEl.style.textDecoration = newData.underline ? 'underline' : 'none';
  textEl.style.fontWeight = newData.bold ? 'bold' : 'normal';
  previewArea.appendChild(textEl);
  newData.previewImg = textEl;
}

// copy and rebuild extra anims
newData.extraAnims = Array.isArray(cloneModel.extraAnims) ? cloneModel.extraAnims.map((a, i) => {
  return {
    id: `${newData.id}_anim_${i}`,
    preset: a.preset || 'custom', // DUPLICATE PRESET FOR EXTRA ANIMS
    x: Number(a.x) || 0,
    y: Number(a.y) || 0,
    opacity: typeof a.opacity === 'number' ? a.opacity : 1,
    scale: typeof a.scale === 'number' ? a.scale : 1,
    delay: typeof a.delay === 'number' ? a.delay : 1,
    locked: false
  };
}) : [];

rebuildExtraAnimBlocks(wrapper, newData); // This will now build the UI with presets


const bp = wrapper.querySelector('.breakpoint');
if (bp) bp.checked = !!newData.breakpoint;

applyLockStateToWrapper(newData);
applyAllAnimLocksForWrapper(newData);

// ensure click-tag UI exists and reflects copied clickTag state
ensureClickTagUI(wrapper, newData);
if (newData.hasClickTag) {
  // create form with existing url
  createClickTagForm(wrapper, newData);
}

renderLayers();
updatePreviewAndCode();

activeDragTarget = { imgData: newData, animIndex: null };
highlightPreview(newData.id);
renderLayers();

try { newData.wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
}


/* Global duplicate button wiring (if you have an overall duplicate button in toolbar)
 It will use current selection (activeDragTarget) or selected layer in layers panel.
*/
const globalDuplicateBtn = document.getElementById('duplicateLayerBtn');
if (globalDuplicateBtn) {
globalDuplicateBtn.addEventListener('click', (ev) => {
  ev.preventDefault();
  const sel = getSelectedLayerData();
  if (!sel) {
    alert('No layer selected to duplicate.');
    return;
  }
  duplicateLayer(sel);
});
}

/* -----------------------------
 Create Control Blocks
------------------------------ */

function createControlBlock(index) {
const controls = document.getElementById('controls');

// temporary base id; will be replaced on file upload with sanitized filename
const baseId = `img${index + 1}`;

const wrapper = document.createElement('div');
wrapper.classList.add('image-block');
wrapper.dataset.imgId = baseId;
wrapper.innerHTML = `
  <div style="display: flex;justify-content: space-between;align-items: center; padding-bottom:10px">
    <strong style="padding:0px">Image ${index + 1}</strong>
    <button class="removeBase" id="toggleLeftPanel" title="Collapse Panel"><i class="fa-solid fa-xmark"></i></button>
  </div>

  <input type="file" class="imageUpload" accept="image/*" />
  <span class="fileNameDisplay" style="font-size: 13px; color: #555; margin-left: 8px;"></span><br />

  <div class="animation-controls" style="margin-top: 8px;">
      <label>Animation Preset:
          <select class="preset-select" style="width: 100%; margin-top: 4px; margin-bottom: 8px;">
              ${getPresetOptionsHTML('all')}
          </select>
      </label>

      <div class="custom-controls">
          <div class="coords">
            <label>X: <input type="number" class="posX" value="0" /></label>
            <label>Y: <input type="number" class="posY" value="0" /></label>
          </div>
          Width: <input type="number" class="imgWidth" value="100" />
          Opacity: <input type="number" class="opacity" step="0.1" value="1" />
          Scale: <input type="number" class="scale" step="0.1" value="1" />
      </div>
      Position (Time): <input type="number" class="delay" step="0.1" value="0" /> <br />
  </div>

  <div style="display:flex;gap:8px;margin-top:8px;">
    <button class="addExtraAnim">+ Add Extra Animation</button>
  </div>
  <div class="extra-anims"></div>
  <!-- click tag controls -->
  <div class="click-tag-ctl"></div>
  <div class="click-tag-container"></div>
`;
controls.appendChild(wrapper);

const imageData = {
  id: baseId,
  type: 'image',
  layerName: `Image ${index + 1}`,
  visible: true,
  preset: 'custom', // NEW: Default preset

  fileName: '',
  src: '',
  x: 0, y: 0,
  width: 100,
  height: 'auto',
  opacity: 1,
  delay: 0,
  scale: 1,
  extraAnims: [],
  previewImg: null,
  breakpoint: false,
  locked: false,
  wrapper,

  // click-tag fields (new)
  hasClickTag: false,
  clickTagUrl: ''
};

imageList.push(imageData);

const presetSelect = wrapper.querySelector('.preset-select');
const customControls = wrapper.querySelector('.custom-controls');

presetSelect.addEventListener('change', () => {
  imageData.preset = presetSelect.value;
  customControls.style.display = imageData.preset === 'custom' ? 'block' : 'none';
  // When base preset changes, must rebuild extra anims to update their options
  rebuildExtraAnimBlocks(wrapper, imageData);
  updatePreviewAndCode();
  renderLayers();
});


// ensure click-tag UI exists
ensureClickTagUI(wrapper, imageData);

// Select this block when clicked
wrapper.addEventListener('click', () => {
  activeDragTarget = { imgData: imageData, animIndex: null };
  highlightPreview(imageData.id);
  highlightExtraAnim(wrapper, null);
  updatePreviewAndCode();
  renderLayers();
});

// Update data when inputs change
const updateFromInputs = () => {
  imageData.x = parseInt(wrapper.querySelector('.posX').value) || 0;
  imageData.y = parseInt(wrapper.querySelector('.posY').value) || 0;
  imageData.width = parseInt(wrapper.querySelector('.imgWidth').value) || 100;
  imageData.height = 'auto';
  imageData.opacity = parseFloat(wrapper.querySelector('.opacity').value) || 0;
  imageData.scale = parseFloat(wrapper.querySelector('.scale').value) || 1;
  imageData.delay = parseFloat(wrapper.querySelector('.delay').value) || 0;

  updatePreviewAndCode();
  renderLayers();
};

// Attach input handlers
wrapper.querySelectorAll('input').forEach(input => {
  input.addEventListener('input', updateFromInputs);
});

// Remove base control handler (NEW)
const removeBtn = wrapper.querySelector('.removeBase');
removeBtn.addEventListener('click', (ev) => {
  ev.stopPropagation();
  const idx = imageList.indexOf(imageData);
  if (idx === -1) return;
  if (!confirm(`Remove ${imageData.layerName || imageData.id || 'this layer'}?`)) return;
  removeLayerAtIndex(idx);
});

// Add extra animation
wrapper.querySelector('.addExtraAnim').addEventListener('click', (e) => {
  e.stopPropagation();
  const animIndex = imageData.extraAnims.length;
  const anim = { id: `${imageData.id}_anim_${animIndex}`, preset: 'custom', x: 0, y: 0, opacity: 1, delay: 1, scale: 1, locked: false };

  // Lock previous animations
  imageData.extraAnims.forEach((prevAnim, i) => {
    prevAnim.locked = true;
    applyAnimLockStateToWrapper(imageData, i);
  });

  imageData.extraAnims.push(anim);

  // Lock base image
  imageData.locked = true;
  applyLockStateToWrapper(imageData);

  rebuildExtraAnimBlocks(wrapper, imageData);

  updatePreviewAndCode();
  renderLayers();
});

// File upload handler (set id from filename)
const fileInput = wrapper.querySelector('.imageUpload');
fileInput.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  wrapper.querySelector('.fileNameDisplay').textContent = file.name;

  const reader = new FileReader();
  reader.onload = function (event) {
    imageData.src = event.target.result;
    imageData.fileName = file.name;

    // determine id from filename (sanitize & ensure unique)
    const sanitized = sanitizeId(file.name);
    const unique = ensureUniqueId(sanitized);

    // centralized update of id across model and DOM
    setElementId(imageData, unique);

    // Remove old preview image if present
    if (imageData.previewImg && imageData.previewImg.parentNode === previewArea) {
      previewArea.removeChild(imageData.previewImg);
    }

    // Create new preview img element
    const img = document.createElement('img');
    img.src = imageData.src;
    img.classList.add('preview');
    img.id = imageData.id;
    previewArea.appendChild(img);
    imageData.previewImg = img;

    updatePreviewAndCode();
    renderLayers();
  };
  reader.readAsDataURL(file);
});
}

/* -------------------------------------------------------
 Text control block (new)
 - includes Remove button for base text
 - supports italic, underline & bold
--------------------------------------------------------- */
function createTextControlBlock(index) {
const controls = document.getElementById('controls');

const baseId = `text${index + 1}`;

const wrapper = document.createElement('div');
wrapper.classList.add('image-block', 'text-block');
wrapper.dataset.imgId = baseId;
wrapper.innerHTML = `
  <div style="display: flex;justify-content: space-between;align-items: center; padding-bottom:10px">
    <strong style="padding:0px">Text ${index + 1}</strong>
    <button class="removeBase" id="toggleLeftPanel" title="Collapse Panel"><i class="fa-solid fa-xmark"></i></button>
  </div>

  <div style="margin-top:8px;">
    <textarea class="textContent" rows="2" placeholder="Enter text..."></textarea>
  </div>
  <div style="margin-top:8px; display:flex; gap:12px; align-items:center;flex-wrap:wrap;">
    <label style="display:flex; gap:6px; align-items:center;">
      Font Size: <input type="number" class="fontSize" value="14" style="width:72px;" />
    </label>
    <label style="display:flex; gap:6px; align-items:center;">
      Color: <input type="color" class="fontColor" value="#000000" />
    </label>
    <label style="display:flex; gap:6px; align-items:center; margin-left:8px;">
      <input type="checkbox" class="fontItalic" /> <small>Italic</small>
    </label>
    <label style="display:flex; gap:6px; align-items:center;">
      <input type="checkbox" class="fontUnderline" /> <small>Underline</small>
    </label>
    <label style="display:flex; gap:6px; align-items:center;">
      <input type="checkbox" class="fontBold" /> <small>Bold</small>
    </label>
  </div>

  <div class="animation-controls" style="margin-top:8px;">
    <label>Animation Preset:
        <select class="preset-select" style="width: 100%; margin-top: 4px; margin-bottom: 8px;">
            ${getPresetOptionsHTML('all')}
        </select>
    </label>

    <div class="custom-controls">
      <div class="coords">
        <label>X: <input type="number" class="posX" value="0" /></label>
        <label>Y: <input type="number" class="posY" value="0" /></label>
      </div>
      Width: <input type="number" class="txtWidth" value="200" />
      Opacity: <input type="number" class="opacity" step="0.1" value="1" />
      Scale: <input type="number" class="scale" step="0.1" value="1" />
    </div>
    Position (Time): <input type="number" class="delay" step="0.1" value="0" /> <br />
  </div>

  <div style="display:flex;gap:8px;margin-top:8px;">
    <button class="addExtraAnim">+ Add Extra Animation</button>
  </div>

  <div class="extra-anims"></div>

  <!-- click tag controls -->
  <div class="click-tag-ctl"></div>
  <div class="click-tag-container"></div>
`;
controls.appendChild(wrapper);

const textData = {
  id: baseId,
  type: 'text',
  layerName: `Text ${index + 1}`,
  visible: true,
  preset: 'custom', // NEW

  text: '',
  fontFamily: 'Arial, sans-serif',
  fontSize: 14,
  color: '#000000',
  italic: false,
  underline: false,
  bold: false,
  width: 200,

  x: 0, y: 0,
  height: 'auto',
  opacity: 1,
  scale: 1,
  delay: 0,
  extraAnims: [],
  previewImg: null,
  breakpoint: false,
  locked: false,
  wrapper,

  hasClickTag: false,
  clickTagUrl: ''
};

imageList.push(textData);

const presetSelect = wrapper.querySelector('.preset-select');
const customControls = wrapper.querySelector('.custom-controls');

presetSelect.addEventListener('change', () => {
  textData.preset = presetSelect.value;
  customControls.style.display = textData.preset === 'custom' ? 'block' : 'none';
  // When base preset changes, must rebuild extra anims to update their options
  rebuildExtraAnimBlocks(wrapper, textData);
  updatePreviewAndCode();
  renderLayers();
});

// ensure click-tag UI exists
ensureClickTagUI(wrapper, textData);

// Preview text element
const textEl = document.createElement('div');
textEl.className = 'banner-text preview';
textEl.id = textData.id;
textEl.textContent = '';
textEl.style.position = 'absolute';
textEl.style.left = '0px';
textEl.style.top = '0px';
textEl.style.fontSize = `${textData.fontSize}px`;
textEl.style.color = textData.color;
textEl.style.fontStyle = textData.italic ? 'italic' : 'normal';
textEl.style.textDecoration = textData.underline ? 'underline' : 'none';
textEl.style.fontWeight = textData.bold ? 'bold' : 'normal';
textEl.style.width = textData.width + 'px'; // NEW
textEl.style.wordWrap = 'break-word';
previewArea.appendChild(textEl);
textData.previewImg = textEl;

// Select this block when clicked
wrapper.addEventListener('click', () => {
  activeDragTarget = { imgData: textData, animIndex: null };
  highlightPreview(textData.id);
  highlightExtraAnim(wrapper, null);
  updatePreviewAndCode();
  renderLayers();
});

// Remove base control handler
wrapper.querySelector('.removeBase').addEventListener('click', (ev) => {
  ev.stopPropagation();
  const idx = imageList.indexOf(textData);
  if (idx === -1) return;
  if (!confirm(`Remove ${textData.layerName || textData.id || 'this layer'}?`)) return;
  removeLayerAtIndex(idx);
});

const updateFromInputs = () => {
  textData.text = wrapper.querySelector('.textContent').value || '';
  textData.fontSize = parseInt(wrapper.querySelector('.fontSize').value) || 14;
  textData.color = wrapper.querySelector('.fontColor').value || '#000000';
  textData.italic = !!wrapper.querySelector('.fontItalic').checked;
  textData.underline = !!wrapper.querySelector('.fontUnderline').checked;
  textData.bold = !!wrapper.querySelector('.fontBold').checked;
  textData.width = parseInt(wrapper.querySelector('.txtWidth').value) || 200; // NEW

  textData.x = parseInt(wrapper.querySelector('.posX').value) || 0;
  textData.y = parseInt(wrapper.querySelector('.posY').value) || 0;
  textData.opacity = parseFloat(wrapper.querySelector('.opacity').value) || 1;
  textData.scale = parseFloat(wrapper.querySelector('.scale').value) || 1;
  textData.delay = parseFloat(wrapper.querySelector('.delay').value) || 0;

  if (textData.previewImg) {
    const el = textData.previewImg;
    el.textContent = textData.text;
    el.style.fontSize = `${textData.fontSize}px`;
    el.style.color = textData.color;
    el.style.fontStyle = textData.italic ? 'italic' : 'normal';
    el.style.textDecoration = textData.underline ? 'underline' : 'none';
    el.style.fontWeight = textData.bold ? 'bold' : 'normal';
    el.style.width = textData.width + 'px'; // NEW
    el.style.left = textData.x + 'px';
    el.style.top = textData.y + 'px';
  }

  updatePreviewAndCode();
  renderLayers();
};

wrapper.querySelectorAll('input, textarea').forEach(input => input.addEventListener('input', updateFromInputs));
wrapper.querySelectorAll('.fontItalic, .fontUnderline, .fontBold').forEach(cb => {
  cb.addEventListener('change', updateFromInputs);
});

wrapper.querySelector('.addExtraAnim').addEventListener('click', (e) => {
  e.stopPropagation();
  const animIndex = textData.extraAnims.length;
  const anim = { id: `${textData.id}_anim_${animIndex}`, preset: 'custom', x: 0, y: 0, opacity: 1, delay: 1, scale: 1, locked: false };

  textData.extraAnims.forEach((prevAnim, i) => {
    prevAnim.locked = true;
    applyAnimLockStateToWrapper(textData, i);
  });

  textData.extraAnims.push(anim);
  textData.locked = true;
  applyLockStateToWrapper(textData);

  rebuildExtraAnimBlocks(wrapper, textData);

  updatePreviewAndCode();
  renderLayers();
});
}

/* -------------------------------------------------------
 Utility to rebuild extra animation blocks (labels/ids) after a removal
 MODIFIED: Now builds preset dropdowns dynamically based on the previous animation's type.
--------------------------------------------------------- */
function rebuildExtraAnimBlocks(wrapper, imageData) {
const extraContainer = wrapper.querySelector('.extra-anims');
extraContainer.innerHTML = '';

const inPresets = ['fadeIn', 'slideInLeft', 'slideInRight', 'slideInTop', 'slideInBottom', 'zoomIn', 'bounce'];
const outPresets = ['fadeOut', 'zoomOut', 'slideOutLeft', 'slideOutRight', 'slideOutTop', 'slideOutBottom'];

imageData.extraAnims.forEach((anim, ai) => {
  anim.id = `${imageData.id}_anim_${ai}`;
  anim.preset = anim.preset || 'custom';

  // Determine the type of the previous animation to set the context for the current dropdown
  const previousPreset = (ai === 0) ? imageData.preset : imageData.extraAnims[ai - 1].preset;
  let context = 'all';
  if (inPresets.includes(previousPreset)) {
    context = 'require-out';
  } else if (outPresets.includes(previousPreset)) {
    context = 'require-in';
  }

  // Generate the appropriate options
  const optionsHTML = getPresetOptionsHTML(context);

  const animDiv = document.createElement('div');
  animDiv.classList.add('exit-controls');
  animDiv.innerHTML = `
  <div style="display: flex;justify-content: space-between;align-items: center; padding-bottom:10px">
    <strong style="padding:0px">Extra Animation ${ai + 1}</strong>
    <button class="removeAnim" id="toggleLeftPanel" title="Collapse Panel"><i class="fa-solid fa-xmark"></i></button>
  </div>
    <div class="animation-controls">
        <label>Animation Preset:
            <select class="preset-select-extra">
                ${optionsHTML}
            </select>
        </label>
        <div class="custom-controls-extra" style="${anim.preset === 'custom' ? 'display:block;' : 'display:none;'}">
            X: <input type="number" class="animX" value="${anim.x}" />
            Y: <input type="number" class="animY" value="${anim.y}" />
            Opacity: <input type="number" class="animOpacity" step="0.1" value="${anim.opacity}" />
            Scale: <input type="number" class="animScale" step="0.1" value="${anim.scale}" />
        </div>
        Position (Time): <input type="number" class="animDelay" step="0.1" value="${anim.delay}" /> <br />
    </div>
  `;
  extraContainer.appendChild(animDiv);

  const presetSelect = animDiv.querySelector('.preset-select-extra');
  const customControls = animDiv.querySelector('.custom-controls-extra');

  // If the currently saved preset is not in the new list of options, reset to 'custom'
  if (![...presetSelect.options].some(opt => opt.value === anim.preset)) {
    anim.preset = 'custom';
  }
  presetSelect.value = anim.preset;


  presetSelect.addEventListener('change', () => {
      anim.preset = presetSelect.value;
      customControls.style.display = anim.preset === 'custom' ? 'block' : 'none';
      // When this preset changes, it might affect the *next* one, so rebuild the whole chain
      rebuildExtraAnimBlocks(wrapper, imageData);
      updatePreviewAndCode();
      renderLayers();
  });

  // attach handlers similar to creation flow
  animDiv.addEventListener('click', (e) => {
    e.stopPropagation();
    activeDragTarget = { imgData: imageData, animIndex: ai };
    highlightPreview(imageData.id);
    highlightExtraAnim(wrapper, ai);
    updatePreviewAndCode();
    renderLayers();
  });

  const updateAnim = () => {
    anim.delay = parseFloat(animDiv.querySelector('.animDelay').value) || 0;
    anim.x = parseFloat(animDiv.querySelector('.animX').value) || 0;
    anim.y = parseFloat(animDiv.querySelector('.animY').value) || 0;
    anim.opacity = parseFloat(animDiv.querySelector('.animOpacity').value) || 0;
    anim.scale = parseFloat(animDiv.querySelector('.animScale').value) || 1;

    applyAnimLockStateToWrapper(imageData, ai);

    updatePreviewAndCode();
    renderLayers();
  };

  animDiv.querySelectorAll('input').forEach(input => input.addEventListener('input', updateAnim));

  animDiv.querySelector('.removeAnim').addEventListener('click', (ev) => {
    ev.stopPropagation();
    imageData.extraAnims.splice(ai, 1);
    rebuildExtraAnimBlocks(wrapper, imageData);
    updatePreviewAndCode();
    renderLayers();
  });

  // ensure correct locked state applied
  applyAnimLockStateToWrapper(imageData, ai);
});
}

/* -------------------------------------------------------
 Layers UI (renderLayers)
 - Ascending order (old -> new) — latest at bottom
 (This uses the same original implementation; ensure you don't have a duplicate elsewhere)
--------------------------------------------------------- */

function renderLayers() {
const list = document.getElementById('layersList');
if (!list) return;

list.innerHTML = '';

if (!imageList || imageList.length === 0) {
  const note = document.createElement('div');
  note.className = 'empty-note';
  note.textContent = 'No layers yet — add images to populate layers.';
  list.appendChild(note);
  return;
}

function attachRenameHandler(nameEl, img) {
  if (!nameEl || !img) return;
  const newNameEl = nameEl.cloneNode(true);
  nameEl.parentNode.replaceChild(newNameEl, nameEl);
  newNameEl.addEventListener('dblclick', (ev) => {
    ev.stopPropagation();
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'layer-name-edit';
    // default editing value is the DOM id (user asked to edit id)
    input.value = img.id;
    input.style.width = '100%';
    newNameEl.replaceWith(input);
    input.focus();
    input.select();

    const finish = (accept) => {
      if (!accept) {
        const restored = document.createElement('div');
        restored.className = 'layer-name';
        restored.textContent = img.layerName || img.fileName || img.id;
        restored.title = 'Double-click to rename id';
        input.replaceWith(restored);
        attachRenameHandler(restored, img);
        return;
      }

      let candidate = input.value.trim();
      if (!candidate) candidate = img.id;
      const sanitized = sanitizeId(candidate);
      let unique;
      if (sanitized === img.id) unique = img.id;
      else unique = ensureUniqueId(sanitized);

      const newId = setElementId(img, unique);

      const replaced = document.createElement('div');
      replaced.className = 'layer-name';
      replaced.textContent = img.layerName || img.fileName || newId;
      replaced.title = 'Double-click to rename id';
      input.replaceWith(replaced);
      attachRenameHandler(replaced, img);

      renderLayers();
      updatePreviewAndCode();
    };

    input.addEventListener('blur', () => finish(true));
    input.addEventListener('keydown', (ke) => {
      if (ke.key === 'Enter') input.blur();
      else if (ke.key === 'Escape') finish(false);
    });
  });
}

// iterate in ascending order: earliest first, latest last (appears at bottom)
for (let i = 0; i < imageList.length; i++) {
  const img = imageList[i];

  const item = document.createElement('div');
  item.className = 'layer-item';
  item.dataset.imgId = img.id;

  if (activeDragTarget && activeDragTarget.imgData === img && activeDragTarget.animIndex === null) {
    item.classList.add('selected');
    item.classList.add('expanded');
  }

  const thumb = document.createElement('div');
  thumb.className = 'layer-thumb';
  if (img.type === 'image' && img.src) {
    const timg = document.createElement('img');
    timg.src = img.src;
    thumb.appendChild(timg);
  } else if (img.type === 'text') {
    const sample = document.createElement('div');
    sample.className = 'text-sample';
    sample.textContent = (img.text || 'Text').slice(0, 18);
    thumb.appendChild(sample);
  } else {
    thumb.textContent = '—';
    thumb.style.color = '#999';
    thumb.style.fontSize = '12px';
  }

  const info = document.createElement('div');
  info.className = 'layer-info';

  // Friendly title displayed prominently (Image N / Text N or custom if set)
  const name = document.createElement('div');
  name.className = 'layer-name';
  // Prefer explicit layerName, then filename, then id as fallback
  name.textContent = img.layerName || img.fileName || img.id;
  name.title = 'Double-click to rename id';

  // Meta line shows the real DOM id + position/size/delay so renames are obvious
  const meta = document.createElement('div');
  meta.className = 'layer-meta';
  meta.textContent = `ID: ${img.id} • x:${img.x} y:${img.y} • ${img.width}px • delay ${img.delay}s`;

  info.appendChild(name);
  info.appendChild(meta);

  const actions = document.createElement('div');
  actions.className = 'layer-actions';
  const bpBtn = document.createElement('button');
  bpBtn.type = 'button';
  bpBtn.className = 'icon-btn toggle-breakpoint';
  bpBtn.title = 'Toggle Breakpoint';
  bpBtn.innerHTML = `<i class="fa-solid fa-circle-minus"></i>`;
  const lockBtn = document.createElement('button');
  lockBtn.type = 'button';
  lockBtn.className = 'icon-btn toggle-lock';
  lockBtn.title = 'Toggle Drag Lock';
  lockBtn.innerHTML = `<i class="fa-solid fa-lock"></i>`;

  if (img.breakpoint) bpBtn.classList.add('active');
  if (img.locked) lockBtn.classList.add('active');

  // DUPLICATE button (per-layer)
  const dupBtn = document.createElement('button');
  dupBtn.type = 'button';
  dupBtn.className = 'icon-btn duplicate-layer-btn';
  dupBtn.title = 'Duplicate layer';
  dupBtn.innerHTML = `<i class="fa-solid fa-clone"></i>`; // clone icon

  dupBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    duplicateLayer(img);
  });

  actions.appendChild(bpBtn);
  actions.appendChild(lockBtn);
  actions.appendChild(dupBtn);

  // CLICK TAG icon/button (new)
  const clickBtn = document.createElement('button');
  clickBtn.type = 'button';
  clickBtn.className = 'icon-btn toggle-clicktag';
  clickBtn.title = img.hasClickTag ? 'Edit click tag' : 'Add click tag';
  clickBtn.innerHTML = `<i class="fa-solid fa-link"></i>`;
  if (img.hasClickTag) clickBtn.classList.add('active');

  clickBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    // open the control block's click tag UI
    // prefer to scroll control into view and open its Add Click Tag button
    try {
      if (img.wrapper) {
        img.wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // find addClickTag button inside wrapper and click it to open form
        const addBtn = img.wrapper.querySelector('.addClickTag');
        if (addBtn) addBtn.click();
        // if there is already a form, ensure it is visible
      }
    } catch (err) {}
  });

  actions.appendChild(clickBtn);

  // CHEVRON DROPDOWN: only show if there are extra animations
  if (Array.isArray(img.extraAnims) && img.extraAnims.length > 0) {
    const chevronBtn = document.createElement('button');
    chevronBtn.type = 'button';
    chevronBtn.className = 'icon-btn layer-toggle-chev';
    chevronBtn.title = 'Toggle animations';
    chevronBtn.innerHTML = `<i class="fa-solid fa-chevron-down"></i>`;
    if (item.classList.contains('expanded')) chevronBtn.classList.add('active');

    chevronBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const currentlyExpanded = item.classList.toggle('expanded');
      const nextAnimList = item.nextElementSibling;
      if (nextAnimList && nextAnimList.classList.contains('anim-list')) {
        nextAnimList.style.display = currentlyExpanded ? 'flex' : 'none';
      }
      chevronBtn.classList.toggle('active', currentlyExpanded);
    });

    actions.appendChild(chevronBtn);
  }

  item.appendChild(thumb);
  item.appendChild(info);
  item.appendChild(actions);

  // click on layer selects base image/text
  item.addEventListener('click', (e) => {
    // if click came from an icon button, ignore it here (icons have their own handlers)
    if (e.target.closest('.icon-btn')) return;

    // IMPORTANT: if click originated from the layer-name we must not immediately
    // re-render the layers — doing so cancels a following dblclick intended to rename.
    // So ignore clicks originating inside .layer-name to allow dblclick to work.
    if (e.target.closest('.layer-name') || e.target.classList.contains('layer-name')) {
      // allow the click to pass through to the name element (dblclick handler handles rename)
      return;
    }

    e.stopPropagation();
    activeDragTarget = { imgData: img, animIndex: null };
    highlightPreview(img.id);
    highlightExtraAnim(img.wrapper, null);
    updatePreviewAndCode();
    renderLayers();
    // scroll corresponding control into view
    try {
      img.wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
      img.wrapper.classList.add('selected-control-flash');
      setTimeout(() => img.wrapper.classList.remove('selected-control-flash'), 600);
    } catch (err) {}
  });

  bpBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    img.breakpoint = !img.breakpoint;
    renderLayers();
    updatePreviewAndCode();
  });

  lockBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    img.locked = !img.locked;
    applyLockStateToWrapper(img);
    renderLayers();
    updatePreviewAndCode();
  });

  attachRenameHandler(name, img);

  const animList = document.createElement('div');
  animList.className = 'anim-list';
  if (item.classList.contains('expanded')) animList.style.display = 'flex';

  img.extraAnims.forEach((anim, ai) => {
    const animRow = document.createElement('div');
    animRow.className = 'anim-item';
    animRow.dataset.imgId = img.id;
    animRow.dataset.animIndex = ai;

    if (activeDragTarget && activeDragTarget.imgData === img && activeDragTarget.animIndex === ai) {
      animRow.classList.add('selected');
      item.classList.add('expanded');
      animList.style.display = 'flex';
    }

    const animLabel = document.createElement('div');
    animLabel.className = 'anim-label';
    animLabel.textContent = `Extra ${ai + 1}`;

    const animMeta = document.createElement('div');
    animMeta.className = 'anim-meta';
    animMeta.textContent = `x:${anim.x} y:${anim.y} • delay ${anim.delay}s`;

    // lock icon for extra animation
    const animActions = document.createElement('div');
    animActions.style.display = 'flex';
    animActions.style.gap = '8px';
    const animLockBtn = document.createElement('button');
    animLockBtn.type = 'button';
    animLockBtn.className = 'icon-btn anim-lock-btn';
    animLockBtn.title = anim.locked ? 'Unlock animation' : 'Lock animation';
    animLockBtn.innerHTML = `<i class="fa-solid fa-lock"></i>`;
    if (anim.locked) animLockBtn.classList.add('active');

    animActions.appendChild(animLockBtn);

    animRow.appendChild(animLabel);
    animRow.appendChild(animMeta);
    animRow.appendChild(animActions);

    animRow.addEventListener('click', (e) => {
      e.stopPropagation();
      activeDragTarget = { imgData: img, animIndex: ai };
      highlightPreview(img.id);
      highlightExtraAnim(img.wrapper, ai);
      updatePreviewAndCode();
      renderLayers();

      try {
        img.wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const animDiv = img.wrapper.querySelectorAll('.extra-anims .exit-controls')[ai];
        if (animDiv) {
          animDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
          animDiv.classList.add('selected');
          setTimeout(() => animDiv.classList.remove('selected'), 700);
        }
      } catch (err) {}
    });

    // clicking lock toggles anim.locked and applies to control block
    animLockBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      anim.locked = !anim.locked;
      animLockBtn.classList.toggle('active', anim.locked);
      animLockBtn.title = anim.locked ? 'Unlock animation' : 'Lock animation';
      applyAnimLockStateToWrapper(img, ai);
      renderLayers();
      updatePreviewAndCode();
    });

    animList.appendChild(animRow);
  });

  list.appendChild(item);
  list.appendChild(animList);
}
}

/* Expand / Collapse All */
const expandBtn = document.getElementById('expandAllLayers');
const collapseBtn = document.getElementById('collapseAllLayers');
if (expandBtn) expandBtn.addEventListener('click', () => {
document.querySelectorAll('.layer-item').forEach(li => li.classList.add('expanded'));
document.querySelectorAll('.anim-list').forEach(al => al.style.display = 'flex');
});
if (collapseBtn) collapseBtn.addEventListener('click', () => {
document.querySelectorAll('.layer-item').forEach(li => li.classList.remove('expanded'));
document.querySelectorAll('.anim-list').forEach(al => al.style.display = 'none');
});

/* "Add Image" button wiring */
const addImageBtn = document.getElementById('addImageBtn');
if (addImageBtn) {
addImageBtn.addEventListener('click', () => {
  imageList.forEach(prevImg => {
    prevImg.locked = true;
    applyLockStateToWrapper(prevImg);

    prevImg.extraAnims.forEach((anim, i) => {
      anim.locked = true;
      applyAnimLockStateToWrapper(prevImg, i);
    });
  });

  createControlBlock(imageList.length);
  renderLayers();
});
}

/* "Add Text" button wiring */
const addTextBtn = document.getElementById('addTextBtn');
if (addTextBtn) {
addTextBtn.addEventListener('click', () => {
  imageList.forEach(prev => {
    prev.locked = true;
    applyLockStateToWrapper(prev);

    prev.extraAnims.forEach((anim, i) => {
      anim.locked = true;
      applyAnimLockStateToWrapper(prev, i);
    });
  });

  createTextControlBlock(imageList.length);
  renderLayers();
});
}

/* ensure layers render on load */
document.addEventListener('DOMContentLoaded', () => {
setTimeout(() => { try { renderLayers(); } catch (e) {} }, 50);
});