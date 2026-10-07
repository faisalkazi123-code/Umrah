import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

function listFiles(dir: string, base = dir): string[] {
  return readdirSync(dir).flatMap((f) => {
    const full = path.join(dir, f);
    return statSync(full).isDirectory() ? listFiles(full, base) : [path.relative(base, full).split(path.sep).join("/")];
  });
}

/** Emits sw.js with every built asset and public file precached, so all routes work offline. */
function precacheServiceWorker(): Plugin {
  return {
    name: "umrah-precache-sw",
    apply: "build",
    generateBundle(_opts, bundle) {
      const built = Object.keys(bundle).filter((f) => !f.endsWith(".map"));
      const pub = listFiles(r("./public"));
      const urls = ["/", ...new Set([...built, ...pub].map((f) => `/${f}`))].filter((u) => u !== "/sw.js");
      const version = createHash("sha256").update(urls.join("|")).update(built.map((f) => {
        const o = bundle[f]!;
        return o.type === "chunk" ? o.code : String(o.source);
      }).join("")).digest("hex").slice(0, 12);
      const source = readFileSync(r("./pwa/sw-template.js"), "utf8")
        .replace("__VERSION__", version)
        .replace("__PRECACHE__", JSON.stringify(urls, null, 2));
      this.emitFile({ type: "asset", fileName: "sw.js", source });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === "demo" ? [] : [precacheServiceWorker()])],
  resolve: {
    alias: { "@": r("./src"), "@shared": r("./shared"), "@content": r("./server/seed/content") },
  },
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:3001" },
  },
  preview: {
    proxy: { "/api": "http://localhost:3001" },
  },
  build:
    mode === "demo"
      ? // Single bundle so scripts/inline-demo.mjs can inline it into one page.
        { outDir: "dist-demo", sourcemap: false, target: "es2022", assetsInlineLimit: 100_000, rollupOptions: { output: { inlineDynamicImports: true } } }
      : { outDir: "dist", sourcemap: false, target: "es2022" },
}));
