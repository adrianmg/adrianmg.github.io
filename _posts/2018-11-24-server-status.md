---
layout: post
title: "Worklog: Small tool for servers to be figured out yet"
date: 2018-11-24 21:40:00
categories: [blog, worklog]
summary: "
A small tool for servers on the works."
---

### March 29, 2019 at 7:51
{:.anchor }
Some news, [Iván](http://ivanguardado.com) has paired up with me helping to improve the business logic, and making the code a bit more robust for future steps. I'm trying to put together a template to generate the first version of the front-end. Basically we will be able to serve all the data we're collecting.

![UI components race calculator]({{ "/assets/images/posts/2019/server-status-03.png" | relative_url }})
![UI components race calculator]({{ "/assets/images/posts/2019/server-status-04.png" | relative_url }})

### November 25, 2018 at 16:05
{:.anchor }

I've refactored and added long polling to the **nodejs** application so now I can control how often the date is going to be retrieved. I also set up a simple docker container that allows me to deploy the app to **now/zeit** continuously.

Here's a preview of the app running while updating the real-time database from **firebase**:

![UI components race calculator]({{ "/assets/images/posts/2018/server-status-02.gif" | relative_url }})

I'm going to leave this up and running for a few days as I keep making progress on the client side. Hopefully, it doesn't crash 😅.

### November 24, 2018 at 21:45
{:.anchor }

I'm still not sure where this is going to, but I've managed to put some hours to code the first part of it. I've started with a **nodejs** client that pulls information from a list of endpoints and write all that data into a Firebase real-time database.

![UI components race calculator]({{ "/assets/images/posts/2018/server-status-01.gif" | relative_url }})

Stay tuned, I think it's going to be useful. I'm going to invest the next few days working on a React client that would read all this information and give it some structure to make this more useful.