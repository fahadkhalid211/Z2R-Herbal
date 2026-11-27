"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { buttonClasses } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { TextField } from "@/components/ui/TextField";
import { type Customer, customerApi, describeApiError, errorFields } from "@/lib/customer-api";

export function ProfileForm({ customer, onDone }: { customer: Customer; onDone: () => void }) {
  const { refresh } = useAuth();
  const [values, setValues] = useState({ name: customer.name, phone: customer.phone ?? "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setErrors({});
    setFormError("");
    try {
      refresh(await customerApi.updateProfile(values));
      onDone();
    } catch (error) {
      setErrors(errorFields(error));
      setFormError(describeApiError(error, "account"));
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="mt-5 space-y-4">
      <TextField
        label="Full name"
        name="name"
        autoComplete="name"
        value={values.name}
        onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        error={errors.name}
      />
      <TextField
        label="Contact number"
        name="phone"
        type="tel"
        autoComplete="tel"
        value={values.phone}
        onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
        error={errors.phone}
      />
      {formError && !Object.keys(errors).length && (
        <Notice tone="error" role="alert">
          {formError}
        </Notice>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses({ className: "h-11 px-5 text-sm disabled:opacity-60" })}
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className={buttonClasses({ variant: "outline-dark", className: "h-11 px-5 text-sm" })}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const empty = { currentPassword: "", newPassword: "", confirmPassword: "" };
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [pending, setPending] = useState(false);
  const set = (key: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setErrors({});
    setMessage(null);
    try {
      await customerApi.changePassword(values);
      setValues(empty);
      setMessage({
        tone: "success",
        text: "Your password has been changed. Other devices have been signed out.",
      });
    } catch (error) {
      setErrors(errorFields(error));
      setMessage({ tone: "error", text: describeApiError(error, "account") });
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="mt-5 space-y-4">
      <TextField
        label="Current password"
        type="password"
        name="currentPassword"
        autoComplete="current-password"
        value={values.currentPassword}
        onChange={set("currentPassword")}
        error={errors.currentPassword}
      />
      <TextField
        label="New password"
        type="password"
        name="newPassword"
        autoComplete="new-password"
        value={values.newPassword}
        onChange={set("newPassword")}
        error={errors.newPassword}
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
      {message && (
        <Notice
          tone={message.tone === "error" ? "error" : undefined}
          role={message.tone === "error" ? "alert" : "status"}
        >
          {message.text}
        </Notice>
      )}
      <button
        type="submit"
        disabled={pending}
        className={buttonClasses({ className: "h-11 px-5 text-sm disabled:opacity-60" })}
      >
        {pending ? "Changing…" : "Change password"}
      </button>
    </form>
  );
}
