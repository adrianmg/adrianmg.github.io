(() => {
  'use strict';

  const isHome = document.querySelector("body.home");

  // HOME
  if (isHome) {
    let arrow = document.querySelector('.home-intro-scroll');
    const arrowTreshold = 100; // when stops being visible
    let scrollTimeout = null;

    // scroll hint
    function showScrollHint(seconds) {
      try {
        if (arrow && document.scrollingElement && document.scrollingElement.scrollTop <= arrowTreshold) {
          setTimeout(function() {
            if (arrow && arrow.classList) {
              arrow.classList.add("visible");
            }
          }, Math.max(0, seconds * 1000));
        }
      } catch (error) {
        console.warn('Error showing scroll hint:', error);
      }
    }

    // debounced scroll handler for better performance
    function debouncedScrollHandler() {
      if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
      }
      scrollTimeout = requestAnimationFrame(scrollHandler);
    }

    // scrolling event
    if (document.addEventListener) {
      document.addEventListener("scroll", debouncedScrollHandler, { passive: true });
    }

    function scrollHandler() {
      try {
        // scroll hint
        if (!document.scrollingElement) return;
        
        let scroll = document.scrollingElement.scrollTop;
        
        // validate scroll value
        if (typeof scroll !== 'number' || isNaN(scroll)) return;

        // hide arrow when needed
        if (scroll >= arrowTreshold && arrow && arrow.classList) {
          arrow.classList.remove("visible");
        }
      } catch (error) {
        console.warn('Error in scroll handler:', error);
      }
    }

    // initialize scroll hint
    showScrollHint(3);
  }

  // HELPERS

  // HELPERS: scrolling function from A -> B (modified from: https://bit.ly/2H3JKMV)
  function scrollToItem(destination, duration = 500, extraPadding = 0) {
    try {
      if (!window || !document) return;
      
      // Input validation
      if (duration < 0) duration = 500;
      if (typeof extraPadding !== 'number') extraPadding = 0;
      
      const start = window.pageYOffset || 0;
      const hasPerformance = typeof window.performance === 'object' && 
                           typeof window.performance.now === 'function';
      const startTime = hasPerformance ? performance.now() : new Date().getTime();

      // Safe document height calculation
      const documentHeight = Math.max(
        (document.body && document.body.scrollHeight) || 0,
        (document.body && document.body.offsetHeight) || 0,
        (document.documentElement && document.documentElement.clientHeight) || 0,
        (document.documentElement && document.documentElement.scrollHeight) || 0,
        (document.documentElement && document.documentElement.offsetHeight) || 0
      );
      
      // Safe window height calculation
      const windowHeight =
        window.innerHeight ||
        (document.documentElement && document.documentElement.clientHeight) ||
        (document.getElementsByTagName("body")[0] && 
         document.getElementsByTagName("body")[0].clientHeight) ||
        0;
      
      // Safe destination calculation
      let destinationOffset = 0;
      if (typeof destination === "number") {
        destinationOffset = destination;
      } else if (destination && typeof destination.offsetTop === 'number') {
        destinationOffset = destination.offsetTop;
      } else {
        console.warn('Invalid destination for scrollToItem');
        return;
      }
      
      // Bounds checking
      let destinationOffsetToScroll = Math.round(
        documentHeight - destinationOffset < windowHeight
          ? Math.max(0, documentHeight - windowHeight)
          : destinationOffset
      );
      
      if (start >= destinationOffsetToScroll) { // going up
        destinationOffsetToScroll = Math.max(0, destinationOffsetToScroll - extraPadding);
      }

      // Fallback for browsers without requestAnimationFrame
      const hasRequestAnimationFrame = typeof window.requestAnimationFrame === 'function';
      if (!hasRequestAnimationFrame) {
        if (typeof window.scroll === 'function') {
          window.scroll(0, destinationOffsetToScroll);
        }
        return;
      }

      function scroll() {
        try {
          const now = hasPerformance ? performance.now() : new Date().getTime();
          const time = Math.min(1, Math.max(0, (now - startTime) / duration));
          const timeFunction = 0.5 * (1 - Math.cos(Math.PI * time));
          const scrollPosition = Math.ceil(timeFunction * (destinationOffsetToScroll - start) + start);
          
          if (typeof window.scroll === 'function') {
            window.scroll(0, scrollPosition);
          }

          // Check if animation should continue
          const currentScroll = window.pageYOffset || 0;
          if (start >= destinationOffsetToScroll) { // going up
            if (Math.round(currentScroll) <= Math.ceil(destinationOffsetToScroll)) {
              return;
            }
          } else { // going down
            if (Math.round(currentScroll) >= Math.ceil(destinationOffsetToScroll)) {
              return;
            }
          }

          if (time < 1) {
            requestAnimationFrame(scroll);
          }
        } catch (error) {
          console.warn('Error in scroll animation:', error);
        }
      }

      scroll();
    } catch (error) {
      console.warn('Error in scrollToItem:', error);
    }
  }
})();