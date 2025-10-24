(() => {
  'use strict';

  const isHome = document.querySelector("body.home");

  // HOME
  if (isHome) {
    let arrow = document.querySelector('.home-intro-scroll');
    const arrowTreshold = 100; // when stops being visible
    let ticking = false; // for throttling scroll events

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

    // scrolling event with throttling using requestAnimationFrame
    document.addEventListener("scroll", function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          scrollHandler();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

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

  // HELPERS

  // HELPERS: scrolling function from A -> B (modified from: https://bit.ly/2H3JKMV)
  function scrollToItem(destination, duration = 500, extraPadding) {
    const start = window.pageYOffset;
    const startTime = performance.now();

    // Cache document/window dimensions to avoid repeated reflows
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    const windowHeight = window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;
    const destinationOffset =
      typeof destination === "number" ? destination : destination.offsetTop;
    let destinationOffsetToScroll = Math.round(
      documentHeight - destinationOffset < windowHeight
        ? documentHeight - windowHeight
        : destinationOffset
    )
    if (start >= destinationOffsetToScroll) { // going up
      destinationOffsetToScroll -= extraPadding;
    }

    if (!window.requestAnimationFrame) {
      window.scroll(0, destinationOffsetToScroll);
      return;
    }

    function scroll() {
      const now = performance.now();
      const time = Math.min(1, (now - startTime) / duration);
      const timeFunction = 0.5 * (1 - Math.cos(Math.PI * time));
      window.scroll(
        0,
        Math.ceil(timeFunction * (destinationOffsetToScroll - start) + start)
      );

      if (start >= destinationOffsetToScroll) { // going up
        if (Math.round(window.pageYOffset) <= Math.ceil(destinationOffsetToScroll)) {
          return;
        }
      }
      else { // going down
        if (Math.round(window.pageYOffset) >= Math.ceil(destinationOffsetToScroll)) {
          return;
        }
      }

      requestAnimationFrame(scroll);
    }

    scroll();
  }
})();