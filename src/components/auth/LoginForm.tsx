"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { TextField } from "@/components/ui/TextField";
import { describeApiError } from "@/lib/customer-api";
import { fieldErrors, loginSchema } from "@/lib/validation";
import { useAuth } from "./AuthProvider";

function safeNext(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

export function LoginForm() {
  const { status, login } = useAuth();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace(next);
  }, [status, next, router]);

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setPending(true);
    try {
      await login(parsed.data);
      router.replace(next);
    } catch (error) {
      setFormError(describeApiError(error, "account"));
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <TextField
        label="Email address"
        type="email"
        name="email"
        autoComplete="email"
        value={values.email}
        onChange={set("email")}
        error={errors.email}
      />
      <TextField
        label="Password"
        type="password"
        name="password"
        autoComplete="current-password"
        value={values.password}
        onChange={set("password")}
        error={errors.password}
      />
      <p className="-mt-2 text-right text-[0.88rem]">
        <Link
          href="/forgot-password"
          prefetch={false}
          className="font-medium text-forest-700 underline decoration-forest-600/30 underline-offset-4 hover:decoration-forest-600"
        >
          Forgot password?
        </Link>
      </p>
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
        {pending ? "Signing in…" : "Login"}
      </button>
      <p className="text-center text-[0.92rem] text-ink-muted">
        New to Z2R Herbal?{" "}
        <Link
          href={next === "/account" ? "/register" : `/register?next=${encodeURIComponent(next)}`}
          prefetch={false}
          className="font-semibold text-forest-700 underline decoration-forest-600/30 underline-offset-4 hover:decoration-forest-600"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
