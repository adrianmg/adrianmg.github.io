(() => {
  'use strict';

  const isHome = document.querySelector("body.home");

  // HOME
  if (isHome) {
    let arrow = document.querySelector('.home-intro-scroll');
    const arrowTreshold = 100; // when stops being visible

    // scroll hint
    function showScrollHint(seconds) {
      if (arrow && document.scrollingElement.scrollTop <= arrowTreshold) {
        setTimeout(function() {
          if (arrow) {
            arrow.classList.add("visible");
          }
        }, seconds * 1000);
      }
    }

    // scrolling event
    document.addEventListener("scroll", scrollHandler);

    function scrollHandler() {
      // scroll hint
      let scroll = document.scrollingElement.scrollTop;

      // hide arrow when needed
      if (scroll >= arrowTreshold && arrow) {
        arrow.classList.remove("visible");
      }
    }

    // initialize scroll hint
    showScrollHint(3);
  }
})();