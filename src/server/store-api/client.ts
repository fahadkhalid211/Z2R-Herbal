import { logger } from "@/lib/logger";

export interface StoreApiConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
}

export function storeApiConfig(env: Record<string, string | undefined> = process.env): StoreApiConfig | null {
  if (env.DATA_SOURCE && env.DATA_SOURCE !== "store-api") return null;
  const baseUrl = env.STORE_API_URL?.trim().replace(/\/+$/, "");
  const clientId = env.STORE_API_CLIENT_ID?.trim();
  const clientSecret = env.STORE_API_CLIENT_SECRET?.trim();
  return baseUrl && clientId && clientSecret ? { baseUrl, clientId, clientSecret } : null;
}

export const storeApiEnabled = (): boolean => storeApiConfig() !== null;

export class StoreApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[]>,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = "StoreApiError";
  }
}

const TIMEOUT_MS = 15_000;
const WRITE_TIMEOUT_MS = 30_000;
const RENEW_EARLY_MS = 60_000;

let token: { value: string; expiresAt: number } | null = null;
let pendingToken: Promise<string> | null = null;
let tokenBlockedUntil = 0;

const busy = () =>
  new StoreApiError(
    "rate_limited",
    "The store service is busy. Please try again shortly.",
    429,
    undefined,
    true,
  );

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const limit = init.method && init.method !== "GET" ? WRITE_TIMEOUT_MS : TIMEOUT_MS;
  const timer = setTimeout(() => controller.abort(), limit);
  try {
    return await fetch(url, { ...init, cache: "no-store", signal: controller.signal });
  } catch {
    throw new StoreApiError("network", "Could not reach the store service.", 0, undefined, true);
  } finally {
    clearTimeout(timer);
  }
}

async function requestToken(config: StoreApiConfig): Promise<string> {
  if (Date.now() < tokenBlockedUntil) throw busy();
  const res = await fetchWithTimeout(`${config.baseUrl}/api/v1/store/oauth/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }).toString(),
  });
  const body = (await res.json().catch(() => null)) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
  } | null;
  if (res.status === 429) {
    tokenBlockedUntil = Date.now() + 60_000;
    throw busy();
  }
  if (!res.ok || !body?.access_token) {
    logger.error("Store API token request failed", { status: res.status, error: body?.error });
    throw new StoreApiError(
      body?.error ?? "unauthenticated",
      "The store service refused the website key.",
      res.status,
    );
  }
  token = { value: body.access_token, expiresAt: Date.now() + (body.expires_in ?? 900) * 1000 };
  return token.value;
}

async function websiteToken(config: StoreApiConfig): Promise<string> {
  if (token && Date.now() < token.expiresAt - RENEW_EARLY_MS) return token.value;
  pendingToken ??= requestToken(config).finally(() => {
    pendingToken = null;
  });
  return pendingToken;
}

export interface CallOptions {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  customerToken?: string;
  endUserIp?: string;
  idempotencyKey?: string;
}

export interface ApiPage {
  page: number;
  pageSize: number;
  total: number;
}

type Envelope<T> =
  | { ok: true; data: T; meta?: ApiPage; requestId?: string }
  | {
      ok: false;
      error: { code: string; message: string; fieldErrors?: Record<string, string[]>; retryable?: boolean };
      requestId?: string;
    };

export async function storeApi<T>(
  path: string,
  options: CallOptions = {},
): Promise<{ data: T; meta?: ApiPage }> {
  if (process.env.NEXT_PHASE === "phase-production-build")
    throw new StoreApiError("build_time", "The store service is not used during the build.", 503);
  const config = storeApiConfig();
  if (!config) throw new StoreApiError("not_configured", "The store service is not connected.", 503);
  const method = options.method ?? "GET";

  for (let attempt = 1; ; attempt++) {
    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Bearer ${await websiteToken(config)}`,
    };
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    if (options.customerToken) headers["X-Customer-Token"] = options.customerToken;
    if (options.endUserIp) headers["X-End-User-IP"] = options.endUserIp;
    if (options.idempotencyKey) headers["Idempotency-Key"] = options.idempotencyKey;

    const res = await fetchWithTimeout(`${config.baseUrl}/api/v1/store${path}`, {
      method,
      headers,
      ...(options.body !== undefined && { body: JSON.stringify(options.body) }),
    });
    const payload = (await res.json().catch(() => null)) as Envelope<T> | null;

    if (payload?.ok) return { data: payload.data, ...(payload.meta && { meta: payload.meta }) };

    const error = payload && !payload.ok ? payload.error : null;
    if (res.status === 401 && !options.customerToken && attempt === 1) {
      token = null; // renewed on the next loop
      continue;
    }
    if ((res.status === 429 || error?.retryable) && method === "GET" && attempt === 1) {
      await new Promise((r) => setTimeout(r, 800));
      continue;
    }
    throw new StoreApiError(
      error?.code ?? (payload ? "error" : "invalid_response"),
      error?.message ?? "Unexpected response from the store service.",
      res.status,
      error?.fieldErrors,
      error?.retryable ?? false,
    );
  }
}

export function publicMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const config = storeApiConfig();
  if (!config) return url;
  try {
    const u = new URL(url, config.baseUrl);
    const internal = ["0.0.0.0", "localhost", "127.0.0.1"].includes(u.hostname);
    const staticMedia = process.env.STATIC_EXPORT === "1" && u.pathname.startsWith("/media/");
    return internal || staticMedia ? `${config.baseUrl}${u.pathname}${u.search}` : u.toString();
  } catch {
    return null;
  }
}

export function resetStoreApiToken(): void {
  token = null;
  pendingToken = null;
  tokenBlockedUntil = 0;
}
