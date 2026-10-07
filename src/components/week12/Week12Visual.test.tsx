import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Week12Visual } from "./Week12Visual";

describe("Week 12 presentation-only teaching visuals", () => {
  it("renders the existing Ivy hero with separate Broadcast Tower caption", () => {
    const html = renderToStaticMarkup(<Week12Visual stage="hero" />);
    expect(html).toContain('data-week12-visual="hero"');
    expect(html).toContain("ivy-vault-hero.jpg");
    expect(html).toContain("Broadcast Tower");
    expect(html).toContain("<figcaption");
  });
  it.each([1, 2, 3, 4, 5, 6] as const)("renders stage %i without interactive controls or student state", (stage) => {
    const html = renderToStaticMarkup(<Week12Visual stage={stage} />);
    expect(html).toContain(`data-week12-visual="${stage}"`);
    expect(html).toContain("ivy-vault-headshot.jpg");
    expect(html).toContain("<ol");
    expect(html).not.toMatch(/<(button|input|textarea|select)\b/);
  });
  it("shows equal written and video options, not an additional requirement", () => {
    const html = renderToStaticMarkup(<Week12Visual stage={4} />);
    expect(html).toContain("Written Executive Summary");
    expect(html).toContain("Video Executive Briefing");
    expect(html).toContain(">OR<");
    expect(html).toContain("Equal expectations");
  });
});