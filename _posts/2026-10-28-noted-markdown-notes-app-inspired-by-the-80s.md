---
title: "Noted: a tiny, fast Markdown notes app inspired by the 80s"
date: "2026-10-28 09:00:00"
categories: [blog, worklog]
---

I built a notes app inspired by the 80s, back when software felt simple and snappy. It launches in 2.6ms.

<figure class="post-media">
  <video data-autoplay-video controls loop muted playsinline preload="none" poster="/assets/images/posts/2026/noted/launch-poster.webp" width="1920" height="1084" aria-label="Noted launching in the terminal and opening a note">
    <source src="/assets/images/posts/2026/noted/launch-mobile.mp4" media="(max-width: 620px)" type="video/mp4">
    <source src="/assets/images/posts/2026/noted/launch.av1.mp4" type="video/mp4; codecs=av01.0.08M.08">
    <source src="/assets/images/posts/2026/noted/launch.mp4" type="video/mp4">
  </video>
</figure>

I've taken notes for more than ten years, first in VS Code and later in Obsidian. Both are great tools, but most of the time I just want to jot down a thought and get back to what I was doing. That small gap between having an idea and writing it down is why I made [Noted](https://noted.computer).

## Open it, write, close it

I love Markdown, but opening a whole workspace just to write down a thought always felt like too much ceremony. Noted removes that step: it runs in your terminal, opens instantly, and gets out of the way when you're done.

Everything saves as you type, straight to plain Markdown files, so there's no save button and nothing to set up. You open it, write, and close it. That's pretty much the whole idea.

<figure class="post-media">
  <video data-autoplay-video controls loop muted playsinline preload="none" data-poster="/assets/images/posts/2026/noted/idea-poster.webp" width="1920" height="1194" aria-label="Writing a note in Noted while it saves automatically">
    <source src="/assets/images/posts/2026/noted/idea-mobile.mp4" media="(max-width: 620px)" type="video/mp4">
    <source src="/assets/images/posts/2026/noted/idea.mp4" type="video/mp4">
  </video>
</figure>

## A bit obsessed with speed

If the goal is capturing a thought before it slips away, speed matters, so I got a bit obsessed with it. Noted launches in **2.6ms**, uses about **5MB** of memory, and takes up roughly **2.5MB** on disk.

With 1,000 notes on my machine, it opens faster than Vim, Emacs, Obsidian, and Apple Notes. These are tiny numbers on paper, but you feel the difference every time you reach for it.

<figure class="post-media">
  <img src="/assets/images/posts/2026/noted/benchmark.webp" alt="Benchmarks with 1,000 notes on an Apple M4 Max: Noted launches in 2.6ms, uses 5.3MB of RAM and 2.5MB on disk, compared with Vim, Emacs, Apple Notes, Obsidian, and VS Code" width="2682" height="1273" loading="lazy" decoding="async">
</figure>

## Finding that one note

Writing notes quickly only helps if you can find them again. We've all lost time hunting for that one note we know we wrote somewhere.

Noted uses fuzzy search for when you only remember bits and pieces, and exact matching for when you know precisely what you're looking for. Either way, results appear as you type.

<figure class="post-media">
  <video data-autoplay-video controls loop muted playsinline preload="none" data-poster="/assets/images/posts/2026/noted/search-poster.webp" width="1920" height="1194" aria-label="Searching notes in Noted with results appearing as you type">
    <source src="/assets/images/posts/2026/noted/search-mobile.mp4" media="(max-width: 620px)" type="video/mp4">
    <source src="/assets/images/posts/2026/noted/search.mp4" type="video/mp4">
  </video>
</figure>

## The little interactions

My favorite part of any side project is obsessing over the small interactions. In Noted, that means checking off tasks, seeing your progress at a glance, and editing Markdown tables that automatically align text and numbers. Tables in particular have always been painful to edit by hand, and they shouldn't be.

There are plenty of other small details like these waiting to be discovered.

<figure class="post-media">
  <video data-autoplay-video controls loop muted playsinline preload="none" data-poster="/assets/images/posts/2026/noted/details-poster.webp" width="1920" height="1194" aria-label="Checking off tasks and editing an auto-aligned Markdown table in Noted">
    <source src="/assets/images/posts/2026/noted/details-mobile.mp4" media="(max-width: 620px)" type="video/mp4">
    <source src="/assets/images/posts/2026/noted/details.mp4" type="video/mp4">
  </video>
</figure>

And if your notes start to pile up, you can organize them into folders and arrange them however you like, without leaving the keyboard.

<figure class="post-media">
  <video data-autoplay-video controls loop muted playsinline preload="none" data-poster="/assets/images/posts/2026/noted/folders-poster.webp" width="1920" height="1194" aria-label="Organizing notes into folders in Noted">
    <source src="/assets/images/posts/2026/noted/folders-mobile.mp4" media="(max-width: 620px)" type="video/mp4">
    <source src="/assets/images/posts/2026/noted/folders.mp4" type="video/mp4">
  </video>
</figure>

## The actual 80s part

Then there's the part that gives Noted its personality: DOS-style menus, Turbo blue and amber themes, a Synthwave theme for late nights, and optional keyboard sound effects I'm slightly addicted to.

It's part nostalgia and part a belief that software can feel immediate and tactile again. That spirit carried over to [the website](https://noted.computer), which was a lot of fun to build.

<figure class="post-media">
  <video data-autoplay-video controls loop muted playsinline preload="none" data-poster="/assets/images/posts/2026/noted/eighties-poster.webp" width="1920" height="1070" aria-label="Noted's DOS-style menus, themes, and the noted.computer website">
    <source src="/assets/images/posts/2026/noted/eighties-mobile.mp4" media="(max-width: 620px)" type="video/mp4">
    <source src="/assets/images/posts/2026/noted/eighties.av1.mp4" type="video/mp4; codecs=av01.0.08M.08">
    <source src="/assets/images/posts/2026/noted/eighties.mp4" type="video/mp4">
  </video>
</figure>

## Give it a try

I've been using Noted every day for the past month, and it felt like the right time to share it. You can install it with npm on macOS, Linux, or Windows:

```sh
npm install -g @adrianmg/noted
```

There are also other ways to install it, including Homebrew, on [noted.computer](https://noted.computer).

If you give it a try, I'd love to hear what you think, whether it's an idea, a bug, or a weird edge case.

I hope you enjoy it as much as I do ❤️

<p class="post-note">This post was originally shared as <a href="https://x.com/adrianmg/status/2115473668063281459">a thread on X</a>.</p>
