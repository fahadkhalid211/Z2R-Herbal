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

        {/* eslint-disable-next-line @next/next/next-script-for-ga -- GTM must load in the server HTML <head> */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-P52F765N');`,
          }}
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1475357668986455');
fbq('track', 'PageView');`,
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
            src="https://www.googletagmanager.com/ns.html?id=GTM-P52F765N"
            height="0"
            width="0"
            style={{
              display: "none",
              visibility: "hidden",
            }}
          ></iframe>
        </noscript>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element -- Meta Pixel noscript fallback */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            alt=""
            src="https://www.facebook.com/tr?id=1475357668986455&ev=PageView&noscript=1"
          />
        </noscript>
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
