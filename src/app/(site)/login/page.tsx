import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { PageBanner } from "@/components/ui/PageBanner";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta({ title: "Login", path: "/login", index: false });

export default function LoginPage() {
  return (
    <>
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "Login" }]}
        eyebrow="My Account"
        title={["Welcome Back"]}
        intro="Log in to your Z2R Herbal account."
      />
      <AuthShell>
        <div className="mx-auto max-w-md">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </AuthShell>
    </>
  );
}
