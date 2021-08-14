---
layout: post
title: "github-pewpew: a CLI tool to clean up and remove unnecessary GitHub repositories. 🔫 Pew pew!"
date: 2021-08-11 13:56:00
categories: [blog, worklog]
---


<a href="https://badge.fury.io/js/github-pewpew"><img src="https://badge.fury.io/js/github-pewpew.svg" alt="npm version" height="18"></a>

![github-pewpew preview]({{ "/assets/images/posts/2021/github-pewpew.gif" | relative_url }})

### Why?
Have you ever had too much fun with the GitHub API and ended up creating too many dummy repos? Me too 😅!

I made this little CLI tool to clean up repositories quickly. I'm planning to add some flags and regexp to delete in bulk in the future. [Let me know](http://twitter.com/adrianmg) if that sounds interesting to you.

Get the [latest version](https://www.npmjs.com/package/github-pewpew/) published in npm. It's [open-sourced on GitHub](https://github.com/adrianmg/github-pewpew) under MIT license.

### 📦 github-pewpew v1.1.3 on August 14, 2021
{:.anchor }

A new version [github-pewpew v 1.1.3](https://www.npmjs.com/package/github-pewpew/v/1.1.3) is published in npm. It's an important update as it's making it way easier to use than before. It's also lighter in size.

The auth solution wasn't too friendly, so I re-implemented it using [**OAuth**](https://github.com/octokit/octokit.js#oauth), and it's working like a charm. Plus, it doesn't need to ask for the username. You automatically get a validation code copied to your clipboard, paste it, and you are good to go! Kudos to [@mamuso](https://twitter.com/mamuso) for suggesting me this mechanism I never used before.

I also added **persistent configuration**. There's no more need to sign in every time you run the command. During this implementation, I learned about [`os.homedir()`](https://nodejs.org/api/os.html#os_os_homedir), the differences between operating systems, and how they store user configuration files.

Here's how it works:

```js
function getConfigDir(homeDir) {
  const configDir = path.join(
    homeDir,
    process.platform === 'win32'
      ? path.join('AppData', 'Roaming', PACKAGE_AUTHOR, PACKAGE.name)
      : path.join('Library', `com.${PACKAGE_AUTHOR}.${PACKAGE.name}`)
  );

  return configDir;
}

// Windows: adrianmg\AppData\Roaming\adrianmg\github-pewpew
// macOS/UNIX: /Users/adrianmg/Library/com.adrianmg.github-pewpew
```

The win32 solution won't work for systems older than Windows Vista. I guess that's OK in 2021? Some npm packages provide a robust solution covering all the different platforms, but it felt like a waste of weight for such a small tool. Plus, I'm learning a few things along the way.

### 📦 github-pewpew v1.0.0 on August 11, 2021
{:.anchor }

The first public version, [github-pewpew v 1.0.0](https://www.npmjs.com/package/github-pewpew/v/1.0.0) released on npm. The authentification is relying on both e-mail and PAT (Personal Acess Token) with a `repo_delete` scope. Although it works, it’s adding too much friction as the user must constantly copy and paste the value to get permissions to delete repositories.

![github-pewpew preview]({{ "/assets/images/posts/2021/github-pewpew-1.gif" | relative_url }})

I'm planning to reduce friction via a refactor that will use OAuth as the mechanism to get permissions.

## Questions? Ideas? Bugs?

If you run into any issues or you'd like to share your thoughts, feel free to [open an issue](https://github.com/adrianmg/github-pewpew/issues) in this repository or hit me up on [Twitter](https://twitter.com/adrianmg).