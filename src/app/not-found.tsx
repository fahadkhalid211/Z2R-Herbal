import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-forest-900 px-6 text-center text-cream-50">
      <div>
        <Logo tone="cream" loading="lazy" className="mx-auto h-28" />
        <h1 className="mt-8 font-display text-4xl font-bold italic sm:text-5xl">Coming soon</h1>
        <p className="mx-auto mt-4 max-w-sm text-cream-50/80">
          This page is still growing. In the meantime, explore our herbal hair oils on the home page.
        </p>
        <ButtonLink href="/" className="mt-8">
          <ArrowLeft aria-hidden="true" className="size-4" /> Back to home
        </ButtonLink>
      </div>
    </main>
  );
}
