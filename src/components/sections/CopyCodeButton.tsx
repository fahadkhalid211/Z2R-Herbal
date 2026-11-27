"use client";

import { Check, Copy } from "lucide-react";
import clsx from "clsx";
import { useRef } from "react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

const MESSAGES = {
  idle: "",
  copied: "Code copied to clipboard",
  manual: "Press Ctrl+C to copy the code",
} as const;

export function CopyCodeButton({ code }: { code: string }) {
  const { status, copy } = useCopyToClipboard();
  const codeRef = useRef<HTMLElement>(null);

  const onClick = async () => {
    if ((await copy(code)) === "manual" && codeRef.current) {
      const range = document.createRange();
      range.selectNodeContents(codeRef.current);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        data-status={status}
        aria-label={status === "copied" ? "Copied!" : `Use Code: ${code} (copy to clipboard)`}
        className={clsx(
          "group relative flex items-center gap-2 rounded-full border border-dashed px-5 py-2 text-sm transition-colors",
          status === "copied"
            ? "border-lime-400 bg-lime-400/15 text-lime-300"
            : "border-cream-50/55 hover:border-cream-50 hover:bg-cream-50/10",
        )}
      >
        {status === "copied" ? (
          <>
            <Check aria-hidden="true" className="size-4" /> Copied!
          </>
        ) : (
          <>
            Use Code:{" "}
            <strong ref={codeRef} className="font-semibold tracking-wide">
              {code}
            </strong>
            <Copy
              aria-hidden="true"
              className="size-3.5 opacity-70 transition-opacity group-hover:opacity-100"
            />
          </>
        )}
      </button>
      <span role="status" className="sr-only">
        {MESSAGES[status]}
      </span>
      {status === "manual" && (
        <span aria-hidden="true" className="text-xs text-gold-300">
          Press Ctrl+C to copy
        </span>
      )}
    </>
  );
}
