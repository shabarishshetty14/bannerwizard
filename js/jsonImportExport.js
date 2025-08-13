/* -----------------------------
   JSON Import / Export
------------------------------ */

// Download JSON
document.getElementById('downloadJsonBtn').addEventListener('click', () => {
  const jsonData = {
    bannerWidth: parseInt(widthInput.value) || 300,
    bannerHeight: parseInt(heightInput.value) || 250,
    images: imageList.map(img => ({
      id: img.id,
      fileName: img.fileName,
      src: img.src,
      x: img.x,
      y: img.y,
      width: img.width,
      height: img.height,
      opacity: img.opacity,
      scale: img.scale,
      delay: img.delay,
      breakpoint: img.breakpoint,
      extraAnims: img.extraAnims.map(anim => ({
        id: anim.id,
        x: anim.x,
        y: anim.y,
        opacity: anim.opacity,
        scale: anim.scale,
        delay: anim.delay,
        locked: anim.locked || false
      })),
      locked: img.locked || false
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

// Import JSON
document.getElementById('importJsonInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const data = JSON.parse(event.target.result);
      if (!Array.isArray(data.images)) throw new Error("Invalid format");

      // Set banner size
      widthInput.value = data.bannerWidth || 300;
      heightInput.value = data.bannerHeight || 250;
      updateBannerSize();

      // Reset state
      imageList.length = 0;
      document.getElementById('controls').innerHTML = '';
      previewArea.innerHTML = '';

      // Remove old ISI preview if exists
      const oldIsi = document.getElementById('iframe_tj');
      if (oldIsi && oldIsi.parentNode === previewArea) {
        previewArea.removeChild(oldIsi);
      }

      // Rebuild images
      data.images.forEach((item, index) => {
        createControlBlock(index);
        const imgData = imageList[index];
        const wrapper = imgData.wrapper;

        imgData.locked = item.locked || false;
        wrapper.querySelector('.lockPosition').checked = imgData.locked;
        wrapper.querySelector('.posX').disabled = imgData.locked;
        wrapper.querySelector('.posY').disabled = imgData.locked;

        // Update inputs
        const setInput = (selector, value) => {
          const input = wrapper.querySelector(selector);
          if (input) input.value = value;
        };
        setInput('.posX', item.x);
        setInput('.posY', item.y);
        setInput('.imgWidth', item.width);
        setInput('.opacity', item.opacity);
        setInput('.scale', item.scale);
        setInput('.delay', item.delay);
        wrapper.querySelector('.breakpoint').checked = item.breakpoint;
        wrapper.querySelector('.fileNameDisplay').textContent = item.fileName;

        // Assign all props
        Object.assign(imgData, item);

        // If src is valid, create preview image
        if (imgData.src) {
          const previewImg = document.createElement('img');
          previewImg.src = imgData.src;
          previewImg.id = imgData.id;
          previewImg.classList.add('preview');
          previewArea.appendChild(previewImg);
          imgData.previewImg = previewImg;
        }

        // Extra animation controls
        const extraContainer = wrapper.querySelector('.extra-anims');
        extraContainer.innerHTML = '';
        item.extraAnims.forEach((anim, ai) => {
          anim.locked = anim.locked || false;
          const animDiv = document.createElement('div');
          animDiv.classList.add('exit-controls');
          animDiv.innerHTML = `
            <strong>Extra Animation ${ai + 1}</strong><br />
            Position (Time): <input type="number" class="animDelay" step="0.1" value="${anim.delay}" />
            X: <input type="number" class="animX" value="${anim.x}" />
            Y: <input type="number" class="animY" value="${anim.y}" />
            Opacity: <input type="number" class="animOpacity" step="0.1" value="${anim.opacity}" />
            Scale: <input type="number" class="animScale" step="0.1" value="${anim.scale}" />
            <label><input type="checkbox" class="lockExtraAnim"> 🔒 Lock Animation</label><br />
            <button class="removeAnim">Remove</button>
          `;

          extraContainer.appendChild(animDiv);

          const lockBox = animDiv.querySelector('.lockExtraAnim');
          const xInput = animDiv.querySelector('.animX');
          const yInput = animDiv.querySelector('.animY');

          if (lockBox) {
            lockBox.checked = anim.locked;
            xInput.disabled = anim.locked;
            yInput.disabled = anim.locked;

            lockBox.addEventListener('change', () => {
              anim.locked = lockBox.checked;
              xInput.disabled = anim.locked;
              yInput.disabled = anim.locked;
              updatePreviewAndCode();
            });
          }

          animDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            activeDragTarget = { imgData: imgData, animIndex: ai };
            highlightPreview(imgData.id);
            highlightExtraAnim(wrapper, ai);
            updatePreviewAndCode();
          });

          animDiv.querySelectorAll('input').forEach(input => input.addEventListener('input', () => {
            anim.delay = parseFloat(animDiv.querySelector('.animDelay').value) || 0;
            anim.x = parseFloat(animDiv.querySelector('.animX').value) || 0;
            anim.y = parseFloat(animDiv.querySelector('.animY').value) || 0;
            anim.opacity = parseFloat(animDiv.querySelector('.animOpacity').value) || 0;
            anim.scale = parseFloat(animDiv.querySelector('.animScale').value) || 1;
            updatePreviewAndCode();
          }));

          animDiv.querySelector('.removeAnim').addEventListener('click', () => {
            anim.locked = anim.locked || false;
            lockBox.checked = anim.locked;
            xInput.disabled = anim.locked;
            yInput.disabled = anim.locked;
            lockBox.addEventListener('change', () => {
              anim.locked = lockBox.checked;
              xInput.disabled = anim.locked;
              yInput.disabled = anim.locked;
              updatePreviewAndCode();
            });
            item.extraAnims.splice(ai, 1);
            extraContainer.removeChild(animDiv);
            updatePreviewAndCode();
          });
        });
      });

      updatePreviewAndCode();
    } catch (err) {
      alert("Failed to import JSON: " + err.message);
    }
  };
  reader.readAsText(file);
});
