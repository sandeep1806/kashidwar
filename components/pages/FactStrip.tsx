import type { ReactNode } from "react";
import Icon, { type IconName } from "@/components/ui/Icon";

export interface Fact {
  icon: IconName;
  label: string;
  value: ReactNode;
}

/**
 * The row of icon facts under a page's photo hero (timings, entry, time
 * needed, best time): a 2-column grid on phones, one row on wide screens.
 * Hook-free, so it renders inside <Static>.
 */
export default function FactStrip({ items, className = "" }: { items: Fact[]; className?: string }) {
  const list = items.filter((it) => it.value);
  if (!list.length) return null;
  return (
    <ul className={`fact-strip ${className}`}>
      {list.map((it) => (
        <li key={it.label} className="fact">
          <Icon name={it.icon} className="fact-icon" />
          <div className="min-w-0">
            <span className="fact-label">{it.label}</span>
            <span className="fact-value">{it.value}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
