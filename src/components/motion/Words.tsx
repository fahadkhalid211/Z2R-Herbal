import { Fragment } from "react";
import { cssVars } from "@/lib/css-vars";

export function Words({ text, start = 0 }: { text: string; start?: number }) {
  const words = text.split(" ");
  return words.map((word, i) => (
    <Fragment key={`${word}-${i}`}>
      <span className="w">
        <span style={cssVars({ "--i": start + i })}>{word}</span>
      </span>
      {i < words.length - 1 && " "}
    </Fragment>
  ));
}
