/* -----------------------------
   App Entry Point
------------------------------ */

document.addEventListener('DOMContentLoaded', () => {
  // Apply default banner size on load
  updateBannerSize();

  // Create the first image control block automatically
  // (If you don't want an image block on start, comment this out)
  // createControlBlock(imageList.length);

  // ISI scroll init happens inside updatePreviewAndCode when enabled
});
