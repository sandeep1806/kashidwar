import type { PlaceType } from "@/lib/contentTypes";

/**
 * Placeholder art for places without a photograph: a gold line silhouette of
 * the place *type* (ghat steps, temple shikhara, stupa, minarets, spire…) on
 * the faith-tinted gradient — so a row of cards is never twelve identical
 * glyphs. Replaced automatically when a photo exists.
 */
const P: Record<PlaceType, React.ReactNode> = {
  ghat: (<><path d="M8 70h84M14 60h72M20 50h60M26 40h48" /><path d="M8 78c10 3 20 3 30 0s20-3 30 0 20 3 24 0" /><circle cx="50" cy="30" r="3" /><path d="M50 27c2-3 2-6 0-9-2 3-2 6 0 9z" /></>),
  temple: (<><path d="M30 78V52h40v26M36 52c0-14 6-24 14-34 8 10 14 20 14 34" /><path d="M50 18v-8M46 12l4-4 4 4" /><path d="M44 78V64a6 6 0 0 1 12 0v14M22 78h56" /></>),
  stupa: (<><path d="M18 78h64M24 78c0-22 12-34 26-34s26 12 26 34" /><path d="M44 44h12v-8H44zM50 36V16M46 22h8M47 28h6" /></>),
  monastery: (<><path d="M20 78V48l30-18 30 18v30M14 50l36-22 36 22" /><path d="M44 78V62h12v16M28 58h8v8h-8zM64 58h8v8h-8z" /><circle cx="50" cy="42" r="4" /></>),
  mosque: (<><path d="M30 78V50h40v28M30 50c0-12 9-20 20-20s20 8 20 20" /><path d="M50 30v-8M48 22a2 2 0 1 0 4 0" /><path d="M18 78V34M82 78V34M16 34h4M80 34h4M18 34l0-8M82 34v-8" /><path d="M44 78V64a6 6 0 0 1 12 0v14" /></>),
  church: (<><path d="M30 78V44l20-12 20 12v34M50 32V14M44 20h12" /><path d="M44 78V62a6 6 0 0 1 12 0v16M24 78h52" /><path d="M38 52h4v6h-4zM58 52h4v6h-4z" /></>),
  gurudwara: (<><path d="M28 78V52h44v26M34 52c0-12 7-20 16-22 9 2 16 10 16 22" /><path d="M50 30v-6M16 78V20M16 20l14 5-14 5" /><path d="M44 78V64a6 6 0 0 1 12 0v14" /></>),
  math: (<><path d="M22 78V50h56v28M18 50h64l-8-10H26z" /><path d="M44 78V62h12v16M50 40V24M50 24l10 4-10 4" /></>),
  fort: (<><path d="M14 78V44h8v6h8v-6h8v6h8v-6h8v6h8v-6h8v6h8v-6h8v34z" /><path d="M42 78V62a8 8 0 0 1 16 0v16M20 58h6v8h-6zM74 58h6v8h-6z" /></>),
  museum: (<><path d="M16 42h68L50 22zM20 42v32M34 42v32M50 42v32M66 42v32M80 42v32M14 78h72" /></>),
  university: (<><path d="M18 78V46h64v32M14 46h72L50 26z" /><path d="M28 78V60a6 6 0 0 1 12 0v18M60 78V60a6 6 0 0 1 12 0v18M46 78V58a4 4 0 0 1 8 0v20" /></>),
  heritage: (<><path d="M22 78V46a28 28 0 0 1 56 0v32M32 78V48a18 18 0 0 1 36 0v30M14 78h72" /></>),
};

export default function PlaceArt({ type, className = "" }: { type: PlaceType; className?: string }) {
  return (
    <svg viewBox="0 0 100 90" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[type] ?? P.heritage}
    </svg>
  );
}
