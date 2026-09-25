// usage: node shape.mjs font corpus.txt out.json
// Shapes every Devanagari line of the corpus; writes the glyph ids used and,
// per line, a signature (outline path + advance of each glyph) for comparing
// a subset font against the original.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import * as hb from "harfbuzzjs";
const [fontPath, corpusPath, outPath] = process.argv.slice(2);
const data = readFileSync(fontPath);
const font = new hb.Font(new hb.Face(new hb.Blob(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength))));
const lines = [...new Set(readFileSync(corpusPath, "utf8").split("\n"))].filter((l) => /[ऀ-ॿ꣠-ꣿ᳐-᳿]/.test(l));
const gids = new Set(); const sigs = [];
for (const line of lines) {
  // every glyph that appears at any step of shaping (intermediate forms too)
  const tb = new hb.Buffer(); tb.addText(line); tb.guessSegmentProperties();
  for (const step of hb.shapeWithTrace(font, tb, [], 0, 0)) if (step.glyphs) for (const g of step.t) if (typeof g.g === "number") gids.add(g.g);
  const buf = new hb.Buffer(); buf.addText(line); buf.guessSegmentProperties(); hb.shape(font, buf);
  const infos = buf.getGlyphInfos(), pos = buf.getGlyphPositions();
  const parts = infos.map((g, i) => { gids.add(g.codepoint); return createHash("md5").update(font.glyphToPath(g.codepoint)).digest("hex").slice(0, 8) + "@" + pos[i].xAdvance + "," + pos[i].xOffset + "," + pos[i].yOffset; });
  sigs.push(parts.join(" "));
}
writeFileSync(outPath, JSON.stringify({ gids: [...gids].sort((a, b) => a - b), sigs, lines }));
console.log(lines.length, "lines,", gids.size, "glyphs");
