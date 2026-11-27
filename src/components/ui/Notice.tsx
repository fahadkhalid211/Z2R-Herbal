import { AlertCircle, Check, Info } from "lucide-react";
import { cn } from "@/lib/cn";

const TONES = {
  info: {
    box: "border-forest-600/20 bg-forest-600/[0.06] text-forest-900",
    Icon: Info,
    icon: "text-forest-600",
  },
  error: {
    box: "border-[#b3261e]/25 bg-[#b3261e]/[0.06] text-[#7a1a14]",
    Icon: AlertCircle,
    icon: "text-[#b3261e]",
  },
  success: {
    box: "border-forest-600/25 bg-lime-300/25 text-forest-900",
    Icon: Check,
    icon: "text-forest-600",
  },
} as const;

interface NoticeProps {
  tone?: keyof typeof TONES;
  title?: string;
  role?: "alert" | "status";
  className?: string;
  children: React.ReactNode;
}

export function Notice({ tone = "info", title, role, className, children }: NoticeProps) {
  const { box, Icon, icon } = TONES[tone];
  return (
    <div
      role={role}
      className={cn(
        "flex gap-3 rounded-2xl border px-4 py-3.5 text-[0.9rem] leading-relaxed",
        box,
        className,
      )}
    >
      <Icon aria-hidden="true" className={cn("mt-0.5 size-[18px] shrink-0", icon)} strokeWidth={2} />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children}
      </div>
    </div>
  );
}
