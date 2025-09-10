/* -----------------------------
   Preview Rendering + Generated Code Output
------------------------------ */

const outputCode = document.getElementById('outputCode');
const widthInput = document.getElementById('bannerWidthInput');
const heightInput = document.getElementById('bannerHeightInput');

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
    const originalText = btn.textContent;
    btn.textContent = '✅ Copied!';
    setTimeout(() => btn.textContent = originalText, 2000);
  }).catch(err => {
    alert("Failed to copy code: " + err);
  });
});

/* -----------------------------
   ISI helper wrappers that use Quill content when available
------------------------------ */

function getIsiInner() {
  // prefer Quill instance content
  if (window.quill && typeof window.quill.root !== 'undefined') {
    const content = window.quill.root.innerHTML;
    if (content && content.trim().length) return content;
  }
  // fallback to saved HTML variable (set by modal save or by import)
  if (window.isiContentHTML && window.isiContentHTML.trim().length) {
    return window.isiContentHTML;
  }

  // last fallback default
  return isiInnerDefault;
}

function getIsiCSS() {
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

#iframe_tj {
position: absolute;
width: 299px;
height: 69px;
top: 180px;
left: 0px;
bottom: 17px;
border: none;
background-color: #ffffff;
z-index: 9;
}

#scroll_tj {
position: absolute;
overflow: hidden;
width: 299px;
height: 69px;
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
  return `
  <div id="iframe_tj">
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
------------------------------ */
function escapeHtml(str) {
  if (!str && str !== '') return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* -----------------------------
   Core updatePreviewAndCode function
------------------------------ */

function updatePreviewAndCode() {
  const isiEnabled = document.getElementById('enableIsiCheckbox').checked;

  // Remove old ISI style
  const existingIsiStyle = document.getElementById('isi-style-tag');
  if (existingIsiStyle) existingIsiStyle.remove();

  // Add ISI style if enabled
  if (isiEnabled) {
    const style = document.createElement('style');
    style.id = 'isi-style-tag';
    style.textContent = `/* ISI Styles */` + getIsiCSS();
    document.head.appendChild(style);
  }

  // Temporarily remove label
  if (labelElement && labelElement.parentNode === previewArea) {
    previewArea.removeChild(labelElement);
  }
  previewArea.innerHTML = '';

  const bannerW = parseInt(widthInput.value) || 300;
  const bannerH = parseInt(heightInput.value) || 250;

  // HTML Output
  let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Generated Banner</title>
<meta name="ad.size" content="width=${bannerW},height=${bannerH}">
<style>
* {margin: 0;padding: 0;box-sizing: border-box;user-select: none;outline: 0;}
#banner-wrapper { position: relative; width: ${bannerW}px; height: ${bannerH}px; overflow: hidden; background: #eee; border: 1px solid #727479; }
img { position: absolute; }
.banner-text { position: absolute; white-space: pre-wrap; }
`;

  // Add styles for each element
  imageList.forEach(el => {
    if (el.type === 'image') {
      html += `#${el.id} { left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}; opacity: ${el.opacity}; }\n`;
    } else if (el.type === 'text') {
      html += `#${el.id} { left: ${el.x}px; top: ${el.y}px; opacity: ${el.opacity}; font-size: ${el.fontSize}px; color: ${el.color}; transform-origin: 0 0; }\n`;
    }
  });

  html += `</style>\n`;

  if (isiEnabled) {
    html += `<style>${getIsiCSS()}</style>\n`;
  }

  html += `<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.5.1/gsap.min.js"></script>\n</head>\n<body>\n<div id="banner-wrapper">\n`;

  const stopAt = imageList.findIndex(el => el.breakpoint);
  imageList.forEach((el, index) => {
    if (stopAt !== -1 && index > stopAt) return;

    if (el.type === 'image') {
      if (!el.src) return;
      html += `<img id="${el.id}" src="${el.fileName}" />\n`;
    } else if (el.type === 'text') {
      // export text as banner-text div
      const safe = escapeHtml(el.text || '');
      html += `<div id="${el.id}" class="banner-text">${safe}</div>\n`;
    }

    // Builder Preview element in editor
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
    } else if (el.type === 'text') {
      previewEl = document.createElement('div');
      previewEl.classList.add('preview', 'banner-text');
      previewEl.id = el.id;
      previewEl.innerHTML = el.text || '';
      previewEl.style.position = "absolute";
      previewEl.style.fontSize = (el.fontSize || 14) + "px";
      previewEl.style.color = el.color || '#000';
    }

    // compute live position by applying extraAnims up to active drag target if selected
    let liveX = el.x, liveY = el.y, liveOpacity = el.opacity, liveScale = el.scale;
    if (activeDragTarget && activeDragTarget.imgData === el) {
      const maxIndex = activeDragTarget.animIndex ?? -1;
      for (let i = 0; i <= maxIndex; i++) {
        const anim = el.extraAnims[i];
        if (anim) {
          liveX += anim.x;
          liveY += anim.y;
          liveOpacity = anim.opacity;
          liveScale *= anim.scale;
        }
      }
    } else {
      el.extraAnims.forEach(anim => {
        liveX += anim.x;
        liveY += anim.y;
        liveOpacity = anim.opacity;
        liveScale *= anim.scale;
      });
    }

    if (previewEl) {
      previewEl.style.left = liveX + "px";
      previewEl.style.top = liveY + "px";
      previewEl.style.opacity = liveOpacity;
      previewEl.style.transform = `scale(${liveScale})`;
      previewArea.appendChild(previewEl);
      el.previewImg = previewEl;
    }

    // Highlight + label for selected
    if (activeDragTarget && activeDragTarget.imgData === el) {
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

  // Add ISI HTML if enabled
  if (isiEnabled) {
    html += getIsiHTML();
  }

  html += `</div>\n<script>\nconst tl = gsap.timeline();\nfunction startAd() {\n`;

  // GSAP animations (works for images and text; both are DOM targets by id)
  let stop = false;
  imageList.forEach((el) => {
    if (stop) return;
    // We will still set initial opacity/scale for both types
    html += `  // Base animation for ${el.id}\n`;
    html += `gsap.set("#${el.id}", {opacity: 0, scale: 1});\n`;
    html += `tl.to("#${el.id}", {opacity: ${el.opacity}, scale: ${el.scale}, duration: 1}, ${el.delay});\n`;

    let totalX = 0, totalY = 0;
    el.extraAnims.forEach((anim, i) => {
      totalX += anim.x;
      totalY += anim.y;
      html += `  // Extra Animation ${i + 1} for ${el.id} (delay: ${anim.delay}s)\n`;
      html += `tl.to("#${el.id}", {x: ${totalX}, y: ${totalY}, opacity: ${anim.opacity}, scale: ${anim.scale}, duration: 1}, ${anim.delay});\n`;
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

  // ISI live preview
  if (isiEnabled) {
    const isiWrapper = document.createElement('div');
    isiWrapper.id = 'iframe_tj';
    isiWrapper.innerHTML = getIsiPreviewHTML();
    previewArea.appendChild(isiWrapper);

    // Ensure ISI scrolling logic starts exactly after preview is rendered
    if (typeof initIsiScroll === 'function') {
      setTimeout(initIsiScroll, 10);
    }
  }
}
