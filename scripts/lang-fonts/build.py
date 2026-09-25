#!/usr/bin/env python3
"""Tiny per-script font subsets for the language names.

The language switcher and the footer list every locale in its own script
("தமிழ்", "ਪੰਜਾਬੀ", …). Loading each full Noto Sans family for one word costs
30–100 KB per script; these subsets contain only the characters of each
script's native language names and greetings (lib/i18n/locales.ts), at
Regular weight: 1–3 KB each, so all 13 names render in matching faces.

  pip install fonttools brotli; npm i --no-save harfbuzzjs (for the shaping step)
  python3 scripts/lang-fonts/build.py <dir with the Noto Sans variable TTFs>

Sources: github.com/google/fonts ofl/notosans*/NotoSans*[wdth,wght].ttf (OFL;
licence in scripts/lang-fonts/OFL.txt). scripts/heading-font/check.mjs
verifies, on every build, that each subset still covers its names.
"""
import json, os, re, subprocess, sys, tempfile
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..", "..")
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "src")
OUT = os.path.join(ROOT, "lib", "fonts", "lang")
FILES = {
    "latin": "NotoSans", "devanagari": "NotoSansDevanagari", "tamil": "NotoSansTamil", "telugu": "NotoSansTelugu",
    "kannada": "NotoSansKannada", "malayalam": "NotoSansMalayalam", "bengali": "NotoSansBengali",
    "oriya": "NotoSansOriya", "gujarati": "NotoSansGujarati", "gurmukhi": "NotoSansGurmukhi",
}

src_ts = open(os.path.join(ROOT, "lib", "i18n", "locales.ts"), encoding="utf8").read()
text = {}   # script -> all characters (cmap)
lines = {}  # script -> the words themselves (shaped to find the glyphs used)
for m in re.finditer(r'^\s+\w+: \{[^}]*?nativeName: "([^"]+)", sample: "([^"]+)", script: "(\w+)"', src_ts, re.M):
    native, sample, script = m.groups()
    text[script] = text.get(script, "") + native + sample
    lines.setdefault(script, []).extend([native, sample])
os.makedirs(OUT, exist_ok=True)
for script, chars in sorted(text.items()):
    font = TTFont(os.path.join(SRC, FILES[script] + "[wdth,wght].ttf"))
    font = instancer.instantiateVariableFont(font, {"wght": 400, "wdth": 100})
    # Keep only glyphs HarfBuzz uses (at any shaping step) for these words, as
    # for the heading font; layout closure would add every conjunct.
    tmp = tempfile.mkdtemp()
    inst, corpus, shaped = (os.path.join(tmp, n) for n in ("inst.ttf", "corpus.txt", "shaped.json"))
    font.save(inst)
    open(corpus, "w", encoding="utf8").write("\n".join(lines[script]))
    subprocess.run(["node", os.path.join(ROOT, "scripts", "heading-font", "shape.mjs"), inst, corpus, shaped, "--all"], check=True, capture_output=True)
    gids = json.load(open(shaped))["gids"]
    opt = subset.Options()
    opt.layout_closure = False
    opt.layout_features = ["*"]
    opt.hinting = False
    opt.desubroutinize = True
    opt.notdef_outline = True
    opt.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14]
    s = subset.Subsetter(opt)
    s.populate(text=chars + " ", gids=gids)
    s.subset(font)
    check = os.path.join(tmp, "check.ttf")
    font.save(check)
    # verify: same glyph outlines/advances as the full font for every word
    subprocess.run(["node", os.path.join(ROOT, "scripts", "heading-font", "shape.mjs"), check, corpus, os.path.join(tmp, "v.json"), "--all"], check=True, capture_output=True)
    a, v = json.load(open(shaped))["sigs"], json.load(open(os.path.join(tmp, "v.json")))["sigs"]
    if len(a) != len(lines[script]) or not all(a):
        sys.exit(f"{script}: shaping produced no glyphs for some words")
    if a != v:
        sys.exit(f"{script}: subset shapes differently from the full font")
    font.flavor = "woff2"
    path = os.path.join(OUT, f"{script}.woff2")
    font.save(path)
    print(f"{script:11} {len(font.getGlyphOrder()):3} glyphs {os.path.getsize(path):6} bytes  {''.join(sorted(set(chars)))[:40]}")
