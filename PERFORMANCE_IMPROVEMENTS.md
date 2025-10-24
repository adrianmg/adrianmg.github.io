# Performance Optimizations

This document outlines the performance improvements made to the website.

## Summary of Changes

### 1. JavaScript Performance Improvements

#### a. Extracted Inline JavaScript (pewpew.html)
- **Before**: Large inline script (~7.5KB) embedded in HTML
- **After**: External file `assets/pewpew/js/terminal.js` with defer attribute
- **Benefits**:
  - Browser can cache the script
  - HTML parses faster
  - Better code organization
  - Reduced initial page size

#### b. Scroll Event Throttling (assets/js/s.js)
- **Before**: Scroll handler executed on every scroll event
- **After**: Throttled to execute at most once per 100ms
- **Benefits**:
  - Reduced CPU usage during scrolling
  - Smoother scrolling experience
  - Added passive event listener for better performance
  - Automatically removes listener when arrow is hidden

#### c. DOM Query Optimization (assets/js/s.js)
- **Before**: Repeated DOM queries in scroll animation loop
- **After**: Cached DOM element references
- **Benefits**:
  - Fewer DOM lookups
  - Faster execution
  - Reduced memory allocations

#### d. Deferred Script Loading
- **Before**: Blocking script tags for ios.js and s.js
- **After**: Non-blocking with defer attribute
- **Benefits**:
  - Doesn't block HTML parsing
  - Faster initial page render
  - Scripts execute in order after DOM is ready

### 2. CSS Performance Improvements

#### a. Removed Unused Animations
Removed two unused keyframe animations:
- `home-intro-desc-animation`
- `navigation-animation`

**Benefits**:
- Smaller CSS file size (14 lines removed)
- Less CSS parsing overhead
- Cleaner codebase

#### b. Optimized Active Animations
Removed empty keyframe steps from `home-intro-scroll`:
- Removed unused 20% and 75% steps

**Benefits**:
- Simpler animation
- Faster animation processing

### 3. Font Loading Optimization

#### a. Async Google Fonts Loading
- **Before**: Blocking font stylesheet
- **After**: Asynchronous loading with media query trick
- **Implementation**:
  ```html
  <link href="..." rel="stylesheet" media="print" onload="this.media='all'">
  <noscript><link href="..." rel="stylesheet"></noscript>
  ```
- **Benefits**:
  - Doesn't block page render
  - Fonts load in background
  - Noscript fallback for accessibility

#### b. Enhanced Preconnect
- Added `crossorigin` attribute to font preconnect
- **Benefits**:
  - Better CORS handling
  - Faster font loading

## Performance Impact

### Estimated Improvements:

**Note**: These are estimated improvements based on common web performance patterns. Actual results may vary based on network conditions, device, and browser.

- **Initial Page Load**: 15-20% faster (based on removal of inline script and deferred loading)
- **Scroll Performance**: 30-40% smoother (based on throttling and event listener optimization)
- **Resource Caching**: Improved browser caching for extracted JavaScript
- **CSS Size**: ~5% smaller (14 lines removed from animations)

To measure actual improvements, use:
- Chrome DevTools Lighthouse
- WebPageTest.org
- Chrome DevTools Performance tab for scroll performance

### Browser Benefits:
- Faster HTML parsing (no large inline scripts)
- Better resource prioritization
- Improved paint and layout performance
- Reduced JavaScript execution on scroll

## Testing Recommendations

1. Test on mobile devices (especially iOS)
2. Verify scroll behavior with DevTools Performance tab
3. Check that pewpew page terminal animation still works
4. Verify fonts load correctly
5. Test with slow 3G throttling

## Browser Compatibility

All changes use standard web APIs supported by modern browsers:
- Chrome/Edge 90+ (2021+)
- Firefox 88+ (2021+)
- Safari 14+ (2020+)
- iOS Safari 14+ (2020+)

Older browsers will still work but may not receive all performance benefits:
- Defer attribute: Supported since Chrome 61, Firefox 55, Safari 11
- Passive event listeners: Supported since Chrome 51, Firefox 49, Safari 10
- Font loading technique: Requires JavaScript (noscript fallback provided)

## Maintenance Notes

### Source Code Management
- The terminal.js file is minified/obfuscated
- **Recommendation**: Keep an unminified source version in a separate location
  - Store source at: `assets/pewpew/js/terminal.source.js` or in version control
  - Add build step to minify if changes are needed
  - Document the minification process in project README

### Configuration Options
- Scroll throttle delay (100ms) can be adjusted in `assets/js/s.js` if needed
  - Lower values (50ms) = more responsive but higher CPU usage
  - Higher values (150ms) = better performance but less responsive

### Font Loading
- Font loading technique requires JavaScript (noscript fallback provided)
- If JavaScript is disabled, fonts will still load but may cause layout shift
