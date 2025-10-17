/* -----------------------------
   Preview Rendering + Generated Code Output
   Enhanced: Primary CTA overlay + per-layer clickTag ordering & export
   NEW: Animation presets support
   MODIFIED: Elements with a final opacity of 0 are now hidden in the preview.
   FIXED: Statically rendered preview now correctly calculates and hides elements whose final animation state has an opacity of 0 (from custom values or presets like fadeOut).
------------------------------ */

const outputCode = document.getElementById('outputCode');
const isiEditorWrap = document.getElementById('isiEditorWrap'); // may not be used but left for compatibility

// Default inner HTML for ISI (fallback)
const isiInnerDefault = `
<h1>INDICATION and IMPORTANT SAFETY INFORMATION</h1>
<ul>
<li><span></span>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
</p>
</li>
</ul>
<h1>IMPORTANT SAFETY INFORMATION</h1>
<h1 >CONTRAINDICATIONS:</h1>
<ul>
<li><span></span>
<p>some text added here  some text added here some text added here some text added here</p>
</li>
<li><span></span>
<p>some text added here  some text added here some text added here some text added here</p>
</li>
<li><span></span>
<p>some text added here  some text added here some text added here some text added here</p>
</li>
</ul>
<h1>WARNINGS AND PRECAUTIONS:</h1>
<ul>
<li><span></span>
<p><span class="bold-italic">Test:</span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
</p>
</li>
</ul>
`;

/* -----------------------------
   Copy generated code
------------------------------ */
document.getElementById('copyCodeBtn').addEventListener('click', () => {
  const code = outputCode.textContent;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('copyCodeBtn');
    const originalText = btn.innerHTML; // Store original HTML content
    btn.innerHTML = '✅ Copied!';
    setTimeout(() => btn.innerHTML = originalText, 2000);
  }).catch(err => {
    alert("Failed to copy code: " + err);
  });
});

/*
  NOTE: The getPresetGsap function has been moved to utils.js
  to be shared with animations.js
*/


/* -----------------------------
   ISI helper wrappers that use Quill content when available
------------------------------ */

function getIsiInner() {
  // prefer Quill instance content
  if (window.quill && typeof window.quill.root !== 'undefined') {
    const content = window.quill.root.innerHTML;
    // Use saved content even if it's empty, allowing users to clear it
    if (content && window.isiState.isCustom) return content;
    if (content && content.trim().length > 1) return content;
  }
  // fallback to saved HTML variable (set by modal save or by import)
  if (window.isiContentHTML && window.isiContentHTML.trim().length) {
    return window.isiContentHTML;
  }

  // last fallback default
  return isiInnerDefault;
}

// MODIFIED: This function now includes styles to make room for the drag bar.
function getIsiCSS() {
  const DRAG_BAR_HEIGHT = '20px'; // Define the height of our drag bar

  return `
 a {
color: #57585a;
text-decoration: underline;
font-weight: 600;
}

a:hover {
cursor: pointer;
}

.tel {
text-decoration: none;
color: #000000;
}

p,
h1,
.isi h2,
h3,
h4,
h5 {
margin: 0;
}

.hyphenate {
word-wrap: break-word;
overflow-wrap: break-word;

-webkit-hyphens: auto;
-moz-hyphens: auto;
hyphens: auto;
}


.isi {
padding: 0px 2px;
box-sizing: border-box;
}

.isi h1 {
font-family: Arial, sans-serif;
font-size: 12px;
line-height: 14px;
color: #d50032;
text-transform: uppercase;
font-weight: bold;
padding-top: 12px;
}

.isi h1 sup {
font-size: 6px;
vertical-align: 2px;
}

.isi p {
font-family: Arial, sans-serif;
color: #63666a;
font-size: 12px;
line-height: 14px;
margin-bottom: 0px;
text-align: left;
}

.isi .bold {
font-weight: bold;
}

.isi p .bold-italic {
font-weight: bold;
font-style: italic;
}

.italic {
font-style: italic;
}

.isi p.pm2 {
margin-bottom: 4px;
}

.isi p strong {
color: #63666a;
font-weight: 900;
}

.isi p a {
color: #d50032;
font-weight: normal;
}

.isi ul {
margin: 0;
font-family: Arial, sans-serif;
color: #63666a;
font-size: 12px;
line-height: 13px;
list-style: none;
padding-left: 15px;
}

.isi li {
color: #63666a;
font-size: 12px;
line-height: 13px;
position: relative;
margin-left: 0px;
}

.isi li>span {
width: 3px;
height: 3px;
background-color: #63666a;
border-radius: 50%;
position: absolute;
top: 5px;
left: -7px;
}
`;
}
// NEW: Function to get essential ISI structural CSS that should not be overridden.
function getIsiStructureCSS() {
    const DRAG_BAR_HEIGHT = '20px';
    return `
#iframe_tj {
  position: absolute;
  width: 100%;
  height: calc(100% - ${DRAG_BAR_HEIGHT});
  top: ${DRAG_BAR_HEIGHT};
  left: 0;
  border: none;
  background-color: #ffffff;
  z-index: 99;
}

#scroll_tj {
  position: absolute;
  overflow: hidden;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  scrollbar-width: auto;
  scrollbar-color: #63666a #b6b8ba;
  scroll-behavior: auto;
}

#scroll_tj::-webkit-scrollbar {
  width: 8px;
}

#scroll_tj::-webkit-scrollbar-track {
  background-color: #ededed;
}

#scroll_tj::-webkit-scrollbar-thumb {
  background-color: #b3b3b3;
  border: 0px;
  border-left: #ededed 2px;
  border-right: #ededed 2px;
  border-style: solid;
}
    `;
}

