"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { BadgeCheck, CircleAlert, Clock, MailCheck } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import { cardSurface } from "@/components/ui/surface";
import { customerApi } from "@/lib/customer-api";

type Result = Awaited<ReturnType<typeof customerApi.confirmEmail>>["status"];

const MESSAGES: Record<Result, { title: string; text: string; tone: "ok" | "warn" }> = {
  verified: {
    title: "Your email is verified",
    text: "Thank you. Your email address is confirmed.",
    tone: "ok",
  },
  "already-verified": {
    title: "Already verified",
    text: "This email address was already confirmed with this link.",
    tone: "ok",
  },
  expired: {
    title: "This link has expired",
    text: "Verification links work for 24 hours. Sign in and choose “Resend verification email” on your account page to get a new one.",
    tone: "warn",
  },
  replaced: {
    title: "A newer link was sent",
    text: "This link was replaced by a newer verification email. Please use the link in the latest email.",
    tone: "warn",
  },
  invalid: {
    title: "This link is not valid",
    text: "The link may be incomplete or already used. Sign in and choose “Resend verification email” on your account page to get a new one.",
    tone: "warn",
  },
};

export function VerifyEmail() {
  const token = useSearchParams().get("token") ?? "";
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result | null>(token ? null : "invalid");

  const confirm = async () => {
    setPending(true);
    try {
      setResult((await customerApi.confirmEmail(token)).status);
    } catch {
      setResult("invalid");
    } finally {
      setPending(false);
    }
  };

  const message = result ? MESSAGES[result] : null;
  const Icon = !message
    ? MailCheck
    : message.tone === "ok"
      ? BadgeCheck
      : result === "expired"
        ? Clock
        : CircleAlert;

  return (
    <div className={`${cardSurface} mx-auto max-w-lg p-8 text-center sm:p-10`}>
      <span
        className={`mx-auto grid size-16 place-items-center rounded-full ${message?.tone === "warn" ? "bg-[#fbf3df] text-[#7a5a0c]" : "feature-medal"}`}
      >
        <Icon aria-hidden="true" className="size-7" strokeWidth={1.6} />
      </span>
      <div role="status" aria-live="polite">
        <h2 className="mt-5 font-display text-[1.7rem] font-semibold text-ink">
          {message ? message.title : "Confirm your email address"}
        </h2>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-muted">
          {message ? message.text : "Press the button below to confirm that this email address is yours."}
        </p>
      </div>
      {!result ? (
        <button
          type="button"
          onClick={confirm}
          disabled={pending}
          className={buttonClasses({ className: "mt-7 h-12 px-7 text-sm disabled:opacity-60" })}
        >
          {pending ? "Confirming…" : "Confirm my email"}
        </button>
      ) : (
        <a href="/account" className={buttonClasses({ className: "mt-7 h-12 px-7 text-sm" })}>
          Go to My Account
        </a>
      )}
    </div>
  );
}
