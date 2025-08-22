/* -----------------------------
   Reanimate (Builder Preview)
------------------------------ */

function reanimate() {
  // Clear active selection and label
  activeDragTarget = { imgData: null, animIndex: null };
  labelElement.style.display = 'none';

  gsap.killTweensOf("*");
  let tl = gsap.timeline();

  for (let i = 0; i < imageList.length; i++) {
    const img = imageList[i];
    if (!img.previewImg) continue;

    const el = img.previewImg;
    gsap.set(el, {
      x: 0, y: 0, opacity: 0,
      width: img.width,
      height: img.height,
      left: img.x,
      top: img.y,
      scale: img.scale
    });

    // Base animation
    tl.to(el, {
      opacity: img.opacity,
      scale: img.scale,
      duration: 1
    }, img.delay);

    // Extra animations
    let totalX = 0, totalY = 0;
    img.extraAnims.forEach(anim => {
      totalX += anim.x;
      totalY += anim.y;
      tl.to(el, {
        x: totalX,
        y: totalY,
        opacity: anim.opacity,
        scale: anim.scale,
        duration: 1
      }, anim.delay);
    });

    if (img.breakpoint) {
      tl.call(() => tl.pause());
      break;
    }
  }
}
