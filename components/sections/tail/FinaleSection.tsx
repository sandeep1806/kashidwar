import Reveal from "@/components/motion/Reveal";
import Static from "@/components/ui/Static";
import type { FinaleProps } from "@/lib/sectionProps";
import AartiFlames from "../AartiFlames";
import AartiLamps from "../AartiLamps";

export default function FinaleSection({ closing, closingSecondary }: FinaleProps) {
  return (
    <>
      <div className="relative mt-16">
        <AartiFlames />
        <Static>
          <AartiLamps />
        </Static>
        <div aria-hidden="true" className="mx-auto mt-0 h-px w-3/4 max-w-3xl bg-gradient-to-r from-transparent via-kashi-diya/70 to-transparent" />
      </div>
      <Static>
        <Reveal>
          <p className="mt-14 font-display text-2xl text-kashi-diya text-glow">{closing}</p>
          <p className="mt-2 text-sm text-kashi-ash/60">{closingSecondary}</p>
        </Reveal>
      </Static>
    </>
  );
}
