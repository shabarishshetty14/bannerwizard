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

// Shrink In and Out Function
const toggleBtn = document.getElementById('toggleLeftPanel');
const leftPanel = document.getElementById('leftPanel');
const icon = toggleBtn.querySelector('i');

toggleBtn.addEventListener('click', () => {
    leftPanel.classList.toggle('collapsed');

    if (leftPanel.classList.contains('collapsed')) {
        // Panel is collapsed → show original icon
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-up-right-and-down-left-from-center');
    } else {
        // Panel is open → show X icon
        icon.classList.remove('fa-up-right-and-down-left-from-center');
        icon.classList.add('fa-xmark');
    }
});



