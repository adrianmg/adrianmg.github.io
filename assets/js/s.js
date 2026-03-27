(() => {
  'use strict';

  const isHome = document.querySelector("body.home");

  // HOME
  if (isHome) {
    const arrow = document.querySelector('.home-intro-scroll');
    const arrowTreshold = 100; // when stops being visible

    if (!arrow) return; // Early exit if arrow doesn't exist

    // scroll hint
    function showScrollHint(seconds) {
      if (document.scrollingElement.scrollTop <= arrowTreshold) {
        setTimeout(function() {
          arrow.classList.add("visible");
        }, seconds * 1000);
      }
    }

    // scrolling event
    document.addEventListener("scroll", scrollHandler);

    function scrollHandler() {
      // hide arrow when needed
      const scroll = document.scrollingElement.scrollTop;
      if (scroll >= arrowTreshold) {
        arrow.classList.remove("visible");
      }
    }

    // initialize scroll hint
    showScrollHint(3);
  }

  // HELPERS

  // Helper function to get current time consistently
  function getTime() {
    return "now" in window.performance ? performance.now() : new Date().getTime();
  }

  // HELPERS: scrolling function from A -> B (modified from: https://bit.ly/2H3JKMV)
  function scrollToItem(destination, duration = 500, extraPadding) {
    const start = window.pageYOffset;
    const startTime = getTime();

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
      const now = getTime();

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