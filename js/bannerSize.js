/* -----------------------------
   Banner Size Controls
------------------------------ */

function updateBannerSize() {
  const width = parseInt(widthInput.value) || 300;
  const height = parseInt(heightInput.value) || 250;
  previewArea.style.width = width + "px";
  previewArea.style.height = height + "px";
  updatePreviewAndCode();
}

widthInput.addEventListener('input', updateBannerSize);
heightInput.addEventListener('input', updateBannerSize);
