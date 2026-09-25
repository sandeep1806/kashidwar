// Generates favicon.ico (16/32/48, PNG-in-ICO), apple-touch-icon, PWA icons and a maskable icon from public/icon.svg.
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
const svg = readFileSync(new URL("../public/icon.svg", import.meta.url));
const out = (f) => new URL(`../public/${f}`, import.meta.url);
const png = (size, pad = 0) =>
  sharp(svg, { density: 384 })
    .resize(size - pad * 2, size - pad * 2)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: "#0B0A14" })
    .png({ compressionLevel: 9 })
    .toBuffer();
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => png(s)));
// ICO container with embedded PNGs
const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const dir = sizes.map((s, i) => { const e = Buffer.alloc(16); e.writeUInt8(s, 0); e.writeUInt8(s, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3); e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(pngs[i].length, 8); e.writeUInt32LE(offset, 12); offset += pngs[i].length; return e; });
writeFileSync(out("favicon.ico"), Buffer.concat([header, ...dir, ...pngs]));
writeFileSync(out("apple-touch-icon.png"), await png(180, 14));
writeFileSync(out("icon-192.png"), await png(192));
writeFileSync(out("icon-512.png"), await png(512));
writeFileSync(out("icon-maskable-512.png"), await png(512, 80));
console.log("icons written");
