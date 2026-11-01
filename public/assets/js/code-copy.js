// Adds a small copy button to each code block in a post.
(() => {
  'use strict';

  if (!navigator.clipboard) {
    return;
  }

  const COPY = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/><path fill="currentColor" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/></svg>';
  const DONE = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/></svg>';

  document.querySelectorAll('.post-content pre').forEach((pre) => {
    const wrap = document.createElement('div');
    wrap.className = 'code-block';
    pre.replaceWith(wrap);
    wrap.append(pre);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy';
    button.setAttribute('aria-label', 'Copy code');
    button.innerHTML = COPY;
    let timer = 0;
    button.addEventListener('click', () => {
      navigator.clipboard.writeText(pre.innerText.replace(/\n$/, '')).then(() => {
        button.innerHTML = DONE;
        button.classList.add('is-copied');
        button.setAttribute('aria-label', 'Copied');
        clearTimeout(timer);
        timer = setTimeout(() => {
          button.innerHTML = COPY;
          button.classList.remove('is-copied');
          button.setAttribute('aria-label', 'Copy code');
        }, 2000);
      });
    });
    wrap.append(button);
  });
})();
