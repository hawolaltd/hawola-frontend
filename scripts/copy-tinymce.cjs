/**
 * Copy the TinyMCE distribution from node_modules into public/tinymce
 * so the storefront loads TinyMCE from your origin (self-hosted), not Tiny Cloud.
 *
 * Run automatically via npm postinstall after `npm install`.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = path.join(root, "node_modules", "tinymce");
const dest = path.join(root, "public", "tinymce");

if (!fs.existsSync(src)) {
  console.warn("[copy-tinymce] Skipping: `tinymce` package not found in node_modules.");
  process.exit(0);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.cpSync(src, dest, { recursive: true });
console.log("[copy-tinymce] Copied TinyMCE to public/tinymce");
