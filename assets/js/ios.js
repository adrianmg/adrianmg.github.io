/**
 * iOS innerHeight Polyfill
 * Provides accurate innerHeight for iOS devices to handle viewport quirks
 */
(function() {
  'use strict';

  // Return early if not iOS
  if (!navigator.userAgent.match(/iphone|ipod|ipad/i)) {
    window.iosInnerHeight = function() {
      return window.innerHeight;
    };
    return;
  }

  // Cache dimensions to avoid repeated DOM manipulation
  const dims = { w: 0, h: 0 };
  
  // Create temporary ruler element once
  const ruler = document.createElement('div');
  ruler.style.cssText = 'position:fixed;height:100vh;width:0;top:0;pointer-events:none;visibility:hidden;';
  
  // Append, measure, and remove
  document.documentElement.appendChild(ruler);
  
  const axis = Math.abs(window.orientation);
  dims.w = axis === 90 ? ruler.offsetHeight : window.innerWidth;
  dims.h = axis === 90 ? window.innerWidth : ruler.offsetHeight;
  
  document.documentElement.removeChild(ruler);

  // Return cached dimension based on orientation
  window.iosInnerHeight = function() {
    return Math.abs(window.orientation) === 90 ? dims.w : dims.h;
  };
})();