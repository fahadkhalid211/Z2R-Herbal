"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { TextAreaField, TextField } from "@/components/ui/TextField";
import { customerApi, describeApiError, errorFields } from "@/lib/customer-api";
import { contactSchema, fieldErrors } from "@/lib/validation";

const EMPTY = { name: "", email: "", phone: "", message: "" };

export function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setPending(true);
    try {
      await customerApi.sendMessage({ ...parsed.data, company });
      setSent(true);
      setValues(EMPTY);
    } catch (error) {
      setErrors(errorFields(error));
      setFormError(describeApiError(error, "contact"));
    } finally {
      setPending(false);
    }
  };

  if (sent) {
    return (
      <Notice tone="success" role="status" title="Thank you! Your message has been sent.">
        Our customer support team will get back to you soon.
      </Notice>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-5 sm:grid-cols-2">
      <TextField
        label="Full name"
        name="name"
        autoComplete="name"
        value={values.name}
        onChange={set("name")}
        error={errors.name}
      />
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
        label="Contact number (optional)"
        type="tel"
        name="phone"
        autoComplete="tel"
        value={values.phone}
        onChange={set("phone")}
        error={errors.phone}
        className="sm:col-span-2"
      />
      <TextAreaField
        label="Your message"
        name="message"
        rows={5}
        value={values.message}
        onChange={set("message")}
        error={errors.message}
        className="sm:col-span-2"
      />
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="absolute -left-[9999px] h-px w-px opacity-0"
      />
      {formError && (
        <Notice tone="error" role="alert" className="sm:col-span-2">
          {formError}
        </Notice>
      )}
      <button
        type="submit"
        disabled={pending}
        className={buttonClasses({ className: "disabled:opacity-60 sm:col-span-2" })}
      >
        <Send aria-hidden="true" className="size-4" /> {pending ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
