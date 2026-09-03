/**
 * Canonical (key-sorted) JSON signing for Phase 3 project exports.
 *
 * Key order or whitespace in an export file can never change the signature.
 * Exports produced before this canonical form was adopted are obsolete and
 * are rejected on import; students must re-export from the current build.
 */

export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

export async function signWithKey(payload: unknown, key: string): Promise<string> {
  const { createHmac } = await import("crypto");
  return createHmac("sha256", key).update(canonicalJson(payload)).digest("hex");
}

export const OBSOLETE_EXPORT_MESSAGE =
  "signature does not match — this file was either modified or created by an earlier version of the app. Re-export your project from the current application and import the fresh file.";
