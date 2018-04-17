// @todo: do this in vanilla javascript instead Smooth scroll when clicking on Menu items with anchor points
// Home: scroll animation after click
$("a").click(function() {
  $("html, body").animate(
    {
      scrollTop: $($.attr(this, "href")).offset().top
    },
    500
  );
  return false;
});

// Home: years of experience
let yearsExperience = document.querySelector("#years");
if (yearsExperience !== null) {
  yearsExperience.textContent = new Date().getFullYear() - 2007;
}
