import type { Metadata, Viewport } from "next";
import { Fraunces, Jost } from "next/font/google";
import { BrandIntro } from "@/components/brand/BrandIntro";
import { MotionRuntime } from "@/components/motion/MotionRuntime";
import { HEAD_SCRIPT } from "@/lib/brand-intro";
import { PAGE_SEO } from "@/lib/seo";
import { SITE_URL } from "@/lib/site-url";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
  preload: false,
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: PAGE_SEO["/"]!.title,
    template: "%s | Z2R Herbal",
  },
  description: PAGE_SEO["/"]!.description,
  applicationName: "Z2R Herbal",

  verification: {
    google: "i3m1gKYsIqh46-cLgysfLd7HT8vLEcwQkdDh075uV7E",
  },

  openGraph: {
    type: "website",
    siteName: "Z2R Herbal",
    title: PAGE_SEO["/"]!.title,
    description: PAGE_SEO["/"]!.description,
    locale: "en_PK",
  },

  twitter: {
    card: "summary_large_image",
    title: PAGE_SEO["/"]!.title,
    description: PAGE_SEO["/"]!.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#012d17",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-PK" className={`${fraunces.variable} ${jost.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'?l='+l:'';j.async=true;j.src=
'/vj0s'+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer');`,
          }}
        />

        <script
          dangerouslySetInnerHTML={{
            __html: HEAD_SCRIPT,
          }}
        />

        {/* eslint-disable-next-line @next/next/next-script-for-ga -- verification needs Google's exact snippet in the server HTML <head> */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-NQK6K3S1Y7" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n\n  gtag('config', 'G-NQK6K3S1Y7');\n",
          }}
        />
      </head>

      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NNCPM498"
            height="0"
            width="0"
            style={{
              display: "none",
              visibility: "hidden",
            }}
          ></iframe>
        </noscript>

        <BrandIntro />

        {children}

        <MotionRuntime />
      </body>
    </html>
  );
}
