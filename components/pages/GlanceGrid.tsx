import type { ReactNode } from "react";
import Icon, { type IconName } from "@/components/ui/Icon";

export interface GlanceTile {
  icon: IconName;
  label: string;
  value: ReactNode;
  /** Small line under the value (e.g. "15 min walk") */
  note?: ReactNode;
  href?: string;
}

/**
 * "At a glance" tiles: icon, small label, short value. Enumerated facts
 * (crowd, photography, dress) and the nearest listed place. Hook-free.
 */
export default function GlanceGrid({ title, items, footnote }: { title: string; items: GlanceTile[]; footnote?: ReactNode }) {
  const list = items.filter((it) => it.value);
  if (!list.length) return null;
  return (
    <section>
      <h2 className="text-h3 text-kashi-white">{title}</h2>
      <ul className="glance-grid mt-5">
        {list.map((it) => {
          const body = (
            <>
              <Icon name={it.icon} className="glance-icon" />
              <span className="glance-label">{it.label}</span>
              <span className="glance-value">
                {it.value}
                {it.note && <span className="glance-note">{it.note}</span>}
              </span>
            </>
          );
          return (
            <li key={it.label}>
              {it.href ? <a href={it.href} className="glance-tile card-lift">{body}</a> : <div className="glance-tile">{body}</div>}
            </li>
          );
        })}
      </ul>
      {footnote && <p className="mt-3 flex items-start gap-1.5 text-xs text-kashi-ash/60"><Icon name="info" className="mt-0.5 h-3.5 w-3.5 shrink-0" />{footnote}</p>}
    </section>
  );
}
