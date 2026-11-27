import type { NextConfig } from "next";

const staticExport = process.env.STATIC_EXPORT === "1";

const adminOrigin = (process.env.STORE_API_URL?.trim() || "https://admin.z2rherbal.com").replace(/\/+$/, "");

const sizes = {
  deviceSizes: [390, 640, 828, 1080, 1280, 1600, 1920],
  imageSizes: [96, 160, 240, 320, 480],
  qualities: [75, 88],
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: staticExport
    ? { loader: "custom", loaderFile: "./src/lib/static-image-loader.ts", ...sizes }
    : {
        formats: ["image/webp"],
        minimumCacheTTL: 60 * 60 * 24 * 7,
        ...sizes,
        remotePatterns: [
          { protocol: "https", hostname: "z2rherbal.com", pathname: "/media/**" },
          { protocol: "https", hostname: "admin.z2rherbal.com", pathname: "/media/**" },
        ],
      },
  ...(!staticExport && {
    async headers() {
      return [
        {
          source: "/:path*",
          headers: [
            { key: "Strict-Transport-Security", value: "max-age=31536000" },
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            { key: "X-Frame-Options", value: "SAMEORIGIN" },
            { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          ],
        },
      ];
    },
    async rewrites() {
      return [
        { source: "/media/:path*", destination: `${adminOrigin}/media/:path*` },
        { source: "/vj0s", destination: "https://gtm-nncpm498.fps.goog/vj0s/" },
        { source: "/vj0s/:path*", destination: "https://gtm-nncpm498.fps.goog/vj0s/:path*" },
      ];
    },
    async redirects() {
      return [
        {
          source: "/:path*",
          has: [{ type: "host" as const, value: "www.z2rherbal.com" }],
          destination: "https://z2rherbal.com/:path*",
          permanent: true,
        },
        { source: "/favicon.ico", destination: "/icon.png", permanent: true },
        { source: "/products", destination: "/shop", permanent: true },
        { source: "/collections", destination: "/shop", permanent: true },
      ];
    },
  }),
  ...(staticExport && {
    output: "export",
    distDir: ".next-export",
  }),
};

export default nextConfig;
