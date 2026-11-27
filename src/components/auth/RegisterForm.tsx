"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { TextField } from "@/components/ui/TextField";
import { describeApiError, errorFields } from "@/lib/customer-api";
import { PASSWORD_MIN, fieldErrors, registerSchema } from "@/lib/validation";
import { useAuth } from "./AuthProvider";

const EMPTY = { name: "", email: "", phone: "", password: "", confirmPassword: "" };
type Field = keyof typeof EMPTY;

const ORDER: Field[] = ["name", "email", "phone", "password", "confirmPassword"];
const LABELS: Record<Field, string> = {
  name: "Full name",
  email: "Email address",
  phone: "Contact number",
  password: "Password",
  confirmPassword: "Confirm password",
};

const summary = (errors: Record<string, string>) =>
  ORDER.filter((f) => errors[f])
    .map((f) => `${LABELS[f]}: ${errors[f]}`)
    .join(" ");

export function RegisterForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { status, register } = useAuth();
  const router = useRouter();
  const nextParam = useSearchParams().get("next");
  const next = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/account";
  useEffect(() => {
    if (status === "authenticated") router.replace(next);
  }, [status, next, router]);

  const set = (key: Field) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key])
      setErrors((current) => Object.fromEntries(Object.entries(current).filter(([k]) => k !== key)));
  };

  const showErrors = (found: Record<string, string>) => {
    setErrors(found);
    const first = ORDER.find((f) => found[f]);
    if (first) (formRef.current?.elements.namedItem(first) as HTMLInputElement | null)?.focus();
    return first;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      const found = fieldErrors(parsed.error);
      showErrors(found);
      setFormError(summary(found));
      return;
    }
    setErrors({});
    setPending(true);
    try {
      const { name, email, phone, password } = parsed.data;
      await register({ name, email, phone, password });
      setValues(EMPTY);
      router.replace(next);
    } catch (error) {
      const found = errorFields(error);
      if (showErrors(found)) setFormError(summary(found));
      else setFormError(describeApiError(error, "account"));
    } finally {
      setPending(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-5">
      <TextField
        label={LABELS.name}
        name="name"
        autoComplete="name"
        value={values.name}
        onChange={set("name")}
        error={errors.name}
      />
      <TextField
        label={LABELS.email}
        type="email"
        name="email"
        autoComplete="email"
        value={values.email}
        onChange={set("email")}
        error={errors.email}
        hint="We will send a link to verify this address."
      />
      <TextField
        label={LABELS.phone}
        type="tel"
        name="phone"
        autoComplete="tel"
        inputMode="tel"
        value={values.phone}
        onChange={set("phone")}
        error={errors.phone}
      />
      <TextField
        label={LABELS.password}
        type="password"
        name="password"
        autoComplete="new-password"
        value={values.password}
        onChange={set("password")}
        error={errors.password}
        hint={`At least ${PASSWORD_MIN} characters.`}
      />
      <TextField
        label={LABELS.confirmPassword}
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
        {pending ? "Creating your account…" : "Create Account"}
      </button>
      <p className="text-center text-[0.92rem] text-ink-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          prefetch={false}
          className="font-semibold text-forest-700 underline decoration-forest-600/30 underline-offset-4 hover:decoration-forest-600"
        >
          Login
        </Link>
      </p>
    </form>
  );
}
