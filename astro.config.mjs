import { defineConfig } from "astro/config";
import { markdownOptions } from "./src/lib/markdown.mjs";

export default defineConfig({
  site: "https://adrianmato.com",
  output: "static",
  trailingSlash: "always",
  markdown: markdownOptions,
});
