import { FaqList } from "@/components/sections/FaqList";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageBanner } from "@/components/ui/PageBanner";
import { FAQS, faqsWithPayments } from "@/content/faqs";
import { pageMeta } from "@/lib/page-meta";
import { faqSchema } from "@/lib/structured-data";
import { storeApiEnabled } from "@/server/store-api/client";
import { paymentMethodTitles } from "@/server/store-api/orders";

export const metadata = pageMeta({
  title: "Frequently Asked Questions",
  description: FAQS[0].answer,
  path: "/faqs",
});

export default async function FaqPage() {
  const faqs = faqsWithPayments(storeApiEnabled() ? await paymentMethodTitles() : []);

  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "FAQs" }]}
        eyebrow="Customer Support"
        title={["Frequently Asked", "Questions"]}
      />
      <section aria-label="Questions and answers" className="container-page py-14 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <FaqList faqs={faqs} />
        </div>
      </section>
    </>
  );
}
