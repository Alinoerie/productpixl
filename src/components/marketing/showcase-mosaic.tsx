import Image from "next/image";
import { SHOWCASE_HERO_MOSAIC } from "@/lib/showcase";

export function ShowcaseMosaic({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`grid grid-cols-2 gap-2 sm:gap-3 ${className}`}>
      {SHOWCASE_HERO_MOSAIC.map((item, i) => (
        <div
          key={item.image}
          className={`relative aspect-square overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)] shadow-[var(--shadow-md)] ${i === 0 ? "animate-fade-up" : ""}`}
          style={i > 0 ? { animationDelay: `${i * 60}ms` } : undefined}
        >
          <Image
            src={item.image}
            alt={item.alt}
            fill
            sizes="(max-width: 768px) 45vw, 240px"
            className="object-cover"
            priority={priority && i < 2}
          />
        </div>
      ))}
    </div>
  );
}
