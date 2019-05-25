// Safari Mobile browser fix for navigation
let innerheight = iosInnerHeight();
if (innerheight !== window.innerHeight) {
  document.body.classList.add("ios");
  if (innerheight >= 699) {
    document.body.classList.add("ios-iphonex"); // iPhone X requires different style
  }
}
// Lazy Load of images
var lazyLoad = new LazyLoad({
  elements_selector: ".lazy",
  threshold: 800
});

/*
HOME
*/
let arrow = document.querySelector(".home-intro-scroll");
const arrowTreshold = 100; // when stops being visible
const workAnchor = "#home-work";
const navWork = document.querySelector(
  `.home-navigation [href='${workAnchor}']`
);

// click on navigation 'work' and scroll
navWork.addEventListener("click", function(e) {
  scrollToItem(document.querySelector(workAnchor), 800);
  // workAnchor.scrollIntoView({behavior: 'smooth' });
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

// hide scroll hint
document.addEventListener("scroll", scrollHandler);

function scrollHandler() {
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