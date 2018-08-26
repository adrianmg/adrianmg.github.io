---
layout: post
title: "Worklog: Running Race Calculator "
date: 2018-08-11 22:30:00
categories: [blog, worklog]
summary: "
I'm pairing with [Lucia](http://luciagm.net) to build a pet project that would let people estimate the race pace and total time when running races. It's the perfect excuse to do two things:

- She’d  <a href='https://github.com/lucia-gm/race-calculator'>code</a> all the project to keep improving her front-end skills

- I'd stretch the creativity muscle and create a small UI kit to facilitate side projects


I've been pondering about the idea of having a daily worklog, let's give it a try! If you got comments or suggestions please do [share them](http://twitter.com/adrianmg).
"
---

### August 25, 2018 at 20:03
{:.anchor }

We’ve been discussing a little bit how to surface the information to the user. The equation is pretty straightforward: you always have **distance**, and then the user needs to set either a **total time** or a **pace time**, and we’d generate the results.

Initially, I was tempted to force the user to choose between two tabs/switch, but it felt wrong, so we’re going to keep things simple and present the info in three steps:

1. What’s the distance you’re running?
2. Do you want to calculate your pace or total time?
3. Set a time and hit ‘Calculate.’

![Notebook sketch race calculator]({{ "/assets/images/posts/2018/race-calculator-03.jpg" | relative_url }})

All these doubts appeared after reviewing how other online calculators present all the options at first level, so they’d automatically calculate the option you leave empty: distance, total time or pace time. I found that a bit confusing.

I'm also starting to explore how the interactions are going to behave and look. [Lucia](http://luciagm.net) wants to have something strong for the primary actions, something purplish. I've been using blue as the primary action so many years in different companies (now, at Microsoft) that I guess it's a blow of fresh air my eyes 😅.

![Notebook sketch race calculator]({{ "/assets/images/posts/2018/race-calculator-04.png" | relative_url }})

### August 11, 2018 at 16:05
{:.anchor }

When thinking about the visual execution of new projects I always start with the basic unit of information which is the text and its type ramp. I’m also going back to native fonts since they run fast as hell though I may take the license to use Montserrat for big bold titles when representing the time and other cool data about your running stats.

I’d keep you posted!

![Type ramp for race calculator]({{ "/assets/images/posts/2018/race-calculator-02.png" | relative_url }})

### August 10, 2018 at 22:30
{:.anchor }

I’m trying to map the basic elements that would be needed in order to have the race calculator. I don’t feel 100% convinced of what should be the right approach: asking the user what they need to know (pace VS total time) or just give all the option and let them figure out. At this point, I’m towards defaulting to set a pace that would generate the total time and they would be able to switch from a pivot to the other option.

I’m sharing some rough sketches of the process from my notebook:

![Notebook sketch race calculator]({{ "/assets/images/posts/2018/race-calculator-01.jpg" | relative_url }})