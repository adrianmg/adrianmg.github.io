(() => {
  'use strict';

  const isHome = document.querySelector("body.home");

  // HOME
  if (isHome) {
    let arrow = document.querySelector('.home-intro-scroll');
    const arrowTreshold = 100; // when stops being visible
    let ticking = false; // for requestAnimationFrame throttling

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

    // optimized scroll handler using requestAnimationFrame
    function scrollHandler() {
      if (!ticking) {
        requestAnimationFrame(() => {
          // hide arrow when needed
          const scroll = document.scrollingElement.scrollTop;
          if (scroll >= arrowTreshold && arrow) {
            arrow.classList.remove("visible");
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    // scrolling event with passive listener for better performance
    document.addEventListener("scroll", scrollHandler, { passive: true });

    // initialize scroll hint
    showScrollHint(3);
  }

  // HELPERS

  // HELPERS: scrolling function from A -> B (modified from: https://bit.ly/2H3JKMV)
  function scrollToItem(destination, duration = 500, extraPadding = 0) {
    const start = window.pageYOffset;
    const startTime = performance.now();

    // Cache document height calculation
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    const windowHeight = window.innerHeight;
    const destinationOffset =
      typeof destination === "number" ? destination : destination.offsetTop;
    let destinationOffsetToScroll = Math.round(
      documentHeight - destinationOffset < windowHeight
        ? documentHeight - windowHeight
        : destinationOffset
    );
    
    if (start >= destinationOffsetToScroll) { // going up
      destinationOffsetToScroll -= extraPadding;
    }

    function scroll() {
      const now = performance.now();
      const time = Math.min(1, (now - startTime) / duration);
      const timeFunction = 0.5 * (1 - Math.cos(Math.PI * time));
      
      window.scroll(
        0,
        Math.ceil(timeFunction * (destinationOffsetToScroll - start) + start)
      );

      const currentScroll = Math.round(window.pageYOffset);
      const targetReached = start >= destinationOffsetToScroll
        ? currentScroll <= Math.ceil(destinationOffsetToScroll)  // going up
        : currentScroll >= Math.ceil(destinationOffsetToScroll); // going down

      if (!targetReached) {
        requestAnimationFrame(scroll);
      }
    }

    scroll();
  }
})();