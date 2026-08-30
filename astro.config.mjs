import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://adrianmato.com",
  output: "static",
  trailingSlash: "always",
  markdown: {
    syntaxHighlight: false,
  },
});
