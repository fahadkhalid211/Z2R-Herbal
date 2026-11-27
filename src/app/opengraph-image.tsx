import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Z2R Herbal — Pure Herbal Hair Care";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default async function OpenGraphImage() {
  const bottle = await readFile(
    path.join(process.cwd(), "assets", "products", "ZR² Herbal Signature Hair Oil Bottle.png"),
  );
  const src = `data:image/png;base64,${bottle.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 90px",
        background: "linear-gradient(120deg, #01150d 0%, #012d17 60%, #1d5528 100%)",
        color: "#f9f4f1",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 680 }}>
        <div style={{ fontSize: 26, letterSpacing: 6, color: "#cdef3a" }}>BOTANICAL HAIR CARE</div>
        <div style={{ fontSize: 88, fontStyle: "italic", fontWeight: 700, lineHeight: 1.05, marginTop: 18 }}>
          Pure Herbal Hair Care
        </div>
        <div style={{ fontSize: 30, marginTop: 26, color: "rgba(249,244,241,0.85)" }}>
          Premium natural hair oils, proudly made in Pakistan.
        </div>
        <div style={{ fontSize: 30, marginTop: 34, color: "#f5e27a" }}>Z2R Herbal</div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> only */}
      <img src={src} alt="" height={520} style={{ height: 520 }} />
    </div>,
    size,
  );
}
