/* -----------------------------
   JSON Import / Export (Layers-aware, Quill-aware)
----------------------------- */

const downloadBtn = document.getElementById('downloadJsonBtn');
const importInput = document.getElementById('importJsonInput');

downloadBtn.addEventListener('click', () => {
  // Use Quill content if available; else saved HTML string
  const isiContent = (window.quill && window.quill.root)
    ? window.quill.root.innerHTML
    : (window.isiContentHTML || null);

  // NOTE: The layer order is simply the order of the images[] array.
  // The Layers UI displays reverse for convenience (top-most first),
  // but serialization keeps the natural order.
  const jsonData = {
    bannerWidth: parseInt(widthInput.value) || 300,
    bannerHeight: parseInt(heightInput.value) || 250,
    isiEnabled: document.getElementById('enableIsiCheckbox').checked,
    isiContent: isiContent,
    images: imageList.map(el => ({
      id: el.id,
      type: el.type || 'image',
      // Layer-friendly fields (optional, safe defaults)
      layerName: el.layerName || '',
      visible: typeof el.visible === 'boolean' ? el.visible : true,

      // image fields
      fileName: el.fileName || '',
      src: el.src || '',

      // text fields
      text: el.text || '',
      fontSize: el.fontSize || 14,
      color: el.color || '#000000',

      // common fields
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      opacity: el.opacity,
      scale: el.scale,
      delay: el.delay,
      breakpoint: !!el.breakpoint,
      extraAnims: (el.extraAnims || []).map(anim => ({
        id: anim.id,
        x: anim.x,
        y: anim.y,
        opacity: anim.opacity,
        scale: anim.scale,
        delay: anim.delay,
        locked: !!anim.locked
      })),
      locked: !!el.locked
    }))
  };

  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "banner_data.json";
  a.click();
  URL.revokeObjectURL(url);
});

importInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const data = JSON.parse(event.target.result);
      if (!Array.isArray(data.images)) throw new Error("Invalid format: images[] missing");

      // ==== Banner size
      widthInput.value = data.bannerWidth || 300;
      heightInput.value = data.bannerHeight || 250;
      if (typeof updateBannerSize === 'function') updateBannerSize();

      // ==== ISI states/content
      const enableIsi = typeof data.isiEnabled !== 'undefined' ? !!data.isiEnabled : false;
      document.getElementById('enableIsiCheckbox').checked = enableIsi;

      if (typeof data.isiContent !== 'undefined') {
        window.isiContentHTML = data.isiContent || '';
        if (window.quill && window.quill.root) {
          try {
            const delta = window.quill.clipboard.convert(window.isiContentHTML);
            window.quill.setContents(delta, 'silent');
          } catch (err) {
            window.quill.root.innerHTML = window.isiContentHTML;
          }
        }
      }

      // ==== Reset UI state
      imageList.length = 0;
      document.getElementById('controls').innerHTML = '';
      previewArea.innerHTML = '';

      // Remove old ISI preview/style if exists (preview.js re-creates)
      const oldIsi = document.getElementById('iframe_tj');
      if (oldIsi && oldIsi.parentNode === previewArea) {
        previewArea.removeChild(oldIsi);
      }
      const existingIsiStyle = document.getElementById('isi-style-tag');
      if (existingIsiStyle) existingIsiStyle.remove();

      // ==== Rebuild images & controls in the given order
      data.images.forEach((item, index) => {
        // Create fresh control block depending on type
        if (item.type === 'text') {
          createTextControlBlock(index);
        } else {
          createControlBlock(index);
        }

        const elData = imageList[index];
        const wrapper = elData.wrapper;

        // Assign persisted fields (with safe fallbacks)
        elData.id = item.id || elData.id;
        elData.type = item.type || elData.type || 'image';
        elData.layerName = item.layerName || '';
        elData.visible = (typeof item.visible === 'boolean') ? item.visible : true;

        if (elData.type === 'image') {
          elData.fileName = item.fileName || '';
          elData.src = item.src || '';
        } else if (elData.type === 'text') {
          elData.text = item.text || '';
          elData.fontSize = Number(item.fontSize) || 14;
          elData.color = item.color || '#000000';
        }

        elData.x = Number(item.x) || 0;
        elData.y = Number(item.y) || 0;
        elData.width = Number(item.width) || (elData.type === 'image' ? 100 : 'auto');
        elData.height = item.height || 'auto';
        elData.opacity = Number(item.opacity) || 1;
        elData.scale = Number(item.scale) || 1;
        elData.delay = Number(item.delay) || 0;
        elData.breakpoint = !!item.breakpoint;
        elData.extraAnims = Array.isArray(item.extraAnims) ? item.extraAnims.map((a, ai) => ({
          id: a.id || `${elData.id}_anim_${ai}`,
          x: Number(a.x) || 0,
          y: Number(a.y) || 0,
          opacity: Number(a.opacity) || 1,
          scale: Number(a.scale) || 1,
          delay: Number(a.delay) || 0,
          locked: !!a.locked
        })) : [];
        elData.locked = !!item.locked;

        // Reflect into wrapper inputs (if present)
        const setVal = (sel, val) => {
          const el = wrapper.querySelector(sel);
          if (el != null) el.value = val;
        };

        setVal('.posX', elData.x);
        setVal('.posY', elData.y);
        setVal('.opacity', elData.opacity);
        setVal('.scale', elData.scale);
        setVal('.delay', elData.delay);

        if (elData.type === 'image') {
          setVal('.imgWidth', elData.width);
          const fn = wrapper.querySelector('.fileNameDisplay');
          if (fn) fn.textContent = elData.fileName || '';
        } else if (elData.type === 'text') {
          setVal('.fontSize', elData.fontSize);
          const colorInp = wrapper.querySelector('.fontColor');
          if (colorInp) colorInp.value = elData.color;
          const txt = wrapper.querySelector('.textContent');
          if (txt) txt.value = elData.text;
        }

        const bp = wrapper.querySelector('.breakpoint');
        if (bp) bp.checked = elData.breakpoint;

        // Lock UI inputs according to state
        const lockBox = wrapper.querySelector('.lockPosition');
        if (lockBox) lockBox.checked = elData.locked;
        const posX = wrapper.querySelector('.posX');
        const posY = wrapper.querySelector('.posY');
        if (posX) posX.disabled = elData.locked;
        if (posY) posY.disabled = elData.locked;

        // Create preview element in canvas if needed
        if (elData.type === 'image') {
          if (elData.src) {
            const previewImg = document.createElement('img');
            previewImg.src = elData.src;
            previewImg.id = elData.id;
            previewImg.classList.add('preview');
            previewArea.appendChild(previewImg);
            elData.previewImg = previewImg;
          } else {
            elData.previewImg = null;
          }
        } else if (elData.type === 'text') {
          const previewTxt = document.createElement('div');
          previewTxt.id = elData.id;
          previewTxt.classList.add('preview', 'banner-text');
          previewTxt.innerHTML = elData.text || '';
          previewTxt.style.fontSize = (elData.fontSize || 14) + 'px';
          previewTxt.style.color = elData.color || '#000';
          previewArea.appendChild(previewTxt);
          elData.previewImg = previewTxt;
        }

        // Rebuild extra animation control blocks
        const extraContainer = wrapper.querySelector('.extra-anims');
        extraContainer.innerHTML = '';
        elData.extraAnims.forEach((anim, ai) => {
          const animDiv = document.createElement('div');
          animDiv.classList.add('exit-controls');
          animDiv.innerHTML = `
            <strong>Extra Animation ${ai + 1}</strong><br />
            Position (Time): <input type="number" class="animDelay" step="0.1" value="${anim.delay}" />
            X: <input type="number" class="animX" value="${anim.x}" />
            Y: <input type="number" class="animY" value="${anim.y}" />
            Opacity: <input type="number" class="animOpacity" step="0.1" value="${anim.opacity}" />
            Scale: <input type="number" class="animScale" step="0.1" value="${anim.scale}" />
            <label><input type="checkbox" class="lockExtraAnim" ${anim.locked ? 'checked' : ''}> 
              <i class="fa-solid fa-lock"></i> Lock Animation</label><br />
            <button class="removeAnim">Remove</button>
          `;
          extraContainer.appendChild(animDiv);

          // Select this anim on click
          animDiv.addEventListener('click', (ev) => {
            ev.stopPropagation();
            activeDragTarget = { imgData: elData, animIndex: ai };
            highlightPreview(elData.id);
            highlightExtraAnim(wrapper, ai);
            updatePreviewAndCode();
            if (typeof renderLayers === 'function') renderLayers();
          });

          // Wire inputs to state
          const bind = () => {
            anim.delay = parseFloat(animDiv.querySelector('.animDelay').value) || 0;
            anim.x = parseFloat(animDiv.querySelector('.animX').value) || 0;
            anim.y = parseFloat(animDiv.querySelector('.animY').value) || 0;
            anim.opacity = parseFloat(animDiv.querySelector('.animOpacity').value) || 0;
            anim.scale = parseFloat(animDiv.querySelector('.animScale').value) || 1;
            anim.locked = !!animDiv.querySelector('.lockExtraAnim').checked;

            const xInput = animDiv.querySelector('.animX');
            const yInput = animDiv.querySelector('.animY');
            xInput.disabled = anim.locked;
            yInput.disabled = anim.locked;

            updatePreviewAndCode();
            if (typeof renderLayers === 'function') renderLayers();
          };
          animDiv.querySelectorAll('input').forEach(input => input.addEventListener('input', bind));
          animDiv.querySelector('.lockExtraAnim').addEventListener('change', bind);

          // Remove anim
          animDiv.querySelector('.removeAnim').addEventListener('click', (ev) => {
            ev.stopPropagation();
            elData.extraAnims.splice(ai, 1);
            extraContainer.removeChild(animDiv);
            updatePreviewAndCode();
            if (typeof renderLayers === 'function') renderLayers();
          });
        });

        // Keep layers UI updated for each element added
        if (typeof renderLayers === 'function') renderLayers();
      });

      // Final rebuild of preview/code
      if (typeof updatePreviewAndCode === 'function') updatePreviewAndCode();

      // If JSON enabled ISI, initialize scroll exactly like the UI toggle
      if (document.getElementById('enableIsiCheckbox').checked && typeof initIsiScroll === 'function') {
        setTimeout(initIsiScroll, 10);
      }

      // Ensure layers are up to date at end as well
      if (typeof renderLayers === 'function') renderLayers();

    } catch (err) {
      alert("Failed to import JSON: " + err.message);
    }
  };
  reader.readAsText(file);
});
