// Runs automatically after `next build` (via the "postbuild" npm script).
//
// Next's static export doesn't know its own hashed asset filenames until
// after the build finishes, so a hand-written precache list in the service
// worker can never be accurate. Instead, we walk the exported `out/`
// directory once the build is done and write the real file list to
// `out/precache-manifest.json`. The service worker fetches that manifest
// on install and precaches everything in it — every page (including every
// lesson) plus every JS/CSS chunk, so the whole app works offline after
// the first visit, not just Level 0–1.
import { readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "out");

if (!existsSync(OUT_DIR)) {
  console.warn(`[precache-manifest] "${OUT_DIR}" does not exist — did "next build" run with output: "export"?`);
  process.exit(0);
}

function walk(dir, base = "") {
  let files = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const rel = path.join(base, entry);
    if (statSync(full).isDirectory()) {
      files = files.concat(walk(full, rel));
    } else {
      files.push("/" + rel.split(path.sep).join("/"));
    }
  }
  return files;
}

const allFiles = walk(OUT_DIR);

const precache = allFiles.filter((f) => {
  if (f.endsWith(".map")) return false; // source maps — nice to have, not needed offline
  if (f.includes("/.well-known/")) return false;
  return true;
});

writeFileSync(path.join(OUT_DIR, "precache-manifest.json"), JSON.stringify(precache));
console.log(`[precache-manifest] wrote ${precache.length} files to out/precache-manifest.json`);
