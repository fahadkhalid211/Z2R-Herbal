import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { PageBanner } from "@/components/ui/PageBanner";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta({ title: "Create Account", path: "/register", index: false });

export default function RegisterPage() {
  return (
    <>
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "Create Account" }]}
        eyebrow="My Account"
        title={["Create Account"]}
        intro="Create your Z2R Herbal customer account."
      />
      <AuthShell>
        <div className="mx-auto max-w-md">
          <RegisterForm />
        </div>
      </AuthShell>
    </>
  );
}
