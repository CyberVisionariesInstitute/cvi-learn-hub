import ivyVaultHero from "@/assets/characters/ivy-vault/ivy-vault-hero.jpg";
import ivyVaultHeadshot from "@/assets/characters/ivy-vault/ivy-vault-headshot.jpg";
import vaultExchangeWorkbench from "@/assets/environments/cyberfoundations/vault-exchange-workbench.jpg";
import type { SceneVisual } from "../types";

/**
 * Week 8 — Vault Exchange visual slots.
 *
 * One typed slot per teaching role. Scene components read slots, never file
 * paths, so the forthcoming lesson artwork can be dropped in by editing only
 * this file.
 *
 * TEMPORARY FALLBACKS: the dedicated lesson illustrations
 * (2A_Cipher_Vault, 1A_Ivys_First_Vault_Exchange_Assignment,
 * 1D_Guard_Post_vs_Protected_Data, 1E_Plaintext_to_Ciphertext,
 * 2D_Unsafe_Secret_Sharing, 2E_Ivy_Protects_the_Key,
 * 3E_Public_vs_Private_Key_Custody, 3F_Where_Key_Pairs_Appear)
 * are not in the repository yet. Every slot below is mapped to the closest
 * existing Week 8 asset as a placeholder. No stock or generated art is used.
 * Replace `src` and `alt` per slot when the real artwork lands.
 */
export type VaultVisualSlot =
  | "browserThumbnail"
  | "openingBriefing"
  | "week7Bridge"
  | "protectPrimary"
  | "sharedSecretRisk"
  | "keyProtection"
  | "authenticatePrimary"
  | "closingRecap";

export const vaultExchangeVisuals: Record<VaultVisualSlot, SceneVisual> = {
  // TEMPORARY FALLBACK — awaiting 2A_Cipher_Vault.png
  browserThumbnail: {
    src: vaultExchangeWorkbench,
    alt: "The Vault Exchange cryptography workbench",
    fit: "cover",
  },
  // TEMPORARY FALLBACK — awaiting 1A_Ivys_First_Vault_Exchange_Assignment.png
  openingBriefing: {
    src: ivyVaultHero,
    alt: "Ivy, Security Analyst — Vault Access Level 3, at the Vault Exchange",
    caption: "Ivy — Security Analyst, Vault Access Level 3.",
    fit: "contain",
  },
  // TEMPORARY FALLBACK — awaiting 1D_Guard_Post_vs_Protected_Data.png
  week7Bridge: {
    src: vaultExchangeWorkbench,
    alt: "The Vault Exchange floor, where protected information is handled",
    caption: "Week 7 guarded the door. Week 8 protects the information itself.",
    fit: "contain",
  },
  // TEMPORARY FALLBACK — awaiting 1E_Plaintext_to_Ciphertext.png
  protectPrimary: {
    src: vaultExchangeWorkbench,
    alt: "The Vault Exchange workbench used for the encryption station",
    fit: "contain",
  },
  // TEMPORARY FALLBACK — awaiting 2D_Unsafe_Secret_Sharing.png
  sharedSecretRisk: {
    src: vaultExchangeWorkbench,
    alt: "The Vault Exchange workbench, illustrating shared-secret handling",
    fit: "contain",
  },
  // TEMPORARY FALLBACK — awaiting 2E_Ivy_Protects_the_Key.png
  keyProtection: {
    src: ivyVaultHeadshot,
    alt: "Ivy, who keeps her private key with her at all times",
    fit: "contain",
  },
  // TEMPORARY FALLBACK — awaiting 3E_Public_vs_Private_Key_Custody.png
  authenticatePrimary: {
    src: ivyVaultHeadshot,
    alt: "Ivy, holding the private half of her key pair",
    caption: "Public key goes on the server. Private key stays with Ivy.",
    fit: "contain",
  },
  // TEMPORARY FALLBACK — awaiting 3F_Where_Key_Pairs_Appear.png
  closingRecap: {
    src: vaultExchangeWorkbench,
    alt: "The Vault Exchange workbench at the close of the session",
    fit: "contain",
  },
};
