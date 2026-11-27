"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { TextField } from "@/components/ui/TextField";
import { customerApi, describeApiError, errorFields } from "@/lib/customer-api";
import { emailSchema, passwordSchema } from "@/lib/validation";

const SENT = "If an account exists for this email, we sent a 6-digit code. It is valid for 15 minutes.";

const link =
  "font-semibold text-forest-700 underline decoration-forest-600/30 underline-offset-4 hover:decoration-forest-600";

export function ForgotPasswordForm() {
  const [step, setStep] = useState<"email" | "code" | "done">("email");
  const [values, setValues] = useState({ email: "", code: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const t = window.setTimeout(() => setWait((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [wait]);

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const run = async (action: () => Promise<void>) => {
    setFormError("");
    setPending(true);
    try {
      await action();
    } catch (error) {
      setErrors(errorFields(error));
      setFormError(describeApiError(error, "account"));
    } finally {
      setPending(false);
    }
  };

  const sendCode = (e?: React.FormEvent) => {
    e?.preventDefault();
    const email = emailSchema.safeParse(values.email);
    if (!email.success) {
      setErrors({ email: email.error.issues[0]?.message ?? "Please enter a valid email address." });
      return;
    }
    setErrors({});
    return run(async () => {
      setWait(await customerApi.requestPasswordReset(email.data));
      setStep("code");
    });
  };

  const reset = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!/^\d{6}$/.test(values.code.trim())) next.code = "Enter the 6-digit code from the email.";
    const password = passwordSchema.safeParse(values.password);
    if (!password.success) next.password = password.error.issues[0]?.message ?? "Please choose a password.";
    else if (values.password !== values.confirmPassword) next.confirmPassword = "The passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length) return;
    return run(async () => {
      await customerApi.resetPassword({ ...values, code: values.code.trim() });
      setStep("done");
    });
  };

  if (step === "done")
    return (
      <div className="space-y-5">
        <Notice tone="success" role="status" title="Your password has been changed.">
          You can now log in with your new password.
        </Notice>
        <Link href="/login" prefetch={false} className={buttonClasses({ className: "w-full" })}>
          Log in
        </Link>
      </div>
    );

  return step === "email" ? (
    <form onSubmit={sendCode} noValidate className="space-y-5">
      <p className="text-[0.95rem] leading-relaxed text-ink-muted">
        Enter the email address of your account and we will email you a code to reset your password.
      </p>
      <TextField
        label="Email address"
        type="email"
        name="email"
        autoComplete="email"
        value={values.email}
        onChange={set("email")}
        error={errors.email}
      />
      {formError && (
        <Notice tone="error" role="alert">
          {formError}
        </Notice>
      )}
      <button
        type="submit"
        disabled={pending}
        className={buttonClasses({ className: "w-full disabled:opacity-60" })}
      >
        {pending ? "Sending…" : "Send Reset Code"}
      </button>
      <p className="text-center text-[0.92rem] text-ink-muted">
        Remembered it?{" "}
        <Link href="/login" prefetch={false} className={link}>
          Back to login
        </Link>
      </p>
    </form>
  ) : (
    <form onSubmit={reset} noValidate className="space-y-5">
      <Notice tone="success" role="status">
        {SENT}
      </Notice>
      <TextField
        label="6-digit code"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={values.code}
        onChange={set("code")}
        error={errors.code}
      />
      <TextField
        label="New password"
        type="password"
        name="password"
        autoComplete="new-password"
        hint="At least 12 characters."
        value={values.password}
        onChange={set("password")}
        error={errors.password}
      />
      <TextField
        label="Confirm new password"
        type="password"
        name="confirmPassword"
        autoComplete="new-password"
        value={values.confirmPassword}
        onChange={set("confirmPassword")}
        error={errors.confirmPassword}
      />
      {formError && (
        <Notice tone="error" role="alert">
          {formError}
        </Notice>
      )}
      <button
        type="submit"
        disabled={pending}
        className={buttonClasses({ className: "w-full disabled:opacity-60" })}
      >
        {pending ? "Saving…" : "Reset Password"}
      </button>
      <p className="text-center text-[0.92rem] text-ink-muted">
        No email?{" "}
        {wait > 0 ? (
          <span>Check your spam folder, or send a new code in {wait}s.</span>
        ) : (
          <button type="button" onClick={() => sendCode()} disabled={pending} className={link}>
            Send a new code
          </button>
        )}
      </p>
    </form>
  );
}
