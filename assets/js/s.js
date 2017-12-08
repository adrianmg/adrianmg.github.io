// Smooth scroll when clicking on Menu items with anchor points
$('a').click(function(){
  $('html, body').animate({
    scrollTop: $( $.attr(this, 'href') ).offset().top
  }, 500);
  return false;
});