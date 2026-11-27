import { Suspense } from "react";
import { VerifyEmail } from "@/components/auth/VerifyEmail";
import { PageBanner } from "@/components/ui/PageBanner";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta({ title: "Verify Your Email", path: "/verify-email", index: false });

export default function VerifyEmailPage() {
  return (
    <>
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "Verify Email" }]}
        eyebrow="My Account"
        title={["Verify Your Email"]}
      />
      <section className="container-page py-12 lg:py-16">
        <Suspense fallback={<p className="text-center text-ink-muted">Loading…</p>}>
          <VerifyEmail />
        </Suspense>
      </section>
    </>
  );
}
