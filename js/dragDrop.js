/* -----------------------------
   Drag & Drop in Preview Area
------------------------------ */

let dragState = null; 
// Structure: { imgData, animIndex, el, startMouseX, startMouseY, startLeft, startTop, maxX, maxY }

previewArea.addEventListener('mousedown', (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement && target.classList.contains('preview'))) return;

  const imgData = getImageDataById(target.id);
  if (!imgData) return;
  const animIndex = activeDragTarget.animIndex;

  // Check lock state
  if (animIndex === null && imgData.locked) return;
  if (animIndex !== null && imgData.extraAnims[animIndex]?.locked) return;

  const rectParent = previewArea.getBoundingClientRect();
  const rectElem = target.getBoundingClientRect();

  dragState = {
    imgData,
    animIndex: activeDragTarget.animIndex,
    el: target,
    startMouseX: e.clientX,
    startMouseY: e.clientY,
    startLeft: rectElem.left - rectParent.left,
    startTop: rectElem.top - rectParent.top,
    maxX: previewArea.clientWidth - target.offsetWidth,
    maxY: previewArea.clientHeight - target.offsetHeight
  };

  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);
  e.preventDefault();
});

function onDragMove(e) {
  if (!dragState) return;
  const dx = e.clientX - dragState.startMouseX;
  const dy = e.clientY - dragState.startMouseY;

  let newLeft = dragState.startLeft + dx;
  let newTop = dragState.startTop + dy;

  // Snap to grid if enabled
  if (document.getElementById('snapToGridToggle').checked) {
    newLeft = snapToGrid(newLeft);
    newTop = snapToGrid(newTop);
  }

  dragState.el.style.left = newLeft + 'px';
  dragState.el.style.top = newTop + 'px';
}

function onDragEnd() {
  if (!dragState) return;
  const { imgData, animIndex } = dragState;
  const newX = parseInt(dragState.el.style.left) || 0;
  const newY = parseInt(dragState.el.style.top) || 0;

  if (animIndex === null) {
    imgData.x = newX;
    imgData.y = newY;
    const wrapper = imgData.wrapper;
    wrapper.querySelector('.posX').value = imgData.x;
    wrapper.querySelector('.posY').value = imgData.y;
  } else {
    const anim = imgData.extraAnims[animIndex];
    if (!anim) return;

    // Compute cumulative offset of previous animations
    let cumulativeX = 0, cumulativeY = 0;
    for (let i = 0; i < animIndex; i++) {
      cumulativeX += imgData.extraAnims[i].x;
      cumulativeY += imgData.extraAnims[i].y;
    }

    anim.x = newX - imgData.x - cumulativeX;
    anim.y = newY - imgData.y - cumulativeY;

    const animDiv = imgData.wrapper
      .querySelectorAll('.extra-anims .exit-controls')[animIndex];
    if (animDiv) {
      animDiv.querySelector('.animX').value = anim.x;
      animDiv.querySelector('.animY').value = anim.y;
    }
  }

  updatePreviewAndCode();
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', onDragEnd);
  dragState = null;
}
