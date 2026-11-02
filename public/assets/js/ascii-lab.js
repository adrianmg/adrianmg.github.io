// The ASCII cover playground: a browser version of how my music player draws album
// covers in text. Each cell gets one mark and two colors, fitted to the
// picture by least squares, as described in the post.
(() => {
  'use strict';

  // A cell as the fit sees it: 9×20 samples, half a terminal cell at 2x.
  const CELL_W = 9;
  const CELL_H = 20;
  const PIXELS = CELL_W * CELL_H;
  const SMALL = 8;
  const CLIP = 0.02;
  const FONT = '"JetBrains Mono", ui-monospace, Menlo, monospace';
  const BLOCKS = ['▄', '▐'];

  // The player's own table: how much of each of a cell's 9×20 samples each mark
  // inks in JetBrains Mono, one hex digit a sample, from 0 (none) to f (all).
  const MARKS = [[" ", "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"], [".", "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006e6000000afa000000272000000000000000000000000000000000000000"], [",", "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001840000003f50000006f20000009d0000000ba0000000000000000000000"], [":", "0000000000000000000000000000000000000000000000000000000000000000008f80000008f8000000000000000000000000000000000000000000272000000afa000000373000000000000000000000000000000000000000"], [";", "0000000000000000000000000000000000000000000000000000000000000000007f7000000bfb0000002720000000000000000000000000000000001840000004f40000007f1000000ac0000000d90000000000000000000000"], ["'", "0000000000000000000000000000000000000002820000004f40000003f30000003f30000002f3000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"], ["`", "000000000000000000000000000003b200000009c0000000173000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"], ["\"", "00000000000000000000000000000000000000650560000da0ad0000c909c0000c909c0000b909b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"], ["^", "0000000000000000000000000000000000000002820000009e9000001e4e100007b0b70000d404d0005d000d50054000450000000000000000000000000000000000000000000000000000000000000000000000000000000000"], ["-", "00000000000000000000000000000000000000000000000000000000000000000000000000000000000333330000efffe00000000000000000000000000000000000000000000000000000000000000000000000000000000000"], ["_", "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000333333302fffffff2000000000000000000000000000"], ["~", "0000000000000000000000000000000000000000000000000000000000000000000000000288103900bcbd15e00e50ccda0072016610000000000000000000000000000000000000000000000000000000000000000000000000"], ["=", "0000000000000000000000000000000000000000000000000000000000000000000000000bfffffb00233333200000000000233333200bfffffb0000000000000000000000000000000000000000000000000000000000000000"], ["+", "0000000000000000000000000000000000000000000000000000000000000000002f20000002f20000335f53300fffffff00002f20000002f20000002f2000000000000000000000000000000000000000000000000000000000"], ["*", "0000000000000000000000000000000000000000000000000000000002f20000002f20003a52f25a32afdfdfa2001af9100004f5f40001d909d10019101910000000000000000000000000000000000000000000000000000000"], ["<", "000000000000000000000000000000000000000000000000000000000000030000005cb00005ce71004ce710000bb10000005dd600000006dd710000006db0000000040000000000000000000000000000000000000000000000"], [">", "0000000000000000000000000000000000000000000000000000000300000000bc500000018ec500000018ec40000001bb000005dd50006dd60000ad600000040000000000000000000000000000000000000000000000000000"], ["/", "000000000000000000000000230000000c90000003f30000009d0000000e70000005f2000000ab0000001f50000007e1000000c90000003f30000009d0000000e70000005f2000000ab000000000000000000000000000000000"], ["\\", "00000000000000000003200000009c00000003f30000000d900000007e00000002f50000000ba00000005f10000001e700000009c00000003f30000000d800000007e00000002f50000000ba0000000000000000000000000000"], ["|", "0000000000000000000001410000003f30000003f30000003f30000003f30000003f30000003f30000003f30000003f30000003f30000003f30000003f30000003f30000003f30000003f3000000000000000000000000000000"], ["(", "000000000000000000000000000000006d400000af8100006f4000000d90000002f40000003f20000003f20000003f20000003f20000002f40000000e800000008e20000001cd500000019f40000000110000000000000000000"], [")", "00000000000000000000000000004d600000018fa00000004f600000009d00000004f20000002f30000002f30000002f30000002f30000004f20000008e0000002e8000005dc100004f910000011000000000000000000000000"], ["[", "000000000000000000000333200000effb00000e60000000e60000000e60000000e60000000e60000000e60000000e60000000e60000000e60000000e60000000e60000000e83200000effb00000000000000000000000000000"], ["]", "00000000000000000000233300000bffe00000006e00000006e00000006e00000006e00000006e00000006e00000006e00000006e00000006e00000006e00000006e00000238e00000bffe000000000000000000000000000000"], ["!", "0000000000000000000000000000000000000002820000004f40000004f40000004f30000003f30000003f30000002f20000002f20000001810000002720000009f9000000272000000000000000000000000000000000000000"], ["i", "0000000000000000000000000000000730000004fb00000017300000000000006fff80000133d80000000c80000000c80000000c80000000c80000000c800008bbedbb4058888882000000000000000000000000000000000000"], ["l", "0000000000000000000000000000000000004888500006bbea0000000ba0000000ba0000000ba0000000ba0000000ba0000000ba0000000ba0000000ab00000005fcbb3000037882000000000000000000000000000000000000"], ["r", "00000000000000000000000000000000000000000000000000000000000000005f4dfb1005f945ea005f2007e005f1004a005f00000005f00000005f00000005f000000028000000000000000000000000000000000000000000"], ["t", "000000000000000000000000000000000000000320000000e60000000e600004ffffffc0144e84430000e60000000e60000000e60000000e60000000d700000009ebb80000057850000000000000000000000000000000000000"], ["c", "000000000000000000000000000000000000000000000000000000000000000005dfd80004f846f7009c0008a00aa0000000aa0000000aa00034007e200ca001cebde30000576100000000000000000000000000000000000000"], ["v", "0000000000000000000000000000000000000000000000000000000000000001f60006f10ab000ba005f101f5001f505f1000ba0ab00006e1e600001f8f100000beb000000484000000000000000000000000000000000000000"], ["x", "0000000000000000000000000000000000000000000000000000000000000000bc000cb002e707e20006e3e700000bec0000009f9000004f7f40001d909d1009e101e90174000471000000000000000000000000000000000000"], ["z", "00000000000000000000000000000000000000000000000000000000000000008fffff70023337f5000002e9000000cc0000009d1000006f3000003e6000000afbbbb70058888850000000000000000000000000000000000000"], ["u", "0000000000000000000000000000000000000000000000000000000000000000ab000ba00ab000ba00ab000ba00ab000ba00ab000ba009b000b9007e202e7001cebec10001575000000000000000000000000000000000000000"], ["n", "00000000000000000000000000000000000000000000000000000000000000009b7ee80009d848f5009d000c9009b000ba009b000ba009b000ba009b000ba009b000ba0055000550000000000000000000000000000000000000"], ["o", "000000000000000000000000000000000000000000000000000000000000000006dfd60005f747f500ab000ba00b90009b00b90009b00b90009b008d101d8001debed10001575100000000000000000000000000000000000000"], ["a", "000000000000000000000000000000000000000000000000000000000000000007dfd70006e647f50022000c90007abbe9009e988d900e7000b900e9002e9007fcbdc90004761550000000000000000000000000000000000000"], ["e", "000000000000000000000000000000000000000000000000000000000000000006dfd60004f747f400aa000aa00bc888cb00bdbbbb800b900000008d10096001debde20001576100000000000000000000000000000000000000"], ["s", "000000000000000000000000000000000000000000000000000000000000000009efe80007e536e6009b00022005fa852000048bdf40000000ba009b000ba004fdbdf40002787200000000000000000000000000000000000000"], ["L", "00000000000000000000000000000000000000820000001f40000001f40000001f40000001f40000001f40000001f40000001f40000001f40000001f40000001fcbbbb3008888882000000000000000000000000000000000000"], ["7", "0000000000000000000000000000000000000688888810cdbbbcf30c90009d0064001e70000005f2000000bb0000002f50000008d0000000e80000005f2000000bb0000000730000000000000000000000000000000000000000"], ["J", "000000000000000000000000000000000000000000730000000e60000000e60000000e60000000e60000000e60000000e60000000e604c1000e602f6005f3007fccf900003774000000000000000000000000000000000000000"], ["T", "0000000000000000000000000000000000001888888812bbbfbbb20003f30000003f30000003f30000003f30000003f30000003f30000003f30000003f30000003f3000000181000000000000000000000000000000000000000"], ["#", "000000000000000000000000000000000000000620350000e20780002e00a6007ad88e940addbbfb500a603d0000d306a005bfbbdda049e88da7006a00e20008702e000053026000000000000000000000000000000000000000"], ["%", "0000000000000000000000000000000000000573000458ecf201d2c60b60a70c60b65b008ecf4d2000573b60000006b3750002d4fce800b56b06b07a06b06b2d102fce8540003750000000000000000000000000000000000000"], ["@", "00000000000000000000000000000000000000157620002debcf600ca1005f23f20031d55e01dfdd65d05e22e65d06c00c65d06c00c65d05e00e55d01ddde14e00177201e500000007f743200005cff800000000000000000000"], ["▄", "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"], ["▐", "00008ffff00008ffff00008ffff00008ffff00008ffff00008ffff00008ffff00008ffff00008ffff00008ffff00008ffff00008ffff00008ffff00008ffff00008ffff00008ffff00008ffff00008ffff00008ffff00008ffff"]];

  // Each tinted theme's screen color, shadow and highlight, as in the apps.
  const TINTS = {
    amber: [[0, 0, 0], [0x6e, 0x46, 0x00], [0xff, 0xdc, 0x8a]],
    phosphor: [[0, 0, 0], [0x0e, 0x5a, 0x16], [0xc4, 0xff, 0xc4]],
    charcoal: [[0x0a, 0x0a, 0x0a], [0x3a, 0x3a, 0x3a], [0xff, 0xff, 0xff]],
    commodore: [[0x40, 0x31, 0x8d], [0x78, 0x69, 0xc4], [0xb0, 0xa8, 0xf0]],
  };

  const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const clamp = (value) => Math.min(1, Math.max(0, value));

  function measureMarks() {
    const marks = MARKS.map(([mark, digits]) => ({
      mark,
      block: BLOCKS.includes(mark),
      coverage: Float64Array.from(digits, (digit) => parseInt(digit, 16) / 15),
    }));
    // Where to draw glyphs so they land on the cell as the table measured.
    const context = document.createElement('canvas').getContext('2d');
    context.font = `30px ${FONT}`;
    const metrics = context.measureText('M');
    return {
      marks,
      ascent: metrics.fontBoundingBoxAscent || 24,
      descent: metrics.fontBoundingBoxDescent || 6,
      advance: metrics.width || CELL_W * 2,
    };
  }

  // A Gaussian blur over one cell, three samples either side, edges mirrored.
  function blurrer(sigma) {
    if (sigma <= 0) {
      return (cell) => Float64Array.from(cell);
    }
    const weights = Array.from({ length: 7 }, (_, i) => Math.exp(-((i - 3) ** 2) / (2 * sigma * sigma)));
    const total = weights.reduce((a, b) => a + b, 0);
    const kernel = weights.map((w) => w / total);
    const mirror = (i, length) => (i < 0 ? -i : i >= length ? 2 * (length - 1) - i : i);
    return (cell) => {
      const across = new Float64Array(PIXELS);
      const out = new Float64Array(PIXELS);
      for (let y = 0; y < CELL_H; y++) {
        for (let x = 0; x < CELL_W; x++) {
          let sum = 0;
          for (let k = 0; k < 7; k++) {
            sum += kernel[k] * cell[y * CELL_W + mirror(x + k - 3, CELL_W)];
          }
          across[y * CELL_W + x] = sum;
        }
      }
      for (let y = 0; y < CELL_H; y++) {
        for (let x = 0; x < CELL_W; x++) {
          let sum = 0;
          for (let k = 0; k < 7; k++) {
            sum += kernel[k] * across[mirror(y + k - 3, CELL_H) * CELL_W + x];
          }
          out[y * CELL_W + x] = sum;
        }
      }
      return out;
    };
  }

  function summed(pixels) {
    let total = 0;
    let squares = 0;
    for (const value of pixels) {
      total += value;
      squares += value * value;
    }
    return { pixels, total, squares };
  }

  // The background shade and mark shade whose blend comes closest to the
  // patch, by least squares, each kept within 0 to 1, and how far off it is.
  function shades(patch, mark) {
    const n = PIXELS;
    let both = 0;
    for (let i = 0; i < n; i++) {
      both += patch.pixels[i] * mark.pixels[i];
    }
    const mean = patch.total / n;
    const markMean = mark.total / n;
    const spread = mark.squares / n - markMean * markMean;
    const together = both / n - mean * markMean;
    let lift = spread > 1e-9 ? together / spread : 0;
    let bg = clamp(mean - lift * markMean);
    lift = mark.squares > 1e-9 ? (both - bg * mark.total) / mark.squares : 0;
    lift = clamp(bg + lift) - bg;
    bg = clamp((patch.total - lift * mark.total) / n);
    const fg = clamp(bg + lift);
    lift = fg - bg;
    const error = (patch.squares - 2 * bg * patch.total - 2 * lift * both
      + n * bg * bg + 2 * bg * lift * mark.total + lift * lift * mark.squares) / n;
    return { fg, bg, error };
  }

  // Stretches brightness to the full range, ignoring the darkest and
  // brightest 2% so a speck of black or white doesn't flatten the rest.
  function stretch(light) {
    const sorted = Float32Array.from(light).sort();
    const at = (q) => {
      const place = q * (sorted.length - 1);
      const below = Math.floor(place);
      const above = Math.min(sorted.length - 1, Math.ceil(place));
      return sorted[below] + (sorted[above] - sorted[below]) * (place - below);
    };
    const dark = at(CLIP);
    const range = Math.max(at(1 - CLIP) - dark, 1e-6);
    for (let i = 0; i < light.length; i++) {
      light[i] = clamp((light[i] - dark) / range);
    }
  }

  function tint(stops, t) {
    const light = stops.map(([r, g, b]) => luma(r, g, b));
    const wanted = light[0] + clamp(t) * (light[2] - light[0]);
    const segment = wanted > light[1] ? 1 : 0;
    const along = clamp((wanted - light[segment]) / Math.max(light[segment + 1] - light[segment], 1e-6));
    const from = stops[segment];
    const to = stops[segment + 1];
    return `rgb(${from.map((c, i) => Math.round(c + (to[i] - c) * along)).join(',')})`;
  }

  window.Playground.register('ascii-cover', (stage, initial) => {
    const font = measureMarks();
    const canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img');
    stage.prepend(canvas);
    const scratch = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    const figure = stage.closest('[data-playground]');
    const fileInput = figure.querySelector('input[type="file"]');
    const samples = new Map();
    let picture = null;
    let pictureKey = '';
    let pictureFile = null;
    let uploads = 0;
    let sampleUrl = '';
    let state = initial;
    let fitted = null;
    let fitKey = '';
    let markCache = { blur: null, marks: null };

    // Sample pictures load once each and stay cached for switching back.
    function loadSample(url) {
      sampleUrl = url;
      let image = samples.get(url);
      if (!image) {
        image = new Image();
        image.decoding = 'async';
        image.src = url;
        samples.set(url, image);
      }
      const use = () => {
        if (sampleUrl === url && !pictureFile) {
          picture = image;
          pictureKey = url;
          refresh();
        }
      };
      if (image.complete && image.naturalWidth) {
        use();
      } else {
        image.addEventListener('load', use, { once: true });
      }
    }

    // Clicking the picture flips between the text version and the original.
    canvas.style.cursor = 'pointer';
    canvas.title = 'Click to compare with the original';
    canvas.addEventListener('click', () => {
      const next = figure.querySelector(`input[name="view"]:not(:checked)`);
      if (next) {
        next.checked = true;
        next.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    // The marks are drawn in the font they were measured in.
    const fontFace = new FontFace('JetBrains Mono', 'url(/assets/fonts/JetBrainsMono-Regular.woff2)');
    document.fonts.add(fontFace);
    fontFace.load().then(() => {
      Object.assign(font, measureMarks());
      refresh();
    }).catch(() => {});

    function marksFor(blur) {
      if (markCache.blur !== blur) {
        const blurred = blurrer(blur);
        markCache = {
          blur,
          marks: font.marks.map((mark) => ({ ...mark, ...summed(blurred(mark.coverage)) })),
        };
      }
      return markCache.marks;
    }

    function fit() {
      const columns = state.columns;
      const rows = Math.max(1, Math.round(columns * (picture.height / picture.width) * (CELL_W / CELL_H)));
      const width = columns * CELL_W;
      const height = rows * CELL_H;
      scratch.canvas.width = width;
      scratch.canvas.height = height;
      scratch.imageSmoothingEnabled = true;
      scratch.imageSmoothingQuality = 'high';
      // Transparent pictures are fitted as they're shown: over black.
      scratch.fillStyle = '#000';
      scratch.fillRect(0, 0, width, height);
      scratch.drawImage(picture, 0, 0, width, height);
      const { data } = scratch.getImageData(0, 0, width, height);

      const light = new Float32Array(width * height);
      for (let i = 0; i < light.length; i++) {
        light[i] = luma(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]) / 255;
      }
      if (state.stretch) {
        stretch(light);
      }

      const small = rows < SMALL;
      const blur = blurrer(state.squint);
      const marks = marksFor(state.squint).filter((mark) => {
        if (small || state.marks === 'blocks') {
          return mark.block || mark.mark === ' ';
        }
        return state.marks === 'strokes' ? !mark.block : true;
      });
      const cost = state.blockCost / 1000;
      const cells = [];
      const cell = new Float64Array(PIXELS);
      const channels = [new Float64Array(PIXELS), new Float64Array(PIXELS), new Float64Array(PIXELS)];

      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          for (let y = 0; y < CELL_H; y++) {
            const from = (row * CELL_H + y) * width + column * CELL_W;
            for (let x = 0; x < CELL_W; x++) {
              const at = y * CELL_W + x;
              cell[at] = light[from + x];
              for (let c = 0; c < 3; c++) {
                channels[c][at] = data[(from + x) * 4 + c] / 255;
              }
            }
          }
          const patch = summed(blur(cell));
          let best = null;
          for (const mark of marks) {
            const fit = shades(patch, mark);
            const error = fit.error + (mark.block && !small ? cost : 0);
            if (!best || error < best.error) {
              best = { mark, fg: fit.fg, bg: fit.bg, error };
            }
          }
          const colors = channels.map((channel) => shades(summed(blur(channel)), best.mark));
          cells.push({
            mark: best.mark.mark,
            fg: best.fg,
            bg: best.bg,
            fgRgb: colors.map((c) => Math.round(c.fg * 255)),
            bgRgb: colors.map((c) => Math.round(c.bg * 255)),
          });
        }
      }
      return { columns, rows, cells };
    }

    function render() {
      if (!picture) {
        return 'Loading the picture…';
      }
      const key = [state.columns, state.squint, state.marks, state.blockCost, state.stretch, pictureKey].join('|');
      if (key !== fitKey) {
        fitted = fit();
        fitKey = key;
      }
      const { columns, rows, cells } = fitted;
      // A square frame, like an album cover, for every picture and setting, so
      // the page never shifts; the grid of cells is fitted and centered in it.
      const ratio = window.devicePixelRatio || 1;
      // Work in whole device pixels so nothing gets resampled or antialiased.
      const pixels = Math.round((stage.getBoundingClientRect().width || 960) * ratio);
      canvas.width = pixels;
      canvas.height = pixels;
      canvas.style.width = `${pixels / ratio}px`;
      canvas.style.height = `${pixels / ratio}px`;
      const cssWidth = pixels;
      const cssHeight = pixels;
      const fitScale = Math.min(1, cssHeight / ((cssWidth / columns) * (CELL_H / CELL_W) * rows));
      // Grids within a few percent of the frame stretch to fill it, so rounding
      // rows doesn't leave thin black bands at the edges.
      const snug = fitScale > 0.95;
      const cellWidth = snug ? cssWidth / columns : (cssWidth / columns) * fitScale;
      const cellHeight = snug ? Math.min(cssHeight / rows, cellWidth * (CELL_H / CELL_W) / 0.95) : cellWidth * (CELL_H / CELL_W);
      const left = (cssWidth - cellWidth * columns) / 2;
      const top = (cssHeight - cellHeight * rows) / 2;
      // Cell edges snapped to whole pixels, so neighbours meet without seams.
      const xs = Array.from({ length: columns + 1 }, (_, c) => Math.round(left + c * cellWidth));
      const ys = Array.from({ length: rows + 1 }, (_, r) => Math.round(top + r * cellHeight));
      const context = canvas.getContext('2d');
      context.setTransform(1, 0, 0, 1, 0, 0);
      const stops = TINTS[state.theme];
      context.fillStyle = stops ? `rgb(${stops[0].join(',')})` : '#000';
      context.fillRect(0, 0, cssWidth, cssHeight);

      if (state.view === 'original') {
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(picture, xs[0], ys[0], xs[columns] - xs[0], ys[rows] - ys[0]);
      } else {
        const color = (cell, which) => (stops
          ? tint(stops, cell[which])
          : `rgb(${cell[which === 'fg' ? 'fgRgb' : 'bgRgb'].join(',')})`);
        const size = Math.round(cellHeight * 0.75);
        context.font = `${size}px ${FONT}`;
        context.textBaseline = 'alphabetic';
        const scale = size / 30;
        const baseline = (CELL_H * 2 - font.ascent - font.descent) / 2 + font.ascent;
        const advance = font.advance * scale;
        cells.forEach((cell, i) => {
          const column = i % columns;
          const row = Math.floor(i / columns);
          const x = xs[column];
          const y = ys[row];
          const w = xs[column + 1] - x;
          const h = ys[row + 1] - y;
          context.fillStyle = color(cell, 'bg');
          context.fillRect(x, y, w, h);
          context.fillStyle = color(cell, 'fg');
          if (cell.mark === '▄' || cell.mark === '▐') {
            // Exactly half the cell, as the fit measured it: on an odd number
            // of pixels the middle row or column is drawn at half strength.
            const tall = cell.mark === '▄';
            const span = tall ? h : w;
            const half = Math.floor(span / 2);
            if (tall) {
              context.fillRect(x, y + span - half, w, half);
            } else {
              context.fillRect(x + span - half, y, half, h);
            }
            if (span % 2) {
              context.globalAlpha = 0.5;
              context.fillRect(tall ? x : x + half, tall ? y + half : y, tall ? w : 1, tall ? 1 : h);
              context.globalAlpha = 1;
            }
          } else if (cell.mark !== ' ') {
            context.fillText(cell.mark, Math.round(x + (w - advance) / 2), Math.round(y + baseline * scale));
          }
        });
      }

      if (state.grid) {
        // One-pixel lines on the snapped cell edges.
        context.fillStyle = 'rgba(255, 255, 255, 0.18)';
        for (let column = 1; column < columns; column++) {
          context.fillRect(xs[column], ys[0], 1, ys[rows] - ys[0]);
        }
        for (let row = 1; row < rows; row++) {
          context.fillRect(xs[0], ys[row], xs[columns] - xs[0], 1);
        }
      }

      if (state.crt > 0) {
        // The slider is the scanlines' opacity; the darker corners follow it.
        const opacity = state.crt / 100;
        // Thin dark lines every few pixels and darker corners, like an old monitor.
        context.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        // Lines every three CSS pixels, each one device pixel thick or more.
        const line = Math.max(1, Math.round(ratio));
        for (let y = 0; y < cssHeight; y += line * 3) {
          context.fillRect(0, y, cssWidth, line);
        }
        const glow = context.createRadialGradient(
          cssWidth / 2, cssHeight / 2, cssWidth * 0.35,
          cssWidth / 2, cssHeight / 2, cssWidth * 0.75,
        );
        glow.addColorStop(0, 'rgba(0, 0, 0, 0)');
        glow.addColorStop(1, `rgba(0, 0, 0, ${0.6 * opacity})`);
        context.fillStyle = glow;
        context.fillRect(0, 0, cssWidth, cssHeight);
      }

      figure.classList.add('is-ready');
      const blocks = cells.filter((cell) => BLOCKS.includes(cell.mark)).length;
      canvas.setAttribute('aria-label', `The picture drawn as ${columns} by ${rows} text cells, ${blocks} of them half blocks.`);
      return `${columns} × ${rows} cells · ${Math.round((blocks / cells.length) * 100)}% half blocks`;
    }

    function loadFile(file) {
      if (!file || file === pictureFile) {
        return;
      }
      pictureFile = file;
      createImageBitmap(file).then((bitmap) => {
        if (pictureFile === file) {
          picture = bitmap;
          uploads += 1;
          pictureKey = `file:${uploads}`;
          refresh();
        }
      }).catch(() => {
        pictureFile = null;
      });
    }

    // Pictures arrive after the first update, so their status is shown here.
    const status = figure.querySelector('[data-playground-status]');
    function refresh() {
      const line = render();
      if (status) {
        status.textContent = line;
      }
    }

    window.addEventListener('resize', () => requestAnimationFrame(render));

    const defaultSample = initial.sample;
    const sampleInputs = () => figure.querySelectorAll('input[name="sample"]');
    let pickedBefore = initial.sample;

    return {
      update(next) {
        const pickedSample = Boolean(next.sample) && next.sample !== pickedBefore;
        pickedBefore = next.sample;
        state = { ...next, sample: next.sample || defaultSample };
        if (pickedSample && fileInput && fileInput.value) {
          // Picking a sample replaces a picture of your own.
          fileInput.value = '';
          state = { ...state, picture: null };
        } else if (state.picture) {
          // A picture of your own replaces the sample.
          sampleInputs().forEach((input) => { input.checked = false; });
          pickedBefore = undefined;
        }
        if (!state.picture && !figure.querySelector('input[name="sample"]:checked')) {
          const fallback = [...sampleInputs()].find((input) => input.value === state.sample);
          if (fallback) {
            fallback.checked = true;
            pickedBefore = fallback.value;
          }
        }
        if (state.picture) {
          loadFile(state.picture);
        } else {
          pictureFile = null;
          if (pickedSample || state.sample !== sampleUrl || !picture) {
            loadSample(state.sample);
          }
        }
        return render();
      },
    };
  });
})();
