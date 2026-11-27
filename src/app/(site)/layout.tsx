import { Suspense } from "react";
import { connection } from "next/server";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartToast } from "@/components/cart/CartWidgets";
import { WishlistProvider } from "@/components/cart/Wishlist";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { RouteLoader } from "@/components/layout/RouteLoader";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { byShopOrder, defaultVariantMap } from "@/lib/catalog";
import { buildHeaderMenus, toSearchItems } from "@/lib/menu";
import { organizationSchema, websiteSchema } from "@/lib/structured-data";
import { getServices } from "@/services";
import { storeApiEnabled } from "@/server/store-api/client";
import { paymentMethodTitles } from "@/server/store-api/orders";

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (storeApiEnabled()) await connection();
  const services = getServices();
  const [site, products, tree, collections, ingredients, payments] = await Promise.all([
    services.site.config(),
    services.products.list(),
    services.catalog.categoryTree(),
    services.catalog.collections(),
    services.catalog.ingredients(),
    storeApiEnabled() ? paymentMethodTitles() : Promise.resolve([]),
  ]);
  const ordered = byShopOrder(products);
  const menus = buildHeaderMenus({
    site,
    tree,
    collections,
    ingredients,
    products,
    featured: ordered.find((p) => p.featured) ?? ordered.find((p) => p.isBestseller),
  });

  return (
    <AuthProvider enabled={storeApiEnabled()}>
      <CartProvider defaultVariants={defaultVariantMap(products)}>
        <WishlistProvider>
          <JsonLd data={[organizationSchema(site), websiteSchema()]} />
          <a
            href="#main"
            className="sr-only rounded-full bg-lime-400 px-4 py-2 text-sm font-semibold text-forest-900 focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100]"
          >
            Skip to content
          </a>
          <Header nav={site.nav} menus={menus} search={toSearchItems(products)} />
          <main id="main" tabIndex={-1} className="focus:outline-none">
            {children}
          </main>
          <Footer
            site={site}
            products={ordered.map((p) => ({ name: p.name, href: p.href }))}
            payments={payments}
          />
          <WhatsAppButton whatsapp={site.contact.whatsapp} />
          <CartToast />
          <Suspense fallback={null}>
            <RouteLoader />
          </Suspense>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
