import { CheckoutView } from "@/components/checkout/CheckoutView";
import { PageBanner } from "@/components/ui/PageBanner";
import { toCatalogItems } from "@/lib/catalog";
import { logger } from "@/lib/logger";
import { pageMeta } from "@/lib/page-meta";
import { storeApiEnabled } from "@/server/store-api/client";
import { type PaymentMethod, listPaymentMethods } from "@/server/store-api/orders";
import { getServices } from "@/services";

export const metadata = pageMeta({ title: "Checkout", path: "/checkout", index: false });

async function paymentMethods(live: boolean): Promise<PaymentMethod[]> {
  if (!live) return [];
  try {
    return await listPaymentMethods();
  } catch (error) {
    logger.error("Payment methods could not be loaded", { error });
    return [];
  }
}

export default async function CheckoutPage() {
  const services = getServices();
  const live = storeApiEnabled();
  const [products, site, methods] = await Promise.all([
    services.products.list(),
    services.site.config(),
    paymentMethods(live),
  ]);
  return (
    <>
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout" }]}
        eyebrow="Your Order"
        title={["Checkout"]}
      />
      <section className="container-page py-12 lg:py-16">
        <CheckoutView
          catalogue={products.flatMap(toCatalogItems)}
          whatsapp={site.contact.whatsapp}
          live={live}
          paymentMethods={methods}
        />
      </section>
    </>
  );
}
