export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <>
      {[data].flat().map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, "\\u003c") }}
        />
      ))}
    </>
  );
}
