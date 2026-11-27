import { PolicyDocument } from "@/components/sections/PolicyDocument";
import { PRIVACY_POLICY } from "@/content/policies";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta({
  title: PRIVACY_POLICY.title,
  description: PRIVACY_POLICY.intro,
  path: "/privacy",
});

export default function PrivacyPage() {
  return <PolicyDocument policy={PRIVACY_POLICY} />;
}
