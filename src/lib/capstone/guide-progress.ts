/**
 * Remembers the student's last-read Student Guide section (local to their device).
 * No server state, no assignment or scenario data is stored.
 */

import { GUIDE_SECTIONS } from "./student-guide";

const KEY = "cvi.phase3.guide.lastSection";

export interface GuideProgress {
  id: string;
  title: string;
  number: number;
  at: number;
}

export function readGuideProgress(): GuideProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GuideProgress>;
    const section = GUIDE_SECTIONS.find((s) => s.id === parsed.id);
    if (!section) return null;
    return {
      id: section.id,
      title: section.title,
      number: section.number,
      at: typeof parsed.at === "number" ? parsed.at : Date.now(),
    };
  } catch {
    return null;
  }
}

export function writeGuideProgress(id: string) {
  if (typeof window === "undefined") return;
  const section = GUIDE_SECTIONS.find((s) => s.id === id);
  if (!section) return;
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ id: section.id, title: section.title, number: section.number, at: Date.now() }),
    );
  } catch {
    /* storage unavailable — progress is best-effort */
  }
}

export function clearGuideProgress() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
