"use client";

import Image from "next/image";
import { useState } from "react";
import clsx from "clsx";
import { cssVars } from "@/lib/css-vars";
import type { ImageAsset } from "@/services/types";

interface ProductGalleryProps {
  images: ImageAsset[];
  glow: string;
}

export function ProductGallery({ images, glow }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const active = images[index] ?? images[0];
  if (!active) return null;

  return (
    <div>
      <div
        className="product-card relative isolate aspect-square overflow-hidden rounded-[32px] border border-cream-200 bg-gradient-to-b from-white to-cream-100 shadow-[0_30px_70px_-40px_rgb(1_35_19/0.55)]"
        style={cssVars({ "--glow": glow })}
      >
        <span aria-hidden="true" className="card-glow absolute inset-[14%] rounded-full opacity-100" />
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 aspect-square h-[74%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold-500/30"
        />
        <Image
          key={active.src}
          src={active.src}
          alt={active.alt}
          fill
          priority
          sizes="(min-width: 1024px) 560px, 92vw"
          className="object-contain p-[9%]"
        />
      </div>

      {images.length > 1 && (
        <ul className="mt-4 flex gap-3" aria-label="Product images">
          {images.map((image, i) => (
            <li key={image.src}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1} of ${images.length}: ${image.alt}`}
                aria-pressed={i === index}
                className={clsx(
                  "relative block size-20 overflow-hidden rounded-2xl border bg-white transition-[border-color,box-shadow,translate] duration-(--dur-card) hover:-translate-y-0.5 sm:size-24",
                  i === index
                    ? "border-forest-600 shadow-[0_10px_24px_-14px_rgb(1_35_19/0.7)]"
                    : "border-cream-200",
                )}
              >
                <Image src={image.src} alt={image.alt} fill sizes="96px" className="object-contain p-2" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
