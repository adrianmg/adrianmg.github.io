/**
 * iOS innerHeight Fix
 * Adds accurate innerHeight property for iOS devices
 * 
 * iOS Safari has issues with window.innerHeight when the address bar is visible/hidden.
 * This module provides a consistent innerHeight value across iOS devices.
 */
(function(root, factory) {
  'use strict';
  
  // Universal Module Definition (UMD) pattern
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    // CommonJS
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory);
  } else {
    // Browser global
    root.iosInnerHeight = factory();
  }
}(typeof window !== 'undefined' ? window : this, function() {
  'use strict';
  
  /**
   * Returns a function that calculates the inner height for iOS devices.
   * For non-iOS devices, returns the standard window.innerHeight.
   * 
   * @returns {Function} A function that returns the current inner height
   */
  function getIOSInnerHeight() {
    // Check if device is iPhone, iPod, or iPad
    if (!navigator.userAgent.match(/iphone|ipod|ipad/i)) {
      // Not an iOS device, use standard innerHeight
      return function() {
        return window.innerHeight;
      };
    }
    
    // iOS device detected - need special handling
    const axis = Math.abs(window.orientation);
    const dims = { w: 0, h: 0 };
    
    // Create a temporary ruler element to measure viewport height
    const ruler = document.createElement('div');
    ruler.style.position = 'fixed';
    ruler.style.height = '100vh';
    ruler.style.width = '0';
    ruler.style.top = '0';
    
    // Temporarily add to DOM to measure
    document.documentElement.appendChild(ruler);
    
    // Store dimensions based on orientation
    // 90 or 270 degrees means landscape orientation
    dims.w = (axis === 90) ? ruler.offsetHeight : window.innerWidth;
    dims.h = (axis === 90) ? window.innerWidth : ruler.offsetHeight;
    
    // Clean up
    document.documentElement.removeChild(ruler);
    
    // Return a function that returns the appropriate dimension based on current orientation
    return function() {
      return (Math.abs(window.orientation) !== 90) ? dims.h : dims.w;
    };
  }
  
  // Execute and return the appropriate function
  return getIOSInnerHeight();
}));
