/* -----------------------------
   App Entry Point (Quill modal + Source view + Beautify)
   File: js/main.js
------------------------------ */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure global content var exists (fallback)
  window.isiContentHTML = window.isiContentHTML || '';

  // Apply default banner size on load (bannerSize.js provides updateBannerSize)
  if (typeof updateBannerSize === 'function') updateBannerSize();

  // Modal elements
  const isiModal = document.getElementById('isiModal');
  const openBtn = document.getElementById('openIsiEditorBtn');
  const closeBtn = document.getElementById('closeIsiModal');
  const saveBtn = document.getElementById('isiSaveBtn');
  const cancelBtn = document.getElementById('isiCancelBtn');
  const enableIsiCheckbox = document.getElementById('enableIsiCheckbox');
  const toggleSourceBtn = document.getElementById('toggleSourceBtn');

  // Editor containers
  const editorContainer = document.getElementById('isiModalEditor'); // Quill container
  const sourceTextarea = document.getElementById('isiSourceEditor'); // raw HTML textarea

  // Quill instance (lazy init)
  let quillModal = null;
  let inSourceMode = false;
  let sourceInputHandler = null;

  /**
   * Initialize Quill inside modal (lazy).
   */
  function initQuillInModal() {
    if (quillModal) return quillModal;

    if (typeof Quill === 'undefined') {
      console.error('Quill library not found. Make sure quill.min.js is loaded.');
      return null;
    }

    const toolbarOptions = [
      [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'header': 1 }, { 'header': 2 }, 'blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }, { 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ];

    quillModal = new Quill(editorContainer, {
      modules: { toolbar: toolbarOptions },
      theme: 'snow'
    });

    // Load saved HTML if present
    if (window.isiContentHTML && window.isiContentHTML.trim().length) {
      quillModal.root.innerHTML = window.isiContentHTML;
    } else {
      if (!quillModal.root.innerHTML.trim()) {
        quillModal.root.innerHTML = `<h1>INDICATION and IMPORTANT SAFETY INFORMATION</h1><p>Edit this content...</p>`;
      }
    }

    // Live update while editing in Quill
    quillModal.on('text-change', () => {
      window.isiContentHTML = quillModal.root.innerHTML;
      if (typeof updatePreviewAndCode === 'function') updatePreviewAndCode();

      // If the source textarea is visible, keep it in sync
      if (inSourceMode) {
        const beautified = beautifyIfAvailable(window.isiContentHTML);
        sourceTextarea.value = beautified;
      }
    });

    // expose for other modules (backwards compat)
    window.quill = quillModal;

    return quillModal;
  }

  /**
   * Beautify helper: uses html_beautify if available, otherwise returns original.
   * Options can be adjusted.
   */
  function beautifyIfAvailable(html) {
    if (!html) return html || '';
    if (typeof html_beautify === 'function') {
      try {
        return html_beautify(html, {
          indent_size: 2,
          wrap_line_length: 80,
          preserve_newlines: true,
          max_preserve_newlines: 1,
          end_with_newline: false
        });
      } catch (err) {
        console.warn('html_beautify failed:', err);
        return html;
      }
    }
    return html;
  }

  /**
   * Set source mode on or off.
   * When entering source mode, we beautify the HTML for readability.
   */
  function setSourceMode(enable) {
    inSourceMode = !!enable;

    if (inSourceMode) {
      // Prepare raw HTML from Quill or saved var
      let rawHtml = '';
      if (quillModal) {
        rawHtml = quillModal.root.innerHTML || '';
      } else {
        rawHtml = window.isiContentHTML || '';
      }

      // Beautify if possible
      sourceTextarea.value = beautifyIfAvailable(rawHtml);

      // Hide Quill editor DOM, show textarea
      editorContainer.style.display = 'none';
      sourceTextarea.style.display = 'block';
      sourceTextarea.setAttribute('aria-hidden', 'false');

      // Visual state for toggle button
      toggleSourceBtn.classList.add('active');
      toggleSourceBtn.style.background = '#eaeaea';

      // Focus and place caret at end
      setTimeout(() => {
        sourceTextarea.focus();
        sourceTextarea.selectionStart = sourceTextarea.selectionEnd = sourceTextarea.value.length;
      }, 40);

      // Add input handler for live preview while typing
      sourceInputHandler = (e) => {
        window.isiContentHTML = sourceTextarea.value;
        if (typeof updatePreviewAndCode === 'function') updatePreviewAndCode();
      };
      sourceTextarea.addEventListener('input', sourceInputHandler);

    } else {
      // Leaving source mode: remove source input listener
      if (sourceInputHandler) {
        sourceTextarea.removeEventListener('input', sourceInputHandler);
        sourceInputHandler = null;
      }

      // Ensure Quill exists and set its content to the textarea value (if available)
      initQuillInModal();

      // Use quill.clipboard.convert for a cleaner conversion when possible
      try {
        const html = sourceTextarea.value || window.isiContentHTML || '';
        // Let Quill convert HTML to delta if possible, then setContents
        const delta = quillModal.clipboard.convert(html);
        quillModal.setContents(delta, 'silent');
      } catch (err) {
        // Fallback: direct innerHTML assignment
        try {
          quillModal.root.innerHTML = sourceTextarea.value || window.isiContentHTML || '';
        } catch (e) {
          console.warn('Failed to set quill content from source:', e);
        }
      }

      sourceTextarea.style.display = 'none';
      sourceTextarea.setAttribute('aria-hidden', 'true');
      editorContainer.style.display = 'block';
      toggleSourceBtn.classList.remove('active');
      toggleSourceBtn.style.background = '';

      setTimeout(() => {
        try { quillModal.focus(); } catch (e) {}
      }, 40);
    }
  }

  /**
   * Open modal and initialize editor state.
   */
  function openModal() {
    initQuillInModal();

    // Always show latest saved content in both editors
    if (quillModal) {
      if (window.isiContentHTML && window.isiContentHTML.trim().length) {
        // try to set content using clipboard.convert -> setContents for better fidelity
        try {
          const delta = quillModal.clipboard.convert(window.isiContentHTML);
          quillModal.setContents(delta, 'silent');
        } catch (err) {
          quillModal.root.innerHTML = window.isiContentHTML;
        }
      }
    }
    // Mirror into source textarea as beautified HTML
    sourceTextarea.value = beautifyIfAvailable(window.isiContentHTML || '');

    // Default to WYSIWYG
    setSourceMode(false);

    isiModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // prevent background scroll

    // focus Quill
    setTimeout(() => {
      try { if (quillModal) quillModal.focus(); } catch (e) {}
    }, 60);
  }

  /**
   * Close modal.
   */
  function closeModal() {
    isiModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* ---------------------------
     Event wiring
  ----------------------------*/

  openBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });

  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // revert live temporary changes to saved content
    if (quillModal && window.isiContentHTML) {
      try { quillModal.root.innerHTML = window.isiContentHTML; } catch (err) {}
    } else {
      sourceTextarea.value = window.isiContentHTML || '';
    }
    if (typeof updatePreviewAndCode === 'function') updatePreviewAndCode();
    closeModal();
  });

  cancelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // revert unsaved changes: restore saved content to editors & preview
    if (quillModal && window.isiContentHTML) {
      try {
        const delta = quillModal.clipboard.convert(window.isiContentHTML);
        quillModal.setContents(delta, 'silent');
      } catch (err) {
        quillModal.root.innerHTML = window.isiContentHTML || '';
      }
    }
    sourceTextarea.value = beautifyIfAvailable(window.isiContentHTML || '');
    if (typeof updatePreviewAndCode === 'function') updatePreviewAndCode();
    closeModal();
  });

  saveBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // Determine source of truth
    if (inSourceMode) {
      // Source textarea: raw HTML
      window.isiContentHTML = sourceTextarea.value || '';
    } else {
      // Quill: current HTML
      if (quillModal) window.isiContentHTML = quillModal.root.innerHTML || '';
    }

    // Optionally beautify saved HTML before storing/exporting
    window.isiContentHTML = beautifyIfAvailable(window.isiContentHTML || '');

    // Update preview & code
    if (typeof updatePreviewAndCode === 'function') updatePreviewAndCode();

     // Re-init or start ISI scroll if enabled (mirror checkbox behavior)
  if (document.getElementById('enableIsiCheckbox').checked && typeof initIsiScroll === 'function') {
    setTimeout(initIsiScroll, 10);
  }


    closeModal();
  });

  // Source toggle logic
  toggleSourceBtn.addEventListener('click', (e) => {
    e.preventDefault();
    setSourceMode(!inSourceMode);
  });

  // Backdrop click: cancel/close
  const backdrop = isiModal.querySelector('.isi-modal-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      // revert edits & close
      if (quillModal && window.isiContentHTML) {
        try {
          const delta = quillModal.clipboard.convert(window.isiContentHTML);
          quillModal.setContents(delta, 'silent');
        } catch (err) {
          quillModal.root.innerHTML = window.isiContentHTML || '';
        }
      } else {
        sourceTextarea.value = window.isiContentHTML || '';
      }
      if (typeof updatePreviewAndCode === 'function') updatePreviewAndCode();
      closeModal();
    });
  }

  // Enable/disable ISI checkbox wiring -- update preview when toggled
  enableIsiCheckbox.addEventListener('change', () => {
    if (typeof updatePreviewAndCode === 'function') updatePreviewAndCode();
    if (enableIsiCheckbox.checked && typeof initIsiScroll === 'function') {
      setTimeout(initIsiScroll, 10);
    }
  });

  // Set initial preview state
  if (typeof updatePreviewAndCode === 'function') updatePreviewAndCode();

  // optional: create initial control block
  // if you want an initial image block uncomment next line
  // createControlBlock(imageList.length);
});

/* -----------------------------
   Shrink In and Out Function (unchanged)
------------------------------ */
const toggleBtn = document.getElementById('toggleLeftPanel');
const leftPanel = document.getElementById('leftPanel');
const icon = toggleBtn.querySelector('i');

toggleBtn.addEventListener('click', () => {
    leftPanel.classList.toggle('collapsed');

    if (leftPanel.classList.contains('collapsed')) {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-up-right-and-down-left-from-center');
    } else {
        icon.classList.remove('fa-up-right-and-down-left-from-center');
        icon.classList.add('fa-xmark');
    }
});
