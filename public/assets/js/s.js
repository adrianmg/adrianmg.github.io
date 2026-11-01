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

  // Play inline videos only while they are visible and motion is welcome.
  if (document.querySelector('[data-autoplay-video]')) {
    const autoplayVideos = Array.from(document.querySelectorAll('[data-autoplay-video]'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const programmaticPauses = new WeakSet();
    const programmaticPlays = new WeakSet();
    const connection = navigator.connection;
    let preloadObserver;
    let videoObserver;

    // Posters below the fold arrive as data-poster and load about a screen and a half ahead.
    const lazyPosters = autoplayVideos.filter(function(video) {
      return video.dataset.poster;
    });

    function showPoster(video) {
      video.poster = video.dataset.poster;
      delete video.dataset.poster;
    }

    if ('IntersectionObserver' in window) {
      const posterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            showPoster(entry.target);
            posterObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '150% 0px' });

      lazyPosters.forEach(function(video) {
        posterObserver.observe(video);
      });
    } else {
      lazyPosters.forEach(showPoster);
    }

    // Data Saver and reduced motion both mean: never fetch or play without a tap.
    function autoplayAllowed() {
      return !reducedMotion.matches && !(connection && connection.saveData);
    }

    // 'metadata' fetches only the header and first frame; 'auto' buffers for playback.
    function preloadVideo(video, level) {
      const current = video.dataset.preloaded;

      if (current === 'auto' || current === level) {
        return;
      }

      video.dataset.preloaded = level;
      video.preload = level;

      if (!current) {
        video.load();
      }
    }

    function playVideo(video) {
      if (video.dataset.userPaused === 'true') {
        return;
      }

      programmaticPlays.add(video);
      const playPromise = video.play();

      if (playPromise) {
        playPromise.catch(function(error) {
          programmaticPlays.delete(video);

          if (error.name !== 'AbortError') {
            console.warn('Unable to autoplay project video.', error);
          }
        });
      }
    }

    function pauseVideo(video) {
      if (video.paused) {
        return;
      }

      programmaticPauses.add(video);
      video.pause();
    }

    autoplayVideos.forEach(function(video) {
      video.addEventListener('pause', function() {
        if (!programmaticPauses.delete(video)) {
          video.dataset.userPaused = 'true';
        }
      });

      video.addEventListener('play', function() {
        video.dataset.preloaded = 'auto';

        if (!programmaticPlays.delete(video)) {
          delete video.dataset.userPaused;
        }
      });
    });

    function configureVideoPreload() {
      if (preloadObserver) {
        preloadObserver.disconnect();
      }

      if (!autoplayAllowed() || !('IntersectionObserver' in window)) {
        return;
      }

      // Half a screen ahead, fetch just enough to start instantly; full buffering waits until visible.
      preloadObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            preloadVideo(entry.target, 'metadata');
            preloadObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '50% 0px' });

      autoplayVideos.forEach(function(video) {
        if (!video.dataset.preloaded) {
          preloadObserver.observe(video);
        }
      });
    }

    function configureVideoAutoplay() {
      if (videoObserver) {
        videoObserver.disconnect();
      }

      autoplayVideos.forEach(function(video) {
        pauseVideo(video);
        delete video.dataset.inViewport;
      });

      if (!autoplayAllowed() || !('IntersectionObserver' in window)) {
        return;
      }

      videoObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          const video = entry.target;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            video.dataset.inViewport = 'true';

            if (!document.hidden) {
              preloadVideo(video, 'auto');
              playVideo(video);
            }
          } else {
            delete video.dataset.inViewport;
            pauseVideo(video);
          }
        });
      }, { threshold: 0.5 });

      autoplayVideos.forEach(function(video) {
        videoObserver.observe(video);
      });
    }

    configureVideoAutoplay();

    if (document.readyState === 'complete') {
      configureVideoPreload();
    } else {
      window.addEventListener('load', configureVideoPreload, { once: true });
    }

    function reconfigureVideos() {
      configureVideoAutoplay();
      configureVideoPreload();
    }

    reducedMotion.addEventListener('change', reconfigureVideos);

    if (connection && connection.addEventListener) {
      connection.addEventListener('change', reconfigureVideos);
    }

    document.addEventListener('visibilitychange', function() {
      autoplayVideos.forEach(function(video) {
        if (document.hidden) {
          pauseVideo(video);
        } else if (video.dataset.inViewport === 'true' && autoplayAllowed()) {
          playVideo(video);
        }
      });
    });
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