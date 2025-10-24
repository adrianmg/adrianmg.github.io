# Performance Optimization Guide

This document outlines performance optimizations applied to this website and recommendations for future improvements.

## Implemented Optimizations

### JavaScript Performance
- **Scroll Event Throttling**: Added `requestAnimationFrame` throttling to the scroll event handler in `assets/js/s.js` to prevent excessive DOM queries and repaints
- **Passive Event Listeners**: Marked scroll listener as passive to improve scrolling performance
- **Removed Unused Dependencies**: Removed `ios.js` which was loaded but never used

### CSS Performance
- **Respect User Preferences**: Made smooth scrolling conditional on `prefers-reduced-motion: no-preference` for better accessibility and performance
- **Animation Optimization**: Added `will-change: transform` to animated elements during animation
- **Content Visibility**: Added `content-visibility: auto` to project cards to defer rendering of off-screen content
- **Cleaned Empty Keyframes**: Removed empty keyframe steps from animations

### Resource Loading
- **Async Font Loading**: Implemented asynchronous Google Fonts loading with media query trick to prevent render-blocking
- **DNS Prefetch**: Added DNS prefetch for analytics domain (`cloud.umami.is`)
- **Proper Resource Hints**: Added `crossorigin` attribute to font preconnects

## Recommended Future Optimizations

### Image Optimization
Current largest images:
- `work/yammer/yammer-01.jpg` (872KB)
- `work/yammer/yammer-02.jpg` (652KB)
- `work/yammer/yammer-04.jpg` (508KB)
- `work/fever/fever-01.jpg` (476KB)

**Recommendations:**
1. **Convert to Modern Formats**: Use WebP or AVIF with JPEG fallbacks
2. **Implement Responsive Images**: Use `<picture>` element with multiple sizes
3. **Lazy Loading**: Add `loading="lazy"` to below-the-fold images
4. **Image CDN**: Consider using an image CDN for automatic optimization

Example implementation:
```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" loading="lazy" alt="Description">
</picture>
```

### Build Process
Consider adding:
- Image optimization pipeline (e.g., `imagemin` or similar)
- CSS/JS minification in production
- Asset versioning/cache busting

## Performance Metrics to Monitor

Track these Core Web Vitals:
- **LCP (Largest Contentful Paint)**: Should be < 2.5s
- **FID (First Input Delay)**: Should be < 100ms
- **CLS (Cumulative Layout Shift)**: Should be < 0.1

## Testing

Test performance using:
- Chrome DevTools Lighthouse
- WebPageTest.org
- Google PageSpeed Insights

## Accessibility

Performance optimizations maintain accessibility:
- Respects `prefers-reduced-motion`
- Maintains proper semantic HTML
- Preserves keyboard navigation
