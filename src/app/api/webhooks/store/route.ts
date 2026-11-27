import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { createRateLimit } from "@/server/rate-limit";
import { refreshStoreSnapshot } from "@/server/store-api/catalog";
import { storeApiEnabled } from "@/server/store-api/client";
import { forgetPaymentMethods } from "@/server/store-api/orders";

export const dynamic = "force-dynamic";

const callLimit = createRateLimit({ limit: 60, windowMs: 60_000 });

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

function sameSecret(given: string, expected: string): boolean {
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return given.length > 0 && timingSafeEqual(a, b);
}

function secretFrom(request: Request): string {
  const auth = request.headers.get("authorization") ?? "";
  if (/^bearer\s+/i.test(auth)) return auth.replace(/^bearer\s+/i, "").trim();
  return (request.headers.get("x-webhook-secret") ?? "").trim();
}

async function eventName(request: Request): Promise<string | undefined> {
  try {
    const text = (await request.text()).slice(0, 2000);
    if (!text) return undefined;
    const body: unknown = JSON.parse(text);
    const event = body && typeof body === "object" ? (body as Record<string, unknown>).event : undefined;
    return typeof event === "string" ? event.slice(0, 100) : undefined;
  } catch {
    return undefined;
  }
}

export async function POST(request: Request) {
  const expected = process.env.STORE_WEBHOOK_SECRET?.trim();
  if (!expected) return json({ ok: false, error: "The store webhook is not configured." }, 503);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!callLimit(ip)) return json({ ok: false, error: "Too many calls. Please wait a minute." }, 429);
  if (!sameSecret(secretFrom(request), expected)) {
    logger.warn("Store webhook: refused (wrong or missing secret)", { ip });
    return json({ ok: false, error: "Unauthorized." }, 401);
  }
  if (!storeApiEnabled()) return json({ ok: false, error: "The Store API is not connected." }, 409);

  const event = await eventName(request);
  forgetPaymentMethods();
  try {
    const snapshot = await refreshStoreSnapshot();
    revalidatePath("/", "layout");
    console.info(
      `[z2r] Store webhook: catalogue refreshed (${snapshot.products.length} products, ${snapshot.categories.length} categories${event ? `, event ${event}` : ""})`,
    );
    return json({
      ok: true,
      refreshedAt: new Date(snapshot.fetchedAt).toISOString(),
      products: snapshot.products.length,
      categories: snapshot.categories.length,
    });
  } catch (error) {
    logger.error("Store webhook: catalogue refresh failed", { error, event });
    return json(
      {
        ok: false,
        error: "The Store API could not be reached; the previous catalogue is still shown. Please try again.",
      },
      502,
    );
  }
}
