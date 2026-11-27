export const CANONICAL_ORIGIN = "https://z2rherbal.com";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function resolveSiteUrl(raw: string | undefined, production: boolean): string {
  const value = raw?.trim();
  if (!value) return production ? CANONICAL_ORIGIN : "http://localhost:3000";
  try {
    const url = new URL(value);
    return LOCAL_HOSTS.has(url.hostname) ? url.origin : CANONICAL_ORIGIN;
  } catch {
    return CANONICAL_ORIGIN;
  }
}

export const SITE_URL = resolveSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.NODE_ENV === "production",
);

export const absoluteUrl = (pathOrUrl: string): string =>
  /^https?:\/\//i.test(pathOrUrl)
    ? pathOrUrl
    : `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
