/* -----------------------------
   ISI Enable/Disable + Scroll Logic
------------------------------ */

document.getElementById('enableIsiCheckbox')
  .addEventListener('change', updatePreviewAndCode);

function initIsiScroll() {
  const isiEnabled = document.getElementById('enableIsiCheckbox').checked;
  if (!isiEnabled) return;

  const scrollDiv = document.getElementById('scroll_tj');
  if (!scrollDiv) return;

  let ScrollRate = 125;
  let ReachedMaxScroll = false;
  let ScrollInterval = null;
  let PreviousScrollTop = 0;
  let scrollStarted = false;

  function scrollDiv_init() {
    ReachedMaxScroll = false;
    scrollDiv.scrollTop = 0;
    PreviousScrollTop = 0;
    setTimeout(startScroll, getTotalDuration() * 1000);
  }

  function startScroll() {
    scrollStarted = true;
    ScrollInterval = setInterval(scrollStep, ScrollRate);
  }

  function scrollStep() {
    if (!ReachedMaxScroll) {
      scrollDiv.scrollTop = PreviousScrollTop;
      PreviousScrollTop++;
      ReachedMaxScroll = scrollDiv.scrollTop >= (scrollDiv.scrollHeight - scrollDiv.offsetHeight);
    }
  }

  function pauseDiv() {
    clearInterval(ScrollInterval);
  }

  function resumeDiv() {
    PreviousScrollTop = scrollDiv.scrollTop;
    ScrollInterval = setInterval(scrollStep, ScrollRate);
  }

  function getTotalDuration() {
    let max = 0;
    imageList.forEach(img => {
      if (!img.src) return;
      max = Math.max(max, img.delay + 1);
      img.extraAnims.forEach(anim => {
        max = Math.max(max, anim.delay + 1);
      });
    });
    return max;
  }

  scrollDiv.onmouseover = () => scrollStarted ? pauseDiv() : null;
  scrollDiv.onmouseout = () => scrollStarted ? resumeDiv() : null;

  scrollDiv_init();
}
