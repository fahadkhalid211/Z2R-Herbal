import { PolicyDocument } from "@/components/sections/PolicyDocument";
import { TERMS } from "@/content/policies";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta({ title: TERMS.title, description: TERMS.intro, path: "/terms" });

export default function TermsPage() {
  return <PolicyDocument policy={TERMS} />;
}
