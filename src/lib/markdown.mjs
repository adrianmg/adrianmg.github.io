import { satteri } from "@astrojs/markdown-satteri";

export const markdownOptions = {
  processor: satteri({ features: { gfm: true, smartPunctuation: true } }),
  syntaxHighlight: false,
};

let renderer;

export async function renderSummary(markdown) {
  renderer ??= markdownOptions.processor.createRenderer(markdownOptions);
  const { code, metadata } = await (await renderer).render(markdown);
  if (metadata.localImagePaths.length || metadata.remoteImagePaths.length) {
    throw new Error("Summary images must use public /assets/ URLs.");
  }
  return code;
}
