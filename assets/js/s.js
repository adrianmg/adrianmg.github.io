(() => {
  'use strict';

  const isHome = document.querySelector("body.home");

  // HOME
  if (isHome) {
    let arrow = document.querySelector('.home-intro-scroll');
    const arrowTreshold = 100; // when stops being visible
    const scrollingElement = document.scrollingElement;

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

    // Throttle function to limit scroll event handler calls
    function throttle(func, delay) {
      let lastCall = 0;
      return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
          lastCall = now;
          func.apply(this, args);
        }
      };
    }

    // scrolling event
    function scrollHandler() {
      // scroll hint
      let scroll = scrollingElement.scrollTop;

      // hide arrow when needed
      if (scroll >= arrowTreshold && arrow) {
        arrow.classList.remove("visible");
      }
    }

    // Add throttled scroll listener with passive option for better performance
    document.addEventListener("scroll", throttle(scrollHandler, 100), { passive: true });

    // initialize scroll hint
    showScrollHint(3);
  }

  // HELPERS

  // HELPERS: scrolling function from A -> B (modified from: https://bit.ly/2H3JKMV)
  function scrollToItem(destination, duration = 500, extraPadding) {
    const start = window.pageYOffset;
    const startTime = performance.now();
    const docElement = document.documentElement;
    const body = document.body;

    const documentHeight = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      docElement.clientHeight,
      docElement.scrollHeight,
      docElement.offsetHeight
    );
    const windowHeight = window.innerHeight || docElement.clientHeight || body.clientHeight;
    const destinationOffset = typeof destination === "number" ? destination : destination.offsetTop;
    let destinationOffsetToScroll = Math.round(
      documentHeight - destinationOffset < windowHeight
        ? documentHeight - windowHeight
        : destinationOffset
    );
    
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
      const scrollPosition = Math.ceil(timeFunction * (destinationOffsetToScroll - start) + start);
      
      window.scroll(0, scrollPosition);

      const currentPosition = Math.round(window.pageYOffset);
      const targetPosition = Math.ceil(destinationOffsetToScroll);

      if (start >= destinationOffsetToScroll) { // going up
        if (currentPosition <= targetPosition) {
          return;
        }
      } else { // going down
        if (currentPosition >= targetPosition) {
          return;
        }
      }

      requestAnimationFrame(scroll);
    }

    scroll();
  }
})();