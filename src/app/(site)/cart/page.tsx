import { CartView } from "@/components/cart/CartView";
import { PageBanner } from "@/components/ui/PageBanner";
import { toCatalogItems } from "@/lib/catalog";
import { pageMeta } from "@/lib/page-meta";
import { storeApiEnabled } from "@/server/store-api/client";
import { getServices } from "@/services";

export const metadata = pageMeta({ title: "Shopping Cart", path: "/cart", index: false });

export default async function CartPage() {
  const products = await getServices().products.list();
  return (
    <>
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "Cart" }]}
        eyebrow="Your Order"
        title={["Shopping Cart"]}
      />
      <section className="container-page py-12 lg:py-16">
        <CartView catalogue={products.flatMap(toCatalogItems)} live={storeApiEnabled()} />
      </section>
    </>
  );
}
