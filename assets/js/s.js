/*
  HOME
*/

// Years of experience
const yearsExperience = document.querySelector("#years");
if (yearsExperience !== null) {
  yearsExperience.textContent = new Date().getFullYear() - 2007;
}

// Scroll to work
const workLink = document.querySelector(".navigation [href='#work']");

workLink.addEventListener("click", function(e) {
  scrollToItem(document.querySelector("#work"), 500);

  e.preventDefault();
  return false;
});

/*
  HELPERS
*/

// Scrolling function from A -> B (modified from: https://bit.ly/2H3JKMV)
function scrollToItem(destination, duration = 200) {
  const start = window.pageYOffset;
  const startTime =
    "now" in window.performance ? performance.now() : new Date().getTime();

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

    if (window.pageYOffset === destinationOffsetToScroll) {
      return;
    }

    requestAnimationFrame(scroll);
  }

  scroll();
}
