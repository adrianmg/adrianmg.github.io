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

    // Throttle scroll events for better performance
    let scrollTimeout;
    function scrollHandler() {
      if (scrollTimeout) return;
      
      scrollTimeout = setTimeout(function() {
        scrollTimeout = null;
        
        // scroll hint
        let scroll = document.scrollingElement.scrollTop;

        // hide arrow when needed
        if (scroll >= arrowTreshold && arrow) {
          arrow.classList.remove("visible");
          // Remove listener once arrow is hidden to improve performance
          document.removeEventListener("scroll", scrollHandler);
        }
      }, 100);
    }

    // scrolling event
    document.addEventListener("scroll", scrollHandler, { passive: true });

    // initialize scroll hint
    showScrollHint(3);
  }

  // HELPERS

  // HELPERS: scrolling function from A -> B (modified from: https://bit.ly/2H3JKMV)
  function scrollToItem(destination, duration = 500, extraPadding) {
    const start = window.pageYOffset;
    const startTime = "now" in window.performance ? performance.now() : new Date().getTime();

    // Cache document element references for better performance
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

      const currentOffset = Math.round(window.pageYOffset);
      const targetOffset = Math.ceil(destinationOffsetToScroll);

      if (start >= destinationOffsetToScroll) { // going up
        if (currentOffset <= targetOffset) {
          return;
        }
      }
      else { // going down
        if (currentOffset >= targetOffset) {
          return;
        }
      }

      requestAnimationFrame(scroll);
    }

    scroll();
  }
})();