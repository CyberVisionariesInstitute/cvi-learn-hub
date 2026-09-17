import week9Entrance from "@/assets/environments/cyberfoundations/week9/week9-entrance.png.asset.json";
import week9Gallery from "@/assets/environments/cyberfoundations/week9/week9-gallery.png.asset.json";
import week9Inspection from "@/assets/environments/cyberfoundations/week9/week9-inspection.png.asset.json";
import week9Investigation from "@/assets/environments/cyberfoundations/week9/week9-investigation.png.asset.json";
import type { SceneVisual } from "../types";

/**
 * Week 9 — The Trust Authority visual slots.
 *
 * One typed slot per teaching role, matching the Week 8 convention: artwork
 * always sits in its own bordered panel beside the text, never underneath it.
 *
 * Approved Week 9 story illustrations. These images establish place and mood;
 * they are never presented as certificate or chain evidence. All technical
 * labels, fields and diagrams remain readable HTML/SVG in the interaction.
 */
export type TrustVisualSlot =
  | "browserThumbnail"
  | "openingBriefing"
  | "inspectPrimary"
  | "chainPrimary"
  | "warningPrimary"
  | "decisionPrimary"
  | "closingRecap";

export const trustAuthorityVisuals: Record<TrustVisualSlot, SceneVisual> = {
  browserThumbnail: {
    src: week9Entrance.url,
    alt: "The bright marble entrance hall of the Trust Authority, with a circular vault door beyond the security gates",
    fit: "cover",
  },
  openingBriefing: {
    src: week9Entrance.url,
    alt: "The Trust Authority entrance hall, where Ivy begins checking the destination before sending the protected report",
    caption: "Ivy protected the report. Now she has to reach the right destination.",
    fit: "contain",
  },
  inspectPrimary: {
    src: week9Inspection.url,
    alt: "A lit inspection desk displaying a fictional identification badge beside a magnifying glass and laptop",
    caption: "Station 1 — read the badge before you believe the badge.",
    fit: "contain",
  },
  chainPrimary: {
    src: week9Gallery.url,
    alt: "A gallery of glowing keys displayed at different points through the Trust Authority hall",
    caption: "Station 2 — who signed this, and who does the client actually trust?",
    fit: "contain",
  },
  warningPrimary: {
    src: week9Investigation.url,
    alt: "An investigation workstation with three monitors, including a visible warning symbol on the center screen",
    caption: "Station 3 — read the warning before deciding anything.",
    fit: "contain",
  },
  decisionPrimary: {
    src: week9Investigation.url,
    alt: "The Trust Authority investigation desk where Ivy compares evidence before making the final connection decision",
    fit: "contain",
  },
  closingRecap: {
    src: week9Entrance.url,
    alt: "The Trust Authority entrance hall after Ivy completes the destination check",
    fit: "contain",
  },
};
