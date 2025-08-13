/* -----------------------------
   UI Controls: Create and Manage Image Blocks
------------------------------ */

function createControlBlock(index) {
  const controls = document.getElementById('controls');
  const id = 'img' + (index + 1);

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <strong>Image ${index + 1}</strong><br />
    <input type="file" class="imageUpload" accept="image/*" />
    <span class="fileNameDisplay" style="font-size: 13px; color: #555; margin-left: 8px;"></span><br />
    X: <input type="number" class="posX" value="0" />
    Y: <input type="number" class="posY" value="0" />
    Width: <input type="number" class="imgWidth" value="100" />
    Opacity: <input type="number" class="opacity" step="0.1" value="1" />
    Scale: <input type="number" class="scale" step="0.1" value="1" />
    Position (Time): <input type="number" class="delay" step="0.1" value="0" />
    <label><input type="checkbox" class="breakpoint"> ⛔ Breakpoint</label><br>
    <label><input type="checkbox" class="lockPosition"> 🔒 Lock Position</label><br>
    <button class="addExtraAnim">+ Add Extra Animation</button>
    <div class="extra-anims"></div>
  `;
  controls.appendChild(wrapper);

  const imageData = {
    id,
    fileName: '',
    src: '',
    x: 0, y: 0, width: 100, height: 'auto', opacity: 1, delay: 0, scale: 1,
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
    imageData.breakpoint = wrapper.querySelector('.breakpoint').checked;
    imageData.locked = wrapper.querySelector('.lockPosition').checked;

    wrapper.querySelector('.posX').disabled = imageData.locked;
    wrapper.querySelector('.posY').disabled = imageData.locked;

    updatePreviewAndCode();
  };
  wrapper.querySelectorAll('input').forEach(input => input.addEventListener('input', updateFromInputs));
  wrapper.querySelector('.breakpoint').addEventListener('change', updateFromInputs);

  // Extra animations container
  const extraContainer = wrapper.querySelector('.extra-anims');

  // Add extra animation
  wrapper.querySelector('.addExtraAnim').addEventListener('click', () => {
    const animIndex = imageData.extraAnims.length;
    const anim = { id: `${id}_anim_${animIndex}`, x: 0, y: 0, opacity: 1, delay: 1, scale: 1, locked: false };

    // Lock previous animations
    imageData.extraAnims.forEach((prevAnim, i) => {
      prevAnim.locked = true;
      const prevDiv = wrapper.querySelectorAll('.extra-anims .exit-controls')[i];
      if (prevDiv) {
        const lockBox = prevDiv.querySelector('.lockExtraAnim');
        const xInput = prevDiv.querySelector('.animX');
        const yInput = prevDiv.querySelector('.animY');
        if (lockBox) lockBox.checked = true;
        if (xInput) xInput.disabled = true;
        if (yInput) yInput.disabled = true;
      }
    });

    imageData.extraAnims.push(anim);

    // Lock base image
    imageData.locked = true;
    wrapper.querySelector('.lockPosition').checked = true;
    wrapper.querySelector('.posX').disabled = true;
    wrapper.querySelector('.posY').disabled = true;

    const animDiv = document.createElement('div');
    animDiv.classList.add('exit-controls');
    animDiv.innerHTML = `
      <strong>Extra Animation ${animIndex + 1}</strong><br />
      X: <input type="number" class="animX" value="0" />
      Y: <input type="number" class="animY" value="0" />
      Opacity: <input type="number" class="animOpacity" step="0.1" value="1" />
      Scale: <input type="number" class="animScale" step="0.1" value="1" />
      Position (Time): <input type="number" class="animDelay" step="0.1" value="1" />
      <label><input type="checkbox" class="lockExtraAnim"> 🔒 Lock Animation</label>
      <button class="removeAnim">Remove</button>
    `;
    extraContainer.appendChild(animDiv);

    animDiv.addEventListener('click', (e) => {
      e.stopPropagation();
      activeDragTarget = { imgData: imageData, animIndex: animIndex };
      highlightPreview(imageData.id);
      highlightExtraAnim(wrapper, animIndex);
      updatePreviewAndCode();
    });

    const updateAnim = () => {
      anim.locked = animDiv.querySelector('.lockExtraAnim').checked;
      animDiv.querySelector('.animX').disabled = anim.locked;
      animDiv.querySelector('.animY').disabled = anim.locked;
      anim.delay = parseFloat(animDiv.querySelector('.animDelay').value) || 0;
      anim.x = parseFloat(animDiv.querySelector('.animX').value) || 0;
      anim.y = parseFloat(animDiv.querySelector('.animY').value) || 0;
      anim.opacity = parseFloat(animDiv.querySelector('.animOpacity').value) || 0;
      anim.scale = parseFloat(animDiv.querySelector('.animScale').value) || 1;
      updatePreviewAndCode();
    };
    animDiv.querySelectorAll('input').forEach(input => input.addEventListener('input', updateAnim));
    animDiv.querySelector('.lockExtraAnim').addEventListener('change', updateAnim);

    animDiv.querySelector('.removeAnim').addEventListener('click', () => {
      imageData.extraAnims.splice(animIndex, 1);
      extraContainer.removeChild(animDiv);
      updatePreviewAndCode();
    });

    updatePreviewAndCode();
  });

  // File upload
  const fileInput = wrapper.querySelector('.imageUpload');
  fileInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    wrapper.querySelector('.fileNameDisplay').textContent = file.name;

    const reader = new FileReader();
    reader.onload = function (event) {
      imageData.src = event.target.result;
      imageData.fileName = file.name;

      if (imageData.previewImg && imageData.previewImg.parentNode === previewArea) {
        previewArea.removeChild(imageData.previewImg);
      }

      const img = document.createElement('img');
      img.src = imageData.src;
      img.classList.add('preview');
      img.id = imageData.id;
      previewArea.appendChild(img);
      imageData.previewImg = img;

      updatePreviewAndCode();
    };
    reader.readAsDataURL(file);
  });
}

// "Add Image" button logic
document.getElementById('addImageBtn').addEventListener('click', () => {
  // Lock all previous images + animations
  imageList.forEach(prevImg => {
    prevImg.locked = true;
    const wrapper = prevImg.wrapper;
    wrapper.querySelector('.lockPosition').checked = true;
    wrapper.querySelector('.posX').disabled = true;
    wrapper.querySelector('.posY').disabled = true;

    prevImg.extraAnims.forEach((anim, i) => {
      anim.locked = true;
      const animDiv = wrapper.querySelectorAll('.extra-anims .exit-controls')[i];
      if (animDiv) {
        const lockBox = animDiv.querySelector('.lockExtraAnim');
        const xInput = animDiv.querySelector('.animX');
        const yInput = animDiv.querySelector('.animY');
        if (lockBox) lockBox.checked = true;
        if (xInput) xInput.disabled = true;
        if (yInput) yInput.disabled = true;
      }
    });
  });

  // Add new image block
  createControlBlock(imageList.length);
});
