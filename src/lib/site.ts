import type { CollectionEntry } from "astro:content";

import ogManifest from "../../public/assets/og/posts/.manifest.json";

export const SITE = {
  title: "Adrián Mato – Designer at XBOX, leading developer & creator tools",
  description: "Designing & building tools for developers at XBOX. Startup investor.",
  url: "https://adrianmato.com",
  author: "Adrián Mato",
  email: "hello@adrianmato.com",
  twitter: "adrianmg",
  bluesky: "adrianmato.com",
  linkedin: "adrianmg",
  github: "adrianmg",
  locale: "en_US",
  timeZone: "America/Los_Angeles",
} as const;

export const BLOG_DESCRIPTION =
  "Unsorted thoughts and strong opinions about Design, programming, side projects, and personal growth (I guess).";

export const DEFAULT_SOCIAL_IMAGE = {
  path: "/assets/og-image.png?v=2",
  width: 1200,
  height: 600,
} as const;

export type PostEntry = CollectionEntry<"posts">;

export interface SocialImage {
  path: string;
  width: number;
  height: number;
}

export function postSlug(post: PostEntry): string {
  const filename = post.id.split("/").at(-1) ?? post.id;
  return filename.replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

export function postPath(post: PostEntry): string {
  return `/${[...post.data.categories, postSlug(post)].join("/")}/`;
}

export function postRedirects(post: PostEntry): string[] {
  const redirects = post.data.redirect_from;
  if (!redirects) return [];
  return (Array.isArray(redirects) ? redirects : [redirects]).map((path) =>
    path.startsWith("/") ? path : `/${path}`,
  );
}

export function parseLegacyDate(value: string): Date {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/,
  );

  if (!match) {
    throw new Error(`Unsupported post date: ${value}`);
  }

  const [, year, month, day, hour, minute, second] = match;
  return new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    ),
  );
}

function dateParts(date: Date): Map<string, string> {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SITE.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "longOffset",
  }).formatToParts(date);

  return new Map(parts.map(({ type, value }) => [type, value]));
}

export function formatPostDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: SITE.timeZone,
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parseLegacyDate(value));
}

export function formatBlogDate(value: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SITE.timeZone,
    year: "numeric",
    month: "short",
    day: "numeric",
  }).formatToParts(parseLegacyDate(value));
  const byType = new Map(parts.map(({ type, value }) => [type, value]));
  return `${byType.get("month")} ${byType.get("day")} ${byType.get("year")}`;
}

export function formatXmlDate(value: string): string {
  const parts = dateParts(parseLegacyDate(value));
  const offsetName = parts.get("timeZoneName") ?? "GMT+00:00";
  const offset = offsetName === "GMT" ? "+00:00" : offsetName.replace("GMT", "");

  return `${parts.get("year")}-${parts.get("month")}-${parts.get("day")}T${parts.get("hour")}:${parts.get("minute")}:${parts.get("second")}${offset}`;
}

export function sortPostsNewestFirst(posts: PostEntry[]): PostEntry[] {
  return [...posts].sort(
    (left, right) =>
      parseLegacyDate(right.data.date).getTime() -
      parseLegacyDate(left.data.date).getTime(),
  );
}

export function postSocialImage(post: PostEntry): SocialImage {
  if (post.data.image) return post.data.image;

  const slug = postSlug(post);
  const fingerprint = ogManifest.images[slug as keyof typeof ogManifest.images];

  if (!fingerprint) {
    throw new Error(`Missing Open Graph image fingerprint for ${post.id}`);
  }

  return {
    path: `/assets/og/posts/${slug}.png?v=${fingerprint.slice(0, 8)}`,
    width: 2400,
    height: 1260,
  };
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).href;
}

export function postDescription(body: string): string {
  const firstBlock = body.trim().split(/\n\s*\n/, 1)[0] ?? "";
  const text = smartTypography(firstBlock)
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[`*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return text || SITE.description;
}

export function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function smartTypography(value: string): string {
  return value.replace(/([\p{L}\p{N}])'([\p{L}\p{N}])/gu, "$1’$2");
}