function getIsiHTML() {
  const inner = getIsiInner();
  const state = window.isiState;
  // NOTE: We don't need the drag bar in the final exported code.
  return `
  <div id="iframe_tj" style="position: absolute; left: ${state.x}px; top: ${state.y}px; width: ${state.width}px; height: ${state.height}px;">
    <div id="scroll_tj"
      onMouseOver="(scrollStarted?pauseDiv():null)"
      onMouseOut="(scrollStarted?resumeDiv():null)">
      <div class="isi" id="isi">
        ${inner}
      </div>
    </div>
  </div>
  `;
}

function getIsiPreviewHTML() {
  const inner = getIsiInner();
  return `
  <div id="scroll_tj"
    onMouseOver="(scrollStarted?pauseDiv():null)"
    onMouseOut="(scrollStarted?resumeDiv():null)">
    <div class="isi" id="isi">
      ${inner}
    </div>
  </div>
  `;
}

function getIsiScrollScript() {
  return `
<script>
var ScrollRate = 125;
var divName = 'scroll_tj';
function scrollDiv_init() {
  DivElmnt = document.getElementById(divName);
  ReachedMaxScroll = false;
  DivElmnt.scrollTop = 0;
  PreviousScrollTop = 0;
  scrollDivStart = setTimeout(startScroll, tl.totalDuration() * 1000);
}
function startScroll() {
  scrollStarted = true;
  clearTimeout(scrollDivStart);
  ScrollInterval = setInterval('scrollDiv()', ScrollRate);
}
function scrollDiv() {
  if (!ReachedMaxScroll) {
    DivElmnt.scrollTop = PreviousScrollTop;
    PreviousScrollTop++;
    ReachedMaxScroll = DivElmnt.scrollTop >= (DivElmnt.scrollHeight - DivElmnt.offsetHeight);
  }
}
function pauseDiv() { clearInterval(ScrollInterval); }
function resumeDiv() {
  PreviousScrollTop = DivElmnt.scrollTop;
  ScrollInterval = setInterval('scrollDiv()', ScrollRate);
}
window.onload = scrollDiv_init;
</script>
`;
}

