---
layout: post
title: "Worklog: Sharing your process and work in progress"
date: 2019-12-12 22:30:00
categories: [blog, worklog]
summary: "
Updates on a small project aiming to improve how people collaborate by sharing their process, work in progress, and receive feedback.
"
---

### December 16, 2019 at 22:30
{:.anchor }

I just arrived in my hometown with a terrible jet lag, so I managed to put together a first working version of the new login system using [passport-twitter](http://www.passportjs.org/docs/twitter/).

I spent a decent amount of time debugging a token session error while using [cookie-session](https://www.npmjs.com/package/cookie-session). It turns out using `sameSite: strict` won't work at least in a local development environment.

The next steps are figuring out the data retrieved from Twitter and hook it up properly with the data model in the database.

![Prisma Query explorer]({{ "/assets/images/posts/2019/peekingat-02.png" | relative_url }})

### December 12, 2019 at 22:30
{:.anchor }

After eight years working together, [mamuso](http://mamuso.net) and I thought it was time to build something together out of work, so here we are. We have a specific goal: to improve the sharing of process, work in progress, and feedback for creators. We are trying to limit the technical complexity by relying on a [JavaScript boilerplate](https://github.com/nice-boys/product-boilerplate) that [Max](https://mobile.twitter.com/mxstbr/) and [Brian](https://mobile.twitter.com/brian_lovin) have put together.

We got login sessions working via Google Auth, but I'm currently working on a [Passport Twitter Strategy](http://passportjs.org).

![Prisma GraphQL]({{ "/assets/images/posts/2019/peekingat-01.png" | relative_url }})