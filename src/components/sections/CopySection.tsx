import { LinkedText } from "@/components/seo/LinkedText";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";

export interface CopyBlock {
  id: string;
  eyebrow: string;
  title: string;
  paragraphs: string[];
}

export function CopySection({ block, className }: { block: CopyBlock; className?: string }) {
  return (
    <section aria-labelledby={block.id} className={cn("container-page py-14 lg:py-20", className)}>
      <div className="mx-auto max-w-3xl">
        <SectionHeading id={block.id} eyebrow={block.eyebrow} lines={[block.title]} />
        <div className="mt-8 space-y-4 text-[1.02rem] leading-relaxed text-ink-muted">
          {block.paragraphs.map((p) => (
            <p key={p}>
              <LinkedText text={p} />
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
