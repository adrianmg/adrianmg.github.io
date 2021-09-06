---
layout: post
title: "Speeding up the TypeScript development flow for instant feedback"
date: 2021-09-05 21:00:00
categories: [blog, coding]
---

I recently started porting [github-pewpew]({{ site.baseurl }}{% link _posts/2021-08-14-github-pewpew-cli-delete-github-unnecessary-repositories.md %}) to TypeScript. I enjoy using types, but I struggle with the developer velocity due to compiling times.

I tried enabling a [`--watch` implementation](https://www.typescriptlang.org/docs/handbook/configuring-watch.html) so that my project will compile on the fly. That way, I can have it ready to go when running my application. While the experience has improved, it’s still slow when I need instant feedback on my changes. I tried turning on [`--incremental`](https://www.typescriptlang.org/tsconfig#incremental) decreasing times by 200ms to 300ms.

I'm not alone, the community is [discussing about it](https://github.com/microsoft/TypeScript/issues/29651). The biggest advantage is to transpile skipping  types checking, but it’s not supported. This is where the [**SWC compiler**](https://swc.rs) comes in.

## Aiming for instant feedback with SWC

SWC is a typescript / javascript compiler written in Rust that's blazingly fast. They claim to be "<i>20x faster than babel on single thread, and 70x faster on 4 core benchmark</i>".

Here's the comparison between `tsc` and `swc` transpiling a project with three simple files:

![Preview comparison between tsc and swc]({{ "/assets/images/posts/2021/tsc-vs-swc.gif" | relative_url }})

The left side is `tsc`; the right side is `swc`. SWC finishes way faster even when I run the command later. It's almost **1.5 seconds faster** compiling just three files.

Setting up SWC it's pretty straightforward. I installed it as a `devDependency`, and added some commands in my **`package.json`** file:

```json
"scripts": {
  "clean": "rm -rf dist",
  "prebuild": "npm run clean",
  "build": "tsc",
  "start": "npm run build --silent && node dist/index",
  "dev": "node node_modules/@swc/cli/bin/swc src --out-dir dist --delete-dir-on-start --quiet && node dist/index"
}
```

The `dev` command calls `swc`, sets up the output folder, and makes sure previous builds are deleted before starting.

It's even more noticeable when working in more complex projects. Here's another comparison running both at the same time using pipes:

![Preview comparison between tsc and swc run at the same time]({{ "/assets/images/posts/2021/tsc-vs-swc-pipes.gif" | relative_url }})


## What's the trick?

Rust always gets a lot of praise for its speed, but it's not just that: it's skipping the types checking to go even faster. This is not something you want when building your final build to distribute. That's why I keep a `build` command using `tsc` to build the final version of my application.

Does this mean I'm not taking advantage of type checking while developing? Not at all; VSCode TypeScript support will still throw errors and warnings in real-time.

The trade-off here is we need to maintain aligned two configuration files `tsconfig.json` and `.swcrc`. They don't share the same properties, but it’s easy to guess because naming it’s self-explanatory.

Here's an example of my **`.swcrc`** file:

```json
{
  "jsc": {
    "parser": {
      "decorators": true,
      "dynamicImport": true
      "syntax": "typescript",
    },
    "transform": {
      "decoratorMetadata": true
      "legacyDecorator": true,
    },
    "keepClassNames": true,
    "loose": true
    "target": "es2018",
  },
  "module": {
    "lazy": false,
    "noInterop": false
    "strict": true,
    "strictMode": true,
    "type": "commonjs",
  },
  "sourceMaps": "inline"
}
```

And here's the **`tsconfig.json`** file:
```json
{
  "compilerOptions": {
    "allowJs": true,
    "esModuleInterop": true,
    "incremental": true,
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "./dist",
    "resolveJsonModule": true,
    "rootDir": "src",
    "skipLibCheck": true,
    "strict": true,
    "target": "ES2015",
  },
}
```

## Looking forward to a faster cycle

The worst and best part of the JavaScript community is how fast is changing every day. I've already seen [other folks](https://twitter.com/jarredsumner/status/1390084458724741121?lang=en) in the community working on faster alternatives. I can't wait to see what comes next to ease our developer experience!

## Do you have any tips?

I'd love to know if you are using SWC or something else to speed up your developer velocity. Hit me up on [Twitter](https://twitter.com/adrianmg) at any time.

Thanks to [Lucia](https://luciagm.net), [Jorge](https://twitter.com/tylosan), and [Sergio](https://twitter.com/sergiou87) for the feedback before publishing this article.
