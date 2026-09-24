export type RGBA = { r: number; g: number; b: number; a: number };
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const clamp255 = (x: number) => Math.max(0, Math.min(255, Math.round(x)));

function parseHex(hex: string): RGBA | null {
  const h = hex.replace("#", "").trim();
  if (![3, 4, 6, 8].includes(h.length)) return null;

  const expand = (s: string) => (s.length === 1 ? s + s : s);

  let r = 0,
    g = 0,
    b = 0,
    a = 255;

  if (h.length === 3 || h.length === 4) {
    r = parseInt(expand(h[0]!), 16);
    g = parseInt(expand(h[1]!), 16);
    b = parseInt(expand(h[2]!), 16);
    if (h.length === 4) a = parseInt(expand(h[3]!), 16);
  } else {
    r = parseInt(h.slice(0, 2), 16);
    g = parseInt(h.slice(2, 4), 16);
    b = parseInt(h.slice(4, 6), 16);
    if (h.length === 8) a = parseInt(h.slice(6, 8), 16);
  }

  if ([r, g, b, a].some((n) => Number.isNaN(n))) return null;
  return { r, g, b, a: a / 255 };
}

function parseRgb(input: string): RGBA | null {
  const s = input.trim().toLowerCase();
  const m = s.match(/^rgba?\((.*)\)$/);
  if (!m) return null;

  const body = m[1]!.trim();
  const slashParts = body.split("/").map((x) => x.trim());
  const left = slashParts[0]!;
  const alphaPart = slashParts[1];

  const comps = left.includes(",")
    ? left.split(",").map((x) => x.trim())
    : left.split(/\s+/).map((x) => x.trim());

  if (comps.length < 3) return null;

  const to255 = (v: string) => {
    if (v.endsWith("%")) return clamp255(parseFloat(v) * 2.55);
    return clamp255(parseFloat(v));
  };

  const r = to255(comps[0]!);
  const g = to255(comps[1]!);
  const b = to255(comps[2]!);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;

  let a = 1;
  const aStr = alphaPart ?? comps[3];
  if (aStr != null) {
    const t = aStr.trim();
    if (t.endsWith("%")) a = clamp01(parseFloat(t) / 100);
    else a = clamp01(parseFloat(t));
    if (Number.isNaN(a)) a = 1;
  }

  return { r, g, b, a };
}
export function parseColorToRgba(input: string): RGBA | null {
  const s = input.trim();
  if (!s) return null;

  const lower = s.toLowerCase();
  if (lower.startsWith("var(")) return null;
  if (lower === "currentcolor") return null;

  if (s.startsWith("#")) return parseHex(s);
  if (lower.startsWith("rgb")) return parseRgb(s);

  return null;
}
export function luminance({ r, g, b }: RGBA): number {
  const srgb = [r, g, b].map((v) => v / 255);

  const lin = srgb.map((c) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );

  return 0.2126 * lin[0]! + 0.7152 * lin[1]! + 0.0722 * lin[2]!;
}

function blendChannel(c: number, target: number, t: number) {
  return clamp255(c + (target - c) * t);
}

export function lighten(rgba: RGBA, t = 0.45): RGBA {
  const k = clamp01(t);
  return {
    r: blendChannel(rgba.r, 255, k),
    g: blendChannel(rgba.g, 255, k),
    b: blendChannel(rgba.b, 255, k),
    a: rgba.a,
  };
}

export function darken(rgba: RGBA, t = 0.22): RGBA {
  const k = clamp01(t);
  return {
    r: blendChannel(rgba.r, 0, k),
    g: blendChannel(rgba.g, 0, k),
    b: blendChannel(rgba.b, 0, k),
    a: rgba.a,
  };
}

export function toRgbaString({ r, g, b, a }: RGBA): string {
  return `rgba(${clamp255(r)}, ${clamp255(g)}, ${clamp255(b)}, ${clamp01(a)})`;
}

export type AutoHighlightOptions = {
  lightThreshold?: number;
  lightenBy?: number;
  darkenBy?: number;
  alphaBoost?: number;
};

export function generateAutoHighlight(
  baseColor: string,
  opts: AutoHighlightOptions = {}
): string | null {
  const rgba = parseColorToRgba(baseColor);
  if (!rgba) return null;

  const {
    lightThreshold = 0.8,
    lightenBy = 0.5,
    darkenBy = 0.22,
    alphaBoost = 0.06,
  } = opts;
  const L = luminance(rgba);
  const hi =
    L >= lightThreshold ? darken(rgba, darkenBy) : lighten(rgba, lightenBy);
  hi.a = clamp01(Math.max(hi.a, rgba.a + alphaBoost));
  return toRgbaString(hi);
}
