import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Week12Visual } from "./Week12Visual";

const files = { hero: "broadcast-tower-ivy.png", 1: "stage1-case-file-report.png", 2: "stage2-evidence-findings.png", 3: "stage3-technical-report.png", 4: "stage4-executive-briefing.png", 5: "stage5-recommendations.png", 6: "stage6-finalize-present.png" } as const;

describe("Week 12 approved artwork", () => {
  it.each(Object.entries(files))("stage %s uses its approved image uncropped", (k, f) => {
    const stage = (k === "hero" ? "hero" : Number(k)) as "hero" | 1;
    const html = renderToStaticMarkup(<Week12Visual stage={stage} />);
    expect(html).toContain(f);
    expect(html).toContain("object-contain");
    expect(html).not.toContain("object-cover");
    expect(html).not.toMatch(/ivy-vault|<svg|<(button|input|textarea|select)\b/);
  });
});
