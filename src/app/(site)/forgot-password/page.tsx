import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { PageBanner } from "@/components/ui/PageBanner";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta({ title: "Forgot Password", path: "/forgot-password", index: false });

export default function ForgotPasswordPage() {
  return (
    <>
      <PageBanner
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Login", href: "/login" },
          { label: "Forgot Password" },
        ]}
        eyebrow="My Account"
        title={["Reset Your Password"]}
        intro="We will email you a code to choose a new password."
      />
      <AuthShell>
        <div className="mx-auto max-w-md">
          <ForgotPasswordForm />
        </div>
      </AuthShell>
    </>
  );
}
