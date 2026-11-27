import { PolicyDocument } from "@/components/sections/PolicyDocument";
import { RETURN_POLICY } from "@/content/policies";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta({
  title: RETURN_POLICY.title,
  description: RETURN_POLICY.intro,
  path: "/returns",
});

export default function ReturnsPage() {
  return <PolicyDocument policy={RETURN_POLICY} />;
}
