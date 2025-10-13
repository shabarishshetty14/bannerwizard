/* -----------------------------
   ISI Drag and Resize Logic
------------------------------ */

function initIsiInteraction() {
  let activeHandle = null;
  let startX, startY, startWidth, startHeight, startLeft, startTop;

  const previewArea = document.getElementById('previewArea');

  previewArea.addEventListener('mousedown', (e) => {
    const wrapper = document.getElementById('isiInteractiveWrapper');
    if (!wrapper) return;

    const target = e.target;

    // Check if the click is on the resize handle
    if (target.classList.contains('isi-resize-handle')) {
      activeHandle = 'resize';
      e.preventDefault();
      startX = e.clientX;
      startY = e.clientY;
      startWidth = wrapper.offsetWidth;
      startHeight = wrapper.offsetHeight;
    }
    // **CORRECTED LOGIC:** Check if the click is on the new dedicated drag bar
    else if (target.classList.contains('isi-drag-bar')) {
      activeHandle = 'drag';
      e.preventDefault();
      startX = e.clientX;
      startY = e.clientY;
      startLeft = wrapper.offsetLeft;
      startTop = wrapper.offsetTop;
    } else {
      activeHandle = null;
    }

    if (activeHandle) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }
  });

  function onMouseMove(e) {
    if (!activeHandle) return;

    const wrapper = document.getElementById('isiInteractiveWrapper');
    if (!wrapper) return;

    if (activeHandle === 'drag') {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      let newLeft = startLeft + dx;
      let newTop = startTop + dy;

      if (document.getElementById('snapToGridToggle').checked) {
        newLeft = Math.round(newLeft / 10) * 10;
        newTop = Math.round(newTop / 10) * 10;
      }

      window.isiState.x = newLeft;
      window.isiState.y = newTop;
    } else if (activeHandle === 'resize') {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      let newWidth = startWidth + dx;
      let newHeight = startHeight + dy;

      if (document.getElementById('snapToGridToggle').checked) {
        newWidth = Math.round(newWidth / 10) * 10;
        newHeight = Math.round(newHeight / 10) * 10;
      }
      
      newWidth = Math.max(50, newWidth);
      newHeight = Math.max(30, newHeight);

      window.isiState.width = newWidth;
      window.isiState.height = newHeight;
    }

    if (typeof updatePreviewAndCode === 'function') {
      updatePreviewAndCode();
    }
  }

  function onMouseUp() {
    activeHandle = null;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }
}

document.addEventListener('DOMContentLoaded', initIsiInteraction);