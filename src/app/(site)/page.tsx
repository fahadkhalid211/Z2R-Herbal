import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMeta } from "@/lib/page-meta";
import { BenefitsRow } from "@/components/sections/BenefitsRow";
import { FeatureStrip } from "@/components/sections/FeatureStrip";
import { Hero } from "@/components/sections/Hero";
import { IngredientsBanner } from "@/components/sections/IngredientsBanner";
import { ProductCollection } from "@/components/sections/ProductCollection";
import { StoryBanner } from "@/components/sections/StoryBanner";
import { VideoShowcase } from "@/components/sections/VideoShowcase";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SITE_URL } from "@/lib/site-url";
import { getHomePageData } from "@/services";
import type { HomePageData } from "@/services/types";

export const metadata: Metadata = pageMeta({ title: "Z2R Herbal", path: "/" });

function rangeSchema(data: HomePageData) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Z2R Herbal hair oils",
    itemListElement: data.products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}${p.href}`,
      name: p.name,
    })),
  };
}

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <>
      <JsonLd data={rangeSchema(data)} />
      <Hero slides={data.heroSlides} features={data.heroFeatures} ingredients={data.ingredients} />
      <FeatureStrip features={data.featureStrip} />
      <ProductCollection products={data.products} ingredients={data.ingredients} />
      {data.videos.length > 0 && (
        <VideoShowcase videos={data.videos}>
          <SectionHeading
            id="watch-title"
            eyebrow="The Z2R Herbal Experience"
            lines={["Discover the", "Ritual of Natural", "Hair Care"]}
            intro={`Watch how ${data.site.brandName} brings the power of nature into your daily hair care routine.`}
            tone="dark"
            align="start"
          />
        </VideoShowcase>
      )}
      <StoryBanner brandName={data.site.brandName} />
      <BenefitsRow benefits={data.benefits} brandName={data.site.brandName} />
      <IngredientsBanner
        ingredients={data.ingredients}
        products={data.products}
        whatsapp={data.site.contact.whatsapp}
      />
    </>
  );
}
