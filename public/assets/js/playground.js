// Connects interactive post demos to their controls. A demo registers a setup
// function under the name its <Playground> uses; the function receives the
// stage element and the current values, and returns an `update(values)` that
// runs whenever a control changes and may return a short status line to show.
// Demos only set up as they come near view.
(() => {
  'use strict';

  if (window.Playground) {
    return;
  }

  const demos = new Map();

  function values(form) {
    const state = {};
    for (const field of form.elements) {
      if (!field.name) {
        continue;
      }
      if (field.type === 'checkbox') {
        state[field.name] = field.checked;
      } else if (field.type === 'radio') {
        if (field.checked) {
          state[field.name] = field.value;
        }
      } else if (field.type === 'range' || field.type === 'number') {
        state[field.name] = Number(field.value);
      } else if (field.type === 'file') {
        state[field.name] = field.files && field.files[0] ? field.files[0] : null;
      } else {
        state[field.name] = field.value;
      }
    }
    return state;
  }

  function showValues(form) {
    // Ranges paint their filled part from this.
    form.querySelectorAll('input[type="range"]').forEach((range) => {
      const min = Number(range.min || 0);
      const max = Number(range.max || 100);
      range.style.setProperty('--fill', `${((Number(range.value) - min) / (max - min)) * 100}%`);
    });
    form.querySelectorAll('output[data-for]').forEach((output) => {
      const field = form.elements[output.dataset.for];
      if (!field) {
        return;
      }
      const decimals = Number(output.dataset.decimals || 0);
      output.textContent = Number(field.value).toFixed(decimals) + (output.dataset.unit || '');
    });
  }

  function connect(root) {
    const setup = demos.get(root.dataset.playground);
    if (!setup || root.dataset.connected) {
      return;
    }
    root.dataset.connected = 'true';

    const form = root.querySelector('.playground-controls');
    const stage = root.querySelector('[data-playground-stage]');
    const status = root.querySelector('[data-playground-status]');
    const demo = setup(stage, values(form));
    let frame = 0;

    function apply() {
      showValues(form);
      const line = demo.update(values(form));
      // The demo may adjust fields, so these read them after it runs.
      markChanged(form);
      showPictures(form);
      if (status && typeof line === 'string') {
        status.textContent = line;
        status.hidden = false;
      }
    }

    function update() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(apply);
    }

    form.hidden = false;
    root.classList.add('is-interactive');
    acceptDrops(stage, form.querySelector('input[type="file"][data-drop]'));
    form.addEventListener('input', update);
    form.addEventListener('change', update);
    // Clicking a control's name puts it back to how the page started.
    form.addEventListener('click', (event) => {
      const label = event.target.closest('.playground-label');
      if (!label) {
        return;
      }
      event.preventDefault();
      resetControl(label.closest('.playground-control'));
    });
    const randomize = form.querySelector('[data-playground-randomize]');
    if (randomize) {
      randomize.addEventListener('click', () => {
        randomizeControls(form);
        update();
      });
    }
    form.addEventListener('submit', (event) => event.preventDefault());
    // Reset restores the fields after this event, so read them a frame later.
    form.addEventListener('reset', () => setTimeout(update));
    apply();
  }

  function isChanged(field) {
    if (field.type === 'file') {
      return Boolean(field.value);
    }
    if (field.type === 'checkbox' || field.type === 'radio') {
      return field.checked !== field.defaultChecked;
    }
    if (field.tagName === 'SELECT') {
      return [...field.options].some((option) => option.selected !== option.defaultSelected);
    }
    return field.value !== field.defaultValue;
  }

  // A gallery's own-picture tile shows the picture it was given.
  const previews = new WeakMap();
  function showPictures(form) {
    form.querySelectorAll('.playground-swatch-upload').forEach((tile) => {
      const input = tile.querySelector('input[type="file"]');
      const face = tile.querySelector('span[aria-hidden]');
      const file = input.files && input.files[0] ? input.files[0] : null;
      const shown = previews.get(tile);
      if (shown && shown.file === file) {
        return;
      }
      if (shown) {
        URL.revokeObjectURL(shown.url);
      }
      const url = file ? URL.createObjectURL(file) : '';
      previews.set(tile, file ? { file, url } : null);
      face.style.backgroundImage = url ? `url("${url}")` : '';
      face.classList.toggle('has-picture', Boolean(url));
    });
  }

  function markChanged(form) {
    form.querySelectorAll('.playground-control').forEach((control) => {
      control.classList.toggle('is-changed', [...control.querySelectorAll('input, select')].some(isChanged));
    });
  }

  // Picks a fresh value for every control not marked data-fixed.
  function randomizeControls(form) {
    const pick = (items) => items[Math.floor(Math.random() * items.length)];
    form.querySelectorAll('.playground-control:not([data-fixed])').forEach((control) => {
      const radios = [...control.querySelectorAll('input[type="radio"]')];
      if (radios.length) {
        pick(radios).checked = true;
      }
      control.querySelectorAll('input[type="range"]').forEach((range) => {
        const min = Number(range.min || 0);
        const max = Number(range.max || 100);
        const step = Number(range.step) || 1;
        range.value = String(min + Math.round((Math.random() * (max - min)) / step) * step);
      });
      control.querySelectorAll('input[type="checkbox"]').forEach((box) => {
        box.checked = Math.random() < 0.5;
      });
      control.querySelectorAll('select').forEach((select) => {
        select.selectedIndex = Math.floor(Math.random() * select.options.length);
      });
    });
  }

  function resetControl(control) {
    if (!control) {
      return;
    }
    let changed = null;
    control.querySelectorAll('input, select').forEach((field) => {
      if (field.type === 'file') {
        if (field.value) {
          field.value = '';
          changed = field;
        }
      } else if (field.type === 'checkbox' || field.type === 'radio') {
        if (field.checked !== field.defaultChecked) {
          field.checked = field.defaultChecked;
          changed = field;
        }
      } else if (field.tagName === 'SELECT') {
        const option = [...field.options].find((item) => item.defaultSelected) || field.options[0];
        if (option && !option.selected) {
          option.selected = true;
          changed = field;
        }
      } else if (field.value !== field.defaultValue) {
        field.value = field.defaultValue;
        changed = field;
      }
    });
    if (changed) {
      changed.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  // Lets files dropped on the stage fill the file control marked to take them.
  function acceptDrops(stage, input) {
    if (!input || typeof DataTransfer === 'undefined') {
      return;
    }
    const accepts = (file) => {
      const accept = input.accept.split(',').map((type) => type.trim()).filter(Boolean);
      return !accept.length || accept.some((type) => type.endsWith('/*')
        ? file.type.startsWith(type.slice(0, -1))
        : file.type === type || file.name.toLowerCase().endsWith(type.toLowerCase()));
    };
    let depth = 0;
    const carriesFiles = (event) => event.dataTransfer && [...event.dataTransfer.types].includes('Files');
    stage.addEventListener('dragenter', (event) => {
      if (!carriesFiles(event)) {
        return;
      }
      event.preventDefault();
      depth += 1;
      stage.classList.add('is-dropping');
    });
    stage.addEventListener('dragover', (event) => {
      if (carriesFiles(event)) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
      }
    });
    stage.addEventListener('dragleave', () => {
      depth = Math.max(0, depth - 1);
      if (!depth) {
        stage.classList.remove('is-dropping');
      }
    });
    stage.addEventListener('drop', (event) => {
      if (!carriesFiles(event)) {
        return;
      }
      event.preventDefault();
      depth = 0;
      stage.classList.remove('is-dropping');
      const file = [...event.dataTransfer.files].find(accepts);
      if (!file) {
        return;
      }
      const files = new DataTransfer();
      files.items.add(file);
      input.files = files.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  function watch(root) {
    if (!('IntersectionObserver' in window)) {
      connect(root);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        connect(root);
      }
    }, { rootMargin: '50% 0px' });
    observer.observe(root);
  }

  window.Playground = {
    register(name, setup) {
      demos.set(name, setup);
      document.querySelectorAll(`[data-playground="${name}"]`).forEach(watch);
    },
  };
})();
