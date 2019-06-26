(() => {
  'use strict';

  const isHome = document.querySelector("body.home");

  // Lazy Load of images
  var lazyLoad = new LazyLoad({
    elements_selector: ".lazy",
    threshold: 800
  });

  // HOME
  if (isHome) {
    let arrow = document.querySelector('.home-intro-scroll');
    const arrowTreshold = 100; // when stops being visible
    const workAnchor = "#home-work";
    const navWork = document.querySelector(`.home-navigation [href='${workAnchor}']`);
    const nav = document.querySelector('.home-navigation');
    let navBoundingTop = nav.getBoundingClientRect().top;

    // click on navigation 'work' and scroll
    navWork.addEventListener("click", function(e) {
      scrollToItem(document.querySelector(workAnchor), 800, nav.clientHeight * 1.2);
      history.pushState({}, "", workAnchor);
      e.preventDefault();
      return false;
    });

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
    let windowOffset = window.pageYOffset;
    let windowOffsetDelta = 0;
    let windowOffsetThreshold = 20; // pixels
    document.addEventListener("scroll", scrollHandler);

    function scrollHandler() {
      // if header is sticky via CSS
      if (navBoundingTop <= 1) {
        if (windowOffset > window.pageYOffset) { // scrolling up
          if (windowOffsetDelta >= windowOffsetThreshold && nav.classList.contains("hidden")) {
            nav.classList.remove("hidden");
          }
          else {
            windowOffsetDelta++;
          }
        }
        else { // scrolling down
          if (!nav.classList.contains("hidden")) {
            nav.classList.add("hidden");
          }
          windowOffsetDelta = 0;
        }
      }
      navBoundingTop = nav.getBoundingClientRect().top;
      windowOffset = window.pageYOffset;

      // // scroll hint
      let scroll = document.scrollingElement.scrollTop;

      // hide arrow when needed
      if (scroll >= arrowTreshold && arrow) {
        arrow.classList.remove("visible");
      }
    }

    // Initialize scroll hint
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