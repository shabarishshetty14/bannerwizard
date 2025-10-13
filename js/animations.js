/* -----------------------------
   Reanimate (Builder Preview)
   MODIFIED: Now fully resets the preview state before playing the animation to ensure a clean replay every time.
------------------------------ */

function reanimate() {
  // Clear active selection and label, ensuring the preview isn't showing an "inspected" state.
  activeDragTarget = { imgData: null, animIndex: null };
  // A full redraw ensures all elements are reset to their final static positions and visibility.
  // This provides a clean slate before applying the initial animation states for the replay.
  if (typeof updatePreviewAndCode === 'function') {
    updatePreviewAndCode();
  }

  gsap.killTweensOf("*");
  let tl = gsap.timeline();
  const { width: bannerW, height: bannerH } = getCurrentBannerSize();

  for (let i = 0; i < imageList.length; i++) {
    const img = imageList[i];
    // The redraw might not have created a previewImg if the image has no src, so check again.
    if (!img.previewImg) continue;

    const el = img.previewImg;
    const numericWidth = parseInt(img.width) || 200;
    const numericHeight = parseInt(img.height) || 100;

    // CRITICAL FIX: Ensure the element is visible before GSAP starts.
    // The updatePreviewAndCode call might have set display: 'none' if the element's
    // final calculated state was invisible. This line overrides that for the animation replay.
    el.style.display = '';

    // Set the element to its final CSS layout position. This is the 'base' for GSAP's transforms.
    gsap.set(el, {
      left: img.x,
      top: img.y,
      width: img.width,
      height: img.height,
    });


    // --- BASE ANIMATION LOGIC ---
    let startState = { x: 0, y: 0, scale: 1, opacity: 0 }; // Default start for "in" animations
    let toState = { x: 0, y: 0, opacity: img.opacity, scale: img.scale, duration: 1 };

    const presetFrom = getPresetGsap(img.preset, img);
    if (presetFrom) {
      Object.assign(startState, presetFrom);
      if (presetFrom.ease) {
          toState.ease = presetFrom.ease;
      }
    }

    // Handle EXIT presets, which have a different starting state.
    if (img.preset === 'fadeOut') {
        startState = { x: 0, y: 0, scale: img.scale, opacity: img.opacity }; // Start visible
        toState.opacity = 0; // Animate to invisible
    } else if (img.preset === 'zoomOut') {
        startState = { x: 0, y: 0, scale: img.scale, opacity: img.opacity }; // Start visible and at scale
        toState.scale = 0; // Animate to zero scale
        toState.opacity = 0; // And fade out
    } else if (img.preset === 'slideOutLeft') {
        startState = { x: 0, y: 0, scale: img.scale, opacity: img.opacity };
        toState.x = -(img.x + numericWidth);
    } else if (img.preset === 'slideOutRight') {
        startState = { x: 0, y: 0, scale: img.scale, opacity: img.opacity };
        toState.x = bannerW - img.x;
    } else if (img.preset === 'slideOutTop') {
        startState = { x: 0, y: 0, scale: img.scale, opacity: img.opacity };
        toState.y = -(img.y + numericHeight);
    } else if (img.preset === 'slideOutBottom') {
        startState = { x: 0, y: 0, scale: img.scale, opacity: img.opacity };
        toState.y = bannerH - img.y;
    }


    // Apply the calculated starting state and add the main animation to the timeline
    gsap.set(el, startState);
    tl.to(el, toState, img.delay);


    // --- Extra Animations ---
    let cumulativeX = 0;
    let cumulativeY = 0;
    img.extraAnims.forEach(anim => {
      if (anim.preset === 'pulse') {
        tl.to(el, { scale: '+=0.1', yoyo: true, repeat: 1, duration: 0.5 }, anim.delay);
      } else if (anim.preset === 'fadeOut') {
        tl.to(el, { opacity: 0 }, anim.delay);
      } else if (anim.preset === 'zoomOut') {
        tl.to(el, { scale: 0, opacity: 0 }, anim.delay);
      } else if (anim.preset === 'slideOutLeft') {
        tl.to(el, { x: -(img.x + numericWidth) }, anim.delay);
      } else if (anim.preset === 'slideOutRight') {
        tl.to(el, { x: bannerW - img.x }, anim.delay);
      } else if (anim.preset === 'slideOutTop') {
        tl.to(el, { y: -(img.y + numericHeight) }, anim.delay);
      } else if (anim.preset === 'slideOutBottom') {
        tl.to(el, { y: bannerH - img.y }, anim.delay);
      } else {
         // Custom and all "In" presets are treated as a standard 'to' tween.
         cumulativeX += anim.x;
         cumulativeY += anim.y;
         const extraToState = {
            x: cumulativeX,
            y: cumulativeY,
            opacity: anim.opacity,
            scale: anim.scale,
            duration: 1
         };
         tl.to(el, extraToState, anim.delay);
      }
    });

    if (img.breakpoint) {
      tl.call(() => tl.pause());
      break;
    }
  }
}