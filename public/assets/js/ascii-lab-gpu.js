// The ASCII cover playground's fit on the GPU. It's the same least-squares
// search as ascii-lab.js, but a WebGPU compute shader runs it for every cell
// at once, fast enough to redo the whole picture every frame. The cells come
// back to the page, which draws them exactly as the CPU version does.
//
// Each fit: a histogram of brightness for the contrast stretch, then one
// workgroup per cell to blur it, try every mark, and fit the winner's colors.
(() => {
  'use strict';

  const CELL_W = 9;
  const CELL_H = 20;
  const PIXELS = CELL_W * CELL_H;
  const BINS = 4096;
  const CLIP = 0.02;
  const LANES = 64;
  // A cell as the shader writes it: two colors with their brightness, then the mark.
  const CELL_FLOATS = 12;

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
  const FIT = /* wgsl */ `
struct Cell { fg: vec4f, bg: vec4f, mark: u32, p0: u32, p1: u32, p2: u32 };
struct Params { columns: u32, rows: u32, stretch: u32, marks: u32, k0: vec4f, k1: vec4f };

@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var<uniform> params: Params;
@group(0) @binding(2) var<storage, read> ink: array<f32>;
// Per mark: its blurred ink's total and sum of squares, its penalty, and
// whether this fit may use it.
@group(0) @binding(3) var<storage, read> info: array<vec4f>;
@group(0) @binding(4) var<storage, read> levels: vec2f;
@group(0) @binding(5) var<storage, read_write> cells: array<Cell>;

const N = ${PIXELS}u;
const LUMA = vec3f(0.2126, 0.7152, 0.0722);
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
  }
}`;

  async function create({ markCount, onLost }) {
    if (!navigator.gpu || markCount > LANES) {
      return null;
    }
    let device;
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
      pipelines = await Promise.all([compute(HISTOGRAM), compute(LEVELS), compute(FIT)]);
    } catch (error) {
      if (device) {
        device.destroy();
      }
      return null;
    }

    const [histogramPipeline, levelsPipeline, fitPipeline] = pipelines;
    const { STORAGE, UNIFORM, COPY_DST, COPY_SRC, MAP_READ } = GPUBufferUsage;
    const buffer = (size, usage) => device.createBuffer({ size, usage });
    const bins = buffer(BINS * 4, STORAGE | COPY_DST);
    const levels = buffer(8, STORAGE);
    const params = buffer(48, UNIFORM | COPY_DST);
    const info = buffer(markCount * 16, STORAGE | COPY_DST);
    const ink = buffer(markCount * PIXELS * 4, STORAGE | COPY_DST);
    let cells = null;
    let readback = null;
    let source = null;
    let lost = false;

    device.lost.then((reason) => {
      lost = true;
      if (reason.reason !== 'destroyed' && onLost) {
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

    return {
      // The marks' blurred ink, one row of 9×20 samples each, for a new squint.
      setInk(values) {
        device.queue.writeBuffer(ink, 0, values);
      },

      // Fits `options.source`, a canvas of columns×9 by rows×20, and resolves
      // with each cell's colors and brightness (12 floats a cell: fg rgb and
      // brightness, bg rgb and brightness, then the mark's index as a u32).
      // One fit at a time: wait for it before asking for the next.
      async fit({ source: canvas, columns, rows, stretch, kernel, marks }) {
        if (lost) {
          throw new Error('The GPU was lost');
        }
        const largest = device.limits.maxTextureDimension2D;
        if (canvas.width > largest || canvas.height > largest) {
          throw new Error('The picture is too large to fit on the GPU');
        }
        if (!source || source.width !== canvas.width || source.height !== canvas.height) {
          if (source) {
            source.destroy();
          }
          source = device.createTexture({
            size: [canvas.width, canvas.height],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
          });
        }
        device.queue.copyExternalImageToTexture({ source: canvas }, { texture: source }, [canvas.width, canvas.height]);

        const bytes = columns * rows * CELL_FLOATS * 4;
        if (!cells || cells.size < bytes) {
          if (cells) {
            cells.destroy();
            readback.destroy();
          }
          cells = buffer(bytes, STORAGE | COPY_SRC);
          readback = buffer(bytes, COPY_DST | MAP_READ);
        }

        const values = new ArrayBuffer(48);
        new Uint32Array(values, 0, 4).set([columns, rows, stretch ? 1 : 0, markCount]);
        new Float32Array(values, 16, 8).set(kernel);
        device.queue.writeBuffer(params, 0, values);
        device.queue.writeBuffer(info, 0, marks);

        const encoder = device.createCommandEncoder();
        if (stretch) {
          encoder.clearBuffer(bins);
          const histogram = encoder.beginComputePass();
          histogram.setPipeline(histogramPipeline);
          histogram.setBindGroup(0, group(histogramPipeline, [source, bins]));
          histogram.dispatchWorkgroups(Math.ceil(canvas.width / 16), Math.ceil(canvas.height / 16));
          histogram.end();
          const range = encoder.beginComputePass();
          range.setPipeline(levelsPipeline);
          range.setBindGroup(0, group(levelsPipeline, [bins, levels]));
          range.dispatchWorkgroups(1);
          range.end();
        }
        const pass = encoder.beginComputePass();
        pass.setPipeline(fitPipeline);
        pass.setBindGroup(0, group(fitPipeline, [source, params, ink, info, levels, cells]));
        pass.dispatchWorkgroups(columns, rows);
        pass.end();
        encoder.copyBufferToBuffer(cells, 0, readback, 0, bytes);
        device.queue.submit([encoder.finish()]);

        await readback.mapAsync(GPUMapMode.READ, 0, bytes);
        const result = readback.getMappedRange(0, bytes).slice(0);
        readback.unmap();
        return result;
      },
    };
  }

  window.AsciiLabGpu = { create, CELL_FLOATS };
})();
