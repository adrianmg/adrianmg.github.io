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
    const arrow = document.querySelector(".home-intro-scroll");
    const arrowTreshold = 100; // when stops being visible
    const workAnchor = "#home-work";
    const navWork = document.querySelector(
      `.home-navigation [href='${workAnchor}']`
    );

    // click on navigation 'work' and scroll
    navWork.addEventListener("click", function(e) {
      scrollToItem(document.querySelector(workAnchor), 800);
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

    // scrolling
    document.addEventListener("scroll", scrollHandler);

    function scrollHandler() {
      // scroll hint
      let scroll = document.scrollingElement.scrollTop;

      if (scroll >= arrowTreshold && arrow) {
        arrow.classList.remove("visible");

        document.removeEventListener("scroll", scrollHandler);
        // remove element after transition (avoid dealing with event handling + transitionend)
        setTimeout(function() {
          arrow.parentNode.removeChild(arrow);
          arrow = false;
        }, 400);
      }
    }

    // Initialize scroll hint
    showScrollHint(3);
  }

  // HELPERS

  // HELPERS: scrolling function from A -> B (modified from: https://bit.ly/2H3JKMV)
  function scrollToItem(destination, duration = 500) {
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
    const destinationOffsetToScroll = Math.round(
      documentHeight - destinationOffset < windowHeight
        ? documentHeight - windowHeight
        : destinationOffset
    );

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

      if (Math.round(window.pageYOffset) >= destinationOffsetToScroll) {
        return;
      }

      requestAnimationFrame(scroll);
    }

    scroll();
  }
})();