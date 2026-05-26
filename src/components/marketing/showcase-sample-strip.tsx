import Image from "next/image";
import { SHOWCASE_CASE_STUDIES } from "@/lib/showcase";

/** Horizontal strip of real outputs for grader / footer CTAs */
export function ShowcaseSampleStrip() {
  const images = SHOWCASE_CASE_STUDIES.flatMap((study) =>
    study.modules.slice(0, 2).map((mod) => ({
      key: `${study.id}-${mod.moduleId}`,
      image: mod.image,
      alt: mod.alt,
      label: study.product,
    })),
  ).slice(0, 6);

  return (
    <div className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-6">
      {images.map((item) => (
        <div
          key={item.key}
          className="group relative aspect-square overflow-hidden rounded-xl border border-white/10"
        >
          <Image
            src={item.image}
            alt={item.alt}
            fill
            sizes="120px"
            className="object-cover opacity-90 transition group-hover:scale-105 group-hover:opacity-100"
          />
        </div>
      ))}
    </div>
  );
}
