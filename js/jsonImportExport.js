const downloadBtn = document.getElementById('downloadJsonBtn');
const importInput = document.getElementById('importJsonInput');

if (downloadBtn) {
  downloadBtn.addEventListener('click', () => {
    // Use Quill content if available; else saved HTML string
    const isiContent = (window.quill && window.quill.root)
      ? window.quill.root.innerHTML
      : (window.isiContentHTML || null);
      
    // Get custom CSS content
    const isiCss = window.isiContentCSS || "";

    // Ensure we capture primaryCta current UI state
    const primaryEnabledEl = document.getElementById('enablePrimaryCta');
    const primaryUrlEl = document.getElementById('primaryCtaUrl');
    const primaryWEl = document.getElementById('primaryCtaWidth');
    const primaryHEl = document.getElementById('primaryCtaHeight');

    const primaryCtaObj = {
      enabled: !!(primaryEnabledEl && primaryEnabledEl.checked),
      url: (primaryUrlEl && primaryUrlEl.value) ? primaryUrlEl.value.trim() : '',
      width: primaryWEl ? parseInt(primaryWEl.value) || null : null,
      height: primaryHEl ? parseInt(primaryHEl.value) || null : null
    };

    // Get current banner size from the dropdown helper
    const { width: bannerW, height: bannerH } = getCurrentBannerSize();

    // NOTE: The layer order is simply the order of the images[] array.
    const jsonData = {
      bannerWidth: bannerW,
      bannerHeight: bannerH,
      isi: window.isiState, 
      isiContent: isiContent,
      isiContentCSS: isiCss, // ADDED: Export custom CSS
      primaryCta: primaryCtaObj,
      images: imageList.map(el => ({
        id: el.id,
        type: el.type || 'image',
        layerName: el.layerName || '',
        visible: typeof el.visible === 'boolean' ? el.visible : true,
        preset: el.preset || 'custom', 
        // image fields
        fileName: el.fileName || '',
        src: el.src || '',
        // text fields
        text: el.text || '',
        fontSize: el.fontSize || 14,
        color: el.color || '#000000',
        italic: !!el.italic,
        underline: !!el.underline,
        bold: !!el.bold,
        // click-tag fields (new)
        hasClickTag: !!el.hasClickTag,
        clickTagUrl: el.clickTagUrl || '',
        // common
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
          preset: anim.preset || 'custom', 
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
}

if (importInput) {
  importInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const data = JSON.parse(event.target.result);
        if (!Array.isArray(data.images)) throw new Error("Invalid format: images[] missing");

        // ==== Banner size
        const bannerSizeSelect = document.getElementById('bannerSizeSelect');
        if (bannerSizeSelect) {
            const sizeString = `${data.bannerWidth || 300}x${data.bannerHeight || 250}`;
            const optionExists = [...bannerSizeSelect.options].some(opt => opt.value === sizeString);

            if (optionExists) {
                bannerSizeSelect.value = sizeString;
            } else {
                const customOption = document.createElement('option');
                customOption.value = sizeString;
                customOption.textContent = `${sizeString} (Imported)`;
                customOption.selected = true;
                bannerSizeSelect.appendChild(customOption);
            }
        }
        
        if (typeof updateBannerSize === 'function') {
            updateBannerSize();
        }

        // ==== ISI states/content
        if (data.isi && typeof data.isi === 'object') {
            window.isiState = data.isi;
        } else {
            window.isiState.enabled = !!data.isiEnabled;
        }
        
        const isiCheckbox = document.getElementById('enableIsiCheckbox');
        if (isiCheckbox) isiCheckbox.checked = window.isiState.enabled;

        // Restore HTML and Custom CSS
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
        window.isiContentCSS = data.isiContentCSS || ''; // ADDED: Import custom CSS

        
        // ==== Primary CTA restore
        if (data.primaryCta && typeof data.primaryCta === 'object') {
          const p = data.primaryCta;
          const enableEl = document.getElementById('enablePrimaryCta');
          const urlEl = document.getElementById('primaryCtaUrl');
          const wEl = document.getElementById('primaryCtaWidth');
          const hEl = document.getElementById('primaryCtaHeight');

          if (enableEl) enableEl.checked = !!p.enabled;
          if (urlEl) urlEl.value = p.url || '';
          if (wEl) wEl.value = (typeof p.width === 'number' && !isNaN(p.width)) ? p.width : (wEl.value || '');
          if (hEl) hEl.value = (typeof p.height === 'number' && !isNaN(p.height)) ? p.height : (hEl.value || '');

          window.primaryCta = {
            enabled: !!p.enabled,
            url: p.url || '',
            width: typeof p.width === 'number' ? p.width : null,
            height: typeof p.height === 'number' ? p.height : null
          };
        } else {
          const enableEl = document.getElementById('enablePrimaryCta');
          const urlEl = document.getElementById('primaryCtaUrl');
          const wEl = document.getElementById('primaryCtaWidth');
          const hEl = document.getElementById('primaryCtaHeight');
          if (enableEl) enableEl.checked = false;
          if (urlEl) urlEl.value = '';
          if (wEl) wEl.value = '';
          if (hEl) hEl.value = '';
          window.primaryCta = { enabled: false, url: '', width: null, height: null };
        }
        
        // ==== Reset UI state
        imageList.length = 0;
        const controlsEl = document.getElementById('controls');
        if (controlsEl) controlsEl.innerHTML = '';
        previewArea.innerHTML = '';

        const existingIsiStyle = document.getElementById('isi-style-tag');
        if (existingIsiStyle) existingIsiStyle.remove();

        // ==== Rebuild images & controls
        data.images.forEach((item, index) => {
          if (item.type === 'text') {
            createTextControlBlock(index);
          } else {
            createControlBlock(index);
          }

          const elData = imageList[index];
          const wrapper = elData.wrapper;

          // Assign fields...
          elData.id = item.id || elData.id;
          elData.type = item.type || elData.type || 'image';
          elData.layerName = item.layerName || '';
          elData.visible = (typeof item.visible === 'boolean') ? item.visible : true;
          elData.preset = item.preset || 'custom';
          elData.fileName = item.fileName || elData.fileName || '';
          elData.src = item.src || elData.src || '';
          elData.text = item.text || elData.text || '';
          elData.fontSize = typeof item.fontSize === 'number' ? item.fontSize : (elData.fontSize || 14);
          elData.color = item.color || elData.color || '#000000';
          elData.italic = !!item.italic;
          elData.underline = !!item.underline;
          elData.bold = !!item.bold;
          elData.hasClickTag = !!item.hasClickTag;
          elData.clickTagUrl = typeof item.clickTagUrl === 'string' ? (item.clickTagUrl || '') : '';
          elData.x = typeof item.x === 'number' ? item.x : (elData.x || 0);
          elData.y = typeof item.y === 'number' ? item.y : (elData.y || 0);
          elData.width = typeof item.width !== 'undefined' ? item.width : elData.width;
          elData.height = typeof item.height !== 'undefined' ? item.height : elData.height;
          elData.opacity = typeof item.opacity === 'number' ? item.opacity : (elData.opacity || 1);
          elData.scale = typeof item.scale === 'number' ? item.scale : (elData.scale || 1);
          elData.delay = typeof item.delay === 'number' ? item.delay : (elData.delay || 0);
          elData.breakpoint = !!item.breakpoint;
          elData.locked = !!item.locked;
          elData.extraAnims = Array.isArray(item.extraAnims) ? item.extraAnims.map((a, ai) => ({
            id: `${elData.id}_anim_${ai}`,
            preset: a.preset || 'custom', 
            x: typeof a.x === 'number' ? a.x : 0,
            y: typeof a.y === 'number' ? a.y : 0,
            opacity: typeof a.opacity === 'number' ? a.opacity : 1,
            scale: typeof a.scale === 'number' ? a.scale : 1,
            delay: typeof a.delay === 'number' ? a.delay : 1,
            locked: !!a.locked
          })) : [];

          // Update wrapper UI...
          try {
            const strong = wrapper.querySelector('strong');
            if (strong) strong.textContent = elData.layerName || (elData.type === 'text' ? `Text ${index + 1}` : `Image ${index + 1}`);
            
            const presetSelect = wrapper.querySelector('.preset-select');
            if(presetSelect) presetSelect.value = elData.preset;
            const customControls = wrapper.querySelector('.custom-controls');
            if(customControls) customControls.style.display = elData.preset === 'custom' ? 'block' : 'none';

            const fn = wrapper.querySelector('.fileNameDisplay');
            if (fn) fn.textContent = elData.fileName || '';
            const posX = wrapper.querySelector('.posX');
            if (posX) posX.value = elData.x;
            const posY = wrapper.querySelector('.posY');
            if (posY) posY.value = elData.y;
            const widthInp = wrapper.querySelector('.imgWidth');
            if (widthInp && typeof elData.width !== 'undefined') widthInp.value = elData.width;
            const opacityInp = wrapper.querySelector('.opacity');
            if (opacityInp) opacityInp.value = elData.opacity;
            const scaleInp = wrapper.querySelector('.scale');
            if (scaleInp) scaleInp.value = elData.scale;
            const delayInp = wrapper.querySelector('.delay');
            if (delayInp) delayInp.value = elData.delay;
            const bp = wrapper.querySelector('.breakpoint');
            if (bp) bp.checked = !!elData.breakpoint;
            if (elData.type === 'text') {
              const ta = wrapper.querySelector('.textContent');
              if (ta) ta.value = elData.text || '';
              const fontSizeInp = wrapper.querySelector('.fontSize');
              if (fontSizeInp) fontSizeInp.value = elData.fontSize;
              const colorInp = wrapper.querySelector('.fontColor');
              if (colorInp) colorInp.value = elData.color || '#000000';
              const italicCheckbox = wrapper.querySelector('.fontItalic');
              const underlineCheckbox = wrapper.querySelector('.fontUnderline');
              const boldCheckbox = wrapper.querySelector('.fontBold');
              if (italicCheckbox) italicCheckbox.checked = !!elData.italic;
              if (underlineCheckbox) underlineCheckbox.checked = !!elData.underline;
              if (boldCheckbox) boldCheckbox.checked = !!elData.bold;
              const txtWidthInput = wrapper.querySelector('.txtWidth');
              if (typeof elData.width !== 'undefined') {
                if (txtWidthInput) txtWidthInput.value = (elData.width === 'auto' ? '' : elData.width);
              } else {
                if (txtWidthInput) txtWidthInput.value = (elData.width || 200);
              }
            }
          } catch (err) { console.warn('Failed to update wrapper controls for imported element', err); }

          // Build preview node...
          if (elData.type === 'image') {
            if (elData.src) {
              const img = document.createElement('img');
              img.src = elData.src; img.id = elData.id; img.classList.add('preview');
              img.style.position = 'absolute';
              if (typeof elData.width !== 'undefined') img.style.width = (elData.width === 'auto' ? 'auto' : elData.width + 'px');
              if (typeof elData.height !== 'undefined' && elData.height !== 'auto') img.style.height = (elData.height + 'px');
              previewArea.appendChild(img);
              elData.previewImg = img;
            }
          } else if (elData.type === 'text') {
            const textEl = document.createElement('div');
            textEl.className = 'banner-text preview'; textEl.id = elData.id;
            textEl.textContent = elData.text || ''; textEl.style.position = 'absolute';
            textEl.style.left = (elData.x || 0) + 'px'; textEl.style.top = (elData.y || 0) + 'px';
            textEl.style.fontSize = (elData.fontSize || 14) + 'px'; textEl.style.color = elData.color || '#000';
            textEl.style.fontStyle = elData.italic ? 'italic' : 'normal';
            textEl.style.textDecoration = elData.underline ? 'underline' : 'none';
            textEl.style.fontWeight = elData.bold ? 'bold' : 'normal';
            if (typeof elData.width !== 'undefined' && elData.width !== null && elData.width !== 'auto') {
              textEl.style.width = (Number(elData.width) || 0) + 'px';
            } else if (elData.width === 'auto') { textEl.style.width = 'auto'; } else { textEl.style.width = (elData.width || 200) + 'px'; }
            textEl.style.wordWrap = 'break-word';
            previewArea.appendChild(textEl);
            elData.previewImg = textEl;
          }

          if(typeof rebuildExtraAnimBlocks === 'function') {
              rebuildExtraAnimBlocks(wrapper, elData);
          }
          
          try {
            if (typeof ensureClickTagUI === 'function') ensureClickTagUI(wrapper, elData);
            if (elData.hasClickTag) {
              if (typeof createClickTagForm === 'function') {
                createClickTagForm(wrapper, elData);
                wrapper.classList.add('layer-has-clicktag');
              } else { elData.hasClickTag = true; }
            } else { wrapper.classList.remove('layer-has-clicktag'); }
          } catch (err) { console.warn('Click-tag restore skipped for', elData.id, err); }
          
          if (typeof renderLayers === 'function') renderLayers();
        });

        // Final rebuild of preview/code
        if (typeof updatePreviewAndCode === 'function') updatePreviewAndCode();
        if (document.getElementById('enableIsiCheckbox').checked && typeof initIsiScroll === 'function') {
          setTimeout(initIsiScroll, 10);
        }
        if (typeof renderLayers === 'function') renderLayers();

      } catch (err) {
        alert("Failed to import JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  });
}