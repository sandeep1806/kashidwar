#!/usr/bin/env python3
"""Heading-font subset, step 3 (see crawl-corpus.mjs for the whole pipeline).

Keeps only the glyphs HarfBuzz uses, at any shaping step, for the corpus
(final forms and the intermediate half-forms conjunct rules pass through),
plus the corpus codepoints. Layout closure is off, so conjuncts the corpus
never forms are dropped. shape.mjs re-shapes the corpus with the result and
must report zero mismatched lines.
"""
import json, os, sys
from fontTools import subset
from fontTools.ttLib import TTFont

HERE = os.path.dirname(__file__)
SRC = os.path.join(HERE, "TiroDevanagariHindi-Regular.ttf")  # github.com/google/fonts ofl/tirodevanagarihindi (OFL)
SHAPED = sys.argv[1] if len(sys.argv) > 1 else "/tmp/shaped.json"
OUT = os.path.join(HERE, "..", "..", "lib", "fonts", "tiro-devanagari-headings.woff2")

corpus = open(os.path.join(HERE, "corpus.txt"), encoding="utf8").read()
cps = sorted({ord(c) for c in corpus if c >= " "} | {0x20, 0x25CC, 0x200C, 0x200D, 0x0964, 0x0965})
gids = json.load(open(SHAPED))["gids"]

opt = subset.Options()
opt.layout_closure = False
opt.layout_features = ["*"]
opt.notdef_outline = True
opt.hinting = False
opt.desubroutinize = True
font = TTFont(SRC)
s = subset.Subsetter(opt)
s.populate(unicodes=cps, gids=gids)
s.subset(font)
font.save(os.path.join(HERE, "subset-check.ttf"))  # for shape.mjs verification (gitignored)
font.flavor = "woff2"
font.save(OUT)
print(f"{len(font.getGlyphOrder())} glyphs, {os.path.getsize(OUT)} bytes → {OUT}")
