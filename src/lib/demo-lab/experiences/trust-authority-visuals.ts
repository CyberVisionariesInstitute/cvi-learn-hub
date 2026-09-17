import ivyVaultHero from "@/assets/characters/ivy-vault/ivy-vault-hero.jpg";
import ivyVaultHeadshot from "@/assets/characters/ivy-vault/ivy-vault-headshot.jpg";
import vaultExchangeWorkbench from "@/assets/environments/cyberfoundations/vault-exchange-workbench.jpg";
import type { SceneVisual } from "../types";

/**
 * Week 9 — The Trust Authority visual slots.
 *
 * One typed slot per teaching role, matching the Week 8 convention: artwork
 * always sits in its own bordered panel beside the text, never underneath it.
 *
 * TEMPORARY FALLBACKS: dedicated Week 9 lesson illustrations are not in the
 * repository yet, so each slot reuses approved Module 3 artwork. All technical
 * labels (certificate fields, chain diagrams) are rendered as HTML/SVG in the
 * interaction, never baked into an image.
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
    src: vaultExchangeWorkbench,
    alt: "The Vault Exchange workbench, where Ivy checks the destination certificate",
    fit: "cover",
  },
  openingBriefing: {
    src: ivyVaultHero,
    alt: "Ivy, Security Analyst — Vault Access Level 3, preparing to send the protected report",
    caption: "Ivy protected the report. Now she has to reach the right destination.",
    fit: "contain",
  },
  inspectPrimary: {
    src: vaultExchangeWorkbench,
    alt: "The Vault Exchange workbench used for the certificate inspection station",
    caption: "Station 1 — read the badge before you believe the badge.",
    fit: "contain",
  },
  chainPrimary: {
    src: vaultExchangeWorkbench,
    alt: "The Vault Exchange workbench used for the trust chain station",
    caption: "Station 2 — who signed this, and who does the client actually trust?",
    fit: "contain",
  },
  warningPrimary: {
    src: ivyVaultHeadshot,
    alt: "Ivy reading a certificate warning carefully rather than clicking through it",
    caption: "Station 3 — read the warning before deciding anything.",
    fit: "contain",
  },
  decisionPrimary: {
    src: ivyVaultHero,
    alt: "Ivy making the final connect-or-stop decision at the Vault Exchange",
    fit: "contain",
  },
  closingRecap: {
    src: vaultExchangeWorkbench,
    alt: "The Vault Exchange workbench at the close of the Week 9 session",
    fit: "contain",
  },
};
