// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// GitHub Pages build: `GITHUB_PAGES=true vite build`.
// Produces a fully prerendered static site under the repository subpath.
// Lovable preview + local dev are untouched (the flag is off there).
const isGithubPages = process.env["GITHUB_PAGES"] === "true";
const pagesBase = process.env["PAGES_BASE"] ?? "/cvi-learn-hub/";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    ...(isGithubPages
      ? {
          prerender: { enabled: true, crawlLinks: true },
          pages: [
            { path: "/" },
            { path: "/cyberfoundations" },
            { path: "/pki" },
            { path: "/instructor" },
            { path: "/cyberfoundations/week-06/from-the-grid-to-cloud-heights" },
          ],
        }
      : {}),
  },
  ...(isGithubPages
    ? {
        nitro: { preset: "static" as const },
        vite: { base: pagesBase },
      }
    : {}),
});