/* -----------------------------
   small helper to escape HTML when exporting text
----------------------------- */
function escapeHtml(str) {
  if (!str && str !== '') return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* -----------------------------
   ClickTag helpers & validation
----------------------------- */

const CLICK_VALID_RE = /^https?:\/\/.+/i;

function isValidClickUrl(url) {
  return typeof url === 'string' && CLICK_VALID_RE.test(url.trim());
}

/**
 * buildClickTagOrdering()
 * - returns array of urls in order: [primary(if valid), ...layerUrls...]
 * - also returns a mapping object { [layerId] : index } (1-based) for easy attribution
 */
function buildClickTagOrdering() {
  // ensure global primaryCta exists
  window.primaryCta = window.primaryCta || { enabled: false, url: '', width: null, height: null };

  const ordering = [];
  const mapping = {}; // layerId -> index (1-based)
  let index = 1;

  // read current primary CTA UI values into window.primaryCta (so exports persist what user set)
  const enableEl = document.getElementById('enablePrimaryCta');
  const urlEl = document.getElementById('primaryCtaUrl');
  const wEl = document.getElementById('primaryCtaWidth');
  const hEl = document.getElementById('primaryCtaHeight');

  if (enableEl) window.primaryCta.enabled = !!enableEl.checked;
  if (urlEl) window.primaryCta.url = (urlEl.value || '').trim();
  if (wEl) window.primaryCta.width = parseInt(wEl.value) || null;
  if (hEl) window.primaryCta.height = parseInt(hEl.value) || null;

  // If primary CTA is enabled and has a valid URL, it becomes clickTag1
  if (window.primaryCta.enabled && isValidClickUrl(window.primaryCta.url)) {
    ordering.push(window.primaryCta.url);
    // no mapping for primary (it's overlay), we'll map layers only
    index++;
  }

  // iterate imageList in order and collect valid clickTag layers
  for (let i = 0; i < imageList.length; i++) {
    const el = imageList[i];
    if (el.hasClickTag && isValidClickUrl(el.clickTagUrl)) {
      mapping[el.id] = index;
      ordering.push(el.clickTagUrl);
      index++;
    }
  }

  return { ordering, mapping };
}

/* -----------------------------
   Core updatePreviewAndCode function (enhanced)
------------------------------ */

function updatePreviewAndCode() {
  // Update the global isiState from the checkbox
  window.isiState.enabled = document.getElementById('enableIsiCheckbox').checked;
  const isiEnabled = window.isiState.enabled;


  // Remove old ISI style
  const existingIsiStyle = document.getElementById('isi-style-tag');
  if (existingIsiStyle) existingIsiStyle.remove();
    const existingIsiStructureStyle = document.getElementById('isi-structure-style-tag');
    if (existingIsiStructureStyle) existingIsiStructureStyle.remove();

  // Add ISI style if enabled
  if (isiEnabled) {
    const style = document.createElement('style');
    style.id = 'isi-style-tag';

        // Always add structural CSS
        const structureStyle = document.createElement('style');
        structureStyle.id = 'isi-structure-style-tag';
        structureStyle.textContent = `/* ISI Structural Styles */\n` + getIsiStructureCSS();
        document.head.appendChild(structureStyle);

    // ***MODIFIED: Use custom CSS if available, otherwise use default***
    if (window.isiState.isCustom && window.isiContentCSS) {
      style.textContent = `/* Custom ISI Styles */\n` + window.isiContentCSS;
    } else {
      style.textContent = `/* Preset ISI Styles */\n` + getIsiCSS();
    }
    document.head.appendChild(style);
  }

  // Temporarily remove label
  if (labelElement && labelElement.parentNode === previewArea) {
    previewArea.removeChild(labelElement);
  }
  previewArea.innerHTML = '';

  const { width: bannerW, height: bannerH } = getCurrentBannerSize();


  // Build clickTag ordering & mapping
  const clickData = buildClickTagOrdering();
  const clickOrdering = clickData.ordering; // array of urls
  const clickMap = clickData.mapping; // layerId -> index

  // HTML Output header + style block
  let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Generated Banner</title>
<meta name="ad.size" content="width=${bannerW},height=${bannerH}">
<style>
* {margin: 0;padding: 0;box-sizing: border-box;user-select: none;outline: 0;font-family:Arial, sans-serif;}
#banner-wrapper { position: relative; width: ${bannerW}px; height: ${bannerH}px; overflow: hidden; background: #eee; border: 1px solid #727479; }
img { position: absolute; }
.banner-text { position: absolute; white-space: pre-wrap; }
`;

  // Add styles for each element
  imageList.forEach(el => {
    let styleProperties = '';
    // If it has a valid click tag, add z-index and cursor.
    if (el.hasClickTag && isValidClickUrl(el.clickTagUrl)) {
        styleProperties += 'z-index: 20; cursor: pointer; ';
    }

    if (el.type === 'image') {
      html += `#${el.id} { left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}; ${styleProperties}}\n`;
    } else if (el.type === 'text') {
      const fontStyle = el.italic ? 'italic' : 'normal';
      const textDecoration = el.underline ? 'underline' : 'none';
      const fontWeight = el.bold ? 'bold' : 'normal';
      const widthVal = (typeof el.width !== 'undefined' && el.width !== null) ? el.width : 200;
      html += `#${el.id} { left: ${el.x}px; top: ${el.y}px; width: ${widthVal}px; font-size: ${el.fontSize}px; color: ${el.color}; font-style: ${fontStyle}; text-decoration: ${textDecoration}; font-weight: ${fontWeight}; word-wrap: break-word; transform-origin: 0 0; ${styleProperties}}\n`;
    }
  });


  html += `</style>\n`;

    if (isiEnabled) {
        // Always include structural CSS in the export
        html += `<style>${getIsiStructureCSS()}</style>\n`;

        // Include custom or default theme CSS
        if (window.isiState.isCustom && window.isiContentCSS) {
            html += `<style>${window.isiContentCSS}</style>\n`;
        } else {
            html += `<style>${getIsiCSS()}</style>\n`;
        }
    }

  // Prepend clickTag JS variables (only if we have any)
  if (clickOrdering.length > 0) {
    html += `<script>\n`;
    for (let i = 0; i < clickOrdering.length; i++) {
      const idx = i + 1;
      const safeUrl = clickOrdering[i].replace(/"/g, '\\"');
      html += `  var clickTag${idx} = "${safeUrl}";\n`;
    }
    html += `</script>\n`;
  }

  html += `<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.5.1/gsap.min.js"></script>\n</head>\n<body>\n<div id="banner-wrapper">\n`;

  // If primary CTA is enabled and valid, export overlay as clickTag1 (insert before content)
  // Primary CTA keeps z-index:10 so exported elements (z-index:20) will sit above it if needed
  if (window.primaryCta && window.primaryCta.enabled && isValidClickUrl(window.primaryCta.url)) {
    const ovW = window.primaryCta.width || bannerW;
    const ovH = window.primaryCta.height || bannerH;
    html += `<div id="banner_link" style="position:absolute; left:0; top:0; width:${ovW}px; height:${ovH}px; cursor:pointer; z-index:10;" onclick="window.open(window.clickTag1, '_blank')"></div>\n`;
  }

  const stopAt = imageList.findIndex(el => el.breakpoint);
  // iterate imageList and produce exported element markup with onclick if mapped
  imageList.forEach((el, index) => {
    if (stopAt !== -1 && index > stopAt) return;

    if (el.type === 'image') {
      if (!el.src) return;
      // determine if this layer has a clickTag mapping
      const mappedIndex = clickMap[el.id];
      const onclickAttr = mappedIndex ? ` onclick="window.open(window.clickTag${mappedIndex}, '_blank')"` : '';
      html += `<img id="${el.id}" src="${el.fileName}"${onclickAttr} />\n`;
    } else if (el.type === 'text') {
      const safe = escapeHtml(el.text || '');
      const mappedIndex = clickMap[el.id];
      const onclickAttr = mappedIndex ? ` onclick="window.open(window.clickTag${mappedIndex}, '_blank')"` : '';
      html += `<div id="${el.id}" class="banner-text"${onclickAttr}>${safe}</div>\n`;
    }
  });

  // Builder Preview element in editor: create live preview DOM nodes and include onclick attrs for visibility
  imageList.forEach((el, index) => {
    if (stopAt !== -1 && index > stopAt) return;

    // --- REFINED & CORRECTED FINAL STATE CALCULATION ---
    let liveX = el.x;
    let liveY = el.y;
    let liveOpacity = el.opacity;
    let liveScale = el.scale;
    let currentPreset = el.preset;

    const isInspectingThisElement = activeDragTarget && activeDragTarget.imgData === el;

    // Determine the final animation index to consider for the static preview.
    // If not inspecting this element, consider ALL animations to get the final state.
    // If inspecting, consider animations up to the selected one.
    // `animIndex` is null for the base, so we use `?? -1` to ensure the loop doesn't run for the base state.
    const lastAnimIndexToConsider = isInspectingThisElement
        ? (activeDragTarget.animIndex ?? -1)
        : (el.extraAnims.length - 1);

    // Accumulate transformations to find the state at the desired point in the timeline.
    for (let i = 0; i <= lastAnimIndexToConsider; i++) {
        const anim = el.extraAnims[i];
        if (anim) {
            liveX += anim.x;
            liveY += anim.y;
            liveScale *= anim.scale;
            liveOpacity = anim.opacity; // The latest animation's opacity wins
            currentPreset = anim.preset; // The latest animation's preset wins
        }
    }

    // After calculating the state, check if the effective preset is an "out" animation.
    const outPresets = ['fadeOut', 'zoomOut', 'slideOutLeft', 'slideOutRight', 'slideOutTop', 'slideOutBottom'];
    if (outPresets.includes(currentPreset)) {
        liveOpacity = 0;
    }
    // --- END OF CORRECTED CALCULATION ---

    let previewEl;
    if (el.type === 'image') {
      if (!el.src) return;
      previewEl = document.createElement('img');
      previewEl.src = el.src;
      previewEl.id = el.id;
      previewEl.classList.add('preview');
      previewEl.style.width = el.width + "px";
      previewEl.style.height = el.height + "px";
      previewEl.style.position = "absolute";
      if (el.hasClickTag && isValidClickUrl(el.clickTagUrl)) {
        previewEl.style.zIndex = '20';
        previewEl.style.cursor = 'pointer';
      }
    } else if (el.type === 'text') {
      previewEl = document.createElement('div');
      previewEl.classList.add('preview', 'banner-text');
      previewEl.id = el.id;
      previewEl.innerHTML = el.text || '';
      previewEl.style.position = "absolute";
      previewEl.style.fontSize = (el.fontSize || 14) + "px";
      previewEl.style.color = el.color || '#000';
      previewEl.style.fontStyle = el.italic ? 'italic' : 'normal';
      previewEl.style.textDecoration = el.underline ? 'underline' : 'none';
      previewEl.style.fontWeight = el.bold ? 'bold' : 'normal';
      if (typeof el.width !== 'undefined' && el.width !== null && el.width !== 'auto') {
        const w = Number(el.width) || 0;
        previewEl.style.width = w + 'px';
      } else if (el.width === 'auto') {
        previewEl.style.width = 'auto';
      } else {
        previewEl.style.width = (el.width || 200) + 'px';
      }
      previewEl.style.wordWrap = 'break-word';
      if (el.hasClickTag && isValidClickUrl(el.clickTagUrl)) {
        previewEl.style.zIndex = '20';
        previewEl.style.cursor = 'pointer';
      }
    }

    // apply computed live transforms
    if (previewEl) {
      previewEl.style.left = liveX + "px";
      previewEl.style.top = liveY + "px";
      previewEl.style.opacity = liveOpacity;
      previewEl.style.transform = `scale(${liveScale})`;

      // If final opacity is 0, hide the element from the preview layout entirely.
      if (liveOpacity <= 0) {
        previewEl.style.display = 'none';
      } else {
        previewEl.style.display = ''; // Reset to default display
      }

      // if this layer has a clickTag mapping, set the onclick attribute for visibility in DOM
      if (clickMap[el.id]) {
        const mappedIndex = clickMap[el.id];
        // attach attribute string (so inspector shows it). This would navigate if executed,
        // so we install a global editor-level interceptor to prevent navigation while editing.
        previewEl.setAttribute('onclick', `window.open(window.clickTag${mappedIndex}, '_blank')`);
        // also set a data attribute so editor code can identify these nodes
        previewEl.setAttribute('data-clicktag-index', mappedIndex);
      } else {
        previewEl.removeAttribute('onclick');
        previewEl.removeAttribute('data-clicktag-index');
      }

      previewArea.appendChild(previewEl);
      el.previewImg = previewEl;
    }

    // Highlight + label for selected
    if (isInspectingThisElement) {
      if (el.previewImg) el.previewImg.classList.add("highlighted");
      const labelText = activeDragTarget.animIndex === null
        ? `${el.type === 'image' ? 'Base Image' : 'Base Text'} ${imageList.indexOf(el) + 1}`
        : `Extra Animation ${activeDragTarget.animIndex + 1} of ${el.type === 'image' ? 'Image' : 'Text'} ${imageList.indexOf(el) + 1}`;
      labelElement.textContent = labelText;
      labelElement.style.display = 'block';
      labelElement.style.left = `${liveX + 5}px`;
      labelElement.style.top = `${liveY - 10}px`;
    } else {
      if (el.previewImg) el.previewImg.classList.remove("highlighted");
    }
  });

  // Insert Primary CTA overlay into preview (if enabled & valid)
  if (window.primaryCta && window.primaryCta.enabled && isValidClickUrl(window.primaryCta.url)) {
    // ensure overlay size defaults to banner size if user left inputs blank
    const ovW = window.primaryCta.width || bannerW;
    const ovH = window.primaryCta.height || bannerH;

    // create or reuse overlay node
    let overlay = document.getElementById('banner_link');
    const bannerWrapperNode = previewArea.querySelector('#banner-wrapper') || previewArea;

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'banner_link';
      // visual style (same as index.html inline style)
      overlay.style.position = 'absolute';
      overlay.style.left = '0px';
      overlay.style.top = '0px';
      overlay.style.cursor = 'pointer';
      overlay.style.zIndex = '10'; // primary CTA retains z-index 10
      overlay.style.border = '2px dashed rgba(35,155,167,0.9)';
      overlay.style.background = 'rgba(35,155,167,0.08)';
      // IMPORTANT: don't block pointer events by default so editor dragging/dropping works
      overlay.style.pointerEvents = 'none';
      // append to banner-wrapper so it overlays the banner only
      try {
        bannerWrapperNode.appendChild(overlay);
      } catch (e) {
        // fallback to previewArea if append fails
        previewArea.appendChild(overlay);
      }

      // Install key/mouse listeners once to allow testing clicks while holding Ctrl/Meta/Shift.
      if (!window.__primary_overlay_key_handlers_installed) {
        const updateOverlayPointer = (anyMod) => {
          const ov = document.getElementById('banner_link');
          if (!ov) return;
          ov.style.pointerEvents = anyMod ? 'auto' : 'none';
        };

        const keyHandler = (ev) => {
          const anyMod = !!(ev.ctrlKey || ev.metaKey || ev.shiftKey);
          updateOverlayPointer(anyMod);
        };
        const mouseMoveHandler = (ev) => {
          const anyMod = !!(ev.ctrlKey || ev.metaKey || ev.shiftKey);
          updateOverlayPointer(anyMod);
        };
        const blurHandler = () => {
          // when window loses focus, ensure overlay goes back to non-intercepting
          updateOverlayPointer(false);
        };

        window.addEventListener('keydown', keyHandler, true);
        window.addEventListener('keyup', keyHandler, true);
        window.addEventListener('mousemove', mouseMoveHandler, true);
        window.addEventListener('blur', blurHandler, true);

        // keep a simple observer to ensure overlay pointer-events not left enabled if overlay removed/re-added
        const observer = new MutationObserver(() => {
          const ov = document.getElementById('banner_link');
          if (!ov) {
            // overlay removed — nothing to do; listeners can stay installed (they're cheap).
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        window.__primary_overlay_key_handlers_installed = true;
      }
    }

    overlay.style.width = ovW + 'px';
    overlay.style.height = ovH + 'px';
    // set attribute to mirror export (but editor prevents navigation unless modifier pressed)
    overlay.setAttribute('onclick', `window.open(window.clickTag1, '_blank')`);
    overlay.setAttribute('data-clicktag-index', '1');

    // Ensure overlay pointer-events reflects current modifier state (if any)
    const anyModifierNow = !!((window.event && (window.event.ctrlKey || window.event.metaKey || window.event.shiftKey)));
    overlay.style.pointerEvents = anyModifierNow ? 'auto' : 'none';
  } else {
    // remove overlay if present
    const existingOverlay = document.getElementById('banner_link');
    if (existingOverlay && existingOverlay.parentNode) existingOverlay.parentNode.removeChild(existingOverlay);
  }

  // Add ISI HTML if enabled
  if (isiEnabled) {
    html += getIsiHTML();
  }

  html += `</div>\n<script>\nconst tl = gsap.timeline();\nfunction startAd() {\n`;
  
  // Define banner dimensions as constants inside the generated script
  html += `  const bannerW = ${bannerW};\n`;
  html += `  const bannerH = ${bannerH};\n`;

  // GSAP animations (works for images and text; both are DOM targets by id)
  let stop = false;
  imageList.forEach((el) => {
    if (stop) return;

    const numericWidth = parseInt(el.width) || 200;
    const numericHeight = parseInt(el.height) || 100;

    // --- BASE ANIMATION LOGIC (Corrected for Export) ---
    let startState = { x: 0, y: 0, scale: 1, opacity: 0 }; // Default start for "in" animations
    let toState = { x: 0, y: 0, opacity: el.opacity, scale: el.scale, duration: 1 };

    const presetFrom = getPresetGsap(el.preset, el);
    if (presetFrom) {
      Object.assign(startState, presetFrom);
      if (presetFrom.ease) {
          toState.ease = presetFrom.ease;
      }
    }

    // Handle EXIT presets, which have a different starting state.
    if (el.preset === 'fadeOut') {
        startState = { x: 0, y: 0, scale: el.scale, opacity: el.opacity }; // Correct
        toState.opacity = 0;
    } else if (el.preset === 'zoomOut') {
        startState = { x: 0, y: 0, scale: el.scale, opacity: el.opacity }; // Correct
        toState.scale = 0;
        toState.opacity = 0;
    } else if (el.preset === 'slideOutLeft') {
        startState = { x: 0, y: 0, scale: el.scale, opacity: el.opacity }; // Correct
        toState.x = -(el.x + numericWidth);
    } else if (el.preset === 'slideOutRight') {
        startState = { x: 0, y: 0, scale: el.scale, opacity: el.opacity }; // Correct
        toState.x = bannerW - el.x;
    } else if (el.preset === 'slideOutTop') {
        startState = { x: 0, y: 0, scale: el.scale, opacity: el.opacity }; // Correct
        toState.y = -(el.y + numericHeight);
    } else if (el.preset === 'slideOutBottom') {
        startState = { x: 0, y: 0, scale: el.scale, opacity: el.opacity }; // Correct
        toState.y = bannerH - el.y;
    }


    html += `  // Base Animation for ${el.id}\n`;
    html += `gsap.set("#${el.id}", ${JSON.stringify(startState)});\n`;
    html += `tl.to("#${el.id}", ${JSON.stringify(toState)}, ${el.delay});\n`;


    // --- Extra Animations ---
    let cumulativeX = 0;
    let cumulativeY = 0;
    el.extraAnims.forEach((anim, i) => {
      html += `  // Extra Animation ${i + 1} for ${el.id}\n`;
      if (anim.preset === 'pulse') {
        html += `tl.to("#${el.id}", { scale: '+=0.1', yoyo: true, repeat: 1, duration: 0.5 }, ${anim.delay});\n`;
      } else if (anim.preset === 'fadeOut') {
        html += `tl.to("#${el.id}", { opacity: 0 }, ${anim.delay});\n`;
      } else if (anim.preset === 'zoomOut') {
        html += `tl.to("#${el.id}", { scale: 0, opacity: 0 }, ${anim.delay});\n`;
      } else if (anim.preset === 'slideOutLeft') {
        const targetX = -(el.x + numericWidth);
        html += `tl.to("#${el.id}", { x: ${targetX} }, ${anim.delay});\n`;
      } else if (anim.preset === 'slideOutRight') {
        const targetX = bannerW - el.x;
        html += `tl.to("#${el.id}", { x: ${targetX} }, ${anim.delay});\n`;
      } else if (anim.preset === 'slideOutTop') {
        const targetY = -(el.y + numericHeight);
        html += `tl.to("#${el.id}", { y: ${targetY} }, ${anim.delay});\n`;
      } else if (anim.preset === 'slideOutBottom') {
        const targetY = bannerH - el.y;
        html += `tl.to("#${el.id}", { y: ${targetY} }, ${anim.delay});\n`;
      } else {
         cumulativeX += anim.x;
         cumulativeY += anim.y;
         const extraToState = {
            x: cumulativeX,
            y: cumulativeY,
            opacity: anim.opacity,
            scale: anim.scale,
            duration: 1
         };
         html += `tl.to("#${el.id}", ${JSON.stringify(extraToState)}, ${anim.delay});\n`;
      }
    });

    if (el.breakpoint) {
      html += `tl.call(() => tl.pause());\n`;
      stop = true;
    }
  });

  html += `}\nwindow.addEventListener("load", startAd);\n</script>\n`;

  if (isiEnabled) {
    html += getIsiScrollScript();
  }

  html += `</body>\n</html>`;

  // Set output code
  outputCode.textContent = html.trim();
  Prism.highlightElement(outputCode);

  // Duration display
  let totalDuration = 0;
  imageList.forEach(el => {
    let maxTime = (el.delay || 0) + 1;
    el.extraAnims.forEach(anim => {
      maxTime = Math.max(maxTime, (anim.delay || 0) + 1);
    });
    totalDuration = Math.max(totalDuration, maxTime);
  });
  document.getElementById('durationDisplay').textContent = `(${totalDuration.toFixed(1)}s)`;

  // Re-add label
  previewArea.appendChild(labelElement);
  if (!activeDragTarget || !activeDragTarget.imgData) {
    labelElement.style.display = 'none';
  }

  // MODIFIED: ISI live preview now renders inside an interactive wrapper
  if (isiEnabled) {
    const state = window.isiState;

    const isiWrapper = document.createElement('div');
    isiWrapper.id = 'isiInteractiveWrapper';
    isiWrapper.style.left = state.x + 'px';
    isiWrapper.style.top = state.y + 'px';
    isiWrapper.style.width = state.width + 'px';
    isiWrapper.style.height = state.height + 'px';

    // **NEW:** Create and add the drag bar
    const dragBar = document.createElement('div');
    dragBar.className = 'isi-drag-bar';

    const isiContent = document.createElement('div');
    isiContent.id = 'iframe_tj';
    isiContent.innerHTML = getIsiPreviewHTML();

    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'isi-resize-handle';

    isiWrapper.appendChild(dragBar); // Add drag bar first
    isiWrapper.appendChild(isiContent);
    isiWrapper.appendChild(resizeHandle);
    previewArea.appendChild(isiWrapper);

    // Ensure ISI scrolling logic starts exactly after preview is rendered
    if (typeof initIsiScroll === 'function') {
      setTimeout(initIsiScroll, 10);
    }
  }
}

/* -----------------------------
   Editor-level click interception (prevent navigation while editing)
   - If a preview node has an onclick attribute pointing to clickTag, we prevent navigation unless user holds Ctrl/Meta/Shift.
------------------------------ */
(function installPreviewClickInterceptor() {
  // attach once
  if (!window.__preview_click_interceptor_installed && typeof previewArea !== 'undefined' && previewArea) {
    previewArea.addEventListener('click', (ev) => {
      // if user holds ctrl/meta/shift, allow navigation (for testing)
      if (ev.ctrlKey || ev.metaKey || ev.shiftKey) {
        return;
      }

      // find target element with data-clicktag-index or onclick that includes 'clickTag'
      let node = ev.target;
      while (node && node !== previewArea) {
        const dataIdx = node.getAttribute && node.getAttribute('data-clicktag-index');
        const onclick = node.getAttribute && node.getAttribute('onclick');
        if (dataIdx || (onclick && onclick.includes('clickTag'))) {
          // prevent navigation in-editor
          ev.preventDefault();
          ev.stopPropagation();
          // optional: small flash to indicate it's a click-tag target
          node.classList.add('clicktag-flash');
          setTimeout(() => node.classList.remove('clicktag-flash'), 400);
          return;
        }
        node = node.parentNode;
      }
    }, true);
    window.__preview_click_interceptor_installed = true;
  }
})();

/* -----------------------------
   Primary CTA wiring / small fixes
   Place this at end of preview.js (after updatePreviewAndCode)
------------------------------ */

(function wirePrimaryCtaControls() {
  // Defensive: elements might not exist during some builds
  const enableEl = document.getElementById('enablePrimaryCta');
  const urlEl = document.getElementById('primaryCtaUrl');
  const wEl = document.getElementById('primaryCtaWidth');
  const hEl = document.getElementById('primaryCtaHeight');

  // Ensure global model exists
  window.primaryCta = window.primaryCta || { enabled: false, url: '', width: null, height: null };

  // helper: validate http(s) URL
  const CLICK_VALID_RE = /^https?:\/\/.+/i;
  function isValidUrl(u) {
    return !!(typeof u === 'string' && CLICK_VALID_RE.test(u.trim()));
  }

  // updates the model from inputs and triggers preview/code render
  function syncPrimaryFromUI(andRender = true) {
    if (!enableEl || !urlEl || !wEl || !hEl) return;
    window.primaryCta.enabled = !!enableEl.checked;
    window.primaryCta.url = (urlEl.value || '').trim();
    window.primaryCta.width = parseInt(wEl.value) || null;
    window.primaryCta.height = parseInt(hEl.value) || null;

    if (window.primaryCta.enabled && !isValidUrl(window.primaryCta.url)) {
      // warn but still re-render (so overlay won't appear). You can change behavior to auto-prefix if preferred.
      console.warn('Primary CTA enabled but URL is invalid (must start with http:// or https://):', window.primaryCta.url);
    }

    if (andRender && typeof updatePreviewAndCode === 'function') {
      updatePreviewAndCode();
    }
  }

  // auto-prefix https:// on blur if user omitted protocol (optional; comment out if you don't want it)
  function autoPrefixProtocolOnBlur() {
    if (!urlEl) return;
    urlEl.addEventListener('blur', () => {
      const v = (urlEl.value || '').trim();
      if (!v) return;
      // if user typed like "example.com" or "www.example.com", prefix https://
      if (!/^https?:\/\//i.test(v)) {
        urlEl.value = 'https://' + v;
        syncPrimaryFromUI(true);
      }
    });
  }

  if (enableEl) enableEl.addEventListener('change', () => syncPrimaryFromUI(true));
  if (urlEl) urlEl.addEventListener('input', () => syncPrimaryFromUI(false)); // sync model but don't spam re-render on every keystroke
  if (urlEl) urlEl.addEventListener('change', () => syncPrimaryFromUI(true)); // commit on change
  if (wEl) wEl.addEventListener('change', () => syncPrimaryFromUI(true));
  if (hEl) hEl.addEventListener('change', () => syncPrimaryFromUI(true));

  // optional auto-prefix behavior — remove if you prefer strict validation
  autoPrefixProtocolOnBlur();

  // initialize from existing inputs once on load
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => syncPrimaryFromUI(true), 50);
  });

  // also initialize right now in case script executes after DOM ready
  syncPrimaryFromUI(true);
})();