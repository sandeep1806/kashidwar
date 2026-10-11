import Icon, { type IconName } from "@/components/ui/Icon";

export interface DistanceItem {
  key: string;
  icon: IconName;
  label: string;
  /** Formatted km, e.g. "4.2 km" */
  distance: string;
  /** Formatted estimate, e.g. "about 25 min by auto or taxi" */
  estimate: string;
}

/**
 * "How to reach" as three cards (station, airport, Godowlia) with an icon, the
 * straight-line distance and a rough travel time, plus the map links.
 * Hook-free, so it renders inside <Static>.
 */
export default function DistanceCards({
  title,
  items,
  note,
  links,
}: {
  title: string;
  items: DistanceItem[];
  note: string;
  links: { href: string; label: string }[];
}) {
  return (
    <section>
      <h2 className="text-h3 text-kashi-white">{title}</h2>
      <ul className="mt-5 grid gap-3">
        {items.map((it) => (
          <li key={it.key} className="distance-card">
            <Icon name={it.icon} className="distance-icon" />
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug text-kashi-ash/85">{it.label}</p>
              <p className="mt-1 text-xs text-kashi-ash/60">{it.estimate}</p>
            </div>
            <p className="distance-km">{it.distance}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-kashi-ash/55">{note}</p>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {links.map((l) => (
          <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-kashi-diya underline decoration-kashi-diya/40 underline-offset-4 hover:text-kashi-marigold">
            <Icon name="pin" className="h-4 w-4" />
            {l.label}
          </a>
        ))}
      </p>
    </section>
  );
}
