import { WishlistView } from "@/components/cart/WishlistView";
import { PageBanner } from "@/components/ui/PageBanner";
import { toCatalogItems } from "@/lib/catalog";
import { pageMeta } from "@/lib/page-meta";
import { getServices } from "@/services";

export const metadata = pageMeta({ title: "Wishlist", path: "/wishlist", index: false });

export default async function WishlistPage() {
  const products = await getServices().products.list();
  return (
    <>
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "Wishlist" }]}
        eyebrow="Saved for Later"
        title={["Wishlist"]}
      />
      <section className="container-page py-12 lg:py-16">
        <WishlistView catalogue={products.flatMap(toCatalogItems)} />
      </section>
    </>
  );
}
