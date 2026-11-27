import { PageBanner } from "@/components/ui/PageBanner";
import { cardSurface } from "@/components/ui/surface";
import { cn } from "@/lib/cn";
import type { Policy } from "@/content/policies";

export function PolicyDocument({ policy }: { policy: Policy }) {
  let number = 0;
  const anchor = (heading: string) =>
    heading
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  return (
    <>
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: policy.title }]}
        eyebrow="Customer Support"
        title={[policy.title]}
        intro={policy.intro}
      />
      <article className="container-page grid items-start gap-8 py-14 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-12 lg:py-20">
        <nav aria-label="On this page" className="hidden lg:sticky lg:top-32 lg:block">
          <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-olive-600 uppercase">
            On this page
          </p>
          <ol className="mt-4 space-y-1 border-l border-forest-900/10">
            {policy.sections.map((section) => (
              <li key={section.heading}>
                <a
                  href={`#${anchor(section.heading)}`}
                  className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-[0.9rem] text-ink-muted transition-colors hover:border-forest-600 hover:text-forest-800"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className={cn(cardSurface, "max-w-3xl px-6 py-8 sm:px-10 sm:py-10")}>
          <div className="space-y-8">
            {policy.sections.map((section) =>
              section.highlight ? (
                <section
                  key={section.heading}
                  id={anchor(section.heading)}
                  className="scroll-mt-32 rounded-2xl bg-forest-800 bg-[radial-gradient(120%_140%_at_0%_0%,#1d5528_0%,transparent_60%)] px-6 py-6 text-cream-50"
                >
                  <h2 className="font-display text-[1.5rem] font-semibold text-lime-300">
                    {section.heading}
                  </h2>
                  {section.paragraphs?.map((text) => (
                    <p key={text} className="mt-2 leading-relaxed text-cream-50/90">
                      {text}
                    </p>
                  ))}
                </section>
              ) : (
                <section
                  key={section.heading}
                  id={anchor(section.heading)}
                  className="flex scroll-mt-32 gap-4 sm:gap-5"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-forest-600/10 text-[0.85rem] font-semibold text-forest-700 tabular-nums"
                  >
                    {String(++number).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-[1.3rem] leading-snug font-semibold text-ink">
                      <span className="sr-only">{number}. </span>
                      {section.heading}
                    </h2>
                    {section.paragraphs?.map((text) => (
                      <p key={text} className="mt-2 leading-relaxed text-ink-muted">
                        {text}
                      </p>
                    ))}
                    {section.list && (
                      <ul className="mt-3 space-y-2">
                        {section.list.map((item) => (
                          <li key={item} className="flex gap-3 leading-relaxed text-ink-muted">
                            <span
                              aria-hidden="true"
                              className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-forest-600"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              ),
            )}
          </div>
          <div className="mt-10 border-t border-forest-900/10 pt-7 text-center">
            {policy.closing.map((line, i) => (
              <p
                key={line}
                className={
                  i === 0
                    ? "font-display text-[1.25rem] font-semibold text-forest-800 italic"
                    : "mt-3 text-[0.9rem] leading-relaxed text-ink-muted"
                }
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </article>
    </>
  );
}
