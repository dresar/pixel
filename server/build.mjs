import { build } from "esbuild";

await build({
  entryPoints: ["src/app.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "app.js",
  target: "node18",
  external: [
    // Native modules that cannot be bundled
    "pg-native",
    "better-sqlite3",
    "mysql2",
    "oracledb",
    "tedious",
    "pg",
  ],
  banner: {
    js: `
// BrevetAI Backend Server — Built with esbuild
// Hosting: cPanel Node.js App
// Entry: node app.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
`,
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  minify: false, // Keep readable for debugging on cPanel
  sourcemap: false,
  logLevel: "info",
});

console.log("\n✅ Build sukses! File: app.js siap untuk cPanel hosting.\n");
