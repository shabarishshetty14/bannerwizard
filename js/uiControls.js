/* -----------------------------
   UI Controls: Create and Manage Image Blocks + Text Blocks
   (Extra-animation lock moved to Layers icons; no lock checkbox in control blocks)
------------------------------ */

/* NOTE: this file expects utils.js to expose:
   sanitizeId, ensureUniqueId, setElementId, imageList, activeDragTarget, previewArea,
   updatePreviewAndCode, renderLayers (renderLayers defined below)
*/

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

/* ----------------------------- Helpers for locks/animation locks ------------------------------ */

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
   Duplicate functionality
   - duplicateLayer(img) duplicates the given model
   - global duplicate button (#duplicateLayerBtn) will duplicate currently selected layer
------------------------------ */

/**
 * duplicateLayer(img)
 * - Duplicates the provided img/text data model into a new control block
 * - Copies properties, builds preview node, rebuilds extra anim controls
 */
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
  // IMPORTANT: keep the newly created friendly name (Image N / Text N) so duplicates show sequential names.
  // newData.layerName = newData.layerName || cloneModel.layerName; // <-- keep as is
  newData.visible = !!cloneModel.visible;
  newData.fileName = cloneModel.fileName || '';
  newData.src = cloneModel.src || '';
  newData.text = cloneModel.text || '';
  newData.fontFamily = cloneModel.fontFamily || newData.fontFamily;
  newData.fontSize = cloneModel.fontSize || newData.fontSize;
  newData.color = cloneModel.color || newData.color;

  newData.x = Number(cloneModel.x) || 0;
  newData.y = Number(cloneModel.y) || 0;
  newData.width = cloneModel.width || (isImage ? 100 : 'auto');
  newData.height = cloneModel.height || 'auto';
  newData.opacity = typeof cloneModel.opacity === 'number' ? cloneModel.opacity : 1;
  newData.scale = typeof cloneModel.scale === 'number' ? cloneModel.scale : 1;
  newData.delay = typeof cloneModel.delay === 'number' ? cloneModel.delay : 0;
  newData.breakpoint = !!cloneModel.breakpoint;
  newData.locked = false;

  // assign id
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

    const textEl = document.createElement('div');
    textEl.className = 'banner-text preview';
    textEl.id = newData.id;
    textEl.textContent = cloneModel.text || '';
    textEl.style.left = (newData.x || 0) + 'px';
    textEl.style.top = (newData.y || 0) + 'px';
    textEl.style.fontSize = (newData.fontSize || cloneModel.fontSize || 14) + 'px';
    textEl.style.color = cloneModel.color || '#000';
    previewArea.appendChild(textEl);
    newData.previewImg = textEl;
  }

  // copy and rebuild extra anims
  newData.extraAnims = Array.isArray(cloneModel.extraAnims) ? cloneModel.extraAnims.map((a, i) => {
    return {
      id: `${newData.id}_anim_${i}`,
      x: Number(a.x) || 0,
      y: Number(a.y) || 0,
      opacity: typeof a.opacity === 'number' ? a.opacity : 1,
      scale: typeof a.scale === 'number' ? a.scale : 1,
      delay: typeof a.delay === 'number' ? a.delay : 1,
      locked: false
    };
  }) : [];

  const extraContainer = wrapper.querySelector('.extra-anims');
  if (extraContainer) {
    extraContainer.innerHTML = '';
    newData.extraAnims.forEach((anim, ai) => {
      const animDiv = document.createElement('div');
      animDiv.classList.add('exit-controls');
      animDiv.innerHTML = `
        <strong>Extra Animation ${ai + 1}</strong><br />
        X: <input type="number" class="animX" value="${anim.x}" />
        Y: <input type="number" class="animY" value="${anim.y}" />
        Opacity: <input type="number" class="animOpacity" step="0.1" value="${anim.opacity}" />
        Scale: <input type="number" class="animScale" step="0.1" value="${anim.scale}" />
        Position (Time): <input type="number" class="animDelay" step="0.1" value="${anim.delay}" /> <br />
        <button class="removeAnim">Remove</button>
      `;
      extraContainer.appendChild(animDiv);

      animDiv.addEventListener('click', (ev) => {
        ev.stopPropagation();
        activeDragTarget = { imgData: newData, animIndex: ai };
        highlightPreview(newData.id);
        highlightExtraAnim(wrapper, ai);
        updatePreviewAndCode();
        renderLayers();
      });

      const bindAnim = () => {
        anim.x = parseFloat(animDiv.querySelector('.animX').value) || 0;
        anim.y = parseFloat(animDiv.querySelector('.animY').value) || 0;
        anim.opacity = parseFloat(animDiv.querySelector('.animOpacity').value) || 1;
        anim.scale = parseFloat(animDiv.querySelector('.animScale').value) || 1;
        anim.delay = parseFloat(animDiv.querySelector('.animDelay').value) || 0;
        updatePreviewAndCode();
        renderLayers();
      };
      animDiv.querySelectorAll('input').forEach(inp => inp.addEventListener('input', bindAnim));

      animDiv.querySelector('.removeAnim').addEventListener('click', (ev) => {
        ev.stopPropagation();
        newData.extraAnims.splice(ai, 1);
        extraContainer.removeChild(animDiv);
        rebuildExtraAnimBlocks(wrapper, newData);
        updatePreviewAndCode();
        renderLayers();
      });
    });
  }

  const bp = wrapper.querySelector('.breakpoint');
  if (bp) bp.checked = !!newData.breakpoint;

  applyLockStateToWrapper(newData);
  applyAllAnimLocksForWrapper(newData);

  renderLayers();
  updatePreviewAndCode();

  activeDragTarget = { imgData: newData, animIndex: null };
  highlightPreview(newData.id);
  renderLayers();

  try { newData.wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch(e) {}
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
    <strong>Image ${index + 1}</strong>
    <input type="file" class="imageUpload" accept="image/*" />
    <span class="fileNameDisplay" style="font-size: 13px; color: #555; margin-left: 8px;"></span><br />
    <div class="coords">
      <label>X: <input type="number" class="posX" value="0" /></label>
      <label>Y: <input type="number" class="posY" value="0" /></label>
    </div>
    Width: <input type="number" class="imgWidth" value="100" />
    Opacity: <input type="number" class="opacity" step="0.1" value="1" />
    Scale: <input type="number" class="scale" step="0.1" value="1" />
    Position (Time): <input type="number" class="delay" step="0.1" value="0" /> <br />
    <button class="addExtraAnim">+ Add Extra Animation</button>
    <div class="extra-anims"></div>
  `;
  controls.appendChild(wrapper);

  const imageData = {
    id: baseId,
    type: 'image',
    layerName: `Image ${index + 1}`,
    visible: true,

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
    wrapper
  };

  imageList.push(imageData);

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

  // Extra animations container
  const extraContainer = wrapper.querySelector('.extra-anims');

  // Add extra animation
  wrapper.querySelector('.addExtraAnim').addEventListener('click', (e) => {
    e.stopPropagation();
    const animIndex = imageData.extraAnims.length;
    const anim = { id: `${imageData.id}_anim_${animIndex}`, x: 0, y: 0, opacity: 1, delay: 1, scale: 1, locked: false };

    // Lock previous animations
    imageData.extraAnims.forEach((prevAnim, i) => {
      prevAnim.locked = true;
      // reflect into existing DOM controls
      const prevDiv = wrapper.querySelectorAll('.extra-anims .exit-controls')[i];
      if (prevDiv) {
        const xInput = prevDiv.querySelector('.animX');
        const yInput = prevDiv.querySelector('.animY');
        if (xInput) xInput.disabled = true;
        if (yInput) yInput.disabled = true;
        prevDiv.classList.add('anim-locked');
      }
    });

    imageData.extraAnims.push(anim);

    // Lock base image
    imageData.locked = true;
    applyLockStateToWrapper(imageData);

    const animDiv = document.createElement('div');
    animDiv.classList.add('exit-controls');
    animDiv.innerHTML = `
      <strong>Extra Animation ${animIndex + 1}</strong><br />
      X: <input type="number" class="animX" value="0" />
      Y: <input type="number" class="animY" value="0" />
      Opacity: <input type="number" class="animOpacity" step="0.1" value="1" />
      Scale: <input type="number" class="animScale" step="0.1" value="1" />
      Position (Time): <input type="number" class="animDelay" step="0.1" value="1" /> <br />
      <button class="removeAnim">Remove</button>
    `;
    extraContainer.appendChild(animDiv);

    // Click to select this extra animation
    animDiv.addEventListener('click', (ev) => {
      ev.stopPropagation();
      activeDragTarget = { imgData: imageData, animIndex: animIndex };
      highlightPreview(imageData.id);
      highlightExtraAnim(wrapper, animIndex);
      updatePreviewAndCode();
      renderLayers();
    });

    // Update animation inputs
    const updateAnim = () => {
      anim.delay = parseFloat(animDiv.querySelector('.animDelay').value) || 0;
      anim.x = parseFloat(animDiv.querySelector('.animX').value) || 0;
      anim.y = parseFloat(animDiv.querySelector('.animY').value) || 0;
      anim.opacity = parseFloat(animDiv.querySelector('.animOpacity').value) || 0;
      anim.scale = parseFloat(animDiv.querySelector('.animScale').value) || 1;

      // If an animation was locked via layers icon, ensure its inputs stay disabled
      applyAnimLockStateToWrapper(imageData, animIndex);

      updatePreviewAndCode();
      renderLayers();
    };

    animDiv.querySelectorAll('input').forEach(input => input.addEventListener('input', updateAnim));

    // Remove animation
    animDiv.querySelector('.removeAnim').addEventListener('click', (ev) => {
      ev.stopPropagation();
      const removed = imageData.extraAnims.splice(animIndex, 1);
      if (removed) {
        extraContainer.removeChild(animDiv);
        rebuildExtraAnimBlocks(wrapper, imageData);
        updatePreviewAndCode();
        renderLayers();
      }
    });

    // ensure newly created anim inputs are set based on anim.locked (likely false)
    applyAnimLockStateToWrapper(imageData, animIndex);

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
--------------------------------------------------------- */
function createTextControlBlock(index) {
  const controls = document.getElementById('controls');

  // initial candidate id
  const baseId = `text${index + 1}`;

  const wrapper = document.createElement('div');
  wrapper.classList.add('image-block', 'text-block');
  wrapper.dataset.imgId = baseId;
  wrapper.innerHTML = `
    <strong>Text ${index + 1}</strong>
    <div style="margin-top:8px;">
      <textarea class="textContent" rows="2" placeholder="Enter text..."></textarea>
    </div>
    <div style="margin-top:8px;">
      <label>Font Size: <input type="number" class="fontSize" value="14" /></label>
      <label>Color: <input type="color" class="fontColor" value="#000000" /></label>
    </div>

    <div class="coords" style="margin-top:8px;">
      <label>X: <input type="number" class="posX" value="0" /></label>
      <label>Y: <input type="number" class="posY" value="0" /></label>
    </div>

    Opacity: <input type="number" class="opacity" step="0.1" value="1" />
    Scale: <input type="number" class="scale" step="0.1" value="1" />
    Position (Time): <input type="number" class="delay" step="0.1" value="0" /> <br />

    <button class="addExtraAnim">+ Add Extra Animation</button>
    <div class="extra-anims"></div>
  `;
  controls.appendChild(wrapper);

  const textData = {
    id: baseId,
    type: 'text',
    layerName: `Text ${index + 1}`,
    visible: true,

    text: '',
    fontFamily: 'Arial, sans-serif',
    fontSize: 14,
    color: '#000000',

    x: 0, y: 0,
    width: 'auto', height: 'auto',
    opacity: 1,
    scale: 1,
    delay: 0,
    extraAnims: [],
    previewImg: null,
    breakpoint: false,
    locked: false,
    wrapper
  };

  imageList.push(textData);

  // Select this block when clicked
  wrapper.addEventListener('click', () => {
    activeDragTarget = { imgData: textData, animIndex: null };
    highlightPreview(textData.id);
    highlightExtraAnim(wrapper, null);
    updatePreviewAndCode();
    renderLayers();
  });

  const updateFromInputs = () => {
    textData.text = wrapper.querySelector('.textContent').value || '';
    textData.fontSize = parseInt(wrapper.querySelector('.fontSize').value) || 14;
    textData.color = wrapper.querySelector('.fontColor').value || '#000000';
    textData.x = parseInt(wrapper.querySelector('.posX').value) || 0;
    textData.y = parseInt(wrapper.querySelector('.posY').value) || 0;
    textData.opacity = parseFloat(wrapper.querySelector('.opacity').value) || 1;
    textData.scale = parseFloat(wrapper.querySelector('.scale').value) || 1;
    textData.delay = parseFloat(wrapper.querySelector('.delay').value) || 0;
    updatePreviewAndCode();
    renderLayers();
  };

  wrapper.querySelectorAll('input, textarea').forEach(input => input.addEventListener('input', updateFromInputs));

  // Extra animations container
  const extraContainer = wrapper.querySelector('.extra-anims');

  wrapper.querySelector('.addExtraAnim').addEventListener('click', (e) => {
    e.stopPropagation();
    const animIndex = textData.extraAnims.length;
    const anim = { id: `${textData.id}_anim_${animIndex}`, x: 0, y: 0, opacity: 1, delay: 1, scale: 1, locked: false };

    textData.extraAnims.forEach((prevAnim, i) => {
      prevAnim.locked = true;
      const prevDiv = wrapper.querySelectorAll('.extra-anims .exit-controls')[i];
      if (prevDiv) {
        const xInput = prevDiv.querySelector('.animX');
        const yInput = prevDiv.querySelector('.animY');
        if (xInput) xInput.disabled = true;
        if (yInput) yInput.disabled = true;
        prevDiv.classList.add('anim-locked');
      }
    });

    textData.extraAnims.push(anim);
    textData.locked = true;
    applyLockStateToWrapper(textData);

    const animDiv = document.createElement('div');
    animDiv.classList.add('exit-controls');
    animDiv.innerHTML = `
      <strong>Extra Animation ${animIndex + 1}</strong><br />
      X: <input type="number" class="animX" value="0" />
      Y: <input type="number" class="animY" value="0" />
      Opacity: <input type="number" class="animOpacity" step="0.1" value="1" />
      Scale: <input type="number" class="animScale" step="0.1" value="1" />
      Position (Time): <input type="number" class="animDelay" step="0.1" value="1" /> <br />
      <button class="removeAnim">Remove</button>
    `;
    extraContainer.appendChild(animDiv);

    animDiv.addEventListener('click', (ev) => {
      ev.stopPropagation();
      activeDragTarget = { imgData: textData, animIndex: animIndex };
      highlightPreview(textData.id);
      highlightExtraAnim(wrapper, animIndex);
      updatePreviewAndCode();
      renderLayers();
    });

    const updateAnim = () => {
      anim.delay = parseFloat(animDiv.querySelector('.animDelay').value) || 0;
      anim.x = parseFloat(animDiv.querySelector('.animX').value) || 0;
      anim.y = parseFloat(animDiv.querySelector('.animY').value) || 0;
      anim.opacity = parseFloat(animDiv.querySelector('.animOpacity').value) || 0;
      anim.scale = parseFloat(animDiv.querySelector('.animScale').value) || 1;

      applyAnimLockStateToWrapper(textData, animIndex);

      updatePreviewAndCode();
      renderLayers();
    };

    animDiv.querySelectorAll('input').forEach(input => input.addEventListener('input', updateAnim));

    animDiv.querySelector('.removeAnim').addEventListener('click', (ev) => {
      ev.stopPropagation();
      textData.extraAnims.splice(animIndex, 1);
      extraContainer.removeChild(animDiv);
      rebuildExtraAnimBlocks(wrapper, textData);
      updatePreviewAndCode();
      renderLayers();
    });

    applyAnimLockStateToWrapper(textData, animIndex);
    updatePreviewAndCode();
    renderLayers();
  });
}

/* -------------------------------------------------------
   Utility to rebuild extra animation blocks (labels/ids) after a removal
--------------------------------------------------------- */
function rebuildExtraAnimBlocks(wrapper, imageData) {
  const extraContainer = wrapper.querySelector('.extra-anims');
  extraContainer.innerHTML = '';
  imageData.extraAnims.forEach((anim, ai) => {
    const animDiv = document.createElement('div');
    animDiv.classList.add('exit-controls');
    animDiv.innerHTML = `
      <strong>Extra Animation ${ai + 1}</strong><br />
      X: <input type="number" class="animX" value="${anim.x}" />
      Y: <input type="number" class="animY" value="${anim.y}" />
      Opacity: <input type="number" class="animOpacity" step="0.1" value="${anim.opacity}" />
      Scale: <input type="number" class="animScale" step="0.1" value="${anim.scale}" />
      Position (Time): <input type="number" class="animDelay" step="0.1" value="${anim.delay}" /> <br />
      <button class="removeAnim">Remove</button>
    `;
    extraContainer.appendChild(animDiv);

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
        const animDiv = prevImg.wrapper.querySelectorAll('.extra-anims .exit-controls')[i];
        if (animDiv) {
          const xInput = animDiv.querySelector('.animX');
          const yInput = animDiv.querySelector('.animY');
          if (xInput) xInput.disabled = true;
          if (yInput) yInput.disabled = true;
          animDiv.classList.add('anim-locked');
        }
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
        const animDiv = prev.wrapper.querySelectorAll('.extra-anims .exit-controls')[i];
        if (animDiv) {
          const xInput = animDiv.querySelector('.animX');
          const yInput = animDiv.querySelector('.animY');
          if (xInput) xInput.disabled = true;
          if (yInput) yInput.disabled = true;
          animDiv.classList.add('anim-locked');
        }
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
