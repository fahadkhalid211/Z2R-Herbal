"use client";

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  const link = {
    display: "inline-block",
    padding: "12px 22px",
    borderRadius: 999,
    fontWeight: 600,
    textDecoration: "none",
    fontSize: 15,
  } as const;
  return (
    <html lang="en-PK">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          background: "#012d17",
          color: "#f8f3e6",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        }}
      >
        <title>Something went wrong | Z2R Herbal</title>
        <main style={{ maxWidth: 520, textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#bbe21a",
            }}
          >
            Z2R Herbal
          </p>
          <h1 style={{ margin: "14px 0 10px", fontSize: 30, lineHeight: 1.2 }}>Something went wrong</h1>
          <p style={{ margin: 0, opacity: 0.85 }}>This page could not be shown. Please try again.</p>
          <p style={{ margin: "10px 0 0", opacity: 0.85, fontSize: 14 }}>
            Placed an order just now? It may already be confirmed. Please check My Orders before ordering
            again.
          </p>
          <div
            style={{ marginTop: 26, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}
          >
            <button
              type="button"
              onClick={() => retry()}
              style={{ ...link, border: 0, cursor: "pointer", background: "#bbe21a", color: "#011a11" }}
            >
              Try Again
            </button>
            <a
              href="/account"
              style={{ ...link, border: "1px solid rgba(248,243,230,0.4)", color: "#f8f3e6" }}
            >
              My Orders
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
