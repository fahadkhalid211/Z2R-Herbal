import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageBanner } from "@/components/ui/PageBanner";
import { cardSurface } from "@/components/ui/surface";
import { BLOG_POSTS, formatDate } from "@/content/blog";
import { cn } from "@/lib/cn";
import { pageMeta } from "@/lib/page-meta";

const INTRO = "Practical, honest guides to choosing and using hair oil, from the Z2R Herbal team.";

export const metadata = pageMeta({ title: "Blog", description: INTRO, path: "/blog" });

export default function BlogPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return (
    <>
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
        eyebrow="Blog"
        title={["Hair Care Guides"]}
      />
      <section aria-label="Guides" className="container-page py-14 lg:py-20">
        <p className="mx-auto mb-10 max-w-2xl text-center text-[1.02rem] leading-relaxed text-ink-muted">
          {INTRO}
        </p>
        <ul className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
          {posts.map((post) => (
            <li key={post.slug}>
              <article className={cn(cardSurface, "flex h-full flex-col rounded-[24px] p-6 sm:p-7")}>
                <p className="text-[0.8rem] text-ink-muted">
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                </p>
                <h2 className="mt-2 font-display text-[1.45rem] leading-snug font-semibold text-ink">
                  <Link href={`/blog/${post.slug}`} prefetch={false} className="hover:text-forest-700">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-3 flex-1 leading-relaxed text-ink-muted">{post.description}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  prefetch={false}
                  aria-label={`Read: ${post.title}`}
                  className="mt-5 inline-flex items-center gap-1 font-semibold text-forest-700"
                >
                  Read the guide <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
