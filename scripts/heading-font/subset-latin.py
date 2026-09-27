#!/usr/bin/env python3
"""Latin heading face: Cormorant Garamond at weight 600 only, subset by range.

Google's Latin subset is a 38 KB variable file (300-700) and was deferred to
idle, so every Latin heading first painted in Georgia and relaid out later.
Only weight 600 is used (h1-h4, .bilingual-secondary), so this pins the wght
axis at 600 and keeps the ranges the display text can contain in any locale:
Basic Latin, Latin-1, Latin Extended-A, the IAST letters used in
transliterations, and common punctuation. The output is preloaded and set to
font-display: swap (lib/fonts.ts).

    python3 scripts/heading-font/subset-latin.py

Source: github.com/google/fonts ofl/cormorantgaramond (OFL, see OFL-Cormorant.txt).
"""
import os
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

HERE = os.path.dirname(__file__)
SRC = os.path.join(HERE, "CormorantGaramond-VF.ttf")
OUT = os.path.join(HERE, "..", "..", "lib", "fonts", "cormorant-headings.woff2")

RANGES = [
    (0x20, 0x7E), (0xA0, 0xFF), (0x100, 0x17F),
    (0x1E0C, 0x1E0D), (0x1E24, 0x1E25), (0x1E36, 0x1E39), (0x1E40, 0x1E47),  # Ḍḍ Ḥḥ Ḷḷ Ḹḹ Ṁ–ṇ
    (0x1E5A, 0x1E5D), (0x1E62, 0x1E63), (0x1E6C, 0x1E6D),                  # Ṛṛ Ṝṝ Ṣṣ Ṭṭ
    (0x2010, 0x2027), (0x2030, 0x203A), (0x20B9, 0x20B9), (0x2122, 0x2122),  # dashes, quotes, …, ₹, ™
]
cps = sorted({c for a, b in RANGES for c in range(a, b + 1)})

font = TTFont(SRC)
font = instancer.instantiateVariableFont(font, {"wght": 600}, updateFontNames=False)
opt = subset.Options()
opt.layout_features = ["kern", "liga", "clig", "calt", "ccmp", "locl", "mark", "mkmk"]
opt.notdef_outline = True
opt.hinting = False
opt.desubroutinize = True
opt.name_IDs = ["*"]
opt.flavor = "woff2"
s = subset.Subsetter(opt)
s.populate(unicodes=cps)
s.subset(font)
subset.save_font(font, OUT, opt)
print(OUT, os.path.getsize(OUT), "bytes,", len(font.getBestCmap()), "codepoints")
