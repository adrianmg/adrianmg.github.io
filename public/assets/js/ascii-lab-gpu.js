// The ASCII cover playground's fit on the GPU. It's the same least-squares
// search as ascii-lab.js, but WebGPU runs it for every cell on every frame, so
// moving pictures and every slider update immediately.
//
// Each frame: a histogram of brightness for the contrast stretch, one
// workgroup per cell to blur it and try every mark, then one pass that draws
// the chosen marks, colors, cell lines and scanlines straight to the canvas.
(() => {
  'use strict';

  const CELL_W = 9;
  const CELL_H = 20;
  const PIXELS = CELL_W * CELL_H;
  const BINS = 4096;
  const CLIP = 0.02;
  const LANES = 64;
  const CELL_BYTES = 48;
  // Glyphs sit in the atlas this many to a row.
  const ATLAS_ROW = 8;

  const CELL = /* wgsl */ `
struct Cell { fg: vec4f, bg: vec4f, mark: u32, p0: u32, p1: u32, p2: u32 };
const LUMA = vec3f(0.2126, 0.7152, 0.0722);`;

  // Counts every sample's brightness into fine bins.
  const HISTOGRAM = /* wgsl */ `
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var<storage, read_write> bins: array<atomic<u32>, ${BINS}>;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let size = textureDimensions(source);
  if (id.x >= size.x || id.y >= size.y) {
    return;
  }
  let light = dot(textureLoad(source, id.xy, 0).rgb, vec3f(0.2126, 0.7152, 0.0722));
  atomicAdd(&bins[min(u32(light * ${BINS}.0), ${BINS - 1}u)], 1u);
}`;

  // The darkest and brightest 2%, read off the histogram, become the range
  // the brightness is stretched across.
  const LEVELS = /* wgsl */ `
@group(0) @binding(0) var<storage, read> bins: array<u32, ${BINS}>;
@group(0) @binding(1) var<storage, read_write> levels: vec2f;

fn quantile(q: f32, total: u32) -> f32 {
  let goal = u32(q * f32(total - 1u));
  var seen = 0u;
  for (var b = 0u; b < ${BINS}u; b++) {
    let count = bins[b];
    if (seen + count > goal) {
      return (f32(b) + (f32(goal - seen) + 0.5) / f32(count)) / ${BINS}.0;
    }
    seen += count;
  }
  return 1.0;
}

@compute @workgroup_size(1)
fn main() {
  var total = 0u;
  for (var b = 0u; b < ${BINS}u; b++) {
    total += bins[b];
  }
  if (total == 0u) {
    levels = vec2f(0.0, 1.0);
    return;
  }
  let dark = quantile(${CLIP}, total);
  levels = vec2f(dark, max(quantile(${1 - CLIP}, total) - dark, 1e-6));
}`;

  // One workgroup per cell: load and blur its 9×20 samples, let each lane try
  // one mark, keep the closest, then fit that mark's colors per channel.
  const FIT = /* wgsl */ `${CELL}
struct Params { columns: u32, rows: u32, stretch: u32, marks: u32, k0: vec4f, k1: vec4f };

@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var<uniform> params: Params;
@group(0) @binding(2) var<storage, read> ink: array<f32>;
// Per mark: its blurred ink's total and sum of squares, penalty, and 0 if
// it's not allowed, 1 if it is, 2 if it's an allowed half block.
@group(0) @binding(3) var<storage, read> info: array<vec4f>;
@group(0) @binding(4) var<storage, read> levels: vec2f;
@group(0) @binding(5) var<storage, read_write> cells: array<Cell>;
@group(0) @binding(6) var<storage, read_write> blocks: atomic<u32>;

const N = ${PIXELS}u;
var<workgroup> raw: array<vec4f, ${PIXELS}>;
var<workgroup> across: array<vec4f, ${PIXELS}>;
var<workgroup> blurred: array<vec4f, ${PIXELS}>;
var<workgroup> errors: array<f32, ${LANES}>;
var<workgroup> picks: array<u32, ${LANES}>;

fn weight(k: i32) -> f32 {
  if (k < 4) {
    return params.k0[k];
  }
  return params.k1[k - 4];
}

fn mirror(i: i32, length: i32) -> i32 {
  if (i < 0) {
    return -i;
  }
  if (i >= length) {
    return 2 * (length - 1) - i;
  }
  return i;
}

// The background and mark shades closest to the patch, each kept within 0
// to 1, and the mean squared error: shades() in ascii-lab.js.
fn shades(total: f32, squares: f32, both: f32, markTotal: f32, markSquares: f32) -> vec3f {
  let n = f32(N);
  let mean = total / n;
  let markMean = markTotal / n;
  let spread = markSquares / n - markMean * markMean;
  let together = both / n - mean * markMean;
  var lift = select(0.0, together / spread, spread > 1e-9);
  var bg = clamp(mean - lift * markMean, 0.0, 1.0);
  lift = select(0.0, (both - bg * markTotal) / markSquares, markSquares > 1e-9);
  lift = clamp(bg + lift, 0.0, 1.0) - bg;
  bg = clamp((total - lift * markTotal) / n, 0.0, 1.0);
  let fg = clamp(bg + lift, 0.0, 1.0);
  lift = fg - bg;
  let error = (squares - 2.0 * bg * total - 2.0 * lift * both
    + n * bg * bg + 2.0 * bg * lift * markTotal + lift * lift * markSquares) / n;
  return vec3f(fg, bg, error);
}

@compute @workgroup_size(${LANES})
fn main(@builtin(workgroup_id) group: vec3u, @builtin(local_invocation_index) lane: u32) {
  let origin = vec2i(i32(group.x) * ${CELL_W}, i32(group.y) * ${CELL_H});
  for (var i = lane; i < N; i += ${LANES}u) {
    let color = textureLoad(source, origin + vec2i(i32(i % ${CELL_W}u), i32(i / ${CELL_W}u)), 0).rgb;
    var light = dot(color, LUMA);
    if (params.stretch != 0u) {
      light = clamp((light - levels.x) / levels.y, 0.0, 1.0);
    }
    raw[i] = vec4f(color, light);
  }
  workgroupBarrier();
  for (var i = lane; i < N; i += ${LANES}u) {
    let x = i32(i % ${CELL_W}u);
    let row = i32(i / ${CELL_W}u) * ${CELL_W};
    var sum = vec4f(0.0);
    for (var k = 0; k < 7; k++) {
      sum += weight(k) * raw[row + mirror(x + k - 3, ${CELL_W})];
    }
    across[i] = sum;
  }
  workgroupBarrier();
  for (var i = lane; i < N; i += ${LANES}u) {
    let x = i32(i % ${CELL_W}u);
    let y = i32(i / ${CELL_W}u);
    var sum = vec4f(0.0);
    for (var k = 0; k < 7; k++) {
      sum += weight(k) * across[mirror(y + k - 3, ${CELL_H}) * ${CELL_W} + x];
    }
    blurred[i] = sum;
  }
  workgroupBarrier();

  var error = 3.4e38;
  if (lane < params.marks) {
    let mark = info[lane];
    if (mark.w > 0.5) {
      var total = 0.0;
      var squares = 0.0;
      var both = 0.0;
      for (var i = 0u; i < N; i++) {
        let value = blurred[i].w;
        total += value;
        squares += value * value;
        both += value * ink[lane * N + i];
      }
      error = shades(total, squares, both, mark.x, mark.y).z + mark.z;
    }
  }
  errors[lane] = error;
  picks[lane] = lane;
  workgroupBarrier();
  // The lowest error wins; on a tie, the earlier mark, as on the CPU.
  for (var stride = ${LANES / 2}u; stride > 0u; stride >>= 1u) {
    if (lane < stride) {
      let other = lane + stride;
      if (errors[other] < errors[lane] || (errors[other] == errors[lane] && picks[other] < picks[lane])) {
        errors[lane] = errors[other];
        picks[lane] = picks[other];
      }
    }
    workgroupBarrier();
  }

  if (lane == 0u) {
    let best = picks[0];
    let mark = info[best];
    var sums = vec4f(0.0);
    var squares = vec4f(0.0);
    var both = vec4f(0.0);
    for (var i = 0u; i < N; i++) {
      let value = blurred[i];
      sums += value;
      squares += value * value;
      both += value * ink[best * N + i];
    }
    var fg = vec4f(0.0);
    var bg = vec4f(0.0);
    for (var c = 0; c < 4; c++) {
      let fit = shades(sums[c], squares[c], both[c], mark.x, mark.y);
      fg[c] = fit.x;
      bg[c] = fit.y;
    }
    cells[group.y * params.columns + group.x] = Cell(fg, bg, best, 0u, 0u, 0u);
    if (mark.w > 1.5) {
      atomicAdd(&blocks, 1u);
    }
  }
}`;

  // Draws every device pixel: which cell it's in, with the cell edges snapped
  // to whole pixels exactly as the canvas version does, then its mark.
  const DRAW = /* wgsl */ `${CELL}
struct View {
  frame: vec4f,  // canvas width, height, grid left, top
  cell: vec4f,   // cell width, height, columns, rows
  screen: vec4f, // screen color, then 1 to show the original picture
  low: vec4f,    // a theme's screen, shadow and highlight, each with its brightness
  mid: vec4f,
  high: vec4f,
  look: vec4f,   // themed, show cells, scanline opacity, scanline thickness
  glyph: vec4f,  // advance, atlas box width and height, left padding
  marks: vec4f,  // the lower half block, the right half block, the blank, the dark-on-light atlas's top
};

@group(0) @binding(0) var<uniform> view: View;
@group(0) @binding(1) var<storage, read> cells: array<Cell>;
@group(0) @binding(2) var atlas: texture_2d<f32>;
@group(0) @binding(3) var original: texture_2d<f32>;

@vertex
fn vertex(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  let corner = vec2f(f32((i << 1u) & 2u), f32(i & 2u));
  return vec4f(corner * 2.0 - 1.0, 0.0, 1.0);
}

// Math.round, which rounds halves up.
fn snap(value: f32) -> f32 {
  return floor(value + 0.5);
}

// The cell a pixel falls in along one axis, given snapped edges.
fn find(at: f32, start: f32, size: f32, count: f32) -> f32 {
  var index = clamp(floor((at - start) / size), 0.0, count - 1.0);
  if (at < snap(start + index * size)) {
    index -= 1.0;
  } else if (at >= snap(start + (index + 1.0) * size)) {
    index += 1.0;
  }
  return clamp(index, 0.0, count - 1.0);
}

fn tint(t: f32) -> vec3f {
  let wanted = view.low.w + clamp(t, 0.0, 1.0) * (view.high.w - view.low.w);
  if (wanted > view.mid.w) {
    return mix(view.mid.rgb, view.high.rgb, clamp((wanted - view.mid.w) / max(view.high.w - view.mid.w, 1e-6), 0.0, 1.0));
  }
  return mix(view.low.rgb, view.mid.rgb, clamp((wanted - view.low.w) / max(view.mid.w - view.low.w, 1e-6), 0.0, 1.0));
}

fn coverage(mark: u32, local: vec2f, size: vec2f, light: f32) -> f32 {
  if (mark == u32(view.marks.z)) {
    return 0.0;
  }
  let lower = mark == u32(view.marks.x);
  if (lower || mark == u32(view.marks.y)) {
    // Exactly half the cell; on an odd span the middle line is half strength.
    let span = select(size.x, size.y, lower);
    let at = select(local.x, local.y, lower);
    let half = floor(span / 2.0);
    if (at >= span - half) {
      return 1.0;
    }
    return select(0.0, 0.5, span - 2.0 * half > 0.5 && at == half);
  }
  let x = local.x - snap((size.x - view.glyph.x) / 2.0) + view.glyph.w;
  if (x < 0.0 || x >= view.glyph.y || local.y >= view.glyph.z) {
    return 0.0;
  }
  let box = vec2u(mark % ${ATLAS_ROW}u, mark / ${ATLAS_ROW}u) * vec2u(u32(view.glyph.y), u32(view.glyph.z));
  let at = box + vec2u(u32(x), u32(local.y));
  // Light marks take their shape from light-on-dark text, dark marks from
  // dark-on-light, and the shades between from a blend of the two.
  let onDark = textureLoad(atlas, at, 0).r;
  let onLight = 1.0 - textureLoad(atlas, at + vec2u(0u, u32(view.marks.w)), 0).r;
  return mix(onLight, onDark, light);
}

@fragment
fn fragment(@builtin(position) position: vec4f) -> @location(0) vec4f {
  let p = floor(position.xy);
  let start = view.frame.zw;
  let size = view.cell.xy;
  let count = view.cell.zw;
  let first = vec2f(snap(start.x), snap(start.y));
  let last = vec2f(snap(start.x + count.x * size.x), snap(start.y + count.y * size.y));
  var color = view.screen.rgb;

  if (all(p >= first) && all(p < last)) {
    let index = vec2f(find(p.x, start.x, size.x, count.x), find(p.y, start.y, size.y, count.y));
    let corner = vec2f(snap(start.x + index.x * size.x), snap(start.y + index.y * size.y));
    let span = vec2f(snap(start.x + (index.x + 1.0) * size.x), snap(start.y + (index.y + 1.0) * size.y)) - corner;
    if (view.screen.w > 0.5) {
      color = textureLoad(original, vec2u(p - first), 0).rgb;
    } else {
      let cell = cells[u32(index.y) * u32(count.x) + u32(index.x)];
      var fg = cell.fg.rgb;
      var bg = cell.bg.rgb;
      if (view.look.x > 0.5) {
        fg = tint(cell.fg.w);
        bg = tint(cell.bg.w);
      }
      color = mix(bg, fg, coverage(cell.mark, p - corner, span, dot(fg, LUMA)));
    }
    if (view.look.y > 0.5 && ((p.x == corner.x && index.x > 0.0) || (p.y == corner.y && index.y > 0.0))) {
      color = mix(color, vec3f(1.0), 0.18);
    }
  }

  let crt = view.look.z;
  if (crt > 0.0) {
    // Thin dark lines and darker corners, like an old monitor.
    let line = view.look.w;
    if (p.y - floor(p.y / (line * 3.0)) * line * 3.0 < line) {
      color *= 1.0 - crt;
    }
    let width = view.frame.x;
    let fade = clamp((distance(p + 0.5, view.frame.xy / 2.0) - width * 0.35) / (width * 0.4), 0.0, 1.0);
    color *= 1.0 - 0.6 * crt * fade;
  }
  return vec4f(color, 1.0);
}`;

  async function create(canvas, { markCount, onLost }) {
    if (!navigator.gpu || markCount > LANES) {
      return null;
    }
    let device;
    let context;
    let pipelines;
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        return null;
      }
      device = await adapter.requestDevice();
      const compute = (code) => device.createComputePipelineAsync({
        layout: 'auto',
        compute: { module: device.createShaderModule({ code }), entryPoint: 'main' },
      });
      const format = navigator.gpu.getPreferredCanvasFormat();
      const drawModule = device.createShaderModule({ code: DRAW });
      pipelines = await Promise.all([
        compute(HISTOGRAM),
        compute(LEVELS),
        compute(FIT),
        device.createRenderPipelineAsync({
          layout: 'auto',
          vertex: { module: drawModule, entryPoint: 'vertex' },
          fragment: { module: drawModule, entryPoint: 'fragment', targets: [{ format }] },
          primitive: { topology: 'triangle-list' },
        }),
      ]);
      context = canvas.getContext('webgpu');
      if (!context) {
        device.destroy();
        return null;
      }
      context.configure({ device, format, alphaMode: 'opaque' });
    } catch (error) {
      if (device) {
        device.destroy();
      }
      return null;
    }

    const [histogramPipeline, levelsPipeline, fitPipeline, drawPipeline] = pipelines;
    const { STORAGE, UNIFORM, COPY_DST, COPY_SRC, MAP_READ } = GPUBufferUsage;
    const buffer = (size, usage) => device.createBuffer({ size, usage });
    const bins = buffer(BINS * 4, STORAGE | COPY_DST);
    const levels = buffer(8, STORAGE | COPY_DST);
    const blocks = buffer(4, STORAGE | COPY_DST | COPY_SRC);
    const blocksRead = buffer(4, COPY_DST | MAP_READ);
    const params = buffer(48, UNIFORM | COPY_DST);
    const info = buffer(markCount * 16, STORAGE | COPY_DST);
    const ink = buffer(markCount * PIXELS * 4, STORAGE | COPY_DST);
    const viewUniform = buffer(9 * 16, UNIFORM | COPY_DST);
    let cells = null;

    const textures = {};
    const placeholder = device.createTexture({
      size: [1, 1],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING,
    });
    // A texture for canvases copied in each frame, replaced when they resize.
    function upload(name, source) {
      let texture = textures[name];
      if (!texture || texture.width !== source.width || texture.height !== source.height) {
        if (texture) {
          texture.destroy();
        }
        texture = device.createTexture({
          size: [source.width, source.height],
          format: 'rgba8unorm',
          usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        });
        textures[name] = texture;
      }
      device.queue.copyExternalImageToTexture({ source }, { texture }, [source.width, source.height]);
      return texture;
    }

    let lost = false;
    let reading = false;
    const renderer = { blocks: 0, onStats: null };
    device.lost.then((info) => {
      lost = true;
      if (info.reason !== 'destroyed' && onLost) {
        onLost();
      }
    });

    const group = (pipeline, entries) => device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: entries.map((resource, binding) => ({
        binding,
        resource: resource instanceof GPUTexture ? resource.createView() : { buffer: resource },
      })),
    });

    // The marks' blurred ink, one row of 9×20 samples each, for a new squint.
    renderer.setInk = (values) => {
      device.queue.writeBuffer(ink, 0, values);
    };

    renderer.setAtlas = (atlasCanvas) => {
      upload('atlas', atlasCanvas);
    };

    // Fits and draws one frame from `source`, a canvas of columns×9 by rows×20.
    renderer.frame = (options) => {
      if (lost || !textures.atlas) {
        return;
      }
      const { source, columns, rows } = options;
      const sourceTexture = upload('source', source);
      const originalTexture = options.original ? upload('original', options.original) : placeholder;

      const needed = columns * rows * CELL_BYTES;
      if (!cells || cells.size < needed) {
        if (cells) {
          cells.destroy();
        }
        cells = buffer(needed, STORAGE);
      }

      const fitParams = new ArrayBuffer(48);
      new Uint32Array(fitParams, 0, 4).set([columns, rows, options.stretch ? 1 : 0, markCount]);
      new Float32Array(fitParams, 16, 8).set(options.kernel);
      device.queue.writeBuffer(params, 0, fitParams);
      device.queue.writeBuffer(info, 0, options.info);

      const { layout, stops, screen } = options;
      const light = (rgb) => (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
      const stop = (rgb) => (rgb ? [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, light(rgb)] : [0, 0, 0, 0]);
      device.queue.writeBuffer(viewUniform, 0, new Float32Array([
        layout.pixels, layout.pixels, layout.left, layout.top,
        layout.cellWidth, layout.cellHeight, columns, rows,
        screen[0] / 255, screen[1] / 255, screen[2] / 255, options.original ? 1 : 0,
        ...stop(stops && stops[0]),
        ...stop(stops && stops[1]),
        ...stop(stops && stops[2]),
        stops ? 1 : 0, options.grid ? 1 : 0, options.crt, options.line,
        options.glyph.advance, options.glyph.width, options.glyph.height, options.glyph.pad,
        options.glyph.lower, options.glyph.right, options.glyph.blank, options.glyph.half,
      ]));

      const encoder = device.createCommandEncoder();
      if (options.stretch) {
        encoder.clearBuffer(bins);
        const histogram = encoder.beginComputePass();
        histogram.setPipeline(histogramPipeline);
        histogram.setBindGroup(0, group(histogramPipeline, [sourceTexture, bins]));
        histogram.dispatchWorkgroups(Math.ceil(source.width / 16), Math.ceil(source.height / 16));
        histogram.end();
        const range = encoder.beginComputePass();
        range.setPipeline(levelsPipeline);
        range.setBindGroup(0, group(levelsPipeline, [bins, levels]));
        range.dispatchWorkgroups(1);
        range.end();
      }
      encoder.clearBuffer(blocks);
      const fit = encoder.beginComputePass();
      fit.setPipeline(fitPipeline);
      fit.setBindGroup(0, group(fitPipeline, [sourceTexture, params, ink, info, levels, cells, blocks]));
      fit.dispatchWorkgroups(columns, rows);
      fit.end();

      const draw = encoder.beginRenderPass({
        colorAttachments: [{
          view: context.getCurrentTexture().createView(),
          loadOp: 'clear',
          storeOp: 'store',
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
        }],
      });
      draw.setPipeline(drawPipeline);
      draw.setBindGroup(0, group(drawPipeline, [viewUniform, cells, textures.atlas, originalTexture]));
      draw.draw(3);
      draw.end();

      // The half-block count comes back a frame or so later, one read at a time.
      const read = !reading;
      if (read) {
        encoder.copyBufferToBuffer(blocks, 0, blocksRead, 0, 4);
      }
      device.queue.submit([encoder.finish()]);
      if (read) {
        reading = true;
        blocksRead.mapAsync(GPUMapMode.READ).then(() => {
          renderer.blocks = new Uint32Array(blocksRead.getMappedRange())[0];
          blocksRead.unmap();
          reading = false;
          if (renderer.onStats) {
            renderer.onStats(renderer.blocks);
          }
        }).catch(() => {
          reading = false;
        });
      }
    };

    return renderer;
  }

  window.AsciiLabGpu = { create, ATLAS_ROW };
})();
