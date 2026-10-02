import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Skeleton from "../../src/components/Skeleton/Skeleton.vue";

function bodyRows(wrapper: ReturnType<typeof mount>) {
  return wrapper
    .findAll(".vslk-table__row")
    .filter((row) => !row.classes().includes("vslk-table__row--header"));
}

describe("Table Variant", () => {
  it("renders the default number of rows and columns (5 x 4)", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "table" },
    });

    const rows = bodyRows(wrapper);
    expect(rows).toHaveLength(5);
    expect(rows[0].findAll(".vslk-table__cell")).toHaveLength(4);
  });

  it("respects custom rows and columns", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "table", options: { rows: 3, columns: 6 } },
    });

    const rows = bodyRows(wrapper);
    expect(rows).toHaveLength(3);
    rows.forEach((row) => {
      expect(row.findAll(".vslk-table__cell")).toHaveLength(6);
    });
  });

  it("clamps rows and columns to a minimum of 1", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "table", options: { rows: 0, columns: 0 } },
    });

    const rows = bodyRows(wrapper);
    expect(rows).toHaveLength(1);
    expect(rows[0].findAll(".vslk-table__cell")).toHaveLength(1);
  });

  it("defaults every column track to 1fr", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "table", options: { columns: 3 } },
    });

    const row = bodyRows(wrapper)[0];
    expect((row.element as HTMLElement).style.gridTemplateColumns).toBe(
      "1fr 1fr 1fr"
    );
  });

  it("applies minColumnWidth as minmax(min, 1fr) for default columns", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "table",
        options: { columns: 2, minColumnWidth: 90 },
      },
    });

    const row = bodyRows(wrapper)[0];
    expect((row.element as HTMLElement).style.gridTemplateColumns).toBe(
      "minmax(90px, 1fr) minmax(90px, 1fr)"
    );
  });

  it("applies a single columnWidths value to every column", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "table",
        options: { columns: 3, columnWidths: 120 },
      },
    });

    const row = bodyRows(wrapper)[0];
    expect((row.element as HTMLElement).style.gridTemplateColumns).toBe(
      "120px 120px 120px"
    );
  });

  it("applies per-column columnWidths array, falling back to default for missing entries", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "table",
        options: { columns: 3, columnWidths: ["60px", "200px"] },
      },
    });

    const row = bodyRows(wrapper)[0];
    expect((row.element as HTMLElement).style.gridTemplateColumns).toBe(
      "60px 200px 1fr"
    );
  });

  it("does not render a header by default", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "table" },
    });

    expect(wrapper.find(".vslk-table__row--header").exists()).toBe(false);
  });

  it("renders a header row when header: true", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "table", options: { header: true, columns: 4 } },
    });

    const header = wrapper.find(".vslk-table__row--header");
    expect(header.exists()).toBe(true);
    expect(header.findAll(".vslk-table__cell")).toHaveLength(4);
  });

  it("does not render a footer by default", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "table" },
    });

    expect(wrapper.find(".vslk-table__footer").exists()).toBe(false);
  });

  it("renders a footer with the requested number of control items", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "table",
        options: { footer: true, footerItems: 4 },
      },
    });

    const footer = wrapper.find(".vslk-table__footer");
    expect(footer.exists()).toBe(true);
    expect(
      footer.find(".vslk-table__footer-controls").findAll(".vslk-sk-shape")
    ).toHaveLength(4);
  });

  it("renders no footer controls when footerItems is 0", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "table",
        options: { footer: true, footerItems: 0 },
      },
    });

    const footer = wrapper.find(".vslk-table__footer");
    expect(footer.exists()).toBe(true);

    // with footerItems=0, the controls container is removed by v-if
    expect(wrapper.find(".vslk-table__footer-controls").exists()).toBe(false);
  });

  it("defaults footerItems to 3 when footer is enabled", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "table",
        options: { footer: true },
      },
    });

    const controls = wrapper
      .find(".vslk-table__footer-controls")
      .findAll(".vslk-sk-shape");
    expect(controls).toHaveLength(3);
  });

  it("propagates the top-level color into body cells when cellColor isn't set", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "table", color: "#7c3aed" },
    });

    const cellSkeleton = wrapper.find(
      ".vslk-table__cell .vslk-skeleton-container"
    );
    expect(cellSkeleton.attributes("style")).toContain(
      "--vslk-sk-base: #7c3aed"
    );
  });

  it("lets options.cellColor override the top-level color", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "table",
        color: "#7c3aed",
        options: { cellColor: "#ff0000" },
      },
    });

    const cellSkeleton = wrapper.find(
      ".vslk-table__cell .vslk-skeleton-container"
    );
    expect(cellSkeleton.attributes("style")).toContain(
      "--vslk-sk-base: #ff0000"
    );
  });

  it("propagates the top-level color into the header when headerColor isn't set", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "table",
        color: "#7c3aed",
        options: { header: true },
      },
    });

    const headerSkeleton = wrapper.find(
      ".vslk-table__row--header .vslk-skeleton-container"
    );
    expect(headerSkeleton.attributes("style")).toContain(
      "--vslk-sk-base: #7c3aed"
    );
  });

  it("propagates the top-level color into the footer when footerColor isn't set", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "table",
        color: "#7c3aed",
        options: { footer: true },
      },
    });

    const footerSkeleton = wrapper.find(
      ".vslk-table__footer .vslk-skeleton-container"
    );
    expect(footerSkeleton.attributes("style")).toContain(
      "--vslk-sk-base: #7c3aed"
    );
  });

  it("applies a single align value to every column", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "table",
        options: { columns: 3, align: "center" },
      },
    });

    const cells = bodyRows(wrapper)[0].findAll(".vslk-table__cell");
    cells.forEach((cell) => {
      expect(cell.classes()).toContain("vslk-table__cell--center");
    });
  });

  it("applies per-column align array, defaulting to left for missing entries", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "table",
        options: { columns: 3, align: ["left", "right"] },
      },
    });

    const cells = bodyRows(wrapper)[0].findAll(".vslk-table__cell");
    expect(cells[0].classes()).toContain("vslk-table__cell--left");
    expect(cells[1].classes()).toContain("vslk-table__cell--right");
    expect(cells[2].classes()).toContain("vslk-table__cell--left");
  });

  it("shows grid lines by default", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "table" },
    });

    expect(bodyRows(wrapper)[0].classes().includes("vslk-table__row--grid")).toBe(
      true
    );
  });

  it("hides grid lines when gridLines: false", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "table", options: { gridLines: false } },
    });

    expect(
      bodyRows(wrapper)[0].classes().includes("vslk-table__row--grid")
    ).toBe(false);
  });

  it("applies custom cellWidths to the decorative bar inside each cell", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "table",
        options: { columns: 2, cellWidths: ["40%", "80%"] },
      },
    });

    const shapes = bodyRows(wrapper)[0].findAll(".vslk-sk-shape");
    expect(shapes[0].element).toHaveStyle({ width: "40%" });
    expect(shapes[1].element).toHaveStyle({ width: "80%" });
  });

  // Defaults and fallbacks pinned by mutation testing (npm run test:mutation)
  describe("defaults and fallbacks", () => {
    const table = (props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) =>
      mount(Skeleton, { props: { variant: "table", ...props, options: { columns: 1, rows: 1, ...options } } });
    const shapes = (w: ReturnType<typeof mount>, row: string) =>
      w.find(row).findAll(".vslk-sk-shape").map((s) => s.element as HTMLElement);
    const containers = (w: ReturnType<typeof mount>, row: string) =>
      w.find(row).findAll(".vslk-skeleton-container").map((c) => c.attributes("style") ?? "");
    const HEADER = ".vslk-table__row--header";
    const BODY = ".vslk-table__row:not(.vslk-table__row--header)";
    const FOOTER = ".vslk-table__footer";

    it("sizes body bars 80% x 16px with 12px cell padding", () => {
      const w = table();
      expect(shapes(w, BODY)[0]).toHaveStyle({ width: "80%", height: "16px" });
      expect(w.find(".vslk-table__cell").element).toHaveStyle({ padding: "12px" });
    });

    it("applies rowHeight and padding options", () => {
      const w = table({}, { rowHeight: 20, padding: "1rem" });
      expect(shapes(w, BODY)[0]).toHaveStyle({ height: "20px" });
      expect(w.find(".vslk-table__cell").element).toHaveStyle({ padding: "1rem" });
    });

    it("aligns cells left by default", () => {
      expect(table().find(".vslk-table__cell").classes()).toContain("vslk-table__cell--left");
    });

    it("sets the table width and a default border color", () => {
      expect(table({ width: 500 }).find(".vslk-table").element).toHaveStyle({ width: "500px" });
      expect(table({ width: "50%" }).find(".vslk-table").element).toHaveStyle({ width: "50%" });
      expect(table().find(".vslk-table").attributes("style")).not.toContain("width:");
      expect(table().find(".vslk-table").attributes("style")).toContain("--vslk-border-color: rgba(148,163,184,.18)");
      expect(table({}, { borderColor: "red" }).find(".vslk-table").attributes("style")).toContain("--vslk-border-color: red");
    });

    it("applies one columnWidths value to every column", () => {
      const w = table({}, { columns: 2, columnWidths: 120 });
      expect(w.find(".vslk-table__row").attributes("style")).toContain("grid-template-columns: 120px 120px");
    });

    it("sizes header bars 50% x 14px by default", () => {
      expect(shapes(table({}, { header: true }), HEADER)[0]).toHaveStyle({ width: "50%", height: "14px" });
    });

    it("falls back to rowHeight, then cellWidths, for the header", () => {
      const w = table({}, { header: true, rowHeight: 22, cellWidths: "60%" });
      expect(shapes(w, HEADER)[0]).toHaveStyle({ width: "60%", height: "22px" });
      const own = table({}, { header: true, rowHeight: 22, headerHeight: 18, cellWidths: "60%", headerWidths: ["30%"] });
      expect(shapes(own, HEADER)[0]).toHaveStyle({ width: "30%", height: "18px" });
    });

    it("passes cell, header and footer highlights down, each falling back to the cell highlight", () => {
      const inherited = table({ highlight: "#00ff00" }, { header: true, footer: true });
      for (const row of [HEADER, BODY, FOOTER]) expect(containers(inherited, row)[0], row).toContain("--vslk-sk-hi: #00ff00");

      const own = table(
        { highlight: "#00ff00" },
        { header: true, footer: true, cellHighlight: "#111111", headerHighlight: "#222222", footerHighlight: "#333333" }
      );
      expect(containers(own, BODY)[0]).toContain("--vslk-sk-hi: #111111");
      expect(containers(own, HEADER)[0]).toContain("--vslk-sk-hi: #222222");
      expect(containers(own, FOOTER)[0]).toContain("--vslk-sk-hi: #333333");
    });

    it("lays out the footer label and square controls by default", () => {
      const footer = shapes(table({}, { footer: true }), FOOTER);
      expect(footer[0]).toHaveStyle({ width: "110px", height: "28px" });
      expect(footer[1]).toHaveStyle({ width: "28px", height: "28px", borderRadius: "6px" });
      expect(table({}, { footer: true }).find(FOOTER).element).toHaveStyle({ justifyContent: "space-between" });
    });

    it("sizes footer controls from footerHeight unless footerControlWidth is set", () => {
      const square = shapes(table({}, { footer: true, footerHeight: 32 }), FOOTER);
      expect(square[1]).toHaveStyle({ width: "32px", height: "32px" });
      const custom = shapes(
        table({}, { footer: true, footerHeight: 32, footerControlWidth: 60, footerControlRadius: 2, footerLabelWidth: 90 }),
        FOOTER
      );
      expect(custom[0]).toHaveStyle({ width: "90px" });
      expect(custom[1]).toHaveStyle({ width: "60px", borderRadius: "2px" });
    });

    it("hides the footer label with footerLabel: false", () => {
      const footer = shapes(table({}, { footer: true, footerLabel: false }), FOOTER);
      expect(footer).toHaveLength(3);
    });

    it.each([
      ["between", "space-between"],
      ["start", "flex-start"],
      ["end", "flex-end"],
    ])("maps footerAlign %s to justify-content %s", (footerAlign, justify) => {
      expect(table({}, { footer: true, footerAlign }).find(FOOTER).element).toHaveStyle({ justifyContent: justify });
    });
  });
});
