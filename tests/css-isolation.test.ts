import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import postcss from "postcss";
import { parse as parseSfc } from "vue/compiler-sfc";

/* Everything in src/ ends up in the published dist/style.css, which users
   import globally. A selector that isn't anchored to one of our own
   `vslk-` classes (e.g. `body`, `h1`, `:root`, `#app`) would restyle the
   host application — so every rule we ship must reference a vslk- class.
   Scoped SFC blocks are exempt: Vue rewrites them with a data-v attribute. */

const SRC = join(__dirname, "../src");

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function shippedGlobalCss(): { file: string; css: string }[] {
  return walk(SRC).flatMap((path) => {
    const file = relative(SRC, path);
    if (path.endsWith(".css")) return [{ file, css: readFileSync(path, "utf8") }];
    if (path.endsWith(".vue")) {
      const { descriptor } = parseSfc(readFileSync(path, "utf8"));
      return descriptor.styles
        .filter((style) => !style.scoped)
        .map((style) => ({ file, css: style.content }));
    }
    return [];
  });
}

function leakingSelectors(css: string): string[] {
  const leaks: string[] = [];
  postcss.parse(css).walkRules((rule) => {
    const parent = rule.parent;
    if (parent?.type === "atrule" && /keyframes$/.test((parent as postcss.AtRule).name)) {
      return;
    }
    for (const selector of rule.selectors) {
      if (!/\.vslk-/.test(selector)) leaks.push(selector);
    }
  });
  return leaks;
}

describe("shipped CSS isolation", () => {
  const sources = shippedGlobalCss();

  it("finds global stylesheets to check", () => {
    expect(sources.length).toBeGreaterThan(0);
  });

  it.each(sources.map((s) => [s.file, s.css]))(
    "%s only targets vslk- classes",
    (_file, css) => {
      expect(leakingSelectors(css)).toEqual([]);
    }
  );
});
