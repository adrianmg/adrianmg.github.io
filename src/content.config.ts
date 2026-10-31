import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const imageSchema = z.object({
  path: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const posts = defineCollection({
  loader: glob({ pattern: "*.{md,markdown}", base: "./_posts" }),
  schema: z.object({
    title: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/),
    categories: z.array(z.string().min(1)).min(1),
    summary: z.string().optional(),
    redirect_from: z.union([z.string(), z.array(z.string())]).optional(),
    image: imageSchema.optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string().min(1),
  }),
});

export const collections = { pages, posts };
