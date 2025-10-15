/* -----------------------------
   App Entry Point & Global UI Controls
   File: js/main.js
------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
  // Ensure global content var exists (fallback)
  window.isiContentHTML = window.isiContentHTML || "";

  // Apply default banner size on load
  if (typeof updateBannerSize === "function") updateBannerSize();

  // Initialize UI interactions
  initializeIsiModal();
  initializeLeftPanelToggle();
  initializePreviewZoom();

  // Set initial preview state after a short delay to ensure everything is loaded
  if (typeof updatePreviewAndCode === "function") {
    setTimeout(() => updatePreviewAndCode(), 50);
  }
});

/* -----------------------------
   ISI Modal Logic
------------------------------ */
function initializeIsiModal() {
  const isiModal = document.getElementById("isiModal");
  if (!isiModal) return;

  const openBtn = document.getElementById("openIsiEditorBtn");
  const closeBtn = document.getElementById("closeIsiModal");
  const saveBtn = document.getElementById("isiSaveBtn");
  const cancelBtn = document.getElementById("isiCancelBtn");
  const toggleSourceBtn = document.getElementById("toggleSourceBtn");
  const editorContainer = document.getElementById("isiModalEditor");
  const sourceTextarea = document.getElementById("isiSourceEditor");
  const backdrop = isiModal.querySelector(".isi-modal-backdrop");
  const enableIsiCheckbox = document.getElementById("enableIsiCheckbox");

  let quillModal = null;
  let inSourceMode = false;
  let lastSavedContent = window.isiContentHTML;

  const initQuill = () => {
    if (quillModal || typeof Quill === "undefined") return;
    const toolbarOptions = [
      [{ font: [] }, { size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      [{ header: 1 }, { header: 2 }, "blockquote", "code-block"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      [{ direction: "rtl" }, { align: [] }],
      ["link", "image", "video"],
      ["clean"],
    ];
    quillModal = new Quill(editorContainer, {
      modules: { toolbar: toolbarOptions },
      theme: "snow",
    });
    window.quill = quillModal;
    quillModal.on("text-change", () => {
      // We only update the global variable on save now, not live
    });
  };

  const beautifyHtml = (html) => {
    if (typeof html_beautify === "function") {
      try {
        return html_beautify(html, { indent_size: 2, wrap_line_length: 80 });
      } catch (e) {
        return html;
      }
    }
    return html;
  };

  const setContentInEditor = (content) => {
    if (!quillModal) return;
    try {
      const delta = quillModal.clipboard.convert(content);
      quillModal.setContents(delta, "silent");
    } catch (e) {
      quillModal.root.innerHTML = content;
    }
  };

  const setSourceMode = (enable) => {
    inSourceMode = enable;
    editorContainer.style.display = enable ? "none" : "block";
    sourceTextarea.style.display = enable ? "block" : "none";
    toggleSourceBtn.classList.toggle("active", enable);

    if (enable) {
      sourceTextarea.value = beautifyHtml(quillModal.root.innerHTML);
      sourceTextarea.focus();
    } else {
      setContentInEditor(sourceTextarea.value);
    }
  };

  const openModal = () => {
    initQuill();
    lastSavedContent = window.isiContentHTML; // Store content on open
    const contentToLoad =
      lastSavedContent ||
      `<h1>INDICATION and IMPORTANT SAFETY INFORMATION</h1><p>Edit this content...</p>`;
    setContentInEditor(contentToLoad);
    if (inSourceMode) setSourceMode(false);
    isiModal.setAttribute("aria-hidden", "false");
  };

  const closeModal = (revert = false) => {
    if (revert) {
      window.isiContentHTML = lastSavedContent; // Revert to stored content
      if (typeof updatePreviewAndCode === "function") updatePreviewAndCode();
    }
    isiModal.setAttribute("aria-hidden", "true");
  };

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", () => closeModal(true));
  cancelBtn.addEventListener("click", () => closeModal(true));
  backdrop.addEventListener("click", () => closeModal(true));

  saveBtn.addEventListener("click", () => {
    if (inSourceMode) {
      window.isiContentHTML = sourceTextarea.value;
    } else {
      window.isiContentHTML = quillModal.root.innerHTML;
    }
    window.isiContentHTML = beautifyHtml(window.isiContentHTML);
    if (typeof updatePreviewAndCode === "function") updatePreviewAndCode();
    closeModal(false);
  });

  toggleSourceBtn.addEventListener("click", () => setSourceMode(!inSourceMode));

  enableIsiCheckbox.addEventListener("change", () => {
    if (typeof updatePreviewAndCode === "function") updatePreviewAndCode();
    if (enableIsiCheckbox.checked && typeof initIsiScroll === "function") {
      setTimeout(initIsiScroll, 10);
    }
  });
}

/* -----------------------------
   Left Panel Toggle (FIXED)
------------------------------ */
function initializeLeftPanelToggle() {
  const toggleBtn = document.getElementById("toggleLeftPanel");
  const leftPanel = document.getElementById("leftPanel");
  const icon = toggleBtn.querySelector("i");

  if (!toggleBtn || !leftPanel || !icon) return;

  toggleBtn.addEventListener("click", () => {
    leftPanel.classList.toggle("collapsed");

    if (leftPanel.classList.contains("collapsed")) {
      icon.classList.remove("fa-xmark");
      icon.classList.add("fa-bars");
      toggleBtn.setAttribute("title", "Expand Panel");
    } else {
      icon.classList.remove("fa-bars");
      icon.classList.add("fa-xmark");
      toggleBtn.setAttribute("title", "Collapse Panel");
    }
  });
}

/* -----------------------------
   Preview Zoom Controls (NEW)
------------------------------ */
function initializePreviewZoom() {
  const previewArea = document.getElementById("previewArea");
  const zoomInBtn = document.getElementById("zoomInBtn");
  const zoomOutBtn = document.getElementById("zoomOutBtn");
  const zoomResetBtn = document.getElementById("zoomResetBtn");
  const zoomLevelDisplay = document.getElementById("zoomLevelDisplay");

  if (
    !previewArea ||
    !zoomInBtn ||
    !zoomOutBtn ||
    !zoomResetBtn ||
    !zoomLevelDisplay
  )
    return;

  let zoomLevel = 1.0;
  const ZOOM_STEP = 0.1;
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 2.0;

  const applyZoom = () => {
    // Clamp the zoom level within min/max bounds
    zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel));
    previewArea.style.transform = `scale(${zoomLevel})`;
    zoomLevelDisplay.textContent = `${Math.round(zoomLevel * 100)}%`;
  };

  zoomInBtn.addEventListener("click", () => {
    zoomLevel += ZOOM_STEP;
    applyZoom();
  });

  zoomOutBtn.addEventListener("click", () => {
    zoomLevel -= ZOOM_STEP;
    applyZoom();
  });

  zoomResetBtn.addEventListener("click", () => {
    zoomLevel = 1.0;
    applyZoom();
  });

  // Apply initial state
  applyZoom();
}
