(() => {
  'use strict';

  const isHome = document.querySelector("body.home");

  // HOME
  if (isHome) {
    let arrow = document.querySelector('.home-intro-scroll');
    const arrowTreshold = 100; // when stops being visible
    const scrollingElement = document.scrollingElement || document.documentElement;
    let ticking = false;

    // scroll hint
    function showScrollHint(seconds) {
      if (arrow && scrollingElement.scrollTop <= arrowTreshold) {
        setTimeout(function() {
          if (arrow) {
            arrow.classList.add("visible");
          }
        }, seconds * 1000);
      }
    }

    // scrolling event handler - optimized with requestAnimationFrame throttling
    function scrollHandler() {
      // hide arrow when needed
      const scroll = scrollingElement.scrollTop;
      
      if (scroll >= arrowTreshold && arrow) {
        arrow.classList.remove("visible");
      }
      
      ticking = false;
    }

    // Throttled scroll event listener using requestAnimationFrame
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(scrollHandler);
        ticking = true;
      }
    }

    // Add passive listener for better scroll performance
    document.addEventListener("scroll", onScroll, { passive: true });

    // initialize scroll hint
    showScrollHint(3);
  }

  // HELPERS

  // HELPERS: scrolling function from A -> B (modified from: https://bit.ly/2H3JKMV)
  function scrollToItem(destination, duration = 500, extraPadding) {
    const start = window.pageYOffset;
    const startTime = "now" in window.performance ? performance.now() : new Date().getTime();

    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    const windowHeight =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.getElementsByTagName("body")[0].clientHeight;
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

    if ("requestAnimationFrame" in window === false) {
      window.scroll(0, destinationOffsetToScroll);
      return;
    }

    function scroll() {
      const now =
        "now" in window.performance ? performance.now() : new Date().getTime();

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