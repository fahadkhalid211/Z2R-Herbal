import type { IconName } from "@/services/types";

interface BotanicalIconProps {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}

const PATHS: Record<Exclude<IconName, "pakistan-flag">, string[]> = {
  leaf: ["M4.5 19.5C4.5 11 10 5 19.5 4.5C19.5 13 14 19 4.5 19.5Z", "M4.5 19.5L13 11"],
  leaves: [
    "M12 21v-7",
    "M12 14C12 9 8.5 5.5 3.5 5.5C3.5 10.5 7 14 12 14Z",
    "M12 14C12 8 15.5 3.5 20.5 3.5C20.5 9.5 17 14 12 14Z",
    "M12 14L6.5 8.5",
    "M12 14L17.5 6.5",
  ],
  flask: [
    "M9 3h6",
    "M10 3v6.2L4.8 18a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3L14 9.2V3",
    "M7.2 14.5h9.6",
    "M10.5 17.6a.8.8 0 1 0 0-.01",
  ],
  truck: [
    "M3 6h10.5v10H3z",
    "M13.5 9.5h4l3 3.5V16h-7",
    "M8.8 17.5a1.8 1.8 0 1 1-3.6 0a1.8 1.8 0 1 1 3.6 0",
    "M18.8 17.5a1.8 1.8 0 1 1-3.6 0a1.8 1.8 0 1 1 3.6 0",
  ],
  "shield-check": [
    "M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6L12 3z",
    "M8.5 12l2.5 2.5 4.5-5",
  ],
  drop: ["M12 3.5S5.5 10.5 5.5 14.75a6.5 6.5 0 0 0 13 0C18.5 10.5 12 3.5 12 3.5z", "M9 15.5a3 3 0 0 0 3 3"],
  "hair-sprout": [
    "M12 21.5c-1.4 0-2.2-.9-2.2-2 0-1.3 1-2.2 2.2-2.2s2.2.9 2.2 2.2c0 1.1-.8 2-2.2 2z",
    "M12 17.3c0-4 1.5-6.5 0-10.5",
    "M12.6 11c1.8-.2 3.6-1.4 4.4-3.5-2.1-.2-3.8.9-4.4 3.5z",
    "M11.6 8.3C9.9 8 8.4 6.8 7.8 4.8c2 0 3.5 1.2 3.8 3.5z",
    "M5 21.5h3.5M15.5 21.5H19",
  ],
  "hair-strands": [
    "M6 3c-1.5 3 1.5 6 0 9s1.5 6 0 9",
    "M12 3c-1.5 3 1.5 6 0 9s1.5 6 0 9",
    "M18 3c-1.5 3 1.5 6 0 9s1.5 6 0 9",
  ],
  sparkles: [
    "M10 3.5l1.6 4.4 4.4 1.6-4.4 1.6L10 15.5l-1.6-4.4L4 9.5l4.4-1.6L10 3.5z",
    "M18 13.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z",
    "M17.5 3.5v3M16 5h3",
  ],
};

function PakistanFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="1.5" fill="#01411c" />
      <path d="M3.5 5H7v14H3.5A1.5 1.5 0 0 1 2 17.5v-11A1.5 1.5 0 0 1 3.5 5z" fill="#fff" />
      <path d="M15.6 8.6a3.6 3.6 0 1 0 3.1 5.6 3 3 0 1 1-3.1-5.6z" fill="#fff" />
      <path d="M18.3 9.2l.35 1.05h1.1l-.9.65.35 1.05-.9-.65-.9.65.35-1.05-.9-.65h1.1z" fill="#fff" />
    </svg>
  );
}

export function BotanicalIcon({ name, className, strokeWidth = 1.5 }: BotanicalIconProps) {
  if (name === "pakistan-flag") return <PakistanFlag className={className} />;
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} pathLength={1} />
      ))}
    </svg>
  );
}
