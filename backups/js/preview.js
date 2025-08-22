/* -----------------------------
   Preview Rendering + Generated Code Output
------------------------------ */

const outputCode = document.getElementById('outputCode');
const widthInput = document.getElementById('bannerWidthInput');
const heightInput = document.getElementById('bannerHeightInput');

// Copy generated code
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
`;

  imageList.forEach(img => {
    html += `#${img.id} { left: ${img.x}px; top: ${img.y}px; width: ${img.width}px; height: ${img.height}; opacity: ${img.opacity}; }\n`;
  });

  html += `</style>\n`;

  if (isiEnabled) {
    html += `<style>${getIsiCSS()}</style>\n`;
  }

  html += `<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.5.1/gsap.min.js"></script>\n</head>\n<body>\n<div id="banner-wrapper">\n`;

  const stopAt = imageList.findIndex(img => img.breakpoint);
  imageList.forEach((img, index) => {
    if (!img.src) return;
    if (stopAt !== -1 && index > stopAt) return;

    html += `<img id="${img.id}" src="${img.fileName}" />\n`;

    // Builder Preview
    const previewImg = document.createElement('img');
    previewImg.src = img.src;
    previewImg.id = img.id;
    previewImg.classList.add('preview');
    previewImg.style.width = img.width + "px";
    previewImg.style.height = img.height + "px";
    previewImg.style.position = "absolute";

    let liveX = img.x, liveY = img.y, liveOpacity = img.opacity, liveScale = img.scale;
    if (activeDragTarget && activeDragTarget.imgData === img) {
      const maxIndex = activeDragTarget.animIndex ?? -1;
      for (let i = 0; i <= maxIndex; i++) {
        const anim = img.extraAnims[i];
        if (anim) {
          liveX += anim.x;
          liveY += anim.y;
          liveOpacity = anim.opacity;
          liveScale *= anim.scale;
        }
      }
    } else {
      img.extraAnims.forEach(anim => {
        liveX += anim.x;
        liveY += anim.y;
        liveOpacity = anim.opacity;
        liveScale *= anim.scale;
      });
    }

    previewImg.style.left = liveX + "px";
    previewImg.style.top = liveY + "px";
    previewImg.style.opacity = liveOpacity;
    previewImg.style.transform = `scale(${liveScale})`;

    // Highlight + label
    if (activeDragTarget && activeDragTarget.imgData === img) {
      previewImg.classList.add("highlighted");
      const labelText = activeDragTarget.animIndex === null
        ? `Base Image ${imageList.indexOf(img) + 1}`
        : `Extra Animation ${activeDragTarget.animIndex + 1} of Image ${imageList.indexOf(img) + 1}`;
      labelElement.textContent = labelText;
      labelElement.style.display = 'block';
      labelElement.style.left = `${liveX + 5}px`;
      labelElement.style.top = `${liveY - 10}px`;
    } else {
      previewImg.classList.remove("highlighted");
    }

    previewArea.appendChild(previewImg);
    img.previewImg = previewImg;
  });

  // Add ISI HTML if enabled
  if (isiEnabled) {
    html += getIsiHTML();
  }

  html += `</div>\n<script>\nconst tl = gsap.timeline();\nfunction startAd() {\n`;

  // GSAP animations
  let stop = false;
  imageList.forEach((img) => {
    if (!img.src || stop) return;
     html += `  // Base animation for ${img.id}\n`;
    html += `gsap.set("#${img.id}", {opacity: 0, scale: 1});\n`;
    html += `tl.to("#${img.id}", {opacity: ${img.opacity}, scale: ${img.scale}, duration: 1}, ${img.delay});\n`;

    let totalX = 0, totalY = 0;
    img.extraAnims.forEach((anim, i) => {
      totalX += anim.x;
      totalY += anim.y;
        html += `  // Extra Animation ${i + 1} for ${img.id} (delay: ${anim.delay}s)\n`;
      html += `tl.to("#${img.id}", {x: ${totalX}, y: ${totalY}, opacity: ${anim.opacity}, scale: ${anim.scale}, duration: 1}, ${anim.delay});\n`;
    });

    if (img.breakpoint) {
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
  imageList.forEach(img => {
    if (!img.src) return;
    let maxTime = img.delay + 1;
    img.extraAnims.forEach(anim => {
      maxTime = Math.max(maxTime, anim.delay + 1);
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
  }
}

/* -----------------------------
   ISI Helpers
------------------------------ */

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
/*overflow: hidden;*/
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

::-webkit-scrollbar-button:single-button {
background-color: #ededed;
display: block;
background-size: 5px;
background-repeat: no-repeat;
}

/*Up*/
::-webkit-scrollbar-button:single-button:vertical:decrement {
height: 6px;
width: 8px;
background-position: center 0px;
background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='rgb(180, 180, 180)'><polygon points='50,20 0,100 100,100'/></svg>");
}

::-webkit-scrollbar-button:single-button:vertical:decrement:active {
background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='rgb(150, 150, 150)'><polygon points='50,20 0,100 100,100'/></svg>");
}

/* Down */
::-webkit-scrollbar-button:single-button:vertical:increment {
height: 8px;
width: 8px;
background-position: center 0px;
background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='rgb(180, 180, 180)'><polygon points='50,100 0,20 100  ,20'/></svg>");
}

::-webkit-scrollbar-button:single-button:vertical:increment:active {
background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='rgb(150, 150, 150)'><polygon points='50,100 0,20 100  ,20'/></svg>");
}
`;
}

function getIsiHTML() {
  return `

  <div id="iframe_tj">
<div id="scroll_tj"
onMouseOver="(scrollStarted?pauseDiv():null)"
onMouseOut="(scrollStarted?resumeDiv():null)">



<div class="isi"
id="isi">

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

</div>
</div>
</div>  
`;
}

function getIsiPreviewHTML() {
  return `

<div id="scroll_tj"
onMouseOver="(scrollStarted?pauseDiv():null)"
onMouseOut="(scrollStarted?resumeDiv():null)">



<div class="isi"
id="isi">

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
