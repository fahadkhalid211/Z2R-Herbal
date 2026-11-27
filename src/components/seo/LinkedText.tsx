import Link from "next/link";
import { Fragment } from "react";

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

export function LinkedText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK)) {
    const [whole, label, href] = match;
    const at = match.index ?? 0;
    if (at > last) parts.push(text.slice(last, at));
    parts.push(
      href!.startsWith("/") ? (
        <Link
          key={at}
          href={href!}
          prefetch={false}
          className="font-semibold text-forest-700 underline decoration-forest-700/30 underline-offset-4 hover:decoration-forest-700"
        >
          {label}
        </Link>
      ) : (
        <Fragment key={at}>{label}</Fragment>
      ),
    );
    last = at + whole.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

export const plainText = (text: string) => text.replace(LINK, "$1");
