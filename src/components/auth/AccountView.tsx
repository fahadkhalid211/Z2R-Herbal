"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, KeyRound, LogOut, MailWarning, PenLine, ShieldCheck, UserRound } from "lucide-react";
import { OrderHistory } from "@/components/account/OrderHistory";
import { PasswordForm, ProfileForm } from "@/components/account/ProfileForms";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { cardSurface } from "@/components/ui/surface";
import { placedCheckout } from "@/lib/checkout-attempt";
import { customerApi, describeApiError } from "@/lib/customer-api";
import { useAuth } from "./AuthProvider";

const linkButton =
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.84rem] font-semibold text-forest-700 transition-colors hover:bg-forest-600/10 hover:text-forest-600";

function VerifyBanner({ email, onVerified }: { email: string; onVerified: () => void }) {
  const [state, setState] = useState<{ status: "idle" | "sending" | "sent" | "error"; message?: string }>({
    status: "idle",
  });
  const resend = async () => {
    setState({ status: "sending" });
    try {
      const already = await customerApi.resendVerification();
      if (already) onVerified();
      else setState({ status: "sent", message: `A new verification link was sent to ${email}.` });
    } catch (error) {
      setState({ status: "error", message: describeApiError(error, "account") });
    }
  };
  return (
    <div className="flex flex-col gap-4 rounded-[22px] border border-gold-300/60 bg-[#fbf3df] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-start gap-3.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-300/40 text-[#7a5a0c]">
          <MailWarning aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="font-semibold text-forest-900">Please verify your email address</p>
          <p className="mt-0.5 text-[0.88rem] text-ink-muted">
            We sent a verification link to <span className="font-medium text-forest-900">{email}</span>. Open
            it to confirm this address is yours.
          </p>
          {state.message && (
            <p
              role="status"
              className={`mt-2 text-[0.85rem] font-medium ${state.status === "error" ? "text-[#b3261e]" : "text-forest-700"}`}
            >
              {state.message}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={resend}
        disabled={state.status === "sending"}
        className={buttonClasses({
          variant: "outline-dark",
          className: "h-11 shrink-0 px-5 text-sm disabled:opacity-60",
        })}
      >
        {state.status === "sending" ? "Sending…" : "Resend verification email"}
      </button>
    </div>
  );
}

export function AccountView() {
  const { status, customer, logout, refresh } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const justPlaced = useMemo(
    () => (status === "authenticated" ? placedCheckout(Date.now(), 15 * 60 * 1000) : null),
    [status],
  );

  useEffect(() => {
    if (status === "guest") router.replace("/login?next=/account");
  }, [status, router]);

  if (status === "unavailable") {
    return (
      <div className="mx-auto max-w-xl space-y-6 text-center">
        <Notice className="text-left" title="Customer accounts are not available right now.">
          Your account, profile and order history will appear here. You can still browse and shop the
          collection.
        </Notice>
        <ButtonLink href="/shop">Shop the Collection</ButtonLink>
      </div>
    );
  }

  if (status !== "authenticated" || !customer) {
    return (
      <p role="status" className="text-center text-ink-muted">
        {status === "guest" ? "Taking you to the login page…" : "Loading your account…"}
      </p>
    );
  }

  const firstName = customer.name.trim().split(/\s+/)[0] ?? customer.name;
  const verified = customer.emailVerified === true;

  const signOut = async () => {
    setSigningOut(true);
    try {
      await logout();
      router.replace("/login");
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <div className="space-y-6">
      {justPlaced && (
        <Notice tone="success" role="status" title="Thank you! Your order has been placed.">
          {`Your order number is ${justPlaced.order.id}. Payment: ${justPlaced.payLabel}. You can follow it below, and cancel it before dispatch.`}
        </Notice>
      )}
      <section
        aria-label="Account overview"
        className={`${cardSurface} flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7`}
      >
        <div className="flex items-center gap-4">
          <span className="feature-medal grid size-14 shrink-0 place-items-center rounded-full font-display text-[1.4rem] font-semibold">
            {firstName.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="font-display text-[1.6rem] leading-tight font-semibold text-ink">
              Hello, {firstName}
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-[0.9rem] text-ink-muted">
              <span className="break-all">{customer.email}</span>
              {verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-forest-600/10 px-2.5 py-0.5 text-[0.74rem] font-semibold text-forest-700">
                  <BadgeCheck aria-hidden="true" className="size-3.5" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#fbf3df] px-2.5 py-0.5 text-[0.74rem] font-semibold text-[#7a5a0c] ring-1 ring-gold-300/60">
                  Not verified
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={signingOut}
          onClick={signOut}
          className={buttonClasses({
            variant: "outline-dark",
            className: "h-11 self-start px-5 text-sm disabled:opacity-60 sm:self-center",
          })}
        >
          <LogOut aria-hidden="true" className="size-4" /> {signingOut ? "Logging out…" : "Logout"}
        </button>
      </section>

      {!verified && (
        <VerifyBanner
          email={customer.email}
          onVerified={() => refresh({ ...customer, emailVerified: true })}
        />
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-8">
        <div className="space-y-6">
          <section aria-labelledby="profile-title" className={`${cardSurface} p-6 sm:p-7`}>
            <div className="flex items-center justify-between gap-3">
              <h2
                id="profile-title"
                className="flex items-center gap-2.5 font-display text-[1.35rem] font-semibold text-ink"
              >
                <UserRound aria-hidden="true" className="size-5 text-forest-600" /> Personal information
              </h2>
              {!editing && (
                <button type="button" onClick={() => setEditing(true)} className={linkButton}>
                  <PenLine aria-hidden="true" className="size-4" /> Edit
                </button>
              )}
            </div>
            {editing ? (
              <ProfileForm customer={customer} onDone={() => setEditing(false)} />
            ) : (
              <dl className="mt-4 divide-y divide-forest-900/10 text-[0.95rem]">
                {[
                  ["Full name", customer.name],
                  ["Email address", customer.email],
                  ["Contact number", customer.phone],
                ].map(
                  ([term, value]) =>
                    value && (
                      <div key={term} className="grid gap-0.5 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
                        <dt className="text-[0.82rem] text-ink-muted">{term}</dt>
                        <dd className="font-medium break-words text-forest-900">{value}</dd>
                      </div>
                    ),
                )}
              </dl>
            )}
          </section>

          <section aria-labelledby="password-title" className={`${cardSurface} p-6 sm:p-7`}>
            <div className="flex items-center justify-between gap-3">
              <h2
                id="password-title"
                className="flex items-center gap-2.5 font-display text-[1.35rem] font-semibold text-ink"
              >
                <ShieldCheck aria-hidden="true" className="size-5 text-forest-600" /> Password
              </h2>
              {!changingPassword && (
                <button type="button" onClick={() => setChangingPassword(true)} className={linkButton}>
                  <KeyRound aria-hidden="true" className="size-4" /> Change
                </button>
              )}
            </div>
            {changingPassword ? (
              <PasswordForm />
            ) : (
              <p className="mt-3 text-[0.9rem] text-ink-muted">
                Keep your account safe with a strong password.
              </p>
            )}
          </section>
        </div>

        <section aria-labelledby="orders-title" className={`${cardSurface} p-6 sm:p-7`}>
          <h2 id="orders-title" className="font-display text-[1.5rem] font-semibold text-ink">
            My orders
          </h2>
          <p className="mt-1 text-[0.88rem] text-ink-muted">
            Open an order to see its tracking, items and delivery. Orders can be cancelled until they are
            dispatched.
          </p>
          <div className="mt-5">
            <OrderHistory />
          </div>
        </section>
      </div>
    </div>
  );
}
