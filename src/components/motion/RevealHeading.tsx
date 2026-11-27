import { Fragment } from "react";
import { Words } from "./Words";

interface RevealHeadingProps {
  as?: "h1" | "h2" | "h3";
  id?: string;
  lines: string[];
  className?: string;
}

export function RevealHeading({ as: Tag = "h2", id, lines, className }: RevealHeadingProps) {
  const counts = lines.map((line) => line.split(" ").length);
  const starts = counts.map((_, i) => counts.slice(0, i).reduce((sum, n) => sum + n, 0));
  return (
    <Tag id={id} className={className} aria-label={lines.join(" ")} data-reveal="words">
      <span aria-hidden="true" className="split">
        {lines.map((line, li) => (
          <Fragment key={line}>
            {li > 0 && <br />}
            <Words text={line} start={starts[li]} />
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
