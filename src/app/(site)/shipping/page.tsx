import { PolicyDocument } from "@/components/sections/PolicyDocument";
import { SHIPPING_POLICY } from "@/content/policies";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta({
  title: SHIPPING_POLICY.title,
  description: SHIPPING_POLICY.intro,
  path: "/shipping",
});

export default function ShippingPage() {
  return <PolicyDocument policy={SHIPPING_POLICY} />;
}
