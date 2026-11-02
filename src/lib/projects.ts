export const SIDE_PROJECTS = [
  {
    id: "noted",
    name: "noted.computer",
    year: "2026",
    datetime: "2026",
    description:
      "A tiny, fast markdown notes app for your terminal inspired by the 80s.",
    url: "https://noted.computer",
    image: "/assets/work/noted/noted",
    // 32×18 blurred placeholder; regenerate when the image changes.
    imagePreview:
      "data:image/webp;base64,UklGRrQAAABXRUJQVlA4IKgAAADwBACdASogABIAPtFcp04oJSOiKAqpABoJZgCdMw6BqfkxX1cInVEbHPFtDKPo4XAA/uRmVOJUNG/Ww6uXUc1oRDZ1xeir/8E1pHxNaR9u+k/fppCb6BAZ2BxkpktHmAh3m69vm2Y/DvYBGbkgDStLbChjyy9x8esM8fcuqmRosD/q35kkOYpVWdvj30y4Nvg2iUPz3w3C+WRTILGqvjnI1SFgAvPEAAA=",
    imageAlt: "noted in Turbo blue with the Trip to Lisbon note open beside the notes list",
  },
  {
    id: "adrianmato-art",
    name: "adrianmato.art",
    year: "2022",
    datetime: "2022",
    description:
      "A creative journey through 3D art. Wallpapers made with Blender, for desktop and mobile.",
    url: "https://adrianmato.art",
    image: "/assets/work/adrianmatoart/adrianmatoart",
    // 32×18 blurred placeholder; regenerate when the image changes.
    imagePreview:
      "data:image/webp;base64,UklGRtoAAABXRUJQVlA4IM4AAAAwBQCdASogABIAPtFgqU+oJSOiKAgBABoJZAB33jKKB0p+skwHfcmkH0sVyM5AiKPe2AD+/CPnkeReUKuwfGKxgOUDZPX22P7BebOkBZXwgsnbz/dUgZfVfaAHzbDvePao+bHY0YId08sNhoxmCTU7uHQCCxo1eFMYNYEauNYRAtyrAicU/LZUjmxjnCnnNbstYI/zJI9tYVDNc1ijhpuD3pWdnrv/0MV8WiJHQn7RgAxvnc+sbjcUNMdp5yRFJGrnqsCfOn9lniz2dAAAAA==",
    imageAlt: "A selection of colorful 3D wallpapers from adrianmato.art",
  },
  {
    id: "github-pewpew",
    name: "github-pewpew",
    year: "2021",
    datetime: "2021",
    description:
      "A little CLI to clean up unused GitHub repositories. Built as an OSS npm package.",
    url: "/pewpew/",
    image: "/assets/work/pewpew/pewpew",
    // 32×18 blurred placeholder; regenerate when the image changes.
    imagePreview:
      "data:image/webp;base64,UklGRrYAAABXRUJQVlA4IKoAAAAwBQCdASogABIAPrVKnEunJKKht+gA4BaJZgCdMt8E4ycgI3pxsXJGnC++A9duwsH+AAD++EuulSkjcbTqlzJY63daqAOqaIAfRd7XB8/SzqQYGvxwt1VrnNoWGO36G7CAGMwnHdcKkJIWIxnasB4wWyPvpVWkC2losOSpagnMo4OH27lQ/9OH220tqi+ivOKRWKj02CMmF4FaBDUpiIIIt7yn7kqRj4AAAA==",
    imageAlt: "The github-pewpew website and repository cleanup tool",
  },
] as const;

// How project covers are offered and sized on /projects/, shared with links that
// warm them up ahead of a visit.
export const PROJECT_IMAGE_WIDTHS = [640, 960, 1280];
export const PROJECT_IMAGE_SIZES =
  "(max-width: 720px) calc(100vw - 48px), (max-width: 1008px) calc((100vw - 112px) / 3), 299px";

export function projectImageSrcset(image: string) {
  return PROJECT_IMAGE_WIDTHS.map((width) => `${image}-${width}.webp ${width}w`).join(", ");
}
