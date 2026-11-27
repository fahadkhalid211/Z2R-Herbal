"use client";

import { useRef, useState } from "react";
import { AlertCircle, Play } from "lucide-react";
import clsx from "clsx";
import { LEAF_PATH } from "@/components/hero/StageDecor";
import { buttonClasses } from "@/components/ui/Button";
import type { Video } from "@/services/types";

type Status = "idle" | "loading" | "playing" | "paused" | "error";

interface VideoShowcaseProps {
  videos: Video[];
  children: React.ReactNode;
}

export function VideoShowcase({ videos, children }: VideoShowcaseProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [activeId, setActiveId] = useState(videos[0]?.id);
  const [status, setStatus] = useState<Status>("idle");
  const active = videos.find((v) => v.id === activeId) ?? videos[0];
  if (!active) return null;
  const started = status !== "idle";

  const play = () => {
    const el = ref.current;
    if (!el) return;
    setStatus("loading");
    const box = el.getBoundingClientRect();
    if (box.top < 0 || box.bottom > window.innerHeight) el.scrollIntoView({ block: "center" });
    el.play().catch(() => setStatus((s) => (s === "error" ? s : "paused")));
  };

  const select = (id: string) => {
    if (id === active.id) return;
    ref.current?.pause();
    setActiveId(id);
    setStatus("idle");
  };

  return (
    <section
      id="watch"
      aria-labelledby="watch-title"
      className="container-page scroll-mt-24 pb-20 defer-render lg:pb-28"
    >
      <div className="relative isolate overflow-hidden rounded-[32px] bg-forest-800 bg-[radial-gradient(90%_90%_at_0%_0%,#1d5528_0%,transparent_60%),radial-gradient(70%_80%_at_100%_100%,#0b3d22_0%,transparent_70%)] px-6 py-12 text-cream-50 sm:px-10 lg:grid lg:grid-cols-[1fr_1.3fr] lg:items-center lg:gap-12 lg:px-14 lg:py-16">
        <svg
          aria-hidden="true"
          viewBox="0 0 40 62"
          className="absolute -bottom-10 -left-6 -z-10 w-32 rotate-[35deg] text-lime-400/10 lg:w-44"
        >
          <path d={LEAF_PATH} fill="currentColor" />
        </svg>
        <svg
          aria-hidden="true"
          viewBox="0 0 40 62"
          className="absolute -top-12 right-[30%] -z-10 w-28 rotate-[200deg] text-lime-400/[0.07] lg:w-40"
        >
          <path d={LEAF_PATH} fill="currentColor" />
        </svg>

        <div className="text-center lg:text-left">
          {children}
          <div className="mt-8">
            <button
              type="button"
              onClick={play}
              className={buttonClasses({ className: "h-12 px-6 text-sm" })}
            >
              Watch Video <Play aria-hidden="true" className="size-4 fill-current" />
            </button>
          </div>
        </div>

        <div className="mt-10 lg:mt-0" data-reveal="fade">
          <figure>
            <div className="video-frame relative aspect-video overflow-hidden rounded-[24px] bg-forest-950 shadow-[0_40px_70px_-34px_rgb(0_0_0/0.8)] ring-1 ring-cream-50/12">
              <video
                key={active.id}
                ref={ref}
                preload="none"
                playsInline
                poster={active.poster}
                width={active.width}
                height={active.height}
                controls={started}
                aria-label={active.title}
                className="size-full object-cover"
                onPlaying={() => setStatus("playing")}
                onWaiting={() => setStatus("loading")}
                onPause={() => setStatus((s) => (s === "error" ? s : "paused"))}
                onError={() => setStatus("error")}
              >
                <source src={active.src} type={active.type} onError={() => setStatus("error")} />
              </video>

              <button
                type="button"
                onClick={play}
                aria-label={`Play video: ${active.title}`}
                data-hidden={started}
                tabIndex={started ? -1 : 0}
                className="group absolute inset-0 grid place-items-center bg-[radial-gradient(closest-side,rgb(1_21_13/0.3),transparent)] transition-opacity duration-500 data-[hidden=true]:pointer-events-none data-[hidden=true]:opacity-0"
              >
                <span className="grid size-16 place-items-center rounded-full bg-cream-50/95 text-forest-900 shadow-[0_16px_40px_-12px_rgb(0_0_0/0.6)] ring-8 ring-cream-50/20 transition-[scale,box-shadow] duration-(--dur-card) group-hover:scale-110 group-hover:ring-cream-50/30 sm:size-20">
                  <Play aria-hidden="true" className="ml-1 size-7 fill-current" />
                </span>
              </button>

              {status === "loading" && (
                <span role="status" className="pointer-events-none absolute inset-0 grid place-items-center">
                  <span className="video-spinner size-12 rounded-full border-4 border-cream-50/25 border-t-lime-300" />
                  <span className="sr-only">Loading video…</span>
                </span>
              )}
              {status === "error" && (
                <p
                  role="alert"
                  className="absolute inset-0 grid place-items-center bg-forest-950/85 px-6 text-center text-sm text-cream-50"
                >
                  <span className="flex items-center gap-2">
                    <AlertCircle aria-hidden="true" className="size-5 text-gold-300" />
                    This video can&apos;t be played right now.
                  </span>
                </p>
              )}
            </div>
            <figcaption className="mt-4 flex flex-col gap-1 text-left sm:flex-row sm:items-baseline sm:gap-3">
              <span className="font-display text-lg font-semibold">{active.title}</span>
              {active.description && <span className="text-sm text-cream-50/70">{active.description}</span>}
            </figcaption>
          </figure>

          {videos.length > 1 && (
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="More videos">
              {videos.map((video) => (
                <li key={video.id}>
                  <button
                    type="button"
                    onClick={() => select(video.id)}
                    aria-pressed={video.id === active.id}
                    className={clsx(
                      "group block w-full overflow-hidden rounded-2xl text-left ring-1 transition-[box-shadow,translate] duration-(--dur-card) hover:-translate-y-0.5",
                      video.id === active.id ? "ring-2 ring-lime-300" : "ring-cream-50/15",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- posters may be remote (CMS/CDN) */}
                    <img
                      src={video.poster}
                      alt=""
                      loading="lazy"
                      className="aspect-video w-full object-cover"
                    />
                    <span className="block truncate px-3 py-2 text-xs text-cream-50/85">{video.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
