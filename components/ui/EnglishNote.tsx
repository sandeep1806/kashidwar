/** Small inline note: this block's prose is shown in English for the current locale. */
export default function EnglishNote({ text, className = "" }: { text: string; className?: string }) {
  return (
    <p className={`inline-flex items-center gap-1.5 text-xs text-kashi-ash/55 ${className}`} lang="en-x-note">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
      {text}
    </p>
  );
}
