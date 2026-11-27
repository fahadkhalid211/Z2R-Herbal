import type { SiteConfig } from "@/services/types";

type Platform = SiteConfig["socials"][number]["platform"];

const GLYPHS: Record<Platform, React.ReactNode> = {
  facebook: (
    <path
      d="M14 8h2.5V4.5H14A4 4 0 0 0 10 8.5V11H7.5v3.5H10V21h3.5v-6.5h2.6l.6-3.5h-3.2V8.6c0-.3.2-.6.5-.6z"
      fill="currentColor"
    />
  ),
  instagram: (
    <g fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r=".6" fill="currentColor" stroke="none" />
    </g>
  ),
  youtube: (
    <g>
      <rect
        x="2.5"
        y="5.5"
        width="19"
        height="13"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M10.2 9.2v5.6l4.8-2.8z" fill="currentColor" />
    </g>
  ),
  tiktok: (
    <path
      d="M15.5 3.5c.4 2.3 1.9 3.8 4 4v3.1a7.2 7.2 0 0 1-4-1.3v6.1a5.4 5.4 0 1 1-5.4-5.4c.3 0 .6 0 .9.1v3.2a2.3 2.3 0 1 0 1.4 2.1V3.5h3.1z"
      fill="currentColor"
    />
  ),
};

export function SocialIcon({ platform, className }: { platform: Platform; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {GLYPHS[platform]}
    </svg>
  );
}
