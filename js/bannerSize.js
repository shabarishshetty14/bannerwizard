/* -----------------------------
   Banner Size Controls
------------------------------ */

/**
 * Reads the selected size from the dropdown, updates the preview area,
 * and triggers a full preview and code regeneration.
 */
function updateBannerSize() {
  const select = document.getElementById('bannerSizeSelect');
  if (!select) return;

  const size = select.value.split('x');
  const width = parseInt(size[0]) || 300;
  const height = parseInt(size[1]) || 250;

  // Use the globally declared previewArea, do not re-declare it
  if (previewArea) {
    previewArea.style.width = width + "px";
    previewArea.style.height = height + "px";
  }

  // Also update the Primary CTA overlay size inputs to match
  const primaryCtaWidthInput = document.getElementById('primaryCtaWidth');
  const primaryCtaHeightInput = document.getElementById('primaryCtaHeight');
  if (primaryCtaWidthInput) primaryCtaWidthInput.value = width;
  if (primaryCtaHeightInput) primaryCtaHeightInput.value = height;

  // NEW: Update ISI state with sensible defaults for the selected banner size
  if (window.isiState) {
      if (width === 300 && height === 600) {
          window.isiState.x = 0;
          window.isiState.y = 431;
          window.isiState.width = 299;
          window.isiState.height = 168;
      } else if (width === 160 && height === 600) {
          window.isiState.x = 0;
          window.isiState.y = 431;
          window.isiState.width = 159;
          window.isiState.height = 168;
      } else if (width === 728 && height === 90) {
          window.isiState.x = 573; // right: 0px means x = 728 - 155
          window.isiState.y = 0;
          window.isiState.width = 155;
          window.isiState.height = 89;
      } else if (width === 970 && height === 90) {
          window.isiState.x = 815; // right: 0px means x = 970 - 155
          window.isiState.y = 0;
          window.isiState.width = 155;
          window.isiState.height = 89;
      } else if (width === 970 && height === 250) {
          window.isiState.x = 0;
          window.isiState.y = 179;
          window.isiState.width = 969;
          window.isiState.height = 70;
      } else { // Default for 300x250 and others
          window.isiState.x = 0;
          window.isiState.y = 180;
          window.isiState.width = 299;
          window.isiState.height = 69;
      }
  }


  // Call the main update function to regenerate everything
  if (typeof updatePreviewAndCode === 'function') {
    updatePreviewAndCode();
  }
}

/**
 * Helper function to get the current width and height from the dropdown.
 * @returns {{width: number, height: number}}
 */
function getCurrentBannerSize() {
    const select = document.getElementById('bannerSizeSelect');
    if (!select) return { width: 300, height: 250 }; // Default fallback

    const size = select.value.split('x');
    const width = parseInt(size[0]) || 300;
    const height = parseInt(size[1]) || 250;
    return { width, height };
}

// Attach event listener to the dropdown
const bannerSizeSelect = document.getElementById('bannerSizeSelect');
if (bannerSizeSelect) {
    bannerSizeSelect.addEventListener('change', updateBannerSize);
}

// Set the initial size when the application loads
document.addEventListener('DOMContentLoaded', () => {
    updateBannerSize();
});