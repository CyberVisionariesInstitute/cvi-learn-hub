/**
 * Generates the student-safe Student Guide PDF in the browser from the same
 * canonical content the online guide renders. No instructor-only content is
 * included because the source is GUIDE_META / GUIDE_SECTIONS only.
 */

import { GUIDE_META, GUIDE_SECTIONS, type GuideBlock } from "./student-guide";

const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const MARGIN = 52;
const BODY = 10.5;
const LEAD = 14.5;

export async function generateGuidePdf(): Promise<Blob> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  doc.setTitle(GUIDE_META.title);
  doc.setSubject(GUIDE_META.tagline);
  doc.setCreator("CyberVisionaries Institute");

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.09, 0.11, 0.16);
  const muted = rgb(0.36, 0.4, 0.48);
  const accent = rgb(0.11, 0.35, 0.66);

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const newPage = () => {
    page = doc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
  };
  const need = (h: number) => {
    if (y - h < MARGIN) newPage();
  };

  const wrap = (text: string, size: number, f: typeof font, width: number) => {
    const lines: string[] = [];
    for (const paragraph of text.split("\n")) {
      let line = "";
      for (const word of paragraph.split(/\s+/).filter(Boolean)) {
        const next = line ? `${line} ${word}` : word;
        if (f.widthOfTextAtSize(next, size) > width && line) {
          lines.push(line);
          line = word;
        } else {
          line = next;
        }
      }
      lines.push(line);
    }
    return lines;
  };

  const sanitize = (s: string) =>
    s.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, "-")
      .replace(/[^\x20-\x7E\n]/g, "-");

  const draw = (
    text: string,
    opts: { size?: number; f?: typeof font; color?: typeof ink; indent?: number; gap?: number } = {},
  ) => {
    const size = opts.size ?? BODY;
    const f = opts.f ?? font;
    const indent = opts.indent ?? 0;
    const width = PAGE_W - MARGIN * 2 - indent;
    for (const line of wrap(sanitize(text), size, f, width)) {
      need(LEAD);
      page.drawText(line, {
        x: MARGIN + indent,
        y: y - size,
        size,
        font: f,
        color: opts.color ?? ink,
      });
      y -= size * 1.38;
    }
    y -= opts.gap ?? 4;
  };

  // Cover block
  draw(GUIDE_META.title, { size: 18, f: bold, color: accent, gap: 2 });
  draw(GUIDE_META.tagline, { size: 11, color: muted, gap: 10 });
  for (const [label, value] of [
    ["Program format", GUIDE_META.format],
    ["Your role", GUIDE_META.role],
    ["Release basis", GUIDE_META.release],
    ["Student journey", GUIDE_META.journey],
  ] as const) {
    draw(`${label}: ${value}`, { size: 9.5, color: muted, gap: 0 });
  }
  y -= 12;

  const drawBlock = (block: GuideBlock) => {
    if (block.kind === "para") {
      draw(block.text ?? "");
      return;
    }
    if (block.kind === "table") {
      if (block.head?.length) {
        draw(block.head.join("  |  "), { size: 9, f: bold, color: muted, gap: 2 });
      }
      for (const row of block.rows ?? []) {
        draw(row.join("  |  "), { size: 9.5, indent: 6, gap: 1 });
      }
      y -= 4;
      return;
    }
    if (block.text) draw(block.text, { gap: 2 });
    (block.items ?? []).forEach((item, i) => {
      const marker = block.kind === "steps" ? `${i + 1}.` : "-";
      draw(`${marker} ${item}`, { indent: 12, gap: 1 });
    });
    y -= 4;
  };

  for (const section of GUIDE_SECTIONS) {
    need(60);
    draw(`${section.number}. ${section.title}`, { size: 13, f: bold, color: accent, gap: 6 });
    for (const block of section.blocks) drawBlock(block);
    y -= 6;
  }

  // Footer page numbers
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    p.drawText(`${GUIDE_META.tagline}  ·  Page ${i + 1} of ${pages.length}`.replace(/·/g, "|"), {
      x: MARGIN,
      y: MARGIN - 22,
      size: 8,
      font,
      color: muted,
    });
  });

  const bytes = await doc.save();
  return new Blob([bytes as unknown as ArrayBuffer], { type: "application/pdf" });
}

export async function downloadGuidePdf() {
  const blob = await generateGuidePdf();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Phase3-PKI-Architect-Capstone-Student-Guide.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
