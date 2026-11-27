import { AccountView } from "@/components/auth/AccountView";
import { PageBanner } from "@/components/ui/PageBanner";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta({ title: "My Account", path: "/account", index: false });

export default function AccountPage() {
  return (
    <>
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "My Account" }]}
        eyebrow="My Account"
        title={["My Account"]}
      />
      <section className="container-page py-12 lg:py-16">
        <AccountView />
      </section>
    </>
  );
}
