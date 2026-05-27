import type { ComponentType } from "react";

function FlagEn({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden>
      <rect width="24" height="16" fill="#012169" />
      <path d="M0 0l24 16M24 0L0 16" stroke="#fff" strokeWidth="2.5" />
      <path d="M0 0l24 16M24 0L0 16" stroke="#C8102E" strokeWidth="1.2" />
      <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="4" />
      <path d="M12 0v16M0 8h24" stroke="#C8102E" strokeWidth="2.2" />
    </svg>
  );
}

function FlagDe({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden>
      <rect width="24" height="5.33" y="0" fill="#000" />
      <rect width="24" height="5.33" y="5.33" fill="#DD0000" />
      <rect width="24" height="5.34" y="10.66" fill="#FFCE00" />
    </svg>
  );
}

function FlagNl({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden>
      <rect width="24" height="5.33" fill="#AE1C28" />
      <rect width="24" height="5.33" y="5.33" fill="#FFF" />
      <rect width="24" height="5.34" y="10.66" fill="#21468B" />
    </svg>
  );
}

function FlagFr({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden>
      <rect width="8" height="16" fill="#002395" />
      <rect width="8" height="16" x="8" fill="#fff" />
      <rect width="8" height="16" x="16" fill="#ED2939" />
    </svg>
  );
}

function FlagEs({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden>
      <rect width="24" height="16" fill="#AA151B" />
      <rect width="24" height="8" y="4" fill="#F1BF00" />
    </svg>
  );
}

function FlagIt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden>
      <rect width="8" height="16" fill="#009246" />
      <rect width="8" height="16" x="8" fill="#fff" />
      <rect width="8" height="16" x="16" fill="#CE2B37" />
    </svg>
  );
}

function FlagPl({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden>
      <rect width="24" height="8" fill="#fff" />
      <rect width="24" height="8" y="8" fill="#DC143C" />
    </svg>
  );
}

const FLAG_MAP: Record<string, ComponentType<{ className?: string }>> = {
  en: FlagEn,
  de: FlagDe,
  nl: FlagNl,
  fr: FlagFr,
  es: FlagEs,
  it: FlagIt,
  pl: FlagPl,
};

export function LanguageFlag({ code, className }: { code: string; className?: string }) {
  const Flag = FLAG_MAP[code] ?? FlagEn;
  return <Flag className={className} />;
}
