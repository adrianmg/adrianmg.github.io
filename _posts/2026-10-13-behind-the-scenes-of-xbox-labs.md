---
title: "A little behind the scenes of XBOX Labs"
date: "2026-10-13 09:00:00"
categories: [blog, worklog]
---

I want to share a little behind the scenes of [labs.xbox.com](https://labs.xbox.com). A lot of love went into making every part of it feel just right, and much of that love lives in details that are easy to miss at first glance.

<figure class="post-media">
  <video data-autoplay-video controls loop muted playsinline preload="none" poster="/assets/images/posts/2026/xbox-labs/hero-poster.webp" width="1920" height="994" aria-label="The XBOX Labs homepage with interactive ASCII art over game footage and a panel for art-directing the shaders in real time">
    <source src="/assets/images/posts/2026/xbox-labs/hero-mobile.mp4" media="(max-width: 620px)" type="video/mp4">
    <source src="/assets/images/posts/2026/xbox-labs/hero.mp4" type="video/mp4">
  </video>
</figure>

## Art-directing shaders in real time

The homepage turns game footage into interactive ASCII art. To get the look right, we built some fun tools to art-direct the shaders in real time: a small panel to tweak saturation, density, glyphs, and more while watching clips from games like Halo, Sea of Thieves, and Gears of War change instantly. Being able to dial things in live made it easy to keep experimenting until it felt right.

It's also meant to be played with, not just watched. Move your mouse and you leave a colorful trail that reveals the original footage underneath, or interact with the video to trigger bursts of particles.

## One art direction everywhere

We wanted the whole site to feel cohesive, so the same art direction carries through beyond the homepage. Dialogs pick it up too, so opening one feels like part of the same experience rather than a detour.

<figure class="post-media">
  <video data-autoplay-video controls loop muted playsinline preload="none" poster="/assets/images/posts/2026/xbox-labs/dialogs-poster.webp" width="1920" height="1080" aria-label="A dialog on the XBOX Labs site using the same ASCII art direction as the homepage">
    <source src="/assets/images/posts/2026/xbox-labs/dialogs-mobile.mp4" media="(max-width: 620px)" type="video/mp4">
    <source src="/assets/images/posts/2026/xbox-labs/dialogs.av1.mp4" type="video/mp4; codecs=av01.0.09M.08">
    <source src="/assets/images/posts/2026/xbox-labs/dialogs.mp4" type="video/mp4">
  </video>
</figure>

The site also comes in two flavors, a cream mode and a dark mode, both built on the same visual language.

<figure class="post-media">
  <img src="/assets/images/posts/2026/xbox-labs/cream.webp" alt="The XBOX Labs homepage in cream mode" width="1920" height="992" loading="lazy" decoding="async">
</figure>

<figure class="post-media">
  <img src="/assets/images/posts/2026/xbox-labs/dark.webp" alt="The XBOX Labs homepage in dark mode" width="1920" height="992" loading="lazy" decoding="async">
</figure>

## The tiny details

Some of my favorite parts are the ones you might not notice right away. As you move the mouse around, the video gently tilts to follow it, then smoothly straightens itself when you enter focus or theater mode.

<figure class="post-media">
  <video data-autoplay-video controls loop muted playsinline preload="none" poster="/assets/images/posts/2026/xbox-labs/tilt-poster.webp" width="1920" height="996" aria-label="The XBOX Labs video tilting with the mouse, then straightening when entering focus mode">
    <source src="/assets/images/posts/2026/xbox-labs/tilt-mobile.mp4" media="(max-width: 620px)" type="video/mp4">
    <source src="/assets/images/posts/2026/xbox-labs/tilt.av1.mp4" type="video/mp4; codecs=av01.0.09M.08">
    <source src="/assets/images/posts/2026/xbox-labs/tilt.mp4" type="video/mp4">
  </video>
</figure>

And last but not least, even the forms get the same treatment, all the way down to signing up for updates.

<figure class="post-media">
  <video data-autoplay-video controls loop muted playsinline preload="none" poster="/assets/images/posts/2026/xbox-labs/forms-poster.webp" width="1920" height="1082" aria-label="Typing an email into the XBOX Labs sign-up form, styled with the same art direction">
    <source src="/assets/images/posts/2026/xbox-labs/forms-mobile.mp4" media="(max-width: 620px)" type="video/mp4">
    <source src="/assets/images/posts/2026/xbox-labs/forms.av1.mp4" type="video/mp4; codecs=av01.0.09M.08">
    <source src="/assets/images/posts/2026/xbox-labs/forms.mp4" type="video/mp4">
  </video>
</figure>

## More to come

This is just the beginning, and there's more to come ✨ In the meantime, go play with it at [labs.xbox.com](https://labs.xbox.com). If you have thoughts, I'd love to hear them; you can [reply to the thread on X](https://x.com/adrianmg/status/2110100020557201412).
