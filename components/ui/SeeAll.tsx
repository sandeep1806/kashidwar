/** "See all →" under a home-page carousel (phones and tablets only; the grid above lg shows everything). */
export default function SeeAll({ href, label }: { href: string; label: string }) {
  return (
    <p className="see-all-sm container-kashi mt-4 text-center">
      <a href={href} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-kashi-diya/40 px-5 text-sm text-kashi-diya transition-colors hover:border-kashi-marigold hover:text-kashi-marigold">
        {label}
        <span aria-hidden="true">→</span>
      </a>
    </p>
  );
}
